# dsh-taskboard

轻量 **任务面板** 插件（Jira 简化版）for DeepSeek Harness Web GUI（`dsh web`）。
以任务形式管理对话与开发工作：按仓库/feature 记录需求、实现情况、评审与测试状态，关联 DSH 会话并**一键打开继续**。

## 特点

- **轻**：宿主零依赖（node 内置 API），存储为一个 JSON 文件（`~/.dsh/storages/taskboard.json`），客户端原生 JS（打包后约 21KB），无 SQLite、无前端框架 → 不卡界面
- **左侧边栏入口**：与重型 dsh-taskboard 相同的挂载方式——侧边栏「任务看板」按钮，点击后中间列切换为全幅看板视图（`html[data-dsh-taskboard-active]`，与 SSH 面板互斥）
- **概览视图（默认）**：打开即展示——顶部各状态任务统计；**工作区内容**卡片（每个工作区/仓库：任务按状态徽标统计、关联会话数、当前 git 分支与未提交文件数）；**最近更新**任务列表（点击直达详情）。点击工作区卡片跳转看板并按该仓库过滤
- **看板**：待办 / 进行中 / 评审中 / 已阻塞 / 已完成 五列，卡片显示优先级/仓库/feature/进度/review/测试徽标；支持搜索与仓库过滤
- **任务字段**：标题、仓库、分支/feature、描述、状态、优先级、进度(0-100)、评审状态、测试状态
- **进展记录**：任务内时间线式评论（Ctrl+Enter 快速提交）
- **会话关联**：任务可关联多个 DSH 会话，点「打开」直接恢复该对话继续（localStorage `dsh.sessions.current` + reload）
- **快捷键**：`Ctrl+Shift+B` 也可开合看板

## 安装

```bash
# 1) 加入 web profile 依赖（本地开发：file:<插件目录>；npm 发布后：包名）
cd ~/.dsh/profiles/web
pnpm add file:<本插件目录>

# 2) 注册行（cordis.patch.yml 追加）
#   - insert:
#       - id: taskboard
#         name: 'dsh-taskboard'
#         config: {}

# 3) 客户端改动后重新打包
cd <本插件目录> && npm run build:client

# 4) 重启 dsh web 生效
```

> 说明：`file:` 方式安装时，改动源码后需重新 `pnpm add -f file:<目录>` 或同步文件到
> profile 的 node_modules 副本（`file:` 依赖是复制/硬链接，不自动跟随源文件变更）。

## 设计决策 / 范围变更（重要）

本插件是**轻量 JSON 复刻**，并非最初计划的 `@ttmouse/dsh-taskboard@0.5.0`
（SQLite + Gantt/工作流/仪表盘/AI 对话）。原因、砍掉的能力与审批详见
[`docs/decisions/ADR-0001-scope-deviation.md`](docs/decisions/ADR-0001-scope-deviation.md)。

## 技能（manage-taskboard）

随包携带 DSH 技能 `vendor/skills/manage-taskboard`（含标准 YAML frontmatter）。
插件加载时会把它注册进宿主 `ctx.skills`，因此无论 `npm` 包还是 `file:` 本地链接安装，
模型都能在任务会话里用 `manage-taskboard` 技能操作看板。手工放到任一技能根
（如 `<项目>/.agents/skills` 或 `$DSH_HOME/skills`）同样可被 DSH 发现。

## 数据可靠性（并发 / 损坏）

所有写入先经过进程内写队列，再用 advisory lock dir 串行化（避免两个 `dsh web`
共享同一 `$DSH_HOME` 时互相丢更新）；数据文件带单调递增 `version`。数据文件一旦
损坏会被隔离到 `taskboard.json.bak-<时间戳>` 并返回可读错误——**绝不静默读成空数组
再覆盖清空**。多实例长期建议为每个实例配置独立 `storePath`，勿共享同一数据文件。

## API

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/taskboard/api/tasks?status=&repo=&q=` | 任务列表（支持过滤） |
| POST | `/taskboard/api/tasks` | 新建任务 |
| GET/PATCH/DELETE | `/taskboard/api/tasks/:id` | 任务详情 / 更新字段 / 删除 |
| POST | `/taskboard/api/tasks/:id/notes` | 追加进展记录 `{text}` |
| POST | `/taskboard/api/tasks/:id/sessions` | 关联/解除会话 `{sessionId, action}` |
| GET | `/taskboard/api/sessions` | 会话索引（标题/仓库/轮次，供关联） |
| GET | `/taskboard/api/workspaces` | 仓库（工作区）列表 |

## 架构

- **Host half**（`lib/index.js`，Cordis 插件 `name: taskboard`）
  - `ctx.webServer.register` 注册 `/taskboard/api/*` 与 `/taskboard/assets`（静态）
  - `ctx.webServer.tapIndex` 注入 `<script defer src="/taskboard/assets/app.js">`
  - 数据文件 `config.storePath ?? $DSH_HOME/storages/taskboard.json`，原子写入（tmp+rename）
- **Client half**（`client/src/app.js` → esbuild 打包为 `client-dist/app.js`）
  - 自包含 IIFE，fetch 调 `/taskboard/api/*`，独立 DOM 面板，不侵入 SPA

## 依赖与隐私

- 运行依赖：仅 DSH web profile（宿主零 npm 依赖，`node:fs/promises` + `node:path` 等内置 API）。
- 可选：**dsh-ide** 插件——仅概览视图的"当前分支/未提交文件"徽标会调 `/ide/api/git`，未安装时该处自动隐藏，其余功能不受影响。
- 隐私：代码不含任何密钥/token/内网 IP/用户名；数据只写本地 `$DSH_HOME/storages/taskboard.json`，无外部网络请求。

## 文件

| 路径 | 说明 |
| --- | --- |
| `lib/index.js` | 宿主插件（API + 注入 + 数据可靠层 + 技能注册） |
| `client/src/app.js` | 客户端源码（原生 JS） |
| `client-dist/app.js` | esbuild 产物（约 18 KB） |
| `vendor/skills/manage-taskboard/SKILL.md` | 随包分发的 DSH 技能（含 frontmatter） |
| `docs/decisions/ADR-0001-scope-deviation.md` | 与原方案的范围变更记录 |
| `test/*.test.mjs` | 并发写 / 损坏隔离 / 技能注册回归测试（`npm test`） |
