// 回归测试：任务面板**不得**往已存在的会话日志里写任何事件。
//
// 事故（ADR-0004）：关联会话时插件曾用 `sessionPersistence.append()` 直接追加一条
// `user/message` 当"任务上下文注入"。这条路径绕过 Harness 的 inbox 记账，会留下
// "认领了但从未入队"的持久化 splice → 该会话之后 resume 报
//   invalid persisted inbox splice at session seq N
// 再也打不开。实测被注入过的 12 个会话里有 2 个因此损坏。
//
// 本测试用「记录所有持久化写入」的假 ctx 断言：
//   - POST /tasks/:id/sessions（link）不得产生任何 append/create；
//   - 只有「为新任务创建新会话」这条路径允许 append，且只写一个全新 id。
import { apply } from "../lib/index.js";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { zstdCompressSync } from "node:zlib";

const home = await mkdtemp(join(tmpdir(), "tb-nowrite-"));
process.env.DSH_HOME = home;

const WS = "/tmp/tb-nowrite-ws";
const EXISTING_ID = "session-0000exist-0000-0000-0000-000000000001";

// 磁盘上已存在的一个会话（有内容）
const dir = join(home, "sessions", "tb-nowrite-ws--x", EXISTING_ID);
await mkdir(dir, { recursive: true });
const line = JSON.stringify({
	type: "user/message", seq: 0, time: Date.now(), surfaceOp: "append",
	data: { id: "m1", role: "user", source: { kind: "user" }, content: [{ type: "text", text: "已有会话的首条消息" }] }
});
await writeFile(join(dir, "session.jsonl.zstd"), zstdCompressSync(Buffer.from(`${line}\n`, "utf8")));

const writes = [];   // 记录所有持久化写入
function bodyBytes(body) {
	return body == null ? null : Buffer.from(typeof body === "string" ? body : JSON.stringify(body), "utf8");
}
function caller(list, path) {
	const pathname = path.split("?")[0];
	return list.find((x) => x.kind === "prefix" && pathname.startsWith(x.path))?.handler
		?? list.find((x) => x.kind === "exact" && x.path === pathname)?.handler;
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

const regs = [];
const ctx = {
	effect(fn) { fn?.(); },
	on() {},
	logger: { info() {}, warn() {}, error() {} },
	webServer: { register(x) { regs.push(x); }, tapIndex() {} },
	workspaceRegistry: { list: () => [{ path: WS, title: "tb-nowrite-ws", attachSession: async () => {}, sessionIds: [] }] },
	sessions: { list: () => [], get: () => void 0 },
	sessionPersistence: {
		async list() { return [{ id: EXISTING_ID, cwd: WS }]; },
		async inspect() { return { events: [] }; },
		async create(meta) { writes.push({ op: "create", id: meta.id }); },
		async append(id, events) { writes.push({ op: "append", id, count: events.length, types: events.map((e) => e.type) }); }
	}
};

let failures = 0;
const check = (name, cond, detail) => {
	console.log(`${cond ? "PASS" : "FAIL"}  ${name}${detail === undefined ? "" : `  (${detail})`}`);
	if (!cond) failures++;
};

await apply(ctx, { storePath: join(home, "storages", "taskboard.json") });
const api = http(regs);

const created = await api("POST", "/taskboard/api/tasks", { title: "nowrite", repo: WS });
const taskId = created.body.task.id;
check("创建任务不产生会话写入", writes.length === 0, JSON.stringify(writes));

// 关联一个已存在的会话 —— 这是历史上出事的路径
const link = await api("POST", `/taskboard/api/tasks/${taskId}/sessions`, { sessionId: EXISTING_ID, action: "link" });
check("link 返回 200", link.status === 200, `status=${link.status}`);
check("link 不得写会话日志（splice 事故的根因）", writes.length === 0,
	JSON.stringify(writes));
check("link 仍然记录了关联关系", (link.body?.task?.sessionIds ?? []).includes(EXISTING_ID));
check("link 不再声称已注入上下文", link.body?.injected !== true, `injected=${link.body?.injected}`);

// 解绑同样不得写
await api("POST", `/taskboard/api/tasks/${taskId}/sessions`, { sessionId: EXISTING_ID, action: "unlink" });
check("unlink 不得写会话日志", writes.length === 0, JSON.stringify(writes));

// 唯一允许写的路径：为任务新建一个全新会话（种子必须落在全新 id 上）
const fresh = await api("POST", `/taskboard/api/tasks/${taskId}/session`, {});
const freshId = fresh.body?.sessionId;
check("新建会话仍会写入种子", writes.some((w) => w.op === "append" && w.id === freshId),
	JSON.stringify(writes.map((w) => `${w.op}:${w.id}`)));
check("写入只发生在全新会话 id 上（不是已有会话）",
	writes.every((w) => String(w.id).startsWith("session-") && w.id !== EXISTING_ID),
	JSON.stringify(writes.map((w) => `${w.op}:${w.id}`)));
check("种子只有 user/message（不含 turn 事件）",
	writes.filter((w) => w.op === "append").every((w) => w.types.every((t) => t === "user/message")),
	JSON.stringify(writes.filter((w) => w.op === "append").map((w) => w.types)));

console.log(failures ? "FAILURES" : "ALL OK");
process.exit(failures ? 1 : 0);
