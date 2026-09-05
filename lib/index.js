// dsh-taskboard host half: an ordinary Cordis plugin for the `web` profile.
//
// A lightweight Jira-like task board for the DSH Web GUI. Unlike the heavy
// @ttmouse/dsh-taskboard (SQLite server + React SPA), this one is minimal:
//   - storage: one JSON file (~/.dsh/storages/taskboard.json), atomic writes
//   - API:    /taskboard/api/tasks (CRUD + notes + split + session links +
//             seeded new-session), /taskboard/api/sessions (index with live
//             markers), /taskboard/api/workspaces, /taskboard/api/reindex-sessions
//   - context sharing: a task's description + notes timeline is injected into
//             new conversations (seed) and appended to linked conversations
//             (cold) or queued for auto-injection when a running session ends
//   - client: /taskboard/assets/app.js (vanilla JS, no framework)
import { readFile, writeFile, rename, readdir, stat, mkdir, unlink, rmdir } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { dirname, extname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import os from "node:os";
import path from "node:path";

export const name = "taskboard";

/** Services required before this row can activate. */
export const inject = ["webServer", "sessions", "workspaceRegistry", "sessionPersistence"];

const MIME = {
	".js": "text/javascript; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".json": "application/json",
	".html": "text/html; charset=utf-8",
	".svg": "image/svg+xml",
	".png": "image/png"
};

const PREFIX = "/taskboard";
const STATUSES = ["todo", "in_progress", "in_review", "done", "blocked"];
const PRIORITIES = ["low", "medium", "high", "urgent"];
const REVIEWS = ["none", "pending", "approved", "rejected"];
const TESTS = ["none", "pending", "passed", "failed"];

// Persistence robustness knobs (see "---- persistence ----" below):
// Every store write is serialized on an in-process queue AND guarded by an
// advisory lock dir so two `dsh web` processes sharing one $DSH_HOME do not
// lose each other's updates. A stale lock (owner died / crashed) is stolen
// after LOCK_STALE_MS; waiters give up after LOCK_WAIT_MS.
const STORE_VERSION = 1;
const LOCK_STALE_MS = 30_000;
const LOCK_WAIT_MS = 8_000;
const LOCK_POLL_MS = 25;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let chain = Promise.resolve();
/** Run every task strictly in order regardless of prior task outcomes. */
function enqueue(task) {
	const run = chain.then(task, task);
	chain = run.then(() => {}, () => {});
	return run;
}

function json(res, status, body) {
	res.statusCode = status;
	res.setHeader("content-type", "application/json; charset=utf-8");
	res.setHeader("cache-control", "no-store");
	res.end(JSON.stringify(body));
}

async function readBody(req, limit) {
	const chunks = [];
	let total = 0;
	for await (const chunk of req) {
		total += chunk.length;
		if (total > limit) throw Object.assign(new Error("body too large"), { status: 413 });
		chunks.push(chunk);
	}
	return Buffer.concat(chunks).toString("utf8");
}

function isInside(root, target) {
	const rel = relative(root, target);
	return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel));
}

function clampEnum(value, allowed, fallback) {
	return allowed.includes(value) ? value : fallback;
}

function clampInt(value, min, max, fallback) {
	const n = Number(value);
	return Number.isFinite(n) && n >= min && n <= max ? Math.round(n) : fallback;
}

// ---- bundled skill (vendor/skills/manage-taskboard) -----------------------
// dsh-taskboard ships a DSH skill (`manage-taskboard`) so a model working in a
// task session can manage the board through the same taskboard API. DSH's skill
// loader (dsh-skill-filesystem) requires SKILL.md files to carry YAML frontmatter
// with at least `name` + `description`; we parse that minimal frontmatter here and
// register the skill into `ctx.skills` at runtime so it is discoverable regardless
// of where the package was installed (npm pack/publish or a `file:` dev link).
function parseSkillFrontmatter(raw) {
	const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
	if (!m) return null;
	const data = {};
	for (const line of m[1].split(/\r?\n/)) {
		const kv = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line.trim());
		if (!kv) continue;
		let val = kv[2].trim();
		if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
		data[kv[1]] = val;
	}
	return { data, body: raw.slice(m[0].length) };
}

