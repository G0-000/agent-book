# 第 3 章　UI RPC 服务与 Provider 系统

## 本章目标
让前端不直连后端细节，而通过一层稳定的 RPC / Provider 抽象。

## 最小闭环
前端调用 `api.xxx` → 经 RPC 通道（HTTP / Tauri command / stdio）→ 后端路由 → 返回结构化结果。

## 真实模块地图（源码证实：路径存在）
| 职责 | 路径 |
|---|---|
| 前端 API 门面 | `evopanel/src/lib/tauri-api.js` |
| 传输通道 | `evopanel/src/lib/ws-client.js`；桌面 `evopanel/src-tauri/src/commands/gateway.rs` |
| stdio RPC | `backend/packages/harness/evoflow/app_server/stdio_rpc.py`、`chat_bridge.py` |
| Provider | `evopanel/src/zcode-provider/`、`zcode-provider-node/`、`zcode-rpc/` |
| 模型/供应商入口 | `routers/models.py`、`routers/codex_auth.py` |

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

## 对照 EvoFlow 核对清单
- [ ] `tauri-api.js` 的 method 覆盖范围
- [ ] `zcode-provider` 的接口契约
