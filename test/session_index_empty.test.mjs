// 回归测试：会话索引对「空壳会话」和「任务种子标题」的处理。
//
// 背景（用户报告「最新对话被改坏了」）：索引加入磁盘来源后，把宿主留下的
// 空壳会话（只有 session/permission/sandbox 等引导事件、没有任何 user/message，
// 文件往往只有几百字节且 mtime 是"刚刚"）也收了进来，于是：
//   - 标题退化成目录名（如 "projects"）或裸 session id；
//   - 因为 mtime 最新，直接霸占「最新对话」榜首。
// 同时任务板新建对话的种子是一大段模板文字，被当成标题刷屏。
//
// 约定的三条规则：
//   1) 空壳会话（无 user/message、无投影标题、无任务引用）**不进索引**；
//   2) 被任务引用的会话**必须保留**（否则任务详情显示「会话已不存在」= 最初的 bug），
//      但要打上 empty 标记，由前端小组件过滤；
//   3) 任务种子消息的标题折叠成「任务「X」的新对话」。
import { apply } from "../lib/index.js";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { zstdCompressSync } from "node:zlib";

const home = await mkdtemp(join(tmpdir(), "tb-head-"));
process.env.DSH_HOME = home;

const WS = "/tmp/tb-head-ws";
const EMPTY_ID = "session-0000empty-0000-0000-0000-000000000001";
const SEED_ID = "session-0000seed-0000-0000-0000-000000000002";
const LINKED_EMPTY_ID = "session-0000link-0000-0000-0000-000000000003";

const sessRoot = join(home, "sessions", "tb-head-ws--abc123");
const frame = (obj) => zstdCompressSync(Buffer.from(`${JSON.stringify(obj)}\n`, "utf8"));

// 1) 空壳：只有引导事件，没有任何消息
const emptyDir = join(sessRoot, EMPTY_ID);
await mkdir(emptyDir, { recursive: true });
await writeFile(join(emptyDir, "session.jsonl.zstd"), Buffer.concat([
	frame({ type: "session", seq: 0, data: {} }),
	frame({ type: "permission/preset", seq: 1, data: {} })
]));

// 2) 任务板种子会话：首条 user/message 是模板长文
const seedDir = join(sessRoot, SEED_ID);
await mkdir(seedDir, { recursive: true });
await writeFile(join(seedDir, "session.jsonl.zstd"), frame({
	type: "user/message", seq: 0, time: Date.now(), surfaceOp: "append",
	data: {
		id: "m1", role: "user", source: { kind: "user" },
		content: [{ type: "text", text: "这是任务「性能测试报告生成」的一个新对话。开始前请先阅读并遵循以下任务共享上下文，它包含该任务的历史。" }]
	}
}));

// 3) 空壳，但被任务引用
const linkedDir = join(sessRoot, LINKED_EMPTY_ID);
await mkdir(linkedDir, { recursive: true });
await writeFile(join(linkedDir, "session.jsonl.zstd"), frame({ type: "session", seq: 0, data: {} }));

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
	workspaceRegistry: { list: () => [{ path: WS, title: "tb-head-ws" }] },
	sessions: { list: () => [], get: () => void 0 },
	sessionPersistence: {
		async list() { return [{ id: EMPTY_ID, cwd: WS }, { id: SEED_ID, cwd: WS }, { id: LINKED_EMPTY_ID, cwd: WS }]; },
		async create() {},
		async append() {}
	}
};

let failures = 0;
const check = (name, cond, detail) => {
	console.log(`${cond ? "PASS" : "FAIL"}  ${name}${detail === undefined ? "" : `  (${detail})`}`);
	if (!cond) failures++;
};

await apply(ctx, { storePath: join(home, "storages", "taskboard.json") });
const api = http(regs);

const list = await api("GET", "/taskboard/api/sessions");
const byId = new Map((list.body?.sessions ?? []).map((s) => [s.id, s]));

check("空壳会话不进索引（没被任务引用）", !byId.has(EMPTY_ID), `${byId.size} indexed`);
check("任务板种子会话进索引", byId.has(SEED_ID));
check("种子标题折叠为「任务「X」的新对话」",
	byId.get(SEED_ID)?.title === "任务「性能测试报告生成」的新对话", byId.get(SEED_ID)?.title);
check("索引里没有裸 session id 当标题的行",
	[...byId.values()].every((s) => s.title !== s.id),
	[...byId.values()].filter((s) => s.title === s.id).map((s) => s.id).join(",") || "ok");
check("非空会话不带 empty 标记", byId.get(SEED_ID)?.empty === false, String(byId.get(SEED_ID)?.empty));

// 空壳被任务引用后必须保留，并带 empty 标记
const created = await api("POST", "/taskboard/api/tasks", { title: "empty-link", repo: WS });
const taskId = created.body.task.id;
await api("POST", `/taskboard/api/tasks/${taskId}/sessions`, { sessionId: LINKED_EMPTY_ID, action: "link" });
const list2 = await api("GET", "/taskboard/api/sessions");
const linked = (list2.body?.sessions ?? []).find((s) => s.id === LINKED_EMPTY_ID);
check("被任务引用的空壳会话保留在索引里（否则任务详情显示「会话已不存在」）", linked !== undefined);
check("被引用的空壳会话带 empty 标记（前端小组件据此过滤）", linked?.empty === true, String(linked?.empty));
check("空壳会话标题不是裸 id", linked !== undefined && linked.title !== linked.id, linked?.title);

console.log(failures ? "FAILURES" : "ALL OK");
process.exit(failures ? 1 : 0);
