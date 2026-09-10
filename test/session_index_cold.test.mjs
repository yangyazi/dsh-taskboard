// Regression test: 任务里关联的会话必须能在 /taskboard/api/sessions 里解析出来。
//
// 背景（用户报告「关联对话不见了」）：sessionIndex() 早期只合并两个来源——
// 实时 ctx.sessions（正在运行的会话）和投影缓存 session_projcache.json
// （被 GUI 打开过的会话）。宿主侧新建的冷会话（项目里新建但还没打开过）
// 两者都不在，于是任务详情里这些关联会话显示「（会话已不存在）」并且
// 「打开」按钮消失，看起来就像关联关系丢了。
//
// 修复：加入第三个来源 ctx.sessionPersistence.list()（磁盘上真实存在的会话），
// 标题回退顺序为 投影缓存 title → 会话日志首条 user/message → cwd basename → id。
// 本测试构造一个"既不在实时 store、也不在 projcache、但磁盘上有会话日志"的会话，
// 断言它出现在 /sessions 里，且标题来自日志里的首条用户消息。
import { apply } from "../lib/index.js";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { zstdCompressSync } from "node:zlib";

const home = await mkdtemp(join(tmpdir(), "tb-cold-"));
process.env.DSH_HOME = home;

const WS = "/tmp/tb-cold-ws";
const COLD_ID = "session-0000cold-0000-0000-0000-000000000001";
const COLD_TITLE = "冷会话首条用户消息";

// 真实写一份会话日志：zstd 帧 + JSONL，首行是 user/message。
const sessDir = join(home, "sessions", "tb-cold-ws--abc123", COLD_ID);
await mkdir(sessDir, { recursive: true });
const seedLine = JSON.stringify({
	type: "user/message", seq: 0, time: Date.now(), surfaceOp: "append",
	data: { id: "m1", role: "user", source: { kind: "user" }, content: [{ type: "text", text: COLD_TITLE }] }
});
const frame = zstdCompressSync(Buffer.from(`${seedLine}\n`, "utf8"));
await writeFile(join(sessDir, "session.jsonl.zstd"), Buffer.concat([frame, frame]));

function bodyBytes(body) {
	if (body == null) return null;
	return Buffer.from(typeof body === "string" ? body : JSON.stringify(body), "utf8");
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
	workspaceRegistry: { list: () => [{ path: WS, title: "tb-cold-ws" }] },
	// 实时 store 里【没有】这个冷会话
	sessions: { list: () => [], get: () => void 0 },
	// 磁盘持久化里【有】它
	sessionPersistence: {
		async list() { return [{ id: COLD_ID, cwd: WS }]; },
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

const created = await api("POST", "/taskboard/api/tasks", { title: "cold-link", repo: WS });
const taskId = created.body.task.id;
await api("POST", `/taskboard/api/tasks/${taskId}/sessions`, { sessionId: COLD_ID, action: "link" });

const sessions = await api("GET", "/taskboard/api/sessions");
const ids = (sessions.body?.sessions ?? []).map((s) => s.id);
check("cold session (not live, not in projcache) is indexed", ids.includes(COLD_ID),
	`${ids.length} indexed`);

const row = (sessions.body?.sessions ?? []).find((s) => s.id === COLD_ID);
check("cold session title comes from first user/message", row?.title === COLD_TITLE, row?.title);
check("cold session carries repo/cwd", row?.cwd === WS && row?.repo === WS, `${row?.cwd} / ${row?.repo}`);

// 任务视角：关联能在索引里解析 → 前端不会显示「（会话已不存在）」
const detail = await api("GET", `/taskboard/api/tasks/${taskId}`);
check("task keeps the linked session", (detail.body?.task?.sessionIds ?? []).includes(COLD_ID));

const bySession = await api("GET", `/taskboard/api/task-by-session?sessionId=${COLD_ID}`);
check("reverse lookup finds the task", bySession.body?.task?.id === taskId, bySession.body?.task?.id);

console.log(failures ? "FAILURES" : "ALL OK");
process.exit(failures ? 1 : 0);
