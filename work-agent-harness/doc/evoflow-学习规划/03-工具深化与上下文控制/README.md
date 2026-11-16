# 第 3 部分　工具深化与上下文控制 / Tool Depth and Context Control

> 状态：🟡→✅ 推进中。第 3 章（Middleware 链）已核对源码；第 1、2、4 章仍为骨架。这一部分决定 **能力上限** 与 **稳定性上限**，是 EvoFlow 与玩具 Agent 的真正分水岭。

## 章节

| 章 | 主题 | 真实模块 |
|---|---|---|
| [1](01-文件终端与宿主边界.md) | 文件/终端与宿主边界 | `tools/tools.py`、`tools/host_direct/`、`tools/builtins/` |
| [2](02-后台命令浏览器桥与Computer-Use.md) | 后台命令、浏览器桥、Computer Use | `plugins/`、`routers/browser_bridge.py`、`routers/cua_bridge.py` |
| [3](03-Middleware调用链与工具审计.md) ✅ | Middleware 调用链与工具审计 | `agents/middlewares/`（71 个）、`agents/tool_approval_*.py` |
| [4](04-上下文预算压缩与自动后续.md) | 上下文预算、压缩、自动后续动作 | `context/`、`agents/context_compaction_core.py`、`tools/tool_output_truncation.py` |

## 关键认知

1. **真实 Agent 循环不是 while 循环**，而是 LangGraph 图 + 中间件链；工具调用的「治理」几乎全在 middleware 里。
2. **大结果一定落盘**：`<persisted-output>` 信封 + 截断，是上下文不爆的核心手段。
3. **上下文是有预算的资源**：token 估算、压缩、老化、离线转存，是一整套机制而不是一个 `if len > N`。
4. **宿主边界必须显式**：哪些工具在宿主执行、哪些进沙箱、哪些需要审批。

## 验收口径
- 工具失败不污染后续轮次（悬空 tool_call 能被修复）。
- 单次工具输出 1MB 时不撑爆上下文。
- 上下文超预算时自动压缩且不丢关键结论。
- 每个工具调用都可审计到「谁、何时、参数摘要、结果摘要」。
