# 第 1 章　Web 启动、聊天会话与历史

> **EvoFlow 对照状态 / Alignment status：** 🔍 结构已核对（路径、行数、符号均取自源码实测），**行为**（调用顺序、边界条件）尚未逐行核对。

## 本章目标
理解一次「发送」在前端到底发生了什么，以及历史消息为什么以服务端为准。

## 最小闭环
输入框发送 → 乐观消息上屏 → POST `/runs/stream` → 逐 token 渲染 → 工具卡片 → 完成。

## 真实模块地图（已核对：路径 · 行数 · 符号）

| 文件 | 行数 | 关键符号 | 模块常量 |
|---|---|---|---|
| `evopanel/src/react/chat-app/composer/handle-send.ts` | 934 |  | — |
| `app/gateway/routers/chat_sessions.py` | 2063 | `ForkSessionBody`、`TruncateSessionBody`；`_transcript_db_busy_http`、`_request_principal_id`、`_require_session_access` | — |
| `app/gateway/routers/langgraph_proxy.py` | 963 | `register_active_stream_proxy`、`unregister_active_stream_proxy`、`list_active_stream_proxies` | LANGGRAPH_BASE_URL、DISABLE_SSE_DEBUG_FILE_LOGS、DEBUG_SSE_REASONING |

## 核心概念
- **先 ensure thread 再 run**：`POST /threads` 建执行线，`POST /runs/stream` 才执行。
- **transcript 是 SSOT**：`evoflow_chat_messages` 为模型上下文事实源；本轮 input 只是当前消息。
- **乐观更新**：本地先插一条，服务端确认后替换为权威版本（含 message_id）。
- **attach ≠ create**：`GET .../runs/{id}/stream` 是重连，不是新建。

## 自研实现要点
```text
send(): optimistic(msg) → ensureThread() → POST runs/stream → onEvent(seq)
重连：last_seq → GET run stream（attach）→ 补发 → 去重
```

## 业务规则
- 同一会话不允许两个并发 POST stream。
- 失败回滚乐观消息并提示可重试。
- 历史加载与流式补发不得重复插入。

## 常见坑
- 每次发送都新建 thread → 历史断层。
- 乐观消息无临时 id → 确认后重复。
- 重连直接重放全部 → 重复内容。

## 验收
- [ ] 断线重连无重复
- [ ] 停止后 UI 状态正确
- [ ] 历史与流式结果一致

### 源码核对记录（路径与符号实测）

- `evopanel/src/react/chat-app/composer/handle-send.ts`（934 行）
- `app/gateway/routers/chat_sessions.py`（2063 行）：类 `ForkSessionBody`、`TruncateSessionBody`；环境变量 `EVOFLOW_SESSIONS_LIST_SHED_LIMIT`、`EVOFLOW_SESSIONS_LIST_TIMEOUT_S`
  - 模块自述：Chat session index + application-owned transcript (not LangGraph checkpoint).…
- `app/gateway/routers/langgraph_proxy.py`（963 行）；环境变量 `EVOFLOW_ACTIVE_SESSIONS_CACHE_TTL`、`EVOFLOW_DEBUG_SSE_REASONING`、`EVOFLOW_FAST_THREAD_STATE`、`EVOFLOW_LANGGRAPH_URL`
  - 模块自述：Reverse proxy for LangGraph API under gateway /api/langgraph.…

> 本节只证明**路径、行数、符号存在**；调用顺序与边界条件仍属「行为」，未逐行核对。

## 对照 EvoFlow 核对清单
- [ ] `ws-client.js` 的 TTL/重试策略
- [ ] `ensure-thread` 的 `force_recreate` 条件
