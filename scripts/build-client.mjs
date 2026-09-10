// 构建客户端 bundle。
//
// 本仓库刻意不带 node_modules（宿主插件只需要 Node 内置模块），所以这里不写死
// esbuild 的路径，而是按顺序找可用的 esbuild：
//   1) 仓库内 node_modules/.bin/esbuild
//   2) PATH
//   3) 同机其它项目的 esbuild（本地开发常见，便于零依赖构建）
// 找不到时报明确错误，而不是让 npm run 输出 "esbuild: not found"。
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = [
	"client/src/app.js",
	"--bundle", "--minify", "--format=iife", "--target=es2020",
	"--outfile=client-dist/app.js"
];

const candidates = [
	join(root, "node_modules/.bin/esbuild"),
	"/root/projects/hil-report-web/node_modules/.bin/esbuild",
	"/root/projects/dsh-ide/node_modules/.bin/esbuild"
];

let bin = candidates.find((p) => existsSync(p));
if (bin === undefined) {
	const which = spawnSync("which", ["esbuild"], { encoding: "utf8" });
	if (which.status === 0 && which.stdout.trim() !== "") bin = which.stdout.trim();
}
if (bin === undefined) {
	console.error("找不到 esbuild。请先 `npm i -D esbuild`，或把 esbuild 放进 PATH 后重试。");
	process.exit(1);
}

const run = spawnSync(bin, args, { cwd: root, stdio: "inherit" });
process.exit(run.status ?? 1);
