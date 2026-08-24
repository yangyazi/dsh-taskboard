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

> 本插件**零 npm 依赖**，分发完全走 GitHub，无需 npm registry。仓库：
> `https://github.com/yangyazi/dsh-taskboard`（release 见 `https://github.com/yangyazi/dsh-taskboard/releases`）

```bash
# 方式一（推荐）：GitHub tarball 直接安装（等价 npm 包安装，走 GitHub）
dsh plugin --profile web add https://github.com/yangyazi/dsh-taskboard/archive/refs/tags/v0.1.0.tar.gz

# 方式二：clone 后按本地目录安装
git clone https://github.com/yangyazi/dsh-taskboard
cd ~/.dsh/profiles/web && pnpm add file:<clone 路径>

# 两种方式装完后都要做（方式一装完包名是 dsh-taskboard，注册行同名）：
# 1) 若需要源码改动后重新打包：cd <插件目录> && npm run build:client
# 2) 重启 dsh web 生效
```

注册行（`cordis.patch.yml` 追加，`<包名>` 换成实际安装的包名）：

```yaml
- insert:
    - id: taskboard
      name: '<包名>'   # 方式一装的是 dsh-taskboard
      config: {}
```

> 说明：`file:` 方式安装时，改动源码后需重新 `pnpm add -f file:<目录>` 或同步文件到
> profile 的 node_modules 副本（`file:` 依赖是复制/硬链接，不自动跟随源文件变更）。

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
| `lib/index.js` | 宿主插件（API + 注入） |
| `client/src/app.js` | 客户端源码（原生 JS） |
| `client-dist/app.js` | esbuild 产物（约 18 KB） |
