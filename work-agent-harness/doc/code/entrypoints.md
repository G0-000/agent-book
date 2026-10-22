# cli/ 与 app_server/ — 入口层

> **源码路径**:
> - `backend/packages/harness/workagentharness/cli/main.py`
> - `backend/packages/harness/workagentharness/app_server/stdio_rpc.py`
> **对应功能**: WAH-RUN-008 CLI 和本地 App Server、WAH-API-009

## CLI 装配链

```text
main()
  │
  ├─► argparse 解析参数
  │     --config / --db / --thread / --once / --mode
  │
  ├─► load_chat_model_config(args.config)
  ├─► open_database(args.db)
  ├─► open_checkpointer(args.db)
  │
  ├─► create_chat_model(chat_config)
  ├─► make_lead_agent(model, checkpointer=saver)
  ├─► SessionRepository(database)
  ├─► RunRepository(database)
  │
  └─► RunService(agent, sessions, runs)
        │
        ├─► mode=cli:    交互循环 / --once 单轮
        └─► mode=app-server: serve_stdio(service, sessions)
```

## stdio JSON-RPC 支持的方法

| 方法 | 参数 | 返回 |
|---|---|---|
| `initialize` | 无 | serverInfo + capabilities |
| `server/ping` | 无 | `{"ok": true}` |
| `turn/start` | `text`, `sessionId?` | sessionId / runId / status / answer |

## 关键设计

1. **入口统一装配**：所有依赖都在 `main()` 里组装好，传给 RunService；业务逻辑不关心是 CLI 还是 stdio 调用进来的。
2. **协议层薄**：stdio_rpc 只做 JSON 解析和响应封装，业务全部委托给 RunService。
3. **owner_id 硬编码**：当前所有请求都是 `local-user`，鉴权在后续治理篇补。

## 边界与待补

- stdio 只有三个教学方法，不是完整 EvoFlow App Server 协议
- 无流式事件（SSE / stream chunks）
- 无并发 run / interrupt / cancel 通知
- 无宿主鉴权 / 权限校验
