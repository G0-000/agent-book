# 第 1 章　Plan 定义解析与 Goal 图

> **EvoFlow 对照状态 / Alignment status：** 🔍 结构已核对（路径、行数、符号均取自源码实测），**行为**（调用顺序、边界条件）尚未逐行核对。

## 本章目标
把「用户一句话」变成「可校验的计划结构」，并让目标之间有关系（依赖、包含、互斥）。

## 最小闭环
用户说「做一份竞品分析报告」→ 生成 4 步计划 → 每步有验收标准 → 执行时按依赖推进。

## 真实模块地图（已核对：路径 · 行数 · 符号）

| 文件 | 行数 | 关键符号 | 模块常量 |
|---|---|---|---|
| `packages/harness/evoflow/tools/builtins/plan_tool.py` | 585 | `PlanStepInput`、`PlanInput`；`_json_loads_if_string`、`_coerce_string_list_field`、`_coerce_to_str` | — |
| `app/gateway/routers/goal.py` | 473 | `StartGoalRequest`、`AfterChatTurnRequest`、`SubmitFeedbackRequest`；`get_goal_service`、`_require_goal_session_visible`、`start_goal` | — |
| `app/gateway/v4/goal_engine.py` | 989 | `V4GoalEngine`、`GoalRejectedError`；`escape_goal_prompt_text`、`build_goal_verification_prompt`、`build_goal_continuation_prompt` | MAX_CONTINUATIONS、MAX_SAME_NEXT_ACTION_STREAK、VERIFIER_HISTORY_LIMIT |
| `app/gateway/routers/plans.py` | 137 | `CreateBindingBody`、`PatchBindingBody`、`VerifyBindingBody`；`_http_error`、`get_catalog`、`get_bindings` | — |
| `packages/harness/evoflow/tools/builtins/plan_tool.py` | 585 | `PlanStepInput`、`PlanInput`；`_json_loads_if_string`、`_coerce_string_list_field`、`_coerce_to_str` | — |

## 核心概念
- **计划结构**：`{steps:[{id, goal, inputs, outputs, done_when, depends_on}]}`。
- **Goal 图**：节点是目标，边是「依赖/派生/冲突」；图的意义是**可重排**（并行 vs 串行）。
- **计划守卫**：模型「忘了计划」时，中间件把计划重新注入，避免跑偏。
- **命名陷阱**：`evoflow/plans/` 指的是**模型订阅套餐**，不是任务计划。

## 自研实现要点
```text
plan(id, session_id, version, steps_json, status)
step(id, plan_id, seq, goal, done_when, status, output_ref)
```

## 业务规则
- 计划变更必须版本化，不原地改（否则无法回溯为什么改）。
- 每步的 `done_when` 必须可判定（有产物/有事实），不能写「做好了」。
- 计划步数上限（如 12）防无限细化。

## 常见坑
- 计划只写在回复里 → 下一轮模型就忘了。
- 步骤颗粒度过细 → 计划本身消耗大量 token。
- 目标之间隐含依赖未声明 → 并行执行撞车。

## 验收
- [ ] 计划可持久化并在后续轮次被引用
- [ ] 依赖关系决定执行顺序
- [ ] 每步完成有客观判据

### 源码核对记录（路径与符号实测）

- `packages/harness/evoflow/tools/builtins/plan_tool.py`（585 行）：类 `PlanStepInput`、`PlanInput`
  - 模块自述：Submit structured plan for collaboration gates (has_plan / plan_guard).…
- `app/gateway/routers/goal.py`（473 行）：类 `StartGoalRequest`、`AfterChatTurnRequest`、`SubmitFeedbackRequest`、`GoalSessionResponse`；环境变量 `EVOFLOW_LANGGRAPH_API_KEY`、`EVOFLOW_LANGGRAPH_URL`
- `app/gateway/v4/goal_engine.py`（989 行）：类 `V4GoalEngine`、`GoalRejectedError`；环境变量 `EVOFLOW_LANGGRAPH_API_KEY`、`EVOFLOW_LANGGRAPH_URL`
  - 模块自述：ZCode 式会话目标引擎（v4 主聊天目标模式）。 对齐 ZCode core 的目标处理方式（apps/zcode-cli/packages/core 的 target/goal 链路）： - ``/goal <ob…
- `app/gateway/routers/plans.py`（137 行）：类 `CreateBindingBody`、`PatchBindingBody`、`VerifyBindingBody`
  - 模块自述：Gateway API for Plan Bundle (Connector mode).…
- `packages/harness/evoflow/tools/builtins/plan_tool.py`（585 行）：类 `PlanStepInput`、`PlanInput`
  - 模块自述：Submit structured plan for collaboration gates (has_plan / plan_guard).…

> 本节只证明**路径、行数、符号存在**；调用顺序与边界条件仍属「行为」，未逐行核对。

## 对照 EvoFlow 核对清单
- [ ] `plan_tool.py` 的 schema（`<task_plan>` JSON 格式）
- [ ] `plan_guard_middleware` 的重注入策略
