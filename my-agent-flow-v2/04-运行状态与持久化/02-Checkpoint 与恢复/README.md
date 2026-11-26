# 第 04.2 章　Checkpoint 与恢复

> 状态：✅ 正文按六节写完；memory/sqlite/postgres 三种后端与「写前剥对话」已实现，同 thread 恢复历史有 HTTP 用例。
> 所属：第 04 篇　运行状态与持久化

## 1. 功能与知识点

### 功能

检查点解决「同一 thread 第二轮还能看到第一轮」，并允许换后端：

1. **三种后端**：`memory`（默认，进程内）、`sqlite`（WAL + busy_timeout）、`postgres`（DSN）。
2. **单例**：`get_checkpointer()` 进程内只建一次；`reset_checkpointer()` 给测试用。
3. **只读快照**：`read_thread_state()` 返回 `checkpoint_id/values/metadata`，不 compile 图。
4. **写前剥对话**：`OmitTranscriptCheckpointer` 可把 `messages/ui_messages` 清空，但有未配对 `tool_calls` 时必须保留。
5. **同线程恢复**：`/api/chat` 传 `{"configurable":{"thread_id":...}}`，第二轮带历史。

### 知识点如何体现

| 知识点 | 在本功能里体现为 | 可观察证据 |
|---|---|---|
| 后端可换、协议不变 | 三个 `_build` 分支返回同一个 `Checkpointer` 接口 | 改 `MYAF_CHECKPOINTER` 不动业务代码 |
| 默认要能跑 | `memory` 是默认后端 | 什么都不配也能起服务 |
| 连接要长持有 | SqliteSaver 复用 connection | 避免 setup 反复执行/锁表 |
| 读不写 | WAL 模式 | 读不阻塞写 |
| 缺连接串要指名 | `POSTGRES_CONN_REQUIRED` 写明环境变量 | 报错可执行 |
| 剥对话不能剥断工具 | `has_unresolved_tool_calls` 时保留 | 防止恢复后 `tool_call_id` 丢失 |

**最小验收**：sqlite 后端连续两次 `get_checkpointer()` 返回同一对象且 `checkpoints` 表存在；读不存在线程返回 `None`；同 thread 第二轮带第一轮历史。

## 2. 最小调用链

```mermaid
flowchart TD
    A[/api/chat] --> B[get_checkpointer]
    B --> C{backend}
    C -- memory --> D[InMemorySaver]
    C -- sqlite --> E[SqliteSaver + WAL]
    C -- postgres --> F[PostgresSaver]
    D --> G[build_graph compile]
    E --> G
    F --> G
    G --> H[astream_events thread_id]
    H --> I[写检查点]
    I --> J[第二轮 get_tuple 读回]
```

### 2.1 构建

```python
if backend == "sqlite":
    conn = sqlite3.connect(path, check_same_thread=False)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA busy_timeout=5000")
    saver = SqliteSaver(conn)
    saver.setup()
```

`check_same_thread=False` 是因为 FastAPI 线程池与图执行可能不同线程；WAL + 5s busy_timeout 是「短写高频读」场景的默认最佳组合。

### 2.2 剥对话的边界

```python
if has_unresolved_tool_calls(messages):
    return checkpoint          # 有未配对工具调用，剥掉会让恢复找不到结果
return omit_transcript_channels(checkpoint)
```

剥掉的是「人看的对话副本」，不是「图的执行状态」；一旦有 `AIMessage.tool_calls` 还没收到对应 `ToolMessage`，必须保留，否则恢复后的图会缺一条工具结果。

### 2.3 失败点

- sqlite 路径目录不存在：`os.makedirs(dirname or ".", exist_ok=True)` 兜底；路径为纯文件名时 `dirname` 为空串，写成 `"."`。
- postgres 缺包：报「安装：uv add langgraph-checkpoint-postgres…」，不是裸 ImportError。
- 进程重启 + memory 后端：历史全丢，这是后端选择的结果，不是 bug。

