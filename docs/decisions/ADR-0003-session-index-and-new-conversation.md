# ADR-0003 — 「关联对话不见了 / 新建对话很卡」根因与修复

> 状态：**已修复并加回归测试**。
> 关联测试：`test/session_index_cold.test.mjs`（旧代码红灯，已接入 `npm test`）。

## 1. 现象（用户报告）

- 任务详情里「池内会话」全部显示「（会话已不存在）」，点开也打不开 —— 看起来"关联对话不见了"。
- 「＋ 新对话」很卡：点击后要等约 5 秒页面才动。
- 用户补充："还是不行，刷新之后就不行" —— 刷新后依然看不到关联对话。

浏览器实测（headless Chromium + 真实 GUI，任务「最新对话展示开发」）：
池内会话 3 条其中 3 条解析不到；点击「＋ 新对话」到整页 reload **5212ms**。

## 2. 根因一：会话索引缺少"磁盘来源"（刷新也无效）

`sessionIndex()` 早期只合并两个来源：

1. `ctx.sessions.list()` —— **实时**会话（宿主进程里活着的）；
2. `session_projcache.json` —— **投影缓存**（被 GUI 打开过的）。

宿主侧新建的冷会话（`sessionPersistence.create()` 写入、还没被 GUI 打开）两者都不在。
实测任务 `sessionIds` 共 86 条关联，其中 **20 条**在索引里查不到 —— 全部发生在
"新建后没打开过"或"投影缓存没覆盖"的会话上。

前端拿不到索引行 → 显示「（会话已不存在）」并隐藏「打开」按钮。
**刷新无效**，因为数据来自宿主而不是浏览器缓存 —— 这正是用户说"刷新之后就不行"的原因。

修复：加入第三个来源 `ctx.sessionPersistence.list()`（磁盘上真实存在的会话），
标题回退顺序 `投影缓存 title → 会话日志首条 user/message → cwd basename → id`。

## 3. 根因二：原生「New Session」是草稿态，轮询必然超时

原实现的「＋ 新对话」先尝试宿主原生新建：`startSession()` / 点击侧边栏
`button[class*="newSession"]`，然后 `waitForNewSession(before, 4500)` 轮询
`localStorage["dsh.sessions.current"]` 等新 id。

实测本版 Harness（0.1.2-rc.1）的行为：

```
点击 button.hHd-Xa_newSession 后等 6 秒：
  localStorage dsh.sessions.current 仍为旧会话（未变化）
  侧边栏出现一条 selected 的 "New Session" 行
```

即原生「New Session」是**草稿**：会话 id 要等用户发出第一条消息才产生。
所以 `waitForNewSession()` **永远拿不到 id**，白等满 4.5s 超时才回退到 host 建会话
—— 这就是 5.2s 卡顿的全部来源（fiber 探测实测仅 752 节点 / <1ms，不是瓶颈）。

修复：不再尝试原生建会话，直接走 host：建带任务共享上下文的冷会话（实测 ~340ms，
id 立刻返回，且 host 侧已自动绑定任务）→ 立即 `openSession()`（页内 open 可用则原地切换，
不可用才整页加载）。`setPendingToast()` 让整页加载后仍能看到"已新建并绑定"提示。

## 4. 附带修复：两处真正的性能坑

- `sessionFileMtime()` 每个会话都把 sessions 根目录整个扫一遍 → 索引 N 个会话即 O(N²) 次 stat。
  改为 `sessionFileIndex()`：整目录扫一次、3s TTL 复用、id→{path,mtime} 映射，查询 O(1)。
- 冷会话标题原先 `readFile()` 读整个会话日志（大会话数十 MB × 上百个会话）。
  改为 `readHead()` 只读前 256KB 并扫描 zstd 帧，结果进 `promptTitleCache`。
