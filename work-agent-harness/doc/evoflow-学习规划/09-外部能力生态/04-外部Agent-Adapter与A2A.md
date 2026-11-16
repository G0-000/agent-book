# 第 4 章　外部 Agent Adapter 与 A2A 互操作

> **EvoFlow 对照状态 / Alignment status：** 🔍 结构已核对（路径、行数、符号均取自源码实测），**行为**（调用顺序、边界条件）尚未逐行核对。

## 本章目标
让本系统与「另一个 Agent 系统」对话：互相发现能力、交换任务、汇总结果。

## 最小闭环
注册一个外部 Agent（能力卡）→ 发一条任务 → 收到结构化结果 → 并入本地任务账本。

## 真实模块地图（已核对：路径 · 行数 · 符号）

| 文件 | 行数 | 关键符号 | 模块常量 |
|---|---|---|---|
| `packages/harness/evoflow/a2a/adapter.py` | 811 | `_meeting_speak_backoff_seconds`、`_meeting_speak_user_error`、`_create_a2a_task_record` | — |
| `packages/harness/evoflow/a2a/orchestrator.py` | 426 | `MeetingOrchestrator`；`create_meeting`、`get_meeting`、`update_meeting_status` | — |
| `packages/harness/evoflow/a2a/models.py` | 161 | `TaskState`、`A2ATask`、`AgentCard` | — |
| `packages/harness/evoflow/a2a/agent_card.py` | 108 | `_lookup_skill_metadata`、`_role_tool_names`、`role_to_agent_card` | — |
| `packages/harness/evoflow/a2a/meeting_tool_speak.py` | 194 | `_clip`、`build_meeting_verify_tools`、`_tool_by_name` | — |
| `packages/harness/evoflow/a2a/meeting_conclude.py` | 331 | `list_meeting_speak_turns`、`_parse_conclude_json`、`_normalize_conclusion` | — |
| `packages/harness/evoflow/external_agents/registry.py` | 167 | `ExternalAgentFactory`；`register_active_agent`、`get_active_agent`、`unregister_active_agent` | — |
| `packages/harness/evoflow/external_agents/base.py` | 360 | `BaseExternalAgent` | — |
| `packages/harness/evoflow/external_agents/trae.py` | 403 | `TraeAgent` | — |
| `app/gateway/routers/a2a.py` | 297 | `_rpc_result`、`_rpc_error`、`_filter_agent_cards` | — |
| `packages/harness/evoflow/a2a/agent_card.py` | 108 | `_lookup_skill_metadata`、`_role_tool_names`、`role_to_agent_card` | — |

## 核心概念
- **Agent Card**：能力、端点、鉴权方式的自我描述，是互操作的前提。
- **任务 vs 消息**：A2A 用 task 生命周期（submitted/working/done），不是纯 chat。
- **超时与幂等**：跨系统调用必须带 `task_id` 去重。
- **不可信对端**：返回内容按外部内容处理（防注入）。

## 自研实现要点
```text
peers(id, card_json, endpoint, auth_ref, health)
tasks(task_id, peer_id, state, artifacts[], updated_at)
```

## 业务规则
- 只与已登记且通过健康检查的 peer 通信。
- 跨系统产物落本地一份再引用。
- 失败重试不代表可重复副作用（要 peer 侧幂等）。

## 常见坑
- 把对端回复当指令执行。
- 无 task_id → 重试产生重复任务。
- 只支持同步 → 长任务超时。

## 验收
- [ ] 任务状态可追踪
- [ ] 重试不产生重复任务
- [ ] 对端内容不具指令效力

### 源码核对记录（路径与符号实测）

- `packages/harness/evoflow/a2a/adapter.py`（811 行）；环境变量 `EVOFLOW_MEETING_SPEAK_CONCURRENCY`、`EVOFLOW_MEETING_SPEAK_MAX_BACKOFF_SECONDS`、`EVOFLOW_MEETING_SPEAK_RATE_LIMIT_RETRIES`
  - 模块自述：A2A Adapter: translates A2A protocol <-> EvoFlow dispatch_task. This is the bridge layer. A2A ``tasks/send`` b…
- `packages/harness/evoflow/a2a/orchestrator.py`（426 行）：类 `MeetingOrchestrator`
  - 模块自述：Meeting Orchestrator: A2A Client that serially dispatches tasks to participants. Acts as the A2A Client descri…
