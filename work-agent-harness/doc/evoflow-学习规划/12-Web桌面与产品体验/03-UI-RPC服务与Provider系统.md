# 第 3 章　UI RPC 服务与 Provider 系统

> **EvoFlow 对照状态 / Alignment status：** 🔍 结构已核对（路径、行数、符号均取自源码实测），**行为**（调用顺序、边界条件）尚未逐行核对。

## 本章目标
让前端不直连后端细节，而通过一层稳定的 RPC / Provider 抽象。

## 最小闭环
前端调用 `api.xxx` → 经 RPC 通道（HTTP / Tauri command / stdio）→ 后端路由 → 返回结构化结果。

## 真实模块地图（已核对：路径 · 行数 · 符号）

| 文件 | 行数 | 关键符号 | 模块常量 |
|---|---|---|---|
| `packages/harness/evoflow/app_server/stdio_rpc.py` | 719 | `StdioAppServer`；`_force_utf8_stdio`、`serve_stdio`、`serve_stdio_async` | PROTOCOL_VERSION |
| `packages/harness/evoflow/app_server/chat_bridge.py` | 396 | `_client_lock`、`_get_shared_gateway_client`、`reset_shared_gateway_client_for_tests` | — |
| `app/gateway/routers/models.py` | 1156 | `ModelResponse`、`ModelsListResponse`、`SetPrimaryModelRequest`；`_to_model_response`、`list_models`、`get_primary_model` | — |
| `app/gateway/routers/codex_auth.py` | 180 | `LoginStartRequest`、`LoginPollRequest`、`EnsureModelRequest`；`_http_from_auth_error`、`require_local_plan_admin`、`codex_auth_status` | — |

## 核心概念
- **门面（facade）**：UI 只认 `api.*`，底层换传输不改调用方。
- **Provider**：把「不同模型/工具供应商」的差异收敛成统一接口。
- **能力探测**：Provider 声明自己支持什么（流式、工具、思考），UI 据此降级。
- **错误归一**：不同传输的错误码映射到统一错误类型。

## 自研实现要点
```text
Provider{id, supports[], call(req) → stream|result}
RpcClient: http | tauri | stdio 三种 transport，同一 method 表
```

## 业务规则
- method 名与后端路由一一对应，可自动校验。
- 流式能力由 Provider 声明，不靠猜。
- 传输层不承载业务逻辑。

## 常见坑
- UI 直接调后端 URL → 换桌面端全改一遍。
- Provider 能力声明与实际不符 → 静默失败。
- 错误码各传输不一致 → 无法统一提示。

## 验收
- [ ] 同一 method 在三种 transport 下行为一致
- [ ] 能力降级可观察
- [ ] 错误归一可测试

### 源码核对记录（路径与符号实测）

- `packages/harness/evoflow/app_server/stdio_rpc.py`（719 行）：类 `StdioAppServer`；环境变量 `EVOFLOW_PSS_LOG`
  - 模块自述：Newline-delimited JSON-RPC app-server (stdio or local TCP). Desktop clients use this pipe; the web UI keeps HT…
- `packages/harness/evoflow/app_server/chat_bridge.py`（396 行）；环境变量 `EVOFLOW_PSS_LOG`
  - 模块自述：Proxy interactive chat turns to Gateway LangGraph SSE and re-emit as RPC notifications.…
- `app/gateway/routers/models.py`（1156 行）：类 `ModelResponse`、`ModelsListResponse`、`SetPrimaryModelRequest`、`ModelInvokeMessage`
- `app/gateway/routers/codex_auth.py`（180 行）：类 `LoginStartRequest`、`LoginPollRequest`、`EnsureModelRequest`
  - 模块自述：ChatGPT / Codex subscription auth for Settings → 模型.…

> 本节只证明**路径、行数、符号存在**；调用顺序与边界条件仍属「行为」，未逐行核对。

## 对照 EvoFlow 核对清单
- [ ] `tauri-api.js` 的 method 覆盖范围
- [ ] `zcode-provider` 的接口契约
