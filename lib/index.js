// dsh-taskboard host half: an ordinary Cordis plugin for the `web` profile.
//
// A lightweight Jira-like task board for the DSH Web GUI. Unlike the heavy
// @ttmouse/dsh-taskboard (SQLite server + React SPA), this one is minimal:
//   - storage: one JSON file (~/.dsh/storages/taskboard.json), atomic writes
//   - API:    /taskboard/api/tasks (CRUD + notes + session links),
//             /taskboard/api/sessions (session index for linking),
//             /taskboard/api/workspaces (repo picker)
//   - client: /taskboard/assets/app.js (vanilla JS, no framework)
//   - resume: the client writes localStorage["dsh.sessions.current"] and
//             reloads, which is how the GUI restores a session on boot.
import { readFile, writeFile, rename, readdir, stat, mkdir } from "node:fs/promises";
import { dirname, extname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import os from "node:os";
import path from "node:path";

export const name = "taskboard";

/** Services required before this row can activate. */
export const inject = ["webServer"];

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

export async function apply(ctx, config = {}) {
	const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
	const clientDist = join(pkgRoot, "client-dist");
	// Data file defaults to $DSH_HOME/storages/taskboard.json.
	const dataFile = resolve(config.storePath ?? join(process.env.DSH_HOME ?? path.join(os.homedir(), ".dsh"), "storages", "taskboard.json"));

	// ---- persistence -------------------------------------------------------
	async function loadTasks() {
		try {
			const raw = await readFile(dataFile, "utf8");
			const parsed = JSON.parse(raw);
			return Array.isArray(parsed.tasks) ? parsed.tasks : [];
		} catch {
			return [];
		}
	}

	async function saveTasks(tasks) {
		await mkdir(dirname(dataFile), { recursive: true });
		const tmp = `${dataFile}.tmp`;
		await writeFile(tmp, JSON.stringify({ version: 1, tasks }, null, 2), "utf8");
		await rename(tmp, dataFile);
	}

	async function mutate(fn) {
		const tasks = await loadTasks();
		const result = fn(tasks);
		await saveTasks(tasks);
		return result;
	}

	function taskView(t) {
		return { ...t };
	}

	function newId() {
		return `task-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
	}

	// ---- session index -----------------------------------------------------
	// Sources: live sessions (ctx.sessions), the projection cache (titles), and
	// the workspace registry (repo mapping). Best-effort; any source may be
	// unavailable.
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
					updatedAt: rec.rows?.sessionStats?.val?.lastTurn ? undefined : undefined,
					updated: rec.updatedAt ?? null
				});
			}
		} catch { /* projcache unavailable */ }
		// Workspace title (repo name) per cwd.
		const repoByCwd = new Map();
		try {
			for (const ws of ctx.workspaceRegistry?.list() ?? []) repoByCwd.set(resolve(ws.path), ws.title ?? path.basename(ws.path));
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
					turns: meta?.turns ?? 0
				});
			}
		} catch { /* sessions service unavailable */ }
		// Fall back to projcache-only entries (restarted hosts, no live store).
		for (const [id, meta] of byId) {
			if (seen.has(id)) continue;
			seen.add(id);
			out.push({
				id,
				title: meta.title ?? id,
				cwd: meta.cwd,
				repo: meta.cwd ? (repoByCwd.get(resolve(meta.cwd)) ?? path.basename(meta.cwd)) : null,
				turns: meta.turns ?? 0
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
					const tasks = (await loadTasks()).map(taskView);
					const status = url.searchParams.get("status");
					const repo = url.searchParams.get("repo");
					const priority = url.searchParams.get("priority");
					const label = url.searchParams.get("label");
					const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
					const labels = label ? label.split(",").map((s) => s.trim()).filter(Boolean) : [];
					const filtered = tasks.filter((t) =>
						(!status || t.status === status)
						&& (!repo || t.repo === repo)
						&& (!priority || t.priority === priority)
						&& (!labels.length || (t.labels || []).some((l) => labels.includes(l)))
						&& (!q || [t.title, t.repo, t.feature, t.description, (t.labels || []).join(" ")].join(" ").toLowerCase().includes(q))
					);
					filtered.sort((a, b) => b.updatedAt - a.updatedAt);
					return json(res, 200, { tasks: filtered });
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
					await mutate((tasks) => { tasks.push(task); });
					return json(res, 201, { task: taskView(task) });
				}
				if (!id) return json(res, 405, { error: "method not allowed" });

				const task = (await loadTasks()).find((t) => t.id === id);
				if (!task) return json(res, 404, { error: "task not found" });

				// GET /taskboard/api/tasks/:id
				if (req.method === "GET") return json(res, 200, { task: taskView(task) });

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
					return json(res, 200, { task: taskView(updated) });
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
					return json(res, 200, { task: taskView(updated) });
				}

				// POST /taskboard/api/tasks/:id/sessions — {sessionId, action:"link"|"unlink"}
				if (req.method === "POST" && seg[1] === "sessions") {
					const body = JSON.parse(await readBody(req, 64 * 1024));
					const sessionId = String(body.sessionId ?? "");
					if (!sessionId) return json(res, 400, { error: "sessionId required" });
					await mutate((tasks) => {
						const t = tasks.find((x) => x.id === id);
						if (!t) return;
						if (body.action === "unlink") t.sessionIds = t.sessionIds.filter((s) => s !== sessionId);
						else if (!t.sessionIds.includes(sessionId)) t.sessionIds.push(sessionId);
						t.updatedAt = Date.now();
					});
					const updated = (await loadTasks()).find((t) => t.id === id);
					return json(res, 200, { task: taskView(updated) });
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

	// ---- sessions / workspaces index --------------------------------------
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

	// Inject the taskboard client into every index.html response.
	ctx.effect(() => ctx.webServer.tapIndex((html) => {
		const tag = `<script defer src="${PREFIX}/assets/app.js"></script>`;
		if (html.includes(tag)) return html;
		return html.includes("</body>") ? html.replace("</body>", `${tag}</body>`) : `${html}${tag}`;
	}));
}

export default { name, inject, apply };