export async function apply(ctx, config = {}) {
	const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
	const clientDist = join(pkgRoot, "client-dist");
	// Data file defaults to $DSH_HOME/storages/taskboard.json.
	const dataFile = resolve(config.storePath ?? join(process.env.DSH_HOME ?? path.join(os.homedir(), ".dsh"), "storages", "taskboard.json"));

	// ---- bundled skill registration ---------------------------------------
	// Read vendor/skills/manage-taskboard/SKILL.md and register it on `ctx.skills`
	// so the `manage-taskboard` skill is discoverable from the installed package
	// (npm or `file:` link), independent of any user/project skill root. register()
	// is a same-name first-wins no-op if a local copy already supplies the skill,
	// and we skip it entirely when the host has no skills service.
	const skillBundlePath = join(pkgRoot, "vendor", "skills", "manage-taskboard", "SKILL.md");
	function buildSkillRegistration() {
		try {
			const parsed = parseSkillFrontmatter(readFileSync(skillBundlePath, "utf8"));
			const name = parsed?.data?.name || "manage-taskboard";
			const description = parsed?.data?.description;
			if (!description) return undefined;
			const content = (parsed?.body ?? "").trim();
			if (!content) return undefined;
			return {
				name,
				description,
				...(parsed.data.whenToUse ? { whenToUse: parsed.data.whenToUse } : {}),
				source: "bundled",
				resourceBase: { kind: "directory", path: dirname(skillBundlePath) },
				content
			};
		} catch {
			return undefined;
		}
	}
	function tryRegisterBundledSkill() {
		try {
			if (!ctx.skills?.register) return;
			const registration = buildSkillRegistration();
			if (!registration) return;
			// register() registers cleanup on the ctx effect scope itself, so calling it
			// directly is enough — no need to wrap in ctx.effect (which would be a late
			// effect when reached from the setTimeout retry).
			ctx.skills.register(registration);
		} catch (error) {
			ctx.logger?.warn?.(`dsh-taskboard: bundled skill registration skipped: ${String(error?.message ?? error)}`);
		}
	}
	tryRegisterBundledSkill();
	// The skills service may not have started when this plugin activates; retry once.
	setTimeout(tryRegisterBundledSkill, 800);

	// ---- persistence -------------------------------------------------------
	// A single JSON file is shared by every mutator (HTTP PATCH/notes/split,
	// background activity flushes, session-link updates). A naive
	// read→modify→write loses updates whenever two mutators overlap — in the
	// same process (the two PATCHes / PATCH+notes race) or across two `dsh web`
	// processes that share one $DSH_HOME (the 3081/3083 dual-open case). So:
	//   1. every write runs inside an in-process queue (enqueue) → serial;
	//   2. every write also takes an advisory lock dir → cross-process mutex;
	//   3. the on-disk `version` is bumped each save (diagnostic / optimistic
	//      marker, kept for forward-compat with a future compare-and-swap);
	//   4. a corrupt file is quarantined to .bak-<ts> and surfaced as an error,
	//      never silently read as "[]" and then overwritten to nothing.

	// Advisory (O_EXCL-like) lock dir. Steal if the holder died or went stale.
	const lockDir = `${dataFile}.lock`;
	async function acquireLock(timeoutMs = LOCK_WAIT_MS) {
		const deadline = Date.now() + timeoutMs;
		for (;;) {
			try {
				await mkdir(lockDir);
				return true;
			} catch (err) {
				if (err?.code !== "EEXIST") throw err; // e.g. read-only fs
				const st = await stat(lockDir).catch(() => null);
				const stale = st && Date.now() - st.mtimeMs > LOCK_STALE_MS;
				if (stale) {
					await rmdir(lockDir).catch(() => {});
					continue;
				}
				if (Date.now() > deadline) return false; // another live writer holds it
				await sleep(LOCK_POLL_MS);
			}
		}
	}
	async function releaseLock() {
		await rmdir(lockDir).catch(() => {});
	}

	/** Read the raw store. ENOENT (first run) → empty; corrupt → quarantine + throw. */
	async function readRaw() {
		let raw;
		try {
			raw = await readFile(dataFile, "utf8");
		} catch (err) {
			if (err?.code === "ENOENT") return { version: 0, tasks: [] };
			throw err;
		}
		let parsed;
		try {
			parsed = JSON.parse(raw);
		} catch {
			await quarantineCorrupt(raw);
			throw new Error(`taskboard data file is corrupt: ${dataFile} — original kept at .bak-<ts>; delete it (or the .bak) to start clean`);
		}
		if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.tasks)) {
			await quarantineCorrupt(raw);
			throw new Error(`taskboard data file has an invalid shape: ${dataFile} — original kept at .bak-<ts>`);
		}
		return { version: Number.isInteger(parsed.version) ? parsed.version : 0, tasks: parsed.tasks };
	}

	/** Preserve a corrupt file instead of silently wiping the user's tasks. */
	async function quarantineCorrupt(raw) {
		try {
			await mkdir(dirname(dataFile), { recursive: true });
			const bak = `${dataFile}.bak-${Date.now()}`;
			await writeFile(bak, raw, "utf8");
			ctx.logger?.error?.(`dsh-taskboard: quarantined corrupt data file → ${bak}`);
		} catch { /* best-effort */ }
		try { await unlink(dataFile); } catch { /* best-effort */ }
	}

	async function writeRaw(version, tasks) {
		if (!Array.isArray(tasks)) throw new Error("internal: refusing to persist a non-array task list");
		await mkdir(dirname(dataFile), { recursive: true });
		const tmp = `${dataFile}.tmp`;
		await writeFile(tmp, JSON.stringify({ version, tasks }, null, 2), "utf8");
		await rename(tmp, dataFile);
	}

	/** Read the current task list (read-only, no lock). Atomic single-file read. */
	async function loadTasks() {
		return (await readRaw()).tasks;
	}

	// Run `fn(tasks)` against the freshest list and persist it exactly once,
	// serialized against every other writer in- and cross-process.
	async function mutate(fn) {
		return await enqueue(async () => {
			// null => could not probe the lock (e.g. read-only fs) → queue-only; degrade.
			let locked = await acquireLock().catch(() => null);
			if (locked === false) {
				// A live foreign process held the lock for the whole wait: refuse to
				// write rather than silently drop its concurrent update.
				throw new Error("taskboard store is busy — another dsh process is writing; retry");
			}
			try {
				const { version, tasks } = await readRaw();
				const result = fn(tasks);
				if (result && typeof result.then === "function") {
					// callers historically pass sync fns; guard anyway
					await result;
				}
				await writeRaw(version + 1, tasks);
				return result;
			} finally {
				if (locked === true) await releaseLock();
			}
		});
	}

	// Clean up stale temp/lock leftovers from a crash; called once at startup.
	async function cleanupStaleFiles() {
		try { await unlink(`${dataFile}.tmp`); } catch { /* not present */ }
		// Only steal the advisory lock if it is stale; a live sibling `dsh web`
		// (sharing the store) may legitimately hold it.
		try {
			const st = await stat(lockDir);
			if (Date.now() - st.mtimeMs > LOCK_STALE_MS) await rmdir(lockDir).catch(() => {});
		} catch { /* absent or unreadable */ }
	}

	function taskView(t) {
		const { pendingInjects, ...rest } = t;
		return rest;
	}

	// 自动派生展示进度：状态映射 + 子任务平均 + 手动覆盖。
	// 规则：done=100 / todo=0；有子任务=子任务均值；手动设过>0 用手动；
	//       否则 in_review=90 / in_progress=50 / blocked 保持。
	function withProgress(task, allTasks) {
		const view = taskView(task);
		let displayProgress;
		if (task.status === "done") displayProgress = 100;
		else if (task.status === "todo") displayProgress = 0;
		else {
			const children = (allTasks || []).filter((t) => t.parentId === task.id);
			if (children.length) {
				displayProgress = Math.round(children.reduce((sum, c) => sum + withProgress(c, allTasks).displayProgress, 0) / children.length);
			} else if ((task.progress || 0) > 0) {
				displayProgress = Math.min(100, task.progress);
			} else {
				displayProgress = task.status === "in_review" ? 90 : task.status === "in_progress" ? 50 : (task.progress || 0);
			}
		}
		view.displayProgress = displayProgress;
		return view;
	}

	function viewList(tasks) {
		return tasks.map((t) => withProgress(t, tasks));
	}

	function viewOne(tasks, id) {
		const t = tasks.find((x) => x.id === id);
		return t ? withProgress(t, tasks) : undefined;
	}

	function newId() {
		return `task-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
	}

	// 会话最近活动时间：持久化文件 mtime（best-effort；失败回退 null）
	const sessionRoot = join(process.env.DSH_HOME ?? path.join(os.homedir(), ".dsh"), "sessions");
	async function sessionFileMtime(sessionId) {
		try {
			for (const wsDir of await readdir(sessionRoot, { withFileTypes: true })) {
				if (!wsDir.isDirectory()) continue;
				const f = join(sessionRoot, wsDir.name, sessionId, "session.jsonl.zstd");
				try {
					const info = await stat(f);
					return info.mtimeMs;
				} catch { /* not here */ }
			}
		} catch { /* root unreadable */ }
		return null;
	}

	// ---- session index -----------------------------------------------------
	// Live sessions are marked running:true; repo is the workspace PATH.
	async function sessionIndex() {
		const out = [];
		const seen = new Set();
		const byId = new Map();
		try {
			const proj = JSON.parse(await readFile(join(process.env.DSH_HOME ?? path.join(os.homedir(), ".dsh"), "storages", "session_projcache.json"), "utf8"));
			for (const [id, rec] of Object.entries(proj.tables?.sessions ?? {})) {
				byId.set(id, {
					title: rec.rows?.title?.val ?? null,
					cwd: rec.identity?.cwd ?? null,
					turns: rec.rows?.sessionStats?.val?.turns ?? 0,
					updated: rec.updatedAt ?? null
				});
			}
		} catch { /* projcache unavailable */ }
		const repoByCwd = new Map();
		try {
			for (const ws of ctx.workspaceRegistry?.list() ?? []) repoByCwd.set(resolve(ws.path), ws.path);
		} catch { /* registry unavailable */ }
		try {
			for (const session of ctx.sessions?.list() ?? []) {
				if (seen.has(session.id)) continue;
				const meta = byId.get(session.id);
				seen.add(session.id);
				const cwd = session.header?.cwd ?? meta?.cwd ?? null;
				out.push({
					id: session.id,
					title: meta?.title ?? session.header?.title ?? session.id,
					cwd,
					repo: cwd ? (repoByCwd.get(resolve(cwd)) ?? path.basename(cwd)) : null,
					turns: meta?.turns ?? 0,
					running: true,
					updatedAt: await sessionFileMtime(session.id)
				});
			}
		} catch { /* sessions service unavailable */ }
		for (const [id, meta] of byId) {
			if (seen.has(id)) continue;
			seen.add(id);
			out.push({
				id,
				title: meta.title ?? id,
				cwd: meta.cwd,
				repo: meta.cwd ? (repoByCwd.get(resolve(meta.cwd)) ?? path.basename(meta.cwd)) : null,
				turns: meta.turns ?? 0,
				updatedAt: await sessionFileMtime(id)
			});
		}
		out.sort((a, b) => String(b.title ?? "").localeCompare(String(a.title ?? "")));
		return out;
	}

	async function workspaceList() {
		const out = [];
		const seen = new Set();
		try {
			for (const ws of ctx.workspaceRegistry?.list() ?? []) {
				out.push({ id: ws.id, title: ws.title ?? path.basename(ws.path), path: ws.path });
				seen.add(resolve(ws.path));
			}
		} catch { /* registry unavailable */ }
		try {
			const root = process.env.DSH_HOME ?? path.join(os.homedir(), ".dsh");
			const wsJson = JSON.parse(await readFile(join(root, "storages", "workspace.json"), "utf8"));
			for (const ws of Object.values(wsJson.tables?.workspaces ?? {})) {
				if (!seen.has(resolve(ws.path))) {
					out.push({ id: null, title: ws.title ?? path.basename(ws.path), path: ws.path });
					seen.add(resolve(ws.path));
				}
			}
		} catch { /* workspace storage unavailable */ }
		return out;
	}

	// ---- shared context digest --------------------------------------------
	async function buildTaskDigest(task) {
		const fmt = (ts) => ts ? new Date(ts).toLocaleString("zh-CN", { hour12: false }) : "";
		const lines = [];
		lines.push(`任务：${task.title}`);
		if (task.repo) lines.push(`仓库：${task.repo}${task.feature ? ` | 分支/feature：${task.feature}` : ""}`);
		lines.push(`状态：${task.status} | 优先级：${task.priority}`);
		if (task.description) lines.push(`\n【任务描述】\n${task.description}`);
		if ((task.notes || []).length) {
			lines.push(`\n【历史进展（本任务圈子的共享记忆）】`);
			for (const n of task.notes) lines.push(`- ${fmt(n.at)}：${n.text}`);
		}
		if ((task.sessionIds || []).length) {
			lines.push(`\n【已关联的历史会话】`);
			try {
				const sessTitles = new Map((await sessionIndex()).map((x) => [x.id, x.title]));
				for (const sid of task.sessionIds) lines.push(`- ${sessTitles.get(sid) ?? sid}`);
			} catch {
				for (const sid of task.sessionIds) lines.push(`- ${sid}`);
			}
		}
		return lines.join("\n").slice(0, 20000);
	}

	/** 向一个非运行中的会话追加任务上下文消息。返回 true=已注入。 */
	async function injectContextIntoSession(sessionId, task) {
		try {
			if (!ctx.sessionPersistence) return false;
			const insp = await ctx.sessionPersistence.inspect(sessionId);
			if (!insp || !Array.isArray(insp.events)) return false;
			const nextSeq = insp.events.length;
			const digest = await buildTaskDigest(task);
			const msgId = `msg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
			await ctx.sessionPersistence.append(sessionId, [{
				type: "user/message",
				seq: nextSeq,
				time: Date.now(),
				surfaceOp: "append",
				data: {
					id: msgId,
					role: "user",
					content: [{ type: "text", text: `此会话已关联到任务「${task.title}」。任务共享上下文（历史背景）：\n\n${digest}` }],
					source: { kind: "user" }
				}
			}]);
			return true;
		} catch {
			return false;
		}
	}

	/** 会话结束（disposed）时补注入：把关联时积压的 pendingInjects 写入该会话。 */
	async function flushPendingInjects(sessionId) {
		try {
			const tasks = await loadTasks();
			const targets = tasks.filter((t) => (t.pendingInjects || []).some((p) => p.sessionId === sessionId));
			if (!targets.length) return;
			for (const t of targets) {
				await injectContextIntoSession(sessionId, t);
			}
			await mutate((tasks) => {
				for (const t of tasks) {
					if ((t.pendingInjects || []).some((p) => p.sessionId === sessionId)) {
						t.pendingInjects = (t.pendingInjects || []).filter((p) => p.sessionId !== sessionId);
						t.updatedAt = Date.now();
					}
				}
			});
			ctx.logger?.info?.(`dsh-taskboard: pending context injected into ${sessionId} for ${targets.length} task(s)`);
		} catch (error) {
			ctx.logger?.warn?.(`dsh-taskboard: pending inject failed for ${sessionId}: ${String(error?.message ?? error)}`);
		}
	}

	/** 启动时扫描：对所有已非 live 的 pendingInjects 补注入并清理（覆盖宿主重启场景）。 */
	async function flushAllPendingInjects() {
		try {
			const tasks = await loadTasks();
			let done = 0;
			for (const t of tasks) {
				for (const p of t.pendingInjects || []) {
					if (ctx.sessions?.get(p.sessionId) === void 0) {
						const ok = await injectContextIntoSession(p.sessionId, t);
						if (ok) done++;
					}
				}
			}
			if (done) {
				await mutate((tasks) => {
					for (const t of tasks) {
						const before = t.pendingInjects?.length ?? 0;
						t.pendingInjects = (t.pendingInjects || []).filter((p) => ctx.sessions?.get(p.sessionId) !== void 0);
						if ((t.pendingInjects?.length ?? 0) !== before) t.updatedAt = Date.now();
					}
				});
				ctx.logger?.info?.(`dsh-taskboard: startup pending injects flushed: ${done}`);
			}
		} catch (error) {
			ctx.logger?.warn?.(`dsh-taskboard: startup pending flush failed: ${String(error?.message ?? error)}`);
		}
	}

	/** 把持久化会话按 cwd 挂进工作区（修"未分组"）。 */
	async function reindexWorkspaceSessions() {
		try {
			const headers = await ctx.sessionPersistence?.list();
			const workspaces = ctx.workspaceRegistry?.list() ?? [];
			const wsByPath = new Map(workspaces.map((ws) => [resolve(ws.path), ws]));
			let attached = 0;
			let detached = 0;
			for (const header of headers ?? []) {
				if (!header?.id || typeof header.cwd !== "string" || !header.cwd) continue;
				const ws = wsByPath.get(resolve(header.cwd));
				if (!ws) continue;
				if (ws.sessionIds?.includes(header.id)) continue;
				try { await ws.attachSession(header.id); attached++; } catch { /* conflict etc. */ }
			}
			for (const ws of workspaces) {
				for (const sid of ws.sessionIds ?? []) {
					const header = (headers ?? []).find((h) => h.id === sid);
					if (!header || !header.cwd || wsByPath.get(resolve(header.cwd)) !== ws) {
						try { await ws.detachSession(sid); detached++; } catch { /* already gone */ }
					}
				}
			}
			if (attached || detached) ctx.logger?.info?.(`dsh-taskboard: workspace reindex: ${attached} attached, ${detached} detached`);
			return { attached, detached };
		} catch (error) {
			ctx.logger?.warn?.(`dsh-taskboard: workspace reindex failed: ${String(error?.message ?? error)}`);
			return { attached: 0, detached: 0 };
		}
	}

	// ---- static assets -----------------------------------------------------
	ctx.effect(() => ctx.webServer.register({
		kind: "prefix",
		path: `${PREFIX}/assets`,
		handler: async (req, res) => {
			const url = new URL(req.url ?? "/", "http://x");
			const rel = decodeURIComponent(url.pathname.slice(`${PREFIX}/assets`.length));
			const target = resolve(join(clientDist, `.${rel}`));
			if (!isInside(clientDist, target)) {
				res.statusCode = 403;
				res.end();
				return;
			}
			try {
				const body = await readFile(target);
				res.statusCode = 200;
				res.setHeader("content-type", MIME[extname(target)] ?? "application/octet-stream");
				res.setHeader("cache-control", "no-cache");
				res.end(body);
			} catch {
				res.statusCode = 404;
				res.end();
			}
		}
	}));

	// ---- tasks API ---------------------------------------------------------
	ctx.effect(() => ctx.webServer.register({
		kind: "prefix",
		path: `${PREFIX}/api/tasks`,
		handler: async (req, res) => {
			const url = new URL(req.url ?? "/", "http://x");
			const seg = url.pathname.slice(`${PREFIX}/api/tasks`.length).split("/").filter(Boolean);
			const id = seg[0] ?? null;
			try {
				// GET /taskboard/api/tasks?status=&repo=&q=&priority=&label=
				if (!id && req.method === "GET") {
					const tasks = await loadTasks();
					const status = url.searchParams.get("status");
					const repo = url.searchParams.get("repo");
					const priority = url.searchParams.get("priority");
					const label = url.searchParams.get("label");
					const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
					const labels = label ? label.split(",").map((s) => s.trim()).filter(Boolean) : [];
					const filtered = tasks.filter((t) =>
						(!status || t.status === status)
						&& (!repo || t.repo === repo || (t.repo && t.repo.split("/").pop() === repo))
						&& (!priority || t.priority === priority)
						&& (!labels.length || (t.labels || []).some((l) => labels.includes(l)))
						&& (!q || [t.title, t.repo, t.feature, t.description, (t.labels || []).join(" ")].join(" ").toLowerCase().includes(q))
					);
					filtered.sort((a, b) => b.updatedAt - a.updatedAt);
					return json(res, 200, { tasks: viewList(filtered) });
				}
				// POST /taskboard/api/tasks
				if (!id && req.method === "POST") {
					const body = JSON.parse(await readBody(req, 256 * 1024));
					const now = Date.now();
					const task = {
						id: newId(),
						title: String(body.title ?? "").trim().slice(0, 300),
						repo: String(body.repo ?? "").trim().slice(0, 200),
						feature: String(body.feature ?? "").trim().slice(0, 200),
						description: String(body.description ?? "").slice(0, 20000),
						status: clampEnum(body.status, STATUSES, "todo"),
						priority: clampEnum(body.priority, PRIORITIES, "medium"),
						progress: clampInt(body.progress, 0, 100, 0),
						review: clampEnum(body.review, REVIEWS, "none"),
						test: clampEnum(body.test, TESTS, "none"),
						labels: Array.isArray(body.labels) ? [...new Set(body.labels.map((l) => String(l).trim().slice(0, 40)).filter(Boolean))].slice(0, 20) : [],
						sessionIds: Array.isArray(body.sessionIds) ? body.sessionIds.filter((s) => typeof s === "string").slice(0, 20) : [],
						notes: [],
						createdAt: now,
						updatedAt: now
					};
					if (!task.title) return json(res, 400, { error: "title required" });
					if (!task.repo) return json(res, 400, { error: "repo required（任务必须属于一个仓库目录/工作区，新建的会话才能挂到对应分组）" });
					await mutate((tasks) => { tasks.push(task); });
					return json(res, 201, { task: taskView(task) });
				}
				if (!id) return json(res, 405, { error: "method not allowed" });

				const task = (await loadTasks()).find((t) => t.id === id);
				if (!task) return json(res, 404, { error: "task not found" });

				// GET /taskboard/api/tasks/:id
				if (req.method === "GET" && seg[1] === "context") {
					// 池子实时共享上下文：池内任意会话随时拉取最新版（不依赖注入时的快照）
					const context = await buildTaskDigest(task);
					return json(res, 200, { context, poolSessions: task.sessionIds || [] });
				}
				if (req.method === "GET") return json(res, 200, { task: withProgress(task, await loadTasks()) });

				// PATCH /taskboard/api/tasks/:id — partial field update
				if (req.method === "PATCH") {
					const body = JSON.parse(await readBody(req, 256 * 1024));
					await mutate((tasks) => {
						const t = tasks.find((x) => x.id === id);
						if (!t) return;
						const fields = ["title", "repo", "feature", "description", "status", "priority", "progress", "review", "test"];
						for (const f of fields) {
							if (body[f] === undefined) continue;
							if (f === "status") t.status = clampEnum(body[f], STATUSES, t.status);
							else if (f === "priority") t.priority = clampEnum(body[f], PRIORITIES, t.priority);
							else if (f === "review") t.review = clampEnum(body[f], REVIEWS, t.review);
							else if (f === "test") t.test = clampEnum(body[f], TESTS, t.test);
							else if (f === "progress") t.progress = clampInt(body[f], 0, 100, t.progress);
							else if (f === "labels") t.labels = Array.isArray(body[f]) ? [...new Set(body[f].map((l) => String(l).trim().slice(0, 40)).filter(Boolean))].slice(0, 20) : [];
							else if (f === "title") t.title = String(body[f]).trim().slice(0, 300) || t.title;
							else if (f === "description") t.description = String(body[f]).slice(0, 20000);
							else t[f] = String(body[f] ?? "").trim().slice(0, 200);
						}
						t.updatedAt = Date.now();
					});
					const updated = (await loadTasks()).find((t) => t.id === id);
					return json(res, 200, { task: withProgress(updated, await loadTasks()) });
				}

				// POST /taskboard/api/tasks/:id/notes — {text} appended to the timeline
				if (req.method === "POST" && seg[1] === "notes") {
					const body = JSON.parse(await readBody(req, 256 * 1024));
					const text = String(body.text ?? "").trim().slice(0, 20000);
					if (!text) return json(res, 400, { error: "text required" });
					await mutate((tasks) => {
						const t = tasks.find((x) => x.id === id);
						if (!t) return;
						t.notes.push({ at: Date.now(), text });
						t.updatedAt = Date.now();
					});
					const updated = (await loadTasks()).find((t) => t.id === id);
					return json(res, 200, { task: withProgress(updated, await loadTasks()) });
				}

				// POST /taskboard/api/tasks/:id/split — {titles:[...]} split a big task
				if (req.method === "POST" && seg[1] === "split") {
					const body = JSON.parse(await readBody(req, 256 * 1024));
					const titles = (Array.isArray(body.titles) ? body.titles : [])
						.map((t) => String(t ?? "").trim().slice(0, 300)).filter(Boolean).slice(0, 20);
					if (!titles.length) return json(res, 400, { error: "titles required" });
					const now = Date.now();
					const children = await mutate((tasks) => {
						const parent = tasks.find((t) => t.id === id);
						if (!parent) return null;
						const created = [];
						for (const title of titles) {
							const child = {
								id: newId(),
								parentId: parent.id,
								title,
								repo: parent.repo,
								feature: parent.feature,
								description: "",
								status: "todo",
								priority: parent.priority,
								progress: 0,
								review: "none",
								test: "none",
								labels: [...parent.labels],
								sessionIds: [...parent.sessionIds],
								notes: [{ at: now, text: `由「${parent.title}」拆分创建` }],
								createdAt: now,
								updatedAt: now
							};
							tasks.push(child);
							created.push(child);
						}
						parent.notes.push({ at: now, text: `已拆分为 ${titles.length} 个子任务：${titles.map((t) => `「${t}」`).join("、")}` });
						parent.updatedAt = now;
						return created;
					});
					if (children === null) return json(res, 404, { error: "task not found" });
					return json(res, 201, { tasks: viewList(await loadTasks()) });
				}

				// POST /taskboard/api/tasks/:id/session — create a NEW cold session
				// seeded with the task's shared context, bound to this task.
				if (req.method === "POST" && seg[1] === "session") {
					const task = (await loadTasks()).find((t) => t.id === id);
					if (!task) return json(res, 404, { error: "task not found" });
					let cwd;
					let targetWs;
					try {
						const wss = ctx.workspaceRegistry?.list() ?? [];
						const wsByPath = new Map(wss.map((ws) => [resolve(ws.path), ws]));
						// 1) 任务 repo 命中的工作区
						if (task.repo) {
							for (const ws of wss) {
								if (ws.path === task.repo || ws.title === task.repo || path.basename(ws.path) === task.repo) { cwd = ws.path; targetWs = ws; break; }
							}
						}
						// 2) repo 缺失/未命中时：回退到该任务最近活跃会话所在的工作区
						if (!cwd && (task.sessionIds?.length)) {
							const idx = await sessionIndex();
							const linked = task.sessionIds
								.map((sid) => idx.find((s) => s.id === sid))
								.filter(Boolean)
								.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
							for (const s of linked) {
								if (!s?.cwd) continue;
								const ws = wsByPath.get(resolve(s.cwd)) ?? wss.find((w) => path.basename(w.path) === path.basename(s.cwd));
								if (ws) { cwd = ws.path; targetWs = ws; break; }
							}
							// 回填任务 repo，让任务本身也重新绑定工作区
							if (targetWs && task.repo !== targetWs.path) {
								await mutate((tasks) => {
									const t = tasks.find((x) => x.id === id);
									if (!t) return;
									t.repo = targetWs.path;
									t.updatedAt = Date.now();
								});
							}
						}
					} catch { /* registry unavailable */ }
					if (!cwd || !targetWs) {
						const hint = task.repo
							? `该任务绑定的仓库目录「${task.repo}」没有匹配到任何已打开的工作区。请先在任务详情把「仓库目录」改为已打开工作区的路径，或先在工作区列表里打开对应目录，再新建对话。`
							: "该任务尚未绑定工作区（仓库目录为空，且没有可推断的关联会话）。请先在任务详情填写「仓库目录」（已打开工作区的路径）再新建对话。";
						return json(res, 400, { error: hint });
					}
					// 若上面回填了 repo，重新读取任务，让 seed 摘要包含最新仓库信息
					const taskNow = (await loadTasks()).find((t) => t.id === id) ?? task;
					const digest = await buildTaskDigest(taskNow);
					const msgId = `msg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
					const sessionId = `session-${randomUUID()}`;
					const meta = { version: 0, id: sessionId, createdAt: Date.now(), cwd, delegationDepth: 0, agentPreset: "standard" };
					const seed = [{
						type: "user/message",
						seq: 0,
						time: Date.now(),
						surfaceOp: "append",
						data: {
							id: msgId,
							role: "user",
							content: [{ type: "text", text: `这是任务「${task.title}」的一个新对话。开始前请先阅读并遵循以下任务共享上下文，它包含该任务的历史（描述、进展记录、关联会话），基于它继续推进，而不是重复已有工作：\n\n${digest}` }],
							source: { kind: "user" }
						}
					}];
					try {
						await ctx.sessionPersistence?.create(meta);
						await ctx.sessionPersistence?.append(sessionId, seed);
					} catch (error) {
						return json(res, 500, { error: `session persist failed: ${String(error?.message ?? error)}` });
					}
					// Attach to the workspace so the GUI groups it under the repo.
					if (targetWs) {
						try {
							if (!targetWs.sessionIds?.includes(sessionId)) await targetWs.attachSession(sessionId);
						} catch { /* attach best-effort */ }
					}
					await mutate((tasks) => {
						const t = tasks.find((x) => x.id === id);
						if (!t) return;
						if (!t.sessionIds.includes(sessionId)) t.sessionIds.push(sessionId);
						t.updatedAt = Date.now();
					});
					return json(res, 201, { sessionId, cwd, seeded: true });
				}

				// POST /taskboard/api/tasks/:id/sessions — {sessionId, action:"link"|"unlink"}
				// Linking injects the task context into a cold session; a running
				// session is queued (pendingInjects) and injected when it ends.
				if (req.method === "POST" && seg[1] === "sessions") {
					const body = JSON.parse(await readBody(req, 64 * 1024));
					const sessionId = String(body.sessionId ?? "");
					if (!sessionId) return json(res, 400, { error: "sessionId required" });
					let injected = false;
					let injectionNote = "";
					if (body.action !== "unlink") {
						try {
							if (ctx.sessions?.get(sessionId) !== void 0) {
								await mutate((tasks) => {
									const t = tasks.find((x) => x.id === id);
									if (!t) return;
									if (!(t.pendingInjects || []).some((p) => p.sessionId === sessionId)) {
										t.pendingInjects = [...(t.pendingInjects || []), { sessionId, at: Date.now() }];
									}
								});
								injectionNote = "该会话正在运行：已登记，结束后将自动注入任务上下文";
							} else {
								injected = await injectContextIntoSession(sessionId, task);
								if (!injected) injectionNote = "会话无持久化记录，未注入上下文";
							}
						} catch (error) {
							injectionNote = `注入失败：${String(error?.message ?? error).slice(0, 120)}`;
						}
					}
					await mutate((tasks) => {
						const t = tasks.find((x) => x.id === id);
						if (!t) return;
						if (body.action === "unlink") t.sessionIds = t.sessionIds.filter((s) => s !== sessionId);
						else if (!t.sessionIds.includes(sessionId)) t.sessionIds.push(sessionId);
						t.updatedAt = Date.now();
					});
					const updated = (await loadTasks()).find((t) => t.id === id);
					return json(res, 200, { task: withProgress(updated, await loadTasks()), injected, injectionNote });
				}

				// DELETE /taskboard/api/tasks/:id
				if (req.method === "DELETE") {
					await mutate((tasks) => {
						const at = tasks.findIndex((t) => t.id === id);
						if (at >= 0) tasks.splice(at, 1);
					});
					return json(res, 200, { ok: true });
				}

				return json(res, 405, { error: "method not allowed" });
			} catch (error) {
				return json(res, error?.status ?? 500, { error: String(error?.message ?? error) });
			}
		}
	}));

	// ---- sessions / workspaces / reindex ----------------------------------
	ctx.effect(() => ctx.webServer.register({
		kind: "exact",
		path: `${PREFIX}/api/sessions`,
		handler: async (req, res) => {
			if (req.method !== "GET") return json(res, 405, { error: "method not allowed" });
			try {
				json(res, 200, { sessions: await sessionIndex() });
			} catch (error) {
				json(res, 500, { error: String(error?.message ?? error) });
			}
		}
	}));

	ctx.effect(() => ctx.webServer.register({
		kind: "exact",
		path: `${PREFIX}/api/workspaces`,
		handler: async (req, res) => {
			if (req.method !== "GET") return json(res, 405, { error: "method not allowed" });
			try {
				json(res, 200, { workspaces: await workspaceList() });
			} catch (error) {
				json(res, 500, { error: String(error?.message ?? error) });
			}
		}
	}));

	ctx.effect(() => ctx.webServer.register({
		kind: "exact",
		path: `${PREFIX}/api/reindex-sessions`,
		handler: async (req, res) => {
			if (req.method !== "POST") return json(res, 405, { error: "method not allowed" });
			try {
				json(res, 200, await reindexWorkspaceSessions());
			} catch (error) {
				json(res, 500, { error: String(error?.message ?? error) });
			}
		}
	}));

	// Inject the taskboard client into every index.html response.
	ctx.effect(() => ctx.webServer.tapIndex((html) => {
		const tag = `<script defer src="${PREFIX}/assets/app.js"></script>`;
		if (html.includes(tag)) return html;
		return html.includes("</body>") ? html.replace("</body>", `${tag}</body>`) : `${html}${tag}`;
	}));

	// Startup: reindex workspace grouping + flush queued context injections.
	setTimeout(() => { void cleanupStaleFiles(); }, 500);
	setTimeout(() => { void reindexWorkspaceSessions(); }, 2000);
	setTimeout(() => { void flushAllPendingInjects(); }, 3000);

	// 会话结束时：补注入关联时积压的任务上下文
	ctx.on("session/disposed", (session) => {
		void flushPendingInjects(session.id);
	});

	// —— 会话活动 → 关联任务"最近活跃"上浮 ——
	// 任务列表按 updatedAt 排序；在任务绑定的会话里聊天/干活（user/assistant/step
	// 等事件）时，把该任务的 updatedAt 顶上来，让"刚聊过的任务"排到前面。
	// 事件可能很密集（agent 长跑），用去抖合并写入。
	const seenActivity = new Map(); // sessionId -> lastSeen
	let activityTimer = null;
	const flushActivity = async () => {
		activityTimer = null;
		if (seenActivity.size === 0) return;
		const seen = new Map(seenActivity);
		seenActivity.clear();
		try {
			const now = Date.now();
			const tasks = await loadTasks();
			const matched = tasks.filter((t) => (t.sessionIds ?? []).some((sid) => seen.has(sid)));
			if (matched.length === 0) return;
			await mutate((all) => {
				for (const t of all) if (matched.some((m) => m.id === t.id)) t.updatedAt = now;
			});
		} catch { /* storage contention — 丢这一次更新 */ }
	};
	const scheduleActivityFlush = () => {
		if (activityTimer !== null) return;
		activityTimer = setTimeout(() => { void flushActivity(); }, 1500);
	};
	ctx.on("session/event", (session) => {
		const sid = typeof session === "string" ? session : session?.id;
		if (!sid) return;
		seenActivity.set(sid, Date.now());
		scheduleActivityFlush();
	});
}

export default { name, inject, apply };
