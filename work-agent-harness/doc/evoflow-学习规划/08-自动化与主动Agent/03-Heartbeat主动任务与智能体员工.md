# 第 3 章　Heartbeat 主动任务与智能体员工

> **EvoFlow 对照状态 / Alignment status：** 🔍 结构已核对（路径、行数、符号均取自源码实测），**行为**（调用顺序、边界条件）尚未逐行核对。

## 本章目标
让 Agent 在没人提问时也会「抬头看一眼」：检查任务、发现异常、主动汇报。

## 最小闭环
心跳周期到 → 决策门判断「是否值得打扰用户」→ 是则生成一条主动消息 → 否则静默记录。

## 真实模块地图（已核对：路径 · 行数 · 符号）

| 文件 | 行数 | 关键符号 | 模块常量 |
|---|---|---|---|
| `packages/harness/evoflow/proactive/engine.py` | 1471 | `ProactiveEngine`；`_role_name_for_agent`、`_cancel_running_langgraph_runs`、`_is_execution_failure` | — |
| `packages/harness/evoflow/proactive/decision_gate.py` | 1172 | `DecisionGate`；`_parse_iso_datetime` | — |
| `packages/harness/evoflow/proactive/duty_runs.py` | 439 | `_new_run_id`、`_row_to_dict`、`start_duty_run` | — |
| `packages/harness/evoflow/proactive/employee_automation.py` | 322 | `employee_via_automation_enabled`、`employee_automation_task_id`、`agent_code_from_employee_task` | EMPLOYEE_AUTOMATION_KIND |
| `packages/harness/evoflow/proactive/employee_prompt.py` | 52 |  | — |
| `employee_prompting.py` | — | — | ✗ 源码树中未找到该文件 |
| `packages/harness/evoflow/proactive/departments.py` | 608 | `DepartmentRepository`；`_sanitize_name`、`_new_id`、`_row_dict` | — |
| `packages/harness/evoflow/proactive/cycle_limits.py` | 196 | `effective_max_initiatives`、`round_token`、`round_refs` | DEFAULT_MAX_INITIATIVES |
| `packages/harness/evoflow/proactive/decision_gate.py` | 1172 | `DecisionGate`；`_parse_iso_datetime` | — |

## 核心概念
- **心跳不是轮询一切**：只跑「有 duty 的」检查项，避免空转。
- **决策门**：抑制「没什么可说」的心跳——主动打扰是有成本的。
- **智能体员工**：有岗位、职责、汇报关系，可按部门组织。
- **静默优先**：默认不发消息，只在有结论/异常时发。

## 自研实现要点
```text
heartbeat: for duty in duties: if due → run(duty) → result
gate: 判断 result 是否有新信息 + 是否超频 → send or record
```

## 业务规则
- 每日主动消息条数上限。
- 相同内容不重复推送（内容指纹去重）。
- 用户静音时段不打扰。

## 常见坑
- 心跳过密 → 电费与 token 双烧。
- 决策门过松 → 变成骚扰机器人。
- 员工职责不清 → 同一件事两个员工重复汇报。

## 验收
- [ ] 无新信息时不发消息
- [ ] 超频被抑制
- [ ] 每条主动消息可追溯到 duty

### 源码核对记录（路径与符号实测）

- `packages/harness/evoflow/proactive/engine.py`（1471 行）：类 `ProactiveEngine`；环境变量 `EVOFLOW_LANGGRAPH_URL`、`EVOFLOW_PROACTIVE_ASSISTANT_ID`、`EVOFLOW_PROACTIVE_MODEL`
  - 模块自述：ProactiveEngine - the LLM-driven think cycle. Perceives domain state -> thinks -> produces initiatives -> deci…
- `packages/harness/evoflow/proactive/decision_gate.py`（1172 行）：类 `DecisionGate`
  - 模块自述：DecisionGate - routes risky initiatives through human approval. Approval channels: 1. **Feishu** - interactive…
- `packages/harness/evoflow/proactive/duty_runs.py`（439 行）
  - 模块自述：Employee duty / heartbeat run index (``evoflow_duty_runs``). SSOT for「巡检记录」list entries: every scheduler / hea…
- `packages/harness/evoflow/proactive/employee_automation.py`（322 行）；环境变量 `EVOFLOW_EMPLOYEE_VIA_AUTOMATION`
  - 模块自述：Employee heartbeat as a first-class automation rule. Architecture ------------ * **Definition (规则)**: each act…
- `packages/harness/evoflow/proactive/employee_prompt.py`（52 行）
  - 模块自述：Compat shim — canonical SSOT is ``evoflow.proactive.employee_prompting``. Prefer:: from evoflow.proactive.empl…
- `packages/harness/evoflow/proactive/departments.py`（608 行）：类 `DepartmentRepository`
  - 模块自述：Department registry for smart employees (proactive roles). Roles keep a free-text ``department`` column for pr…
- `packages/harness/evoflow/proactive/cycle_limits.py`（196 行）
  - 模块自述：Per-cycle initiative ceiling for smart-employee duty rounds. ``max_initiatives_per_cycle`` used to be enforced…
- `packages/harness/evoflow/proactive/decision_gate.py`（1172 行）：类 `DecisionGate`
  - 模块自述：DecisionGate - routes risky initiatives through human approval. Approval channels: 1. **Feishu** - interactive…

> 本节只证明**路径、行数、符号存在**；调用顺序与边界条件仍属「行为」，未逐行核对。

## 对照 EvoFlow 核对清单
- [ ] `decision_gate.py` 的判定维度
- [ ] `departments.py` 的组织模型