- 客户端 `discoverNativeCapabilities()` 只在**成功**时缓存，失败时每次调用都重跑整棵
  fiber 树遍历（打开/新建/切换各一次）。改为带 TTL（5s）缓存失败结果 + 单次 40ms 时限。

## 5. 未采用：让客户端页内打开 host 冷会话（后续正解）

理论最优是"host 建会话 + 客户端页内 `open(id)`"，完全免整页 reload。实测受阻：

- 客户端会话服务（`ClientSessions.open/create/refresh`）是 Cordis **service**，
  访问未 inject 的属性会抛 `cannot get property "open" without inject`；
  `open(id)` 还要求会话已在客户端 list store 里，否则 `sessions.select: unknown session`。
- 客户端 list store 只由 `session.list` RPC 基线与宿主 `session/created` 推送维护，
  我们直接写持久化创建的冷会话两者都不触发。
- 注入的 IIFE 脚本**不是客户端插件**，拿不到带 inject 作用域的 `ctx`。

正解是把客户端半做成真正的 client plugin（`package.json` 的 `dsh.client` 声明 +
`window.__ModuleLoader__.load({id, factory})` 包装 + `exports.apply/inject`），
即可合法使用 `ctx.sessions.create()/open()`。

**暂不实施**：`dsh.client` 声明若格式有误，客户端模块注册表的激活扫描会整体抛错，
导致整个 Web GUI 启动失败（"Failed to load plugins"）。收益（省掉一次整页加载）
不足以承担该风险，待有独立时间窗 + 可回滚验证时再做。

## 6. 后续修正：「最新对话」被空壳会话刷屏

第 2 节的修复上线后，用户反馈「最新对话似乎被改坏了」。浏览器实测（DOM 抓取）确认
小组件本身渲染正常（15 行、"刚刚/1 分钟前"排序正确），坏的是**内容**：

```
1. projects | 刚刚                       ← 空壳会话，标题退化成目录名
2. 为DeepSeek Harness开发任务面板插件 | 1 分钟前
3. arch-sim | 1 分钟前                   ← 空壳会话
7. jenkins-pipeline-qa | 24 分钟前        ← 空壳会话
6/11/12/13/14/15. 这是任务「X」的一个新对话。开始前请先阅读并遵循以下任务共享上…  ← 种子长文当标题
```

两类噪音，都来自第 2 节新增的"磁盘来源"：

1. **空壳会话**：宿主在切换工作区/新建草稿时留下的会话日志只有引导事件
   （`session`、`permission/preset`、`sandbox/mode`、`approval/policy`），
   体积几百字节、**没有任何 user/message**，但文件 mtime 是"刚刚" →
   被索引收录后标题只能退化成目录名（`projects`/`arch-sim`），并且因为 mtime 最新
   直接霸占榜首。（实测全量 189 个会话里有 5 个这种空壳。）
2. **任务种子长文**：任务板「新对话」的种子消息是一整段模板文字，作为首条
   user/message 被标题逻辑原样取用。

修正（三条规则，均已加回归测试 `test/session_index_empty.test.mjs`）：

- 空壳会话（无 user/message、无投影标题、也不被任何任务引用）**不进索引**；
- 但**被任务引用的会话必须保留**，只打 `empty: true` 标记，由前端小组件过滤 ——
  否则任务详情又会显示「（会话已不存在）」（即最初用户报的那个 bug）。
  实测中就有一条这样的数据：任务「性能测试报告生成」关联着一个 962 字节的空壳会话。
- 种子消息标题折叠为「任务「X」的新对话」；投影缓存里没有标题的行也回退读日志首条
  用户消息，仍没有才显示「<目录名> · 无标题」，**不再显示裸 session id**。

客户端「最新对话」相应增加过滤：`empty === true` 或标题仍是裸 id 的行不进小组件
（任务详情里的关联列表不受影响）。真实数据实测：索引 189 → 186 条（4 个无关空壳被排除），
任务关联解析不到 0 条，裸 id 标题 0 条。
