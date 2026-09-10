// Regression test: 新建会话的种子事件不得包含 turn/start 或 turn/end。
//
// 背景（v0.1.1 事故）：会话开头（agent react-loop 之前）出现 turn/end 会被
// Harness 判为 "malformed pre-react-loop turn/end at seq N"，该会话随之
// "历史加载失败"（会话损坏）。修复方式是把种子回退为单条 user/message。
// 本测试通过真实 /tasks/:id/session 端点捕获写入持久化的种子事件，断言：
//   - 不含任何 turn 事件
//   - 恰好一条 user/message，seq=0、surfaceOp=append、事件信封字段合法
// 这样即使种子被重写（而非简单回退），只要违反约束就会红灯。
import { apply } from "../lib/index.js";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const home = await mkdtemp(join(tmpdir(), "tb-seed-"));
process.env.DSH_HOME = home;

// ---- harness（与 persistence_concurrency.test.mjs 同风格）----
function bodyBytes(body) {
	if (body == null) return null;
	return Buffer.from(typeof body === "string" ? body : JSON.stringify(body), "utf8");
}
function caller(list, path) {
	return list.find((x) => x.kind === "prefix" && path.startsWith(x.path))?.handler
		?? list.find((x) => x.kind === "exact" && x.path === path)?.handler;
}
function http(list) {
	return (method, path, body) => {
		const h = caller(list, path);
		if (!h) throw new Error(`no handler for ${path}`);
		const bytes = bodyBytes(body);
		const req = {
			url: path, method,
			[Symbol.asyncIterator]() {
				const iter = (bytes ? [bytes] : [])[Symbol.iterator]();
				return { next: () => iter.next(), return: () => { iter.return?.(); return { done: true }; } };
			}
		};
		return new Promise((resolve) => {
			let status = 0, out = "";
			const res = {
				set statusCode(v) { status = v; }, get statusCode() { return status; },
				setHeader() {},
				end(c) { out += c ?? ""; resolve({ status, body: out ? JSON.parse(out) : null }); }
			};
			h(req, res).catch((e) => resolve({ status: 500, body: { error: String(e) } }));
		});
	};
}

const WS = "/tmp/tb-seed-ws";
const captured = {};
function makeCtx(registers) {
	return {
		effect(fn) { fn?.(); },
		on() {},
		logger: { info() {}, warn() {}, error() {} },
		webServer: { register(x) { registers.push(x); }, tapIndex() {} },
		workspaceRegistry: { list: () => [{ path: WS, title: "tb-seed-ws" }] },
		sessions: { list: () => [], get: () => void 0 },
		sessionPersistence: {
			async create(meta) { captured.meta = meta; },
			async append(id, events) { captured.id = id; captured.events = events; }
		}
	};
}

let failures = 0;
const check = (name, cond, detail) => {
	console.log(`${cond ? "PASS" : "FAIL"}  ${name}${detail === undefined ? "" : `  (${detail})`}`);
	if (!cond) failures++;
};

const regs = [];
await apply(makeCtx(regs), { storePath: join(home, "storages", "taskboard.json") });
const api = http(regs);

const created = await api("POST", "/taskboard/api/tasks", { title: "seed-check", repo: WS });
check("task created", created.status === 201, `status=${created.status}`);

const res = await api("POST", `/taskboard/api/tasks/${created.body.task.id}/session`, {});
check("new session returns 201", res.status === 201, res.body?.error ?? `status=${res.status}`);
check("session id returned", typeof res.body?.sessionId === "string" && res.body.sessionId.startsWith("session-"));

const events = captured.events ?? [];
check("seed persisted via sessionPersistence.append", events.length > 0, `${events.length} events`);
check("seed has NO turn/start", !events.some((e) => e.type === "turn/start"));
check("seed has NO turn/end", !events.some((e) => e.type === "turn/end"),
	"pre-react-loop turn/end makes the session unloadable");

const first = events[0];
check("first event is user/message", first?.type === "user/message", first?.type);
check("user/message seq is 0", first?.seq === 0, first?.seq);
check("user/message carries surfaceOp=append", first?.surfaceOp === "append", first?.surfaceOp);

const allowed = new Set(["type", "seq", "time", "data", "surfaceOp", "sourceEventSeqs", "ignorable"]);
const envelopeOk = events.every((e) => Object.keys(e).every((k) => allowed.has(k)));
check("event envelope has only harness-allowed keys", envelopeOk,
	events.flatMap((e) => Object.keys(e).filter((k) => !allowed.has(k))).join(",") || "ok");

const data = first?.data ?? {};
check("message has id/role/source/content",
	typeof data.id === "string" && data.id.length > 0
	&& data.role === "user"
	&& typeof data.source?.kind === "string" && data.source.kind.length > 0
	&& Array.isArray(data.content) && data.content.length > 0);

console.log(failures ? "FAILURES" : "ALL OK");
process.exit(failures ? 1 : 0);