- `packages/harness/evoflow/a2a/models.py`（161 行）：类 `TaskState`、`A2ATask`、`AgentCard`
  - 模块自述：A2A protocol data models (Pydantic v2). Mirrors the A2A (Agent-to-Agent) Protocol v0.3 data structures so the …
- `packages/harness/evoflow/a2a/agent_card.py`（108 行）
  - 模块自述：Agent Card generation: ProactiveRole -> A2A Agent Card JSON.…
- `packages/harness/evoflow/a2a/meeting_tool_speak.py`（194 行）
  - 模块自述：Read-only tools + short tool loop for meeting speak (optional 查证 mode).…
- `packages/harness/evoflow/a2a/meeting_conclude.py`（331 行）
  - 模块自述：Synthesize an optimal plan from meeting oral turns and deposit as a document.…
- `packages/harness/evoflow/external_agents/registry.py`（167 行）：类 `ExternalAgentFactory`
  - 模块自述：Registry for external agent instances. Manages active agent instances and provides a factory for creating agen…
- `packages/harness/evoflow/external_agents/base.py`（360 行）：类 `BaseExternalAgent`
  - 模块自述：Base class for external agent execution. This provides a unified interface for controlling external AI agents,…
- `packages/harness/evoflow/external_agents/trae.py`（403 行）：类 `TraeAgent`
  - 模块自述：Trae Agent implementation using Trae HTTP bridge API. This agent interacts with Trae desktop editor through th…
- `app/gateway/routers/a2a.py`（297 行）
  - 模块自述：A2A Agent Server router. Exposes A2A standard endpoints for each internal agent: - GET /.well-known/agent.json…
- `packages/harness/evoflow/a2a/agent_card.py`（108 行）
  - 模块自述：Agent Card generation: ProactiveRole -> A2A Agent Card JSON.…

> 本节只证明**路径、行数、符号存在**；调用顺序与边界条件仍属「行为」，未逐行核对。

## 对照 EvoFlow 核对清单
- [ ] `agent_card.py` 的字段
- [ ] `orchestrator.py` 的调度策略

## 从零实现（手把手）
> 读完这章你能把「外部 Agent」包装成内部可调用的子代理：输入转协议、输出转摘要。
> 路径均相对 `backend/`，代码注释写「为什么」。

### Step 1　新建 adapter.py：协议转换 + 超时
**文件**：`packages/harness/myagentflow/subagents/adapter.py（新建）`
**要写的逻辑**：`adapter` 只负责三件事：拼请求、发请求（带超时）、把响应转成 `summarize()` 能吃的文本。

**代码**

```python
"""外部 Agent 适配：把 A2A 响应变成内部子代理结果。

为什么单独一层：外部协议随时会变，变化只该影响这个文件，
不该渗透到计划执行、记忆写入这些内部模块。
"""
from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any

from myagentflow.subagents.summarize import summarize


@dataclass(frozen=True)
class ExternalAgent:
    name: str
    endpoint: str
    timeout: float = 30.0


def to_request(task: str, context: dict[str, Any] | None = None) -> dict[str, Any]:
    return {"task": task, "context": context or {}}


def to_summary(agent: ExternalAgent, raw: dict[str, Any]) -> str:
    if "error" in raw:
        return summarize(agent.name, str(raw["error"]), ok=False)
    text = raw.get("result") or raw.get("content") or json.dumps(raw, ensure_ascii=False)
    return summarize(agent.name, str(text), ok=True)
```

**验证**

```bash
uv run python -c "
from myagentflow.subagents.adapter import ExternalAgent, to_request, to_summary
a = ExternalAgent('remote','http://x')
print(to_request('查天气', {'city':'信阳'}))
print(to_summary(a, {'result':'晴'}))
"
```

### 与 EvoFlow 对照

| 我们的做法 | EvoFlow | 为什么 |
|---|---|---|
| 适配层只做协议转换 | `subagents/` 的外部适配 | 协议变化不该污染内部模块 |
| 错误也走 summarize | 同文件 | 失败要能回填主对话 |

### 知识点

- agent-book：A2A 与多 Agent
- Harbor404：外部依赖超时

### 验收

```bash
uv run python -c "from myagentflow.subagents.adapter import to_request; print('ok')"
```
