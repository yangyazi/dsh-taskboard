---
name: manage-taskboard
description: 用 dsh-taskboard（轻量任务面板插件）管理任务——认领/流转状态、追加进展记录、提交与确认评审、拆分大任务、把当前 DSH 会话绑定到某个任务并恢复对话。
whenToUse: 需要查看/认领/流转 dsh-taskboard 任务，给任务追加进展或评审结论，把当前会话关联到某个任务，或为某个任务一键开启新对话时。典型触发词：任务面板、看板、认领任务、任务到 in_review、追加进展、提交评审。
---

# Manage Taskboard

用 **dsh-taskboard**（轻量任务面板插件，随 DSH Web GUI 同源部署）管理任务。
API Base URL：`<DSH Web 同源>/taskboard/api`（本机 GUI 即 `http://127.0.0.1:3081/taskboard/api`）。
任务是按「仓库/feature」组织的共享上下文池：任务描述 + 全部进展记录 + 关联会话 = 该任务的共享记忆，任务下所有会话都看得到。

## 统一生命周期（AI 自动流转，用户只做 review）

```
todo ──认领──▶ in_progress ──完成自验──▶ in_review ──用户确认──▶ done
                  ▲                            │
                  └────── 用户评论退回修改 ─────┘
（卡住 → blocked；解决后恢复 in_progress）
```

## 硬性规则

1. **认领**：开始做之前把任务从 `todo` 流转到 `in_progress`（PATCH `{status:"in_progress"}`）。
2. **进展记录**：执行过程中定期用 `POST /tasks/:id/notes` 追加进展评论（做了什么、结果如何）——这是任务圈子的**共享记忆**。
3. **提交评审**：完成并自验后，**先**加一条总结评论（实现内容/验证方式/结果/遗留风险），**再**流转 `in_review`。**绝不直接把任务置为 done**。
4. **等待 review**：`in_review` 后停下，等用户处理：
   - 用户评论提意见/要求修改 → 按意见改 → 追加进展评论 → 再次流转 `in_review`
   - 用户明确确认通过（或在 GUI 点了「确认完成」）→ 才流转 `done`
5. **阻塞**：无法继续时流转 `blocked` 并评论说明原因；恢复后转回 `in_progress`。
6. **任务上下文共享**：任务 = 一个会话圈子，描述 + 全部进展记录 + 关联会话就是共享上下文。新对话已自动注入任务历史——开始前先看任务描述与进展，不要重复已有工作。
7. **会话关联**：在当前任务会话里干活时，把当前会话绑定到任务：`POST /tasks/:id/sessions` `{"sessionId":"<DSH_SESSION_ID>","action":"link"}`（session id 从环境变量 `DSH_SESSION_ID` 获取）。

## API

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/tasks?repo=&status=&q=` | 任务列表（支持过滤） |
| POST | `/tasks` | 新建 `{title, repo, feature, description, priority, labels}` |
| GET/PATCH/DELETE | `/tasks/:id` | 详情 / 更新（status/priority/progress/review/test/labels/description）/ 删除 |
| POST | `/tasks/:id/notes` | 追加进展记录 `{text}` |
| POST | `/tasks/:id/sessions` | 关联/解除会话 `{sessionId, action:"link"\|"unlink"}` |
| POST | `/tasks/:id/split` | 拆分大任务 `{titles:[...]}` |
| POST | `/tasks/:id/session` | 为任务新建一个**冷会话**（seed 任务上下文，自动挂工作区） |
| GET | `/sessions` | 会话索引（标题/仓库） |
| GET | `/workspaces` | 工作区（仓库）列表 |

## 共享上下文实时拉取（重要）

任务 = 共享上下文池。池内任意会话随时可拉取**最新**任务上下文（比注入时的快照更新）：

```
GET /taskboard/api/tasks/<id>/context
→ { context: "任务：… 描述 … 历史进展 … 已关联会话…", poolSessions: [...] }
```

- **长时间任务务必**：开工前、以及每轮进展后，先 `GET context` 刷新最新进展——其他池内会话可能刚更新了记录。
- 工作完成后把结论写进 `POST /tasks/:id/notes`（进展记录），这是池子的共享记忆，其他会话（含之后新建的）都能看到。

## 会话上下文自取（重要）

任务下的对话是共享圈子。**在一个已绑定任务的会话里开始工作时，先自取任务上下文**：

```sh
curl -s "http://127.0.0.1:3081/taskboard/api/task-by-session?sessionId=$DSH_SESSION_ID"
```

返回 `{task: {...}}`（含描述、全部进展记录、关联会话）；`task` 为 `null` 表示当前会话未绑定任务（可忽略）。
拿到任务后：先读它的 `description` 与 `notes`（历史进展）再动手，避免重复已完成的工作；
干完把结论写回任务进展（规则见上），这样同一任务下的其他对话也能读到。
