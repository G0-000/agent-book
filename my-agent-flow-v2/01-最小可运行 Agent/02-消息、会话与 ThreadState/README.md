# 第 01.2 章　消息、会话与 ThreadState

> 状态：✅ 正文按六节写完；消息/会话仓储已接进 `/api/chat`（写 user/assistant + upsert 会话），回读消息表仍缺。
> 所属：第 01 篇　最小可运行 Agent

## 1. 功能与知识点

### 功能

一次聊天会产生三份状态，各自解决不同问题：

1. **消息表**（`chat_messages`）：给人看、给审计看的事实记录；只追加、有 `seq`、可回读。
2. **会话表**（`sessions`）：会话列表与标题；`updated_at` 决定排序。
3. **ThreadState**（checkpointer）：给模型看的对话状态；`thread_id` 是键，图恢复时用它。

`/api/chat` 现在做的是：先写 user 消息 → 跑图（带 checkpointer）→ 成功后写 assistant 消息。**回读消息表还没接**，这是本章明确的缺口。

### 知识点如何体现

| 知识点 | 在本功能里体现为 | 可观察证据 |
|---|---|---|
| 消息只追加 | 没有 UPDATE 消息正文的接口；修正靠插新消息 | 仓储只有 `append_message` |
| seq 必须由库算 | `MAX(seq)+1` 与插入在同一把锁里 | 并发插入不重号 |
| 「最近 N 条」要先倒序 | `ORDER BY seq DESC LIMIT ?` 再翻转 | `list_messages(limit=2)` 是最新两条 |
| 会话标题不覆盖 | `title` 只在非空时更新 | 第二轮不把标题改成第二句 |
| 两份事实源要分清 | 检查点给模型，消息表给人 | `read_thread_state` 不返回消息正文 |

**最小验收**：同 thread 追加三条 → `seq` 为 1/2/3，`list_messages(limit=2)` 返回第 2、3 条；同 thread 第二次跑图，模型能看到第一轮历史。

## 2. 最小调用链

```mermaid
flowchart TD
    A[/api/chat] --> B[upsert_session_row title=前40字]
    B --> C[append_message user]
    C --> D[build_graph + checkpointer]
    D --> E[模型回复]
    E --> F[append_message assistant]
    F --> G[list_messages 供前端/审计]
    D --> H[read_thread_state 只读快照]
    H --> I[checkpoint_id / values / metadata]
```

### 2.1 追加与读取

```python
def append_message(thread_id: str, role: str, content: str) -> int:
    db = get_db()
    with db_connection_lock():
        seq = _next_seq(db, thread_id)
        db.execute("INSERT INTO chat_messages ... VALUES (?, ?, ?, ?, ?)",
                   (thread_id, seq, role, content, time.time()))
        db.commit()
        return seq
```

锁 + `MAX(seq)+1` 一起做：两个请求同时追加同 thread 时，第二个会等第一个提交，不会都拿到 2。

### 2.2 标题只更新一次

```python
if row is None:
    INSERT(title or "", now, now)
else:
    new_title = title if title else row[0]
```

首条消息决定标题；后续消息只刷新 `updated_at`。否则会话列表会随最后一句乱跳。

### 2.3 检查点快照刻意收窄

```python
return {
    "checkpoint_id": checkpoint.get("id"),
    "values": checkpoint.get("channel_values", {}),
    "metadata": dict(tup.metadata or {}),
}
```

检查点里没有完整对话，这是设计选择：要正文去消息表。读路径不 compile 图，避免刷新页面变成秒级。

## 3. 代码创建

| 顺序 | 文件 | 本章职责 | 关键符号 |
|---|---|---|---|
| 1 | `persistence/db.py` | 单连接 + 事务锁 | `get_db`、`db_connection_lock` |
| 2 | `persistence/chat_message_repositories.py` | 追加/读取/计数/清理 | `append_message`、`list_messages` |
| 3 | `persistence/session_repositories.py` | 会话列表与标题 | `upsert_session_row`、`list_sessions_for_ui` |
| 4 | `agents/checkpointer/thread_state_reader.py` | 只读线程快照 | `read_thread_state` |
| 5 | `app/gateway/routers/chat.py` | 写 user/assistant、upsert 会话 | `_safe_append` |
| 6 | `tests/chapters/test_ch01_03_messages.py` | 仓储行为 | 3 个用例 |