## 3. 代码创建

| 顺序 | 文件 | 本章职责 | 关键符号 |
|---|---|---|---|
| 1 | `agents/checkpointer/provider.py` | 后端选择、单例、pragma | `get_checkpointer`、`_build` |
| 2 | `agents/checkpointer/omit_transcript.py` | 写前剥对话 | `OmitTranscriptCheckpointer`、`has_unresolved_tool_calls` |
| 3 | `agents/checkpointer/thread_state_reader.py` | 只读快照 | `read_thread_state` |
| 4 | `app/gateway/routers/chat.py` | 传 thread_id | `configurable` |
| 5 | `tests/chapters/test_ch02_01_checkpointer.py` | 单例/建表/剥离 | 5 个用例 |
| 6 | `tests/chapters/test_ch01_02_r0_e2e.py` | 同 thread 历史 | 1 个用例 |

### 3.1 为什么单例

`setup()` 会建表；每次请求 new 一个 saver 等于每次重跑 DDL，还会在 sqlite 上抢锁。单例是正确性要求，不只是性能优化。

### 3.2 取舍：剥对话 vs 保留

- 剥：检查点小，但消息表必须可靠（现在聊天不回读，剥了第二轮就失忆）。
- 保留：恢复简单，但检查点随对话增长。

当前默认不剥，用环境变量显式开启；等 04.1 的回读接完再切默认。

### 3.3 上游对照

EvoFlow 的检查点还包含：跨进程恢复、断点续跑（interrupt 后 resume）、检查点清理策略、迁移工具。本章只做「同进程同 thread 恢复」。

## 4. 测试

### 4.1 覆盖矩阵

| 类型 | 用例 | 验证什么 |
|---|---|---|
| 正常 | `test_sqlite_setup_and_singleton` | 单例 + `checkpoints` 表 |
| 边界 | `test_read_unknown_thread` | 不存在的线程返回 None |
| 边界 | `test_omit_transcript_on_put` | 正常轮次剥掉 messages |
| 边界 | `test_keep_messages_for_unresolved_tool_call` | 工具未配对时保留 |
| 开关 | `test_omit_switch_off` | 关闭时原样写入 |
| 端到端 | `test_http_chat_streams_and_second_turn_sees_history` | 第二轮带历史 + 消息表四条 |

### 4.2 运行

```bash
cd /Users/main/my-agent-flow/backend
uv run pytest tests/chapters/test_ch02_01_checkpointer.py tests/chapters/test_ch01_02_r0_e2e.py -q
```

当前结果：5 + 1 = 6 passed。

## 5. 完整化

1. **跨进程恢复**：同一 sqlite 文件被两个 worker 打开时的锁竞争与版本冲突。
2. **断点续跑**：`interrupt` 后从检查点 resume；现在审批走异常，没有挂起点。
3. **清理策略**：按 thread 保留最近 N 个检查点，旧版本删除。
4. **检查点与消息表对账**：启动时抽样比对，发现「图有表无」要能修。
5. **迁移**：memory → sqlite 的导入工具。
6. **剥对话默认化**：回读接完后把默认切成「剥」，并做兼容开关。

每项都要有独立测试；当前只完成同进程恢复。

## 6. 边界与验收

### 本章不做什么

- 不做跨进程/多 worker 恢复验证。
- 不做 `interrupt` 挂起与 resume。
- 不做检查点清理与迁移。
- 不做消息表与检查点自动对账。

### 验收

```bash
cd /Users/main/my-agent-flow/backend
uv run pytest tests/chapters/test_ch02_01_checkpointer.py -q
```

预期：`5 passed`。失败时先查：`provider.reset_checkpointer()` 是否调用、`MYAF_CHECKPOINTER` 与路径是否成对设置、`setup()` 是否真的执行。

### 下一章依赖

04.3 的 run 生命周期不存检查点，它只记「这次执行到哪」；两者不能混为一份状态。
