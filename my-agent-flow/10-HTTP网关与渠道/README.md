# 第 10 部分　HTTP 网关与渠道 / HTTP Gateway and Channels

> **落地状态：🟡 仅有最小 HTTP 聊天/兼容入口和渠道基类；完整网关、流式恢复、语音及 IM 适配器未落地。** 本地文件是 `app/gateway/main.py`、`routers/{chat,compat,settings}.py` 和 `app/channels/base.py`。逐章映射见[总文档、分章与代码落地对照](../00-导论/06-总文档分章与代码落地对照.md)。

目标：让内核被前端、IM、第三方协议使用，并避免每种入口重复实现业务。

## 章节

| 章 | 主题 | 本地实现 | 状态 |
|---|---|---|---|
| [1](01-Gateway启动依赖与聊天API.md) | Gateway 启动依赖与聊天 API | `app/gateway/main.py`、`routers/chat.py` | 最小入口；不代表全量 Gateway |
| [2](02-兼容协议语音与代理.md) | 兼容协议、语音与代理 | `routers/compat.py` | 有兼容路由子集；语音/LangGraph 代理未实现 |
| [3](03-渠道适配器与消息总线.md) | 渠道适配器、消息总线与状态 | `app/channels/base.py` | 只有基类；无具体 IM 适配器/消息总线 |

## 网关的三件事

1. 接入：鉴权、路由注册、健康检查、依赖启动门。
2. 协议转换：内部事件与 AG-UI/v4/OpenAI/SSE 之间的完整转换。
3. 长连接治理：流式、断线重连、限流、超时、审计。

以上是目标能力；本地目前只有少量 FastAPI 路由。不能据此宣称同一个 run 已可由 Web 与 IM 同时消费。
