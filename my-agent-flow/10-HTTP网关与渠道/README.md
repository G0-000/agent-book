# 第 10 部分　HTTP 网关与渠道 / HTTP Gateway and Channels

> 状态：🟡 骨架（真实路径已核对）。

目标：让内核被 **前端、IM、第三方协议** 同时使用，而不在每种入口重复实现业务。

## 章节

| 章 | 主题 | 真实模块 |
|---|---|---|
| [1](01-Gateway启动依赖与聊天API.md) | Gateway 启动依赖与聊天 API | `app/gateway/app.py`、`router_registry.py`、`startup_gate.py`、`routers/chat_sessions.py` |
| [2](02-兼容协议语音与代理.md) | 兼容协议、语音与 OpenAI/LangGraph 代理 | `openai_*`、`agui_*`、`v4/`、`speech/`、`routers/langgraph_proxy.py` |
| [3](03-渠道适配器与消息总线.md) | 渠道适配器、消息总线与渠道状态 | `app/channels/*` |

## 网关的三件事

1. **接入**：鉴权、路由注册、健康检查、启动门（依赖没准备好就不接流量）。
2. **协议转换**：内部事件 ↔ AG-UI / v4 / OpenAI 兼容 / SSE。
3. **长连接治理**：流式、断线重连、限流、超时、审计。

## 渠道的一件事

> 把「IM 里的一条消息」变成「一次 run」，再把「run 的结果」变回「那条消息的回复」。

## 验收口径
- 同一 run 可同时被 Web SSE 与 IM 渠道消费。
- 断线 30 秒内重连无丢失。
- 新增一个 IM 渠道不改动内核。
