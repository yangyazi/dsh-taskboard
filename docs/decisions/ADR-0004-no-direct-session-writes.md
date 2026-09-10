# ADR-0004 — 插件不得直接写会话日志（会话无法 resume 的事故）

> 状态：**已定位、已修复、已修复受影响数据**（v0.1.4）。
> 回归测试：`test/no_session_writes.test.mjs`（旧代码红灯）。
> 修复工具：`scripts/repair-session.mjs`。

## 1. 现象

用户点击「最新对话」里的某个会话，界面报：

```
resume failed for session "session-5063b47e-…": Error:
invalid persisted inbox splice at session seq 339699 (gateway/internal)
```

该会话**彻底打不开**（历史加载失败）。

## 2. 根因：插件绕过 inbox 记账，直接往日志 append

任务面板在「关联会话」时会"把任务共享上下文注入进去"，实现是：

```js
const insp = await ctx.sessionPersistence.inspect(sessionId);
const nextSeq = insp.events.length;              // ← 相当于伪造 seq
await ctx.sessionPersistence.append(sessionId, [{ type: "user/message", seq: nextSeq, … }]);
```

Harness 的待办输入（agent inbox）是**持久化投影**：每次入队/认领都写一条
`agent/inbox/spliced` 事件，`Inbox` 在 resume 时按顺序重放这些事件重建队列
（`@deepseek-ai/dsh-agent/lib/types/inbox.js`）。插件直接塞一条 `user/message`
绕过了这套记账，于是日志里出现"**认领了但从未入队**"的 splice：

```
seq=339696 session/end-seed
seq=339697 user/message            ← 插件直接写的"任务上下文"
seq=339698 turn/start
seq=339699 agent/inbox/spliced     ← {"target":"next-turn","removedCount":1,"inserted":[]}
seq=339701 user/message "继续"      ← 被认领的消息（历史里仍在）
```

重放到 339699 时 `next-turn` 是空的，校验失败：

```
if (!Number.isSafeInteger(s.start) || s.start < 0 || s.start > inbox.length || …)
    throw new Error('invalid inbox splice');
```

对照未损坏的注入样本可见，正常情况下 Harness 会自己补上
`session/end-seed` + **真正的 insert**：

```
注入 → session/end-seed → agent/inbox/spliced(insert) → turn/start     ✅ 正常
注入 → turn/start      → agent/inbox/spliced(removal) → step/start     ❌ 损坏
```

## 3. 影响面（实测）

- 全量扫描 189 个会话：**2 个**损坏（`session-5063b47e` @22:04、`session-95fad046` @00:03）；
- 历史上被注入过上下文的会话共 12 个 → 损坏率约 1/6；
- 两处损坏都在"注入 → 用户发出下一条消息"之后发生，与 harness 无关的其它会话全部正常。

## 4. 决策

**插件永远不得直接写会话日志**（不得调用 `sessionPersistence.create/append` 去改动
已有会话）。这条路径已整体删除，`POST /tasks/:id/sessions`（link/unlink）现在只记关联关系。

仍允许的唯一写入是**为任务新建一个全新会话**时的种子消息（`create` + 单条
`user/message`）——它写在一个全新的、还不属于任何 agent 的 id 上，不存在 inbox 投影，
且已有专门的回归测试（`test/seed_no_turn_events.test.mjs`）。

上下文共享不受影响，改为三条不写日志的路径：

1. 新对话的种子消息（自动带任务上下文）；
2. 任务详情里的「📋 复制上下文」；
3. `manage-taskboard` skill 的 `task-by-session` 自取（让会话里的 agent 自己拉最新上下文）。

**安全的"真正注入"**（未来可选）：走 Harness 自己的投递接口
`ctx.get("agents").get(sessionId)?.followup(message)`（`dsh-api-session-controller`
的 `prompt` RPC 就是这么做的，它会写合法的 inbox splice）。但它需要**活**会话对应的
agent；冷会话没有 agent，因此现在不做。

## 5. 数据修复

`scripts/repair-session.mjs` 逐帧解码会话日志，**保留**那条孤立的 splice 事件、只删掉
它的 `data.removedCount`（该字段可选；Harness 自己在"删 0 条"时也不写它），
于是它变成一次合法的空操作（`start=0`、不删不插），其余行逐字保留、
按后端的 checksum 选项重新压缩，并自检：

- 重放不再报错；
- header 行完整；
- **事件行数不变**（关键，见下）；
- 帧数、被认领消息仍在历史中。

### 5.1 第一版修法是错的（教训）

第一版做法是"删掉那条孤立事件行"，结果 Harness 换了一种报错：

```
failed to observe session "…": corrupt session log:
seq gap in committed region at line 12165 (expected 339699, got 339700)
```

原因是 Harness 对 committed 区还有第二条校验——**第 N 个事件的 seq 必须等于 N**
（`dsh-session-persistence-jsonl` 的 `SessionLogScanner.consumeEventLine`：
`if (event.seq !== this.events.length)` → `seq gap in committed region`）。
删事件会留下 seq 空洞，因此**只能改事件的内容，不能改事件的数量**：
去掉 `removedCount` 让"越界删除"退化成"空操作"，两条校验同时满足。

教训：修这类日志前要把校验规则读全（重放合法性 + seq 连续性），并优先选择
"保留结构、只改语义"的最小改动。

两个损坏会话均已修复（备份在 `/tmp/tb-session-repair-backup/`），修复后全量重放 0 失败。
