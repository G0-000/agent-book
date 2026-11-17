# 第 1 部分　最小闭环 / Part 1: Minimal Closed Loop

目标：按 EvoFlow 后端的模块职责逐章搭建一条可运行链路——配置与模型 → Agent → 会话与消息 → 工具 → 流式事件。先完成最小闭环，再只在对应章节增加能力；不提前实现后续部分。

| 章 | 主题 | 代码 |
|---|---|---|
| [第 1 章](01-配置与模型.md) | 配置与模型 | `config/`, `models/` |
| [第 2 章](02-Agent与单轮执行.md) | Agent 与单轮执行 | `agents/lead_agent/`, `models/` |
| [第 3 章](03-会话与消息存储.md) | 会话与消息存储 | `persistence/`, `agents/` |
| [第 4 章](04-工具协议与首批工具.md) | 工具协议与首批工具 | `tools/`, `agents/` |
| [第 5 章](05-流式事件与断线恢复.md) | 流式事件与断线恢复 | `runtime/`, `persistence/` |
| [第 6 章](06-本部分综合验收.md) | 综合验收 | `tests/`, `demo.py` |

## 依赖关系 / Dependencies
```text
config → models ─┐
tools ───────────┼→ agent → server
store ───────────┘
```

## 状态 / Status
- 代码和章节状态以各章实现步骤、`PROGRESS.md` 及实际验收结果为准；不能用旧的整体测试数字替代逐章状态。
- 本部分代码按 `backend/packages/harness/myagentflow/` 中与 EvoFlow 同构的职责目录组织，不再使用 `config.py`、`store.py` 等虚构的扁平目标文件。
- EvoFlow 的 Agent 运行时是 LangGraph 与 middleware 组合；章节按学习顺序先实现当前最小行为，并明确哪些高级行为留到后续章节。简化必须标为本项目阶段选择，不能描述成 EvoFlow 实现。
