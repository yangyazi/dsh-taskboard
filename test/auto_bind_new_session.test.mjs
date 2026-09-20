// 回归测试：从任务看板点「＋新对话」后，用户发出的第一条消息所在的新会话必须自动关联到该任务。
//
// 背景（用户报障）：原生「新建对话」是**草稿态** —— 点按钮时还没有 session id，
// 会话要等用户发出第一条消息才真正创建。上一版只靠**页面内计时器**去发现新 id：
//   ① 页面一刷新计时器就没了；② 用户先切走再发消息也抓不到；③ 时序稍有偏差就漏。
// 实测任务「适配架构发现问题及时perf」下两条对话只关联上了一条（另一条漏了）。
//
// 现方案：客户端点按钮时先向宿主登记（POST /tasks/:id/arm-session），
// 宿主在 `session/created`（会话真正诞生）时完成绑定，不依赖页面状态。
import { apply } from "../lib/index.js";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const home = await mkdtemp(join(tmpdir(), "tb-arm-"));
process.env.DSH_HOME = home;

const WS = "/tmp/tb-arm-ws";
const handlers = new Map();     // 事件名 → 处理函数（捕获 ctx.on）
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
	on(name, fn) { handlers.set(name, fn); },
	logger: { info() {}, warn() {}, error() {} },
	webServer: { register(x) { regs.push(x); }, tapIndex() {} },
	workspaceRegistry: { list: () => [{ path: WS, title: "tb-arm-ws" }] },
	sessions: { list: () => [], get: () => void 0 },
	sessionPersistence: { async list() { return []; }, async create() {}, async append() {} }
};

let failures = 0;
const check = (name, cond, detail) => {
	console.log(`${cond ? "PASS" : "FAIL"}  ${name}${detail === undefined ? "" : `  (${detail})`}`);
	if (!cond) failures++;
};
const newSession = (id, createdAt) => ({ id, header: { createdAt, cwd: WS } });
const linked = async (api, taskId) => ((await api("GET", `/taskboard/api/tasks/${taskId}`)).body?.task?.sessionIds) ?? [];

await apply(ctx, { storePath: join(home, "storages", "taskboard.json") });
const api = http(regs);
const onCreated = handlers.get("session/created");
check("宿主注册了 session/created 钩子", typeof onCreated === "function");

const a = (await api("POST", "/taskboard/api/tasks", { title: "arm-A", repo: WS })).body.task.id;
const b = (await api("POST", "/taskboard/api/tasks", { title: "arm-B", repo: WS })).body.task.id;

// 1) 登记后新建的会话 → 绑定到该任务
await api("POST", `/taskboard/api/tasks/${a}/arm-session`, {});
await onCreated(newSession("session-arm-1", Date.now() + 50));
await new Promise((r) => setTimeout(r, 50));
check("登记后新建的会话自动关联", (await linked(api, a)).includes("session-arm-1"), JSON.stringify(await linked(api, a)));

// 2) 没有登记时，新会话不应被绑定
await onCreated(newSession("session-arm-2", Date.now() + 50));
await new Promise((r) => setTimeout(r, 50));
check("未登记时新会话不被误绑", !(await linked(api, a)).includes("session-arm-2"));

// 3) 两个任务都登记 → 只绑最近登记的那个
await api("POST", `/taskboard/api/tasks/${a}/arm-session`, {});
await new Promise((r) => setTimeout(r, 20));
await api("POST", `/taskboard/api/tasks/${b}/arm-session`, {});
await onCreated(newSession("session-arm-3", Date.now() + 50));
await new Promise((r) => setTimeout(r, 50));
check("只绑最近登记的任务(B)", (await linked(api, b)).includes("session-arm-3"), JSON.stringify(await linked(api, b)));
check("不会同时绑到另一个任务(A)", !(await linked(api, a)).includes("session-arm-3"), JSON.stringify(await linked(api, a)));

// 4) 会话创建时间早于登记时间（例如旧会话的后续活动）→ 不绑
await api("POST", `/taskboard/api/tasks/${a}/arm-session`, {});
await onCreated(newSession("session-arm-old", Date.now() - 10 * 60 * 1000));
await new Promise((r) => setTimeout(r, 50));
check("早于登记的旧会话不被误绑", !(await linked(api, a)).includes("session-arm-old"));

// 5) 内部字段不外泄
const taskView = (await api("GET", `/taskboard/api/tasks/${a}`)).body.task;
check("arm 登记字段不暴露给前端", taskView.armNextSession === undefined, JSON.stringify(taskView.armNextSession));

// 6) 陈旧登记（超过 2 小时）自动过期，不会绑到后来的新会话
await api("POST", `/taskboard/api/tasks/${a}/arm-session`, {});
// 直接把登记时间改成 3 小时前
const store = JSON.parse(await (await import("node:fs/promises")).readFile(join(home, "storages", "taskboard.json"), "utf8"));
for (const t of store.tasks) if (t.id === a) t.armNextSession = Date.now() - 3 * 60 * 60 * 1000;
await (await import("node:fs/promises")).writeFile(join(home, "storages", "taskboard.json"), JSON.stringify(store));
await onCreated(newSession("session-arm-stale", Date.now() + 50));
await new Promise((r) => setTimeout(r, 50));
check("陈旧登记不会绑到新会话", !(await linked(api, a)).includes("session-arm-stale"));

console.log(failures ? "FAILURES" : "ALL OK");
process.exit(failures ? 1 : 0);
