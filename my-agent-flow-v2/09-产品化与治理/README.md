# 第 09 篇　产品化与治理

> 状态：🟡 1/7 正文（09.3 飞书渠道最小闭环）；其余 6 章为设计卡。

## 能力域

本篇负责「产品化与治理」这一层能力。每章先跑独立最小闭环，篇末再串成本篇闭环。

## 篇级最小闭环

外部请求经 Gateway → 身份校验 → Agent 回答

## 章节

| 章 | 功能 | 知识点 | 最小闭环 | 状态 |
|---|---|---|---|---|
| [09.1](01-Gateway 与聊天 API/README.md) | Gateway 与聊天 API | HTTP 边界、校验、流式、错误封装 | `POST /chat` → SSE | 📋 设计卡 |
| [09.2](02-兼容协议、语音与代理/README.md) | 兼容协议、语音与代理 | OpenAI 兼容、适配器、音频 | 兼容请求 → 同一回答 | 📋 设计卡 |
| [09.3](03-渠道适配器与消息总线/README.md) | 渠道适配器与消息总线 | 渠道抽象、入站/出站、幂等 | 飞书文本事件 → 总线 → Agent → 飞书回复 | ✅ 飞书最小闭环（7 用例） |
| [09.4](04-身份、组织、ACL 与 Workspace/README.md) | 身份、组织、ACL 与 Workspace | Principal、RBAC/ACL、租户隔离 | A 用户读不到 B 的 workspace | 📋 设计卡 |
| [09.5](05-JWT／OIDC 与 Guardrails/README.md) | JWT／OIDC 与 Guardrails | 认证/授权、token 校验、护栏 | 过期 token 被拒绝 | 📋 设计卡 |
| [09.6](06-Trace、Eval 与成本/README.md) | Trace、Eval 与成本 | 可观测性、span、评测集、成本/延迟 | 一次运行生成 trace；3 条 eval | 📋 设计卡 |
| [09.7](07-Web／桌面与产品体验/README.md) | Web／桌面与产品体验 | UI-RPC、本地权限、打包 | Web 聊天 → 设置 | 📋 设计卡 |

## v1 参考

- [10-HTTP网关与渠道](../../my-agent-flow/10-HTTP网关与渠道/README.md)
- 用法：v1 第 09/10/11/12 部分：外部生态、网关、身份、Web/桌面。
- 注意：v1 是实现手册，v2 只借它的源码核对与文件地图；不要把 v1 的章节编号当成 v2 的学习顺序。
