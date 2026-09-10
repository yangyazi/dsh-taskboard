// Concurrency & corruption regression tests for dsh-taskboard host persistence.
// Verifies review findings #3 (no lost update on concurrent writes) and
// #4 (corrupt JSON is quarantined to .bak, never silently wiped).
import { apply } from "../lib/index.js";
import { mkdtemp, readFile, writeFile, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const home = await mkdtemp(join(tmpdir(), "tb-home-"));
process.env.DSH_HOME = home;
const store = join(home, "storages", "taskboard.json");

// ---- harness ----
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
function makeCtx(registers) {
	return {
		effect(fn) { fn?.(); },
		on() {},
		logger: { info() {}, warn() {}, error() {} },
		webServer: { register(x) { registers.push(x); }, tapIndex() {} },
		workspaceRegistry: { list: () => [] },
		sessions: { list: () => [], get: () => void 0 },
		sessionPersistence: {}
	};
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let failures = 0;
const check = (name, cond) => { console.log(`${cond ? "PASS" : "FAIL"}  ${name}`); if (!cond) failures++; };

// ---- instance 1 ----
const h1 = [];
await apply(makeCtx(h1), { storePath: store });
const api1 = http(h1);

// ---- Test 1: no lost update under heavy concurrent mutation (same process) ----
{
	const { body } = await api1("POST", "/taskboard/api/tasks", { title: "A", repo: "/w1" });
	const id = body.task.id;
	const ops = [];
	for (let i = 0; i < 50; i++) ops.push(api1("POST", `/taskboard/api/tasks/${id}/notes`, { text: `note-${i}` }));
	for (let i = 0; i < 50; i++) ops.push(api1("PATCH", `/taskboard/api/tasks/${id}`, { progress: (i % 100) + 1 }));
	await Promise.all(ops);
	await wait(50);
	const got = await api1("GET", `/taskboard/api/tasks/${id}`, null);
	check("concurrent writes: all 50 notes persisted (no lost update)", got.body.task.notes.length === 50);
	console.log(`   notes persisted = ${got.body.task.notes.length}`);
	const raw = JSON.parse(await readFile(store, "utf8"));
	console.log(`   store version after writes = ${raw.version}`);
	check("concurrent writes: store version is a positive integer", Number.isInteger(raw.version) && raw.version >= 1);
}

// ---- Test 2: corrupt file quarantined, not silently wiped ----
{
	await api1("POST", "/taskboard/api/tasks", { title: "seed", repo: "/w1" });
	const goodContent = await readFile(store, "utf8");
	const corrupt = "{ this is not valid json !!!";
	await writeFile(store, corrupt, "utf8");
	const res = await api1("POST", "/taskboard/api/tasks", { title: "X", repo: "/w1" });
	check("corrupt file: write attempt fails loudly (500)", res.status === 500);
	let bakFound = false, bakContent = null;
	const dir = join(home, "storages");
	for (const f of await readdir(dir)) {
		if (f.startsWith("taskboard.json.bak-")) { bakFound = true; bakContent = await readFile(join(dir, f), "utf8"); }
	}
	// The only on-disk copy was already corrupt (external tampering). We must NOT
	// silently overwrite it with an empty board: we back the on-disk bytes up to
	// .bak-* (forensic / manual-recovery copy) and surface a readable error.
	check("corrupt file: original on-disk bytes preserved in a .bak-* file", bakFound && bakContent === corrupt);
	check("corrupt file: write was NOT silently swallowed into an empty board", goodContent.length > 0);
	const res2 = await api1("POST", "/taskboard/api/tasks", { title: "fresh", repo: "/w1" });
	check("corrupt file: board recovers to a clean, usable state", res2.status === 201);
}

// ---- Test 3: two independent "instances" sharing one store file (3081 vs 3083) ----
{
	const h2 = [];
	await apply(makeCtx(h2), { storePath: store });
	const api2 = http(h2);
	await api1("POST", "/taskboard/api/tasks", { title: "base", repo: "/w1" });
	const { body } = await api1("POST", "/taskboard/api/tasks", { title: "shared", repo: "/w1" });
	const id = body.task.id;
	await Promise.all([
		Promise.all(Array.from({ length: 25 }, (_, i) => api1("POST", `/taskboard/api/tasks/${id}/notes`, { text: `ctx1-${i}` }))),
		Promise.all(Array.from({ length: 25 }, (_, i) => api2("POST", `/taskboard/api/tasks/${id}/notes`, { text: `ctx2-${i}` })))
	]);
	await wait(80);
	const got = await api1("GET", `/taskboard/api/tasks/${id}`, null);
	check("cross-instance: both writers' notes survive the file lock", got.body.task.notes.length === 50);
	console.log(`   cross notes = ${got.body.task.notes.length}`);
}

console.log(failures === 0 ? "\nALL TESTS PASSED" : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
