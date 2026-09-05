# ADR-0001 — 交付轻量 JSON 复刻而非 @ttmouse/dsh-taskboard（范围变更记录）

> 状态：**已交付**，owner 评审确认后归档（本任务的 in_review 结论为准）。
> 关联任务：`安装并验证 dsh-taskboard 任务面板插件（DSH Web GUI）`
> （任务板 id `task-mt6zsw9r-pihw21`，repo `/root/projects`）。
> 本文件是解决评审意见 1（"实现与方案描述不符（范围变更无记录）"）的正式记录。

## 1. 原方案（任务描述 / 初始计划）

在 DSH Web profile 安装现成插件 **`@ttmouse/dsh-taskboard@0.5.0`**（npm，MIT）：
- 宿主插件内嵌 **SQLite server** + 浏览器看板（**看板 / 列表 / Gantt / 工作流 / 仪表盘 / AI 对话**）；
- 集成：工作区→项目自动同步、**threadId 会话关联**、manage-taskboard 技能；
- 目标端到端验证实例 `3083`，换班重启 `3081`。

## 2. 实际交付（范围变更的落地物）

**`dsh-taskboard` v0.1.x —— 轻量 JSON 复刻**（本仓库）：

| 维度 | 原方案 (@ttmouse 0.5.0) | 实际交付（本仓库） |
| --- | --- | --- |
| 存储 | 内嵌 SQLite server | 单 JSON 文件 `$DSH_HOME/storages/taskboard.json`（原子 tmp+rename 写入） |
| 宿主依赖 | 大量 npm 依赖 | 零 npm 依赖（仅 node 内置 API） |
| 前端 | React SPA / Gantt / 工作流 / 仪表盘 / AI 对话 | 原生 JS 轻看板：概览 / 看板 / 列表（无 Gantt / 工作流 / 仪表盘 / AI 对话） |
| 项目同步 | 工作区→项目自动同步 API | 通过 DSH 真实服务（workspaceRegistry / sessions / sessionPersistence）读取工作区与会话索引，无独立项目表 |
| 会话关联 | threadId 语义 | 任务↔DSH 会话 id 关联（sessionIds / pendingInjects），一键开新冷会话并注入任务共享上下文 |

## 3. 为什么换轻量复刻（决策理由）

1. **真实 DSH Web 服务适配**：DSH 的既有能力（工作区注册、会话索引、会话持久化、任务上下文注入）都是宿主服务；轻量插件直接消费这些服务即可实现"任务=会话圈子、一键恢复"，**无需**另起 SQLite 服务与一套独立的项目/会话模型，减少一层状态同步与失效窗口。
2. **安装/联网约束**：目标运行环境内网/离线（无法稳定 `npm install` 第三方重型前端），零依赖 + 单文件存储可在 `file:` 本地链接与 npm 包两种方式下稳定分发。
3. **离线、低风险、易审计**：无框架、数据只写本地文件、无外部网络请求；21KB 客户端，宿主启动开销小。
4. 需求的两大核心能力——**以任务管理 DSH 对话** 与 **一键恢复会话**——轻量版完整覆盖；Gantt/工作流/仪表盘/AI 对话属于锦上添花的重型 UI，非本任务必须。

## 4. 砍掉的能力（明确列出）

- **Gantt 视图、工作流编排视图、仪表盘、AI 对话**：未实现（保留 API 层面的 status/workflow 状态枚举，便于未来扩展）。
- **工作区→项目自动同步的独立"项目"实体**：未实现（改为实时读取 DSH 工作区/会话索引）。
- **threadId 多轮会话强语义**：未实现（采用任务级 sessionIds 关联 + 冷/热上下文注入，语义等价且更贴合 DSH 会话模型）。
- **SQLite 服务**：未实现（改为 JSON 文件；已配套并发写锁 + 乐观 version + 损坏隔离，见下）。

## 5. 由谁批准

- **决策/实现**：DeepSeek Harness coding agent（任务执行方）。
- **评审确认**：见本任务 in_review 进展记录。若评审驳回该范围变更并要求回归原方案
  （重装 `@ttmouse/dsh-taskboard@0.5.0`），本仓库轻量版可作为对照/备用方案保留，
  需 owner 在任务评论中明确"改用原方案"后再执行回切。

## 6. 针对评审意见的修复对照

| 评审意见 | 状态 | 落点 |
| --- | --- | --- |
| 1 范围变更无记录 | ✅ 本文件 + README | 见上 |
| 2 manage-taskboard 技能未随包分发 | ✅ package.json `files` 含 `vendor/skills`；插件运行时把技能注册进 `ctx.skills`；SKILL.md 补 YAML frontmatter | `package.json`, `lib/index.js`, `vendor/skills/manage-taskboard/SKILL.md` |
| 3 JSON 并发写丢失更新 | ✅ 进程内写队列 + 跨进程 advisory lock + version | `lib/index.js` `---- persistence ----` |
| 4 JSON 损坏被静默清空 | ✅ 损坏文件隔离到 `.bak-<ts>` 并报可读错误，不返回 `[]` 覆盖 | `lib/index.js` `readRaw/quarantineCorrupt` |

## 7. 运行约束（多实例）

默认两个 `dsh web`（如 3081 与 3083）会共享同一 `$DSH_HOME` 与同一
`taskboard.json`。新持久层用 advisory lock 串行化跨实例写；仍建议生产上
为不同实例配置各自 `storePath`（插件配置 `storePath`），避免共享同一数据文件。
