# 第 1 部分　最小闭环 / Part 1: Minimal Closed Loop

目标：用 **纯标准库 Python** 跑通一条完整链路——配置 → 模型 → Agent → 会话存储 → 工具 → 流式输出。

| 章 | 主题 | 代码 |
|---|---|---|
| [第 1 章](01-配置与模型.md) | 配置与模型（✅ 已与 `config.example.yaml` 核对） | `config.py`, `model_store.py`, `models.py`, `config.example.yaml` |
| [第 2 章](02-Agent与单轮执行.md) | Agent 与单轮执行 | `agent.py` |
| [第 3 章](03-会话与消息存储.md) | 会话与消息存储 | `store.py` |
| [第 4 章](04-工具协议与首批工具.md) | 工具协议与首批工具 | `tools.py`, `agent.py` |
| [第 5 章](05-流式事件与断线恢复.md) | 流式事件与断线恢复 | `server.py`, `store.py` |
| [第 6 章](06-本部分综合验收.md) | 综合验收 | `tests/`, `demo.py` |

## 依赖关系 / Dependencies
```text
config → models ─┐
tools ───────────┼→ agent → server
store ───────────┘
```

## 状态 / Status
- 代码：✅ 已实现，**35 个离线测试通过**。
- 第 1 章：✅ 已与 EvoFlow 公开的 `config.example.yaml` 核对（见章内「已核对的事实」）。
- 第 2–5 章：🟡 仍是自研参考实现。模块地图显示真实运行时是 **LangGraph + middleware 链**，这几章需要等源码后重写。
