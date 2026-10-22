# persistence/ — 业务持久化

> **源码路径**: `backend/packages/harness/workagentharness/persistence/`
> **对应功能**: WAH-RUN-006 聊天记录与存储、WAH-RUN-007 Run 状态

## 文件清单

| 文件 | 职责 |
|---|---|
| `schema.py` | 建表 SQL：sessions / messages / runs |
| `db.py` | 打开 SQLite 连接、设置 WAL、执行建表 |
| `session_repository.py` | Session + Message 读写 |
| `run_repository.py` | Run 状态机：start → complete / fail / cancel |

## 表结构

```text
sessions
  ├─ id          TEXT PK      # thread_id / session_id
  ├─ owner_id    TEXT          # 当前硬编码 "local-user"
  ├─ title       TEXT DEFAULT ''
  ├─ created_at  TEXT
  └─ updated_at  TEXT

messages
  ├─ id          INTEGER PK AUTOINCREMENT
  ├─ session_id  TEXT FK → sessions(id) ON DELETE CASCADE
  ├─ role        TEXT CHECK IN ('user', 'assistant', 'tool')
  ├─ content     TEXT
  └─ created_at  TEXT

runs
  ├─ id          TEXT PK
  ├─ session_id  TEXT FK → sessions(id)
  ├─ owner_id    TEXT
  ├─ status      TEXT CHECK IN ('running', 'completed', 'failed', 'cancelled')
  ├─ error_code  TEXT DEFAULT ''
  ├─ created_at  TEXT
  └─ updated_at  TEXT
```

## Run 状态机

```text
start()          complete()
running ──────► completed
   │  ▲
   │  │
   │  └───────────── fail() / cancel()
   │
   └─ 只允许从 running → 终态
      UPDATE ... WHERE status = 'running'
      rowcount != 1 则报错（防重复结束）
```

## 边界与待补

- 无分页（list_messages 全量返回）
- 无消息编辑 / 删除 / 归档
- 无数据库迁移（只有 CREATE TABLE IF NOT EXISTS）
- 无索引优化
