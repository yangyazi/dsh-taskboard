// 修复被"孤立 inbox splice"损坏的会话日志。
//
// 症状：日志里出现一条 agent/inbox/spliced，它要从未入队的 next-turn 元素里删 1 条，
// 但重放时队列是空的 → Harness 报
//   resume failed: invalid persisted inbox splice at session seq N
// 该会话再也打不开。
//
// 成因：任务面板插件曾用 sessionPersistence.append() 直接往会话日志塞 user/message，
// 绕过了 Harness 的 inbox 记账（详见 ADR-0004）。
//
// ⚠️ 修法要点（第一版修错了，别重犯）：
//   Harness 对 committed 区还有一条校验——第 N 个事件的 seq 必须等于 N
//   （SessionLogScanner.consumeEventLine: `if (event.seq !== this.events.length)`
//    → "corrupt session log: seq gap in committed region"）。
//   所以**不能删除**那条事件（会留下 seq 空洞，报另一种错），必须**保留事件并让它合法**：
//   去掉 data.removedCount（该字段可选，Harness 在删 0 条时本身也不写它），
//   事件即变成合法空操作（start=0、不删不插），两条校验同时满足。
// 用法: node repair-session.mjs <sessionFile> [--apply]
import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { constants, zstdCompressSync, zstdDecompressSync } from "node:zlib";
import { basename, dirname, join } from "node:path";

const file = process.argv[2];
const apply = process.argv.includes("--apply");
const MAGIC = [0x28, 0xb5, 0x2f, 0xfd];

function splitFrames(buf) {
	const starts = [];
	for (let i = 0; i <= buf.length - 4; i++) {
		if (buf[i] === MAGIC[0] && buf[i + 1] === MAGIC[1] && buf[i + 2] === MAGIC[2] && buf[i + 3] === MAGIC[3]) starts.push(i);
	}
	return starts.map((s, i) => buf.subarray(s, i + 1 < starts.length ? starts[i + 1] : buf.length));
}

/** 复刻 Harness 的 inbox 重放，返回首个非法 splice 的 seq。 */
function firstBadSplice(events) {
	const st = { "next-turn": [], "next-step": [] };
	for (const ev of events) {
		if (ev.type !== "agent/inbox/spliced") continue;
		const s = ev.data; const inbox = st[s.target]; const removed = s.removedCount ?? 0;
		if (!inbox) return ev.seq;
		if (!Number.isSafeInteger(s.start) || s.start < 0 || s.start > inbox.length
			|| !Number.isSafeInteger(removed) || removed < 0 || s.start + removed > inbox.length) return ev.seq;
		const cand = inbox.toSpliced(s.start, removed, ...s.inserted);
		const ids = new Set();
		const other = s.target === "next-turn" ? st["next-step"] : st["next-turn"];
		let dupe = false;
		for (const m of [...cand, ...other]) { if (ids.has(m.id)) { dupe = true; break; } ids.add(m.id); }
		if (dupe) return ev.seq;
		st[s.target] = cand;
	}
	return null;
}

const buf = await readFile(file);
const frames = splitFrames(buf);
const decoded = frames.map((f) => {
	try { return zstdDecompressSync(f).toString("utf8"); } catch { return null; }
});
if (decoded.some((d) => d === null)) throw new Error("有帧无法解码，放弃修复");

const events = [];
for (const text of decoded) {
	for (const line of text.split("\n")) {
		if (!line.trim()) continue;
		try { events.push(JSON.parse(line)); } catch { /* 非事件行 */ }
	}
}
const bad = firstBadSplice(events);
console.log(`${basename(dirname(file))} 事件数=${events.length} 首个非法 splice seq=${bad ?? "无"}`);
if (bad === null) { console.log("  无需修复"); process.exit(0); }

// 找到承载该事件的那一行，逐字定位（同一 seq 只可能出现在这一条 splice 上）
let patched = 0;
const newDecoded = decoded.map((text) => text.split("\n").map((line) => {
	if (!line.includes("agent/inbox/spliced") || !line.includes(`"seq":${bad}`)) return line;
	const ev = JSON.parse(line);
	if (ev.data?.removedCount === undefined) return line;
	delete ev.data.removedCount;                 // ← 关键：保留事件行，只去掉越界的删除条数
	patched++;
	console.log(`  改写行: ${line.slice(0, 120)}`);
	return JSON.stringify(ev);
}).join("\n"));
if (patched !== 1) throw new Error(`预期改写 1 行，实际 ${patched} 行 — 放弃`);
console.log(`  改写 ${patched} 行（保留事件行以维持 seq 连续）`);

// 重建（保持 checksum 选项与后端一致）
const out = newDecoded.map((text) => zstdCompressSync(Buffer.from(text, "utf8"), { params: { [constants.ZSTD_c_checksumFlag]: 1 } }));

// 自检：重新解码 + 重放 + 行数不变 + header 完整
const reDecoded = out.map((f) => zstdDecompressSync(f).toString("utf8"));
const reLines = [];
for (const text of reDecoded) for (const line of text.split("\n")) { if (!line.trim()) continue; reLines.push(line); }
const origLines = [];
for (const text of decoded) for (const line of text.split("\n")) { if (!line.trim()) continue; origLines.push(line); }
const stillBad = firstBadSplice(reLines);
const sameCount = reLines.length === origLines.length;
const headerOk = reDecoded[0].startsWith('{"type":"session"');
console.log(`  重建: 帧 ${frames.length} → ${out.length}, 事件行 ${origLines.length} → ${reLines.length}（必须不变）, header行完整=${headerOk}, 重放非法splice=${stillBad ?? "无"}`);
if (stillBad !== null || !sameCount || !headerOk) throw new Error("自检未通过，放弃写入");

if (!apply) { console.log("  (dry-run，未写入；加 --apply 才落盘)"); process.exit(0); }
const backupDir = "/tmp/tb-session-repair-backup";
await mkdir(backupDir, { recursive: true });
const backup = join(backupDir, `${basename(dirname(file))}-session.jsonl.zstd`);
await copyFile(file, backup);
await writeFile(file, Buffer.concat(out));
console.log(`  已写入，备份: ${backup}`);
