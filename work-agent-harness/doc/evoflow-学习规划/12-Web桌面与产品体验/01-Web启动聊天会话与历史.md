# 第 1 章　Web 启动、聊天会话与历史

## 本章目标
理解一次「发送」在前端到底发生了什么，以及历史消息为什么以服务端为准。

## 最小闭环
输入框发送 → 乐观消息上屏 → POST `/runs/stream` → 逐 token 渲染 → 工具卡片 → 完成。

## 真实模块地图（源码证实：路径存在）
| 职责 | 路径 |
|---|---|
| 发送入口 | `evopanel/src/react/chat-app/composer/handle-send.ts`（`handleSend()`） |
| API 门面 | `evopanel/src/lib/tauri-api.js`（`api.chatSend`） |
| 聊天传输 | `evopanel/src/lib/ws-client.js`（`chatSend()`、`_ensureThread()`、`evoflowFetchStream()`） |
| 后端承接 | `backend/app/gateway/routers/chat_sessions.py`、`langgraph_proxy.py` |

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

## 对照 EvoFlow 核对清单
- [ ] `ws-client.js` 的 TTL/重试策略
- [ ] `ensure-thread` 的 `force_recreate` 条件
