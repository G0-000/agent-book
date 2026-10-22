# models/ — 模型工厂

> **源码路径**: `backend/packages/harness/workagentharness/models/factory.py`
> **对应功能**: WAH-RUN-002 模型选择与凭证

## 文件清单

| 文件 | 职责 |
|---|---|
| `factory.py` | `create_chat_model()`：从 `ChatModelConfig` 构造 LangChain `BaseChatModel` |

## 顺序执行链

```text
create_chat_model(config: ChatModelConfig)
  │
  ├─► config.provider == "fake"
  │     └─► return FakeChatModel()   # 不联网，回显轮数
  │
  ├─► config.provider == "openai-compatible"
  │     └─► return ChatOpenAI(model=..., base_url=..., api_key=...)
  │
  └─► 其他 provider → raise ValueError
```

## FakeChatModel 行为

- 不调用任何外部 API
- 输入 messages 列表，统计 human 消息数量
- 返回：`已收到（第 N 轮）：最后一条用户消息`
- 用途：验证配置加载、Agent 接线、checkpoint 恢复，不需要 API Key

## 边界与待补

- 无 provider 自动发现 / 可用模型列表查询
- 无重试 / 限流 / 退避策略
- 无凭证优先级（env > config 文件 > 默认值）
- 无日志脱敏（api_key 打到日志里会泄露）
