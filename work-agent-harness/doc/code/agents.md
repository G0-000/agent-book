# agents/ — Agent 构建与 Checkpoint

> **源码路径**: `backend/packages/harness/workagentharness/agents/`
> **对应功能**: WAH-RUN-003 Agent 图构建、WAH-RUN-005 Checkpoint 与恢复

## 目录结构

```text
agents/
├── lead_agent/
│   └── agent.py        # make_lead_agent()：构造 Lead Agent
└── checkpointer/
    └── provider.py      # open_checkpointer()：SqliteSaver 初始化
```

## Lead Agent 构造链

```text
make_lead_agent(model, checkpointer=None, system_prompt=DEFAULT)
  │
  ▼
  langchain.agents.create_agent(
    model=model,
    tools=[],              # 当前无工具，后续篇补
    middleware=[],         # 当前无中间件，后续篇补
    checkpointer=saver,
    system_prompt=system_prompt,
  )
  │
  ▼ 返回 Runnable (LangGraph 编译后的图)
```

## Checkpoint 初始化链

```text
open_checkpointer(db_path: str)
  │
  ├─► Path(db_path).parent.mkdir()   # 确保目录存在
  ├─► sqlite3.connect(db_path, check_same_thread=False)
  ├─► PRAGMA journal_mode=WAL        # 支持并发读写
  ├─► SqliteSaver(conn)
  ├─► saver.setup()                  # 建 checkpoint 表
  └─► return (conn, saver)
```

## 关键设计

1. **依赖注入**：model 和 checkpointer 都由调用方传入，`make_lead_agent` 不关心具体实现。
2. **空 tools/middleware**：最小闭环先跑通对话，工具和中间件在篇02 补。
3. **WAL 模式**：Checkpoint 写和业务库写可以并发不阻塞。

## 边界与待补

- 无多角色 Agent（goal / worker / planner 等）
- 无图结构可视化 / 调试入口
- Checkpoint 和业务库共用同一个 .db 文件，后续建议拆分
- 无 Checkpoint 过期清理 / 并发冲突处理
