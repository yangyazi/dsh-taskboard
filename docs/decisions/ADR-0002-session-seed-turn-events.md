# ADR-0002 — 新会话种子禁止使用 turn 事件（会话损坏事故记录）

> 状态：**已修复并加回归测试**（v0.1.1）。
> 关联提交：`[Hotfix]: revert closed-turn seed causing corrupt sessions`。
> 关联测试：`test/seed_no_turn_events.test.mjs`（已接入 `npm test`）。

## 1. 事故现象

任务看板「＋ 新对话」创建的新会话，打开时报：

```
历史加载失败：stored session "session-<id>" is corrupt:
stored session "session-<id>" failed validation:
Error: session "<id>" contains malformed pre-react-loop turn/end at seq 2（gateway/internal）
```

会话因此**打不开**（历史加载失败），且该会话已写入任务 `sessionIds`，表现为"点了新对话但什么都没有"。
本次事故中共产生 2 个损坏会话（`session-5066c58c`、`session-597338ba`），均已清理。

## 2. 根因

宿主 `POST /taskboard/api/tasks/:id/session` 用 `sessionPersistence.create()` + `append()` 写入
一个**冷会话**，其种子（seed）曾经被写成"完整闭合回合"：

```js
const seed = [
  { type: "turn/start", seq: 0, data: { turn: 0 } },
  { type: "user/message", seq: 1, surfaceOp: "append", data: { /* 任务上下文 */ } },
  { type: "turn/end", seq: 2, data: { turn: 0, reason: { kind: "completed" } } }
];
```

Harness 的恢复校验**不允许 agent react-loop 开始之前出现 turn/end**（`pre-react-loop turn/end`），
于是该日志被判损坏，`resume` 直接失败。写入阶段不报错（`create()/append()` 通过），
**只有在打开会话（resume/load）时才暴露**，因此极易漏测。

## 3. 决策

**新会话种子只允许一条裸 `user/message`**（`seq=0`、`surfaceOp="append"`、合法信封字段），
**不得包含 `turn/start` / `turn/end`**，哪怕是为了"让 GUI 判定回合已结束"。

```js
const seed = [{
  type: "user/message", seq: 0, time: now, surfaceOp: "append",
  data: { id: msgId, role: "user", content: [{ type: "text", text: "…任务共享上下文…" }], source: { kind: "user" } }
}];
```

## 4. 被否决的替代方案

| 方案 | 否决理由 |
| --- | --- |
| 种子补 `turn/start` + `turn/end`（"闭合回合"） | **本事故根因**：pre-react-loop turn/end 判损坏，会话不可加载 |
| 种子补 `turn/start` 但不补 `turn/end` | 会让会话处于"回合进行中"，输入框被锁，且属于伪造运行态 |
| 放弃任务上下文种子 | 任务=会话圈子的上下文共享是核心能力，不能丢 |

## 5. 关联问题：输入框锁死为什么不再靠种子解决

新版 Harness（0.1.2）下"新建对话后输入框需手动拖拽才能输入"，其真实原因是**切换会话走了整页 reload**：

- 客户端原先依赖 `[class*="sessionRow"]` 等**旧版类名**在 React fiber 里找宿主原生 `open()`；
  0.1.2 类名全部哈希化 → 找不到 → 每次回退 `location.reload()` → reload 恢复会话后输入框被锁。

因此修复放在**客户端**：改为遍历 React fiber 树发现宿主原生 `open` / `startSession`，
"新建对话"走**页面内原生新建**（不 reload）后再绑定任务；reload 兜底路径则自动模拟一次
布局分隔条拖拽解锁。**种子里不要再塞 turn 事件**。

## 6. 防回归

`test/seed_no_turn_events.test.mjs` 通过真实端点捕获写入 `sessionPersistence` 的种子事件并断言：

- 不含任何 `turn/start` / `turn/end`
- 恰一条 `user/message`：`seq=0`、`surfaceOp="append"`、信封字段仅含 Harness 允许的键
- `data` 含 `id` / `role` / `source.kind` / `content`

反向验证：临时注入闭合回合种子时该测试 FAIL（5 条断言红），确认测试确实能拦住回归。
