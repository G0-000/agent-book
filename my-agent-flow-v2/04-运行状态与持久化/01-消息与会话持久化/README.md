# 第 04.1 章　消息与会话持久化

> 状态：✅ 正文按六节写完；`/api/chat` 双写消息表与会话表，3 个仓储用例通过。**聊天仍不回读消息表**。
> 所属：第 04 篇　运行状态与持久化

## 1. 功能与知识点

### 功能

持久化的最小目标是「刷新、审计、导出都还能找回这段对话」：

1. **追加消息**：`append_message(thread_id, role, content)` → 返回 `seq`；不提供改正文的接口。
2. **顺序保证**：`seq = MAX(seq)+1` 与插入在同一把锁内，同一会话严格递增。
3. **读回**：`list_messages(thread_id, limit=N)` 取「最近 N 条」并按正序返回。
4. **会话行**：`upsert_session_row` 维护标题与 `updated_at`；标题只在非空时更新。
5. **清理**：`delete_messages_for_session` → 先删消息再删会话，返回删掉的行数。

`/api/chat` 现在只写不读：历史仍由 checkpointer 提供。

### 知识点如何体现

| 知识点 | 在本功能里体现为 | 可观察证据 |
|---|---|---|
| 追加而非覆盖 | 无 UPDATE 正文 API | 仓储只有 append/delete |
| 序号由库算 | 锁内 `MAX(seq)+1` | `test_append_and_list` 断言 1/2/3 |
| 会话独立编号 | 主键 `(thread_id, seq)` | 两个会话各自从 1 开始 |
| 最近 N 条要先倒序 | `ORDER BY seq DESC LIMIT ?` → `[::-1]` | limit=2 返回最新两条 |
| 标题不被覆盖 | `title if title else row[0]` | 第二轮不改成第二句 |
| 删除顺序 | 先消息后会话 | 不留下孤儿消息 |

**最小验收**：同会话追加 3 条 → `seq` 1/2/3、`count=3`、`limit=2` 取到第 2/3 条；删会话返回 3，重复删返回 0。

## 2. 最小调用链

```mermaid
flowchart TD
    A[/api/chat] --> B[upsert_session_row]
    B --> C[append_message user]
    C --> D[图运行]
    D --> E[on_final append assistant]
    E --> F[list_messages 审计/导出]
    F --> G[delete_messages_for_session]
```

### 2.1 入库

```python
with db_connection_lock():
    seq = _next_seq(db, thread_id)
    db.execute("INSERT INTO chat_messages ... VALUES (?, ?, ?, ?, ?)",
               (thread_id, seq, role, content, time.time()))
    db.commit()
```

SQLite 单连接 + 应用锁：并发写被串行化。代价是写放大时吞吐有限，收益是「不会出现两个 seq=2」。

### 2.2 读取语义

```python
rows = db.execute("... ORDER BY seq DESC LIMIT ?", (thread_id, limit)).fetchall()[::-1]
```

先倒序取最近 N 条，再翻正序。直接 `ORDER BY seq ASC LIMIT N` 拿到的是最老的 N 条，前端会以为「对话没更新」。

### 2.3 失败点

- 内容为空：`_safe_append` 直接 return，不写空行。
- 库被锁：`busy_timeout` 只对检查点库设置，应用库没有；高并发写会抛 `database is locked`。
- 进程崩溃在写 user 后、写 assistant 前：消息表会出现「只有用户问题」的半轮记录，这是可接受的审计事实，不需要回滚。

## 3. 代码创建

| 顺序 | 文件 | 本章职责 | 关键符号 |
|---|---|---|---|
| 1 | `persistence/db.py` | 连接与锁 | `get_db`、`db_connection_lock` |
| 2 | `persistence/chat_message_repositories.py` | 消息 CRUD | `append_message`、`list_messages` |
| 3 | `persistence/session_repositories.py` | 会话行 | `upsert_session_row`、`delete_sessions_by_thread_id` |
| 4 | `app/gateway/routers/chat.py` | 双写 | `_safe_append` |
| 5 | `tests/chapters/test_ch01_03_messages.py` | 仓储行为 | 3 个用例 |

### 3.1 为什么 `seq` 不交给应用计数器

应用内计数器在「多 worker / 多线程」下必然重号；数据库 `MAX(seq)+1` 加上锁是唯一便宜的强一致来源。

### 3.2 取舍：消息表做主 vs 检查点做主

- 消息表做主：人读的事实源稳定，但要让图「重建状态」需要投影逻辑。
- 检查点做主：图恢复开箱即用，但消息表可能缺行，导出/审计不完整。

当前双写、检查点做主；谁做主的问题留到完整化里解决。

### 3.3 上游对照

EvoFlow 还有：会话列表 API、消息分页、软删、按用户隔离、导出任务。本章只有仓储与双写。

## 4. 测试

### 4.1 覆盖矩阵

| 类型 | 用例 | 验证什么 |
|---|---|---|
| 正常 | `test_append_and_list` | seq 连续、会话独立、最近 N 条、计数 |
| 边界 | `test_delete_messages_for_session` | 删除返回条数，重复删 0 |
| 接线 | `test_session_row_lifecycle` | upsert 不覆盖标题、倒序、删除后查不到 |

### 4.2 运行

```bash
cd /Users/main/my-agent-flow/backend
uv run pytest tests/chapters/test_ch01_03_messages.py -q
```

当前结果：`3 passed`。

## 5. 完整化

1. **聊天回读**：进入 `/api/chat` 时先 `list_messages`，与检查点历史做一致性校验。
2. **会话列表 API**：`GET /api/sessions` 走 `list_sessions_for_ui`；现在没有路由。
3. **分页与游标**：`limit` 之外要有 `before_seq`，否则长会话只能拉最近 N 条。
4. **写补偿**：`_safe_append` 失败入 outbox，后台重试；当前缺行只进日志。
5. **应用库并发**：加 WAL 与 busy_timeout，或换连接池。
6. **导出**：Markdown/JSON 导出 + 脱敏规则，04.4 会接分享。

每项都要有独立测试；当前只完成双写。

## 6. 边界与验收

### 本章不做什么

- 不做聊天回读消息表，历史仍由检查点提供。
- 不做会话列表路由、不做分页游标。
- 不做写失败补偿，缺行只能查日志。
- 不做按用户隔离；`thread_id` 由客户端提供。

### 验收

```bash
cd /Users/main/my-agent-flow/backend
uv run pytest tests/chapters/test_ch01_03_messages.py -q
```

预期：`3 passed`。失败时先查：`MYAF_DB_PATH` 是否指到旧库、是否忘了 `db.reset_db()`、`limit=None` 是否被误传成 0。

### 下一章依赖

04.2 的检查点恢复要能回答「消息表与检查点谁缺了」；如果本章不做一致性校验，恢复后会出现「图记得、表里没有」的对话。
