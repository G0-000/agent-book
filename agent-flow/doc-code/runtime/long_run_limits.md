# runtime/long_run_limits.py —— 长任务时长 / 递归预算常量

> 文件路径: `backend/packages/harness/agentflow/runtime/long_run_limits.py`
> 对标来源: `evoflow/runtime/long_run_limits.py`
> 里程碑: M2（第二篇 · 第5章 运行生命周期取消和多进程入口）

---

## 一、模块结构图

```
┌──────────────────────────────────────────────────────────────────────┐
│ 模块级常量（import 时即固定求值，env 覆盖一次读取）：                 │
│   LONG_RUN_WALL_SECONDS        墙钟总预算（默认 4h）                │
│   LONG_RUN_WALL_MS              = 上者 * 1000                        │
│   LONG_RUN_STREAM_READ_SECONDS  流式读取上限（默认=墙钟）            │
│   LONG_RUN_RECURSION_LIMIT      主图 super-step 上限（默认 7500）    │
│   MAX_SUBAGENT_RECURSION_LIMIT  子图递归上限（默认 9000）            │
│ 函数：httpx_stream_timeout() → httpx.Timeout（流式 read 覆盖全程）  │
└──────────────────────────────────────────────────────────────────────┘
```

## 二、顺序执行链

```
import 本模块
  │
  ├─▶ 读 env（AGENTFLOW_LONG_RUN_WALL_SECONDS 等）
  │
  ├─▶ max(下限, int(...)) 钳制 → 常量固定
  │     └─ 下限保护：防止 env 配成过小值把长任务误杀
  │
  └─▶ 调用 httpx_stream_timeout()
        └─ import httpx → 按 read/write/pool 组装 Timeout
              └─ read = LONG_RUN_STREAM_READ_SECONDS
              └─ write = min(read, max(600, read/2))
```

## 三、对外导出

| 名称 | 类型 | 默认值 | 环境变量覆盖 |
|---|---|---|---|
| `LONG_RUN_WALL_SECONDS` | int | 14400（4h） | `AGENTFLOW_LONG_RUN_WALL_SECONDS` |
| `LONG_RUN_WALL_MS` | int | = 上者 × 1000 | 同上 |
| `LONG_RUN_STREAM_READ_SECONDS` | float | = 墙钟秒 | `AGENTFLOW_LONG_RUN_STREAM_READ_SECONDS` |
| `LONG_RUN_RECURSION_LIMIT` | int | 7500 | `AGENTFLOW_LONG_RUN_RECURSION_LIMIT` |
| `MAX_SUBAGENT_RECURSION_LIMIT` | int | 9000 | `AGENTFLOW_SUBAGENT_RECURSION_LIMIT_MAX` |
| `httpx_stream_timeout()` | 函数 | — | 返回 httpx.Timeout |

## 四、设计要点

1. **三处对齐**：墙钟预算、流式 read 超时、图递归上限必须一致，否则长任务会被 read timeout 或 recursion limit 中途杀掉。
2. **下限钳制**：每个常量都 `max(下限, ...)`，防止 env 误配成 0 或极小值。
3. **lazy import httpx**：`httpx_stream_timeout()` 内部才 import httpx，纯核心单测不依赖 httpx 即可 import 本模块。

## 五、Q&A

**Q: 为什么 write 超时是 read 的一半且至少 600s？**
A: 流式请求主要时间在 read（等模型出块），write 只是发请求，取一半足够；但保底 600s 防止慢网络下大 body 发送被误判超时。

**Q: recursion limit 是 LLM turn 数吗？**
A: 不是。是 LangGraph 主图的 super-step 上限（节点执行次数），不是对话轮数。一个 super-step 可能包含多次 LLM 调用。

**Q: env 变量前缀为什么是 AGENTFLOW_？**
A: 原版 EvoFlow 用 `EVOFLOW_`，AgentFlow 仿写改为 `AGENTFLOW_`，避免两套项目环境变量冲突。