### 3.1 失败隔离

```python
def _safe_append(thread_id: str, role: str, content: str) -> None:
    try:
        ...
        append_message(thread_id, role, content)
    except Exception:
        logger.exception("append_message failed")
```

归档失败只记日志：回答已经生成，不能因为落库挂了就把整轮判成失败。代价是「消息表可能缺一条」，要靠审计日志补。

### 3.2 两份事实源的对齐方式

- 写：`/api/chat` 双写，先消息表，后检查点（图运行中自动）。
- 读：前端会话列表读 `sessions` + `list_messages`；图恢复读检查点。
- 不做：以消息表为唯一事实源重建图状态；这需要「消息 → 图状态」的投影，本章没有实现。

### 3.3 上游对照

EvoFlow 把「消息表 / 检查点 / 前端 thread」三者的主从关系写得比较死：消息表是事实源，检查点可重建。本章只做到「双写 + 各自可读」，重建链路留给 04.2。

## 4. 测试

### 4.1 覆盖矩阵

| 类型 | 用例 | 验证什么 |
|---|---|---|
| 正常 | `test_append_and_list` | seq 连续、不同会话各自从 1 开始、limit 取最近、计数正确 |
| 边界 | `test_delete_messages_for_session` | 删除返回条数，重复删返回 0 |
| 接线 | `test_session_row_lifecycle` | upsert 不覆盖标题、列表倒序、删除后查不到 |
| 正常 | `test_same_thread_keeps_history` | 同 thread 第二轮带上前一轮消息，共 4 条 |

### 4.2 运行

```bash
cd /Users/main/my-agent-flow/backend
uv run pytest tests/chapters/test_ch01_03_messages.py tests/chapters/test_ch01_02_graph.py -q
```

当前结果：仓储 3 个用例、图历史 2 个用例，全部通过。

### 4.3 历史编号说明

测试文件名沿用早期章号（`test_ch01_03_messages.py` 是「消息仓储」，不是 v2 的 01.3 Prompt）。读文档时以本章 §4 给出的完整路径为准。

## 5. 完整化

1. **聊天回读消息表**：`/api/chat` 第二轮应从消息表拼历史，再与检查点比对；现在是「图自己记，消息表只写」。
2. **会话列表 API**：`list_sessions_for_ui` 有仓储，没有路由；前端拿不到列表。
3. **消息角色校验**：仓储信任调用方；应在 DB 层加 `role in ('user','assistant','tool','system')` 约束。
4. **写失败重试与补偿**：现在只记日志；应进 outbox，后台补写。
5. **分叉与重放**：从第 N 条消息分叉出新 thread，需要「消息 → 图状态」投影。
6. **大消息体**：单条超长文本要不要落盘引用而不是入库，需要配额策略。

每项都要有独立测试；当前只完成「双写 + 各自可读」。

## 6. 边界与验收

### 本章不做什么

- 不做消息表 → 图状态的重建；检查点仍是图恢复的唯一来源。
- 不做会话列表路由、不做导出；04.4 才谈分享导出。
- 不校验 `role` 合法性；由调用方保证。
- 不做写失败补偿，缺消息只体现在审计日志。

### 验收

```bash
cd /Users/main/my-agent-flow/backend
uv run pytest tests/chapters/test_ch01_03_messages.py -q
```

预期：`3 passed`。失败时先查：`MYAF_DB_PATH` 是否指到旧库、`db.reset_db()` 是否在用例里调用、`limit` 语义是否被当成「前 N 条」。

### 下一章依赖

01.3 的 system prompt 要在本轮消息前面临时插入；它不能写进消息表，也不能写进检查点历史，否则第二轮会多出一条 system 事实。
