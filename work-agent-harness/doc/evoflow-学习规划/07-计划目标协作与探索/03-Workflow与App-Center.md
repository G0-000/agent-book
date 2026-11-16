# 第 3 章　Workflow、App Center、Stage 与任务输入

> **EvoFlow 对照状态 / Alignment status：** 🔍 结构已核对（路径、行数、符号均取自源码实测），**行为**（调用顺序、边界条件）尚未逐行核对。

## 本章目标
把「一次性的对话」升级为「可复用的流程」，并支持由 Agent 生成应用/页面。

## 最小闭环
定义 workflow（步骤 + 输入 schema）→ 用同一输入跑两次得到结构一致的结果 → 应用中心可查看。

## 真实模块地图（已核对：路径 · 行数 · 符号）

| 文件 | 行数 | 关键符号 | 模块常量 |
|---|---|---|---|
| `packages/harness/evoflow/scheduler/tool_executor.py` | 140 | `_preview`、`execute_op`、`log_scheduler_invocation` | — |
| `packages/harness/evoflow/collab/app_engine.py` | 191 | `_render_text`、`_render_value`、`_render_steps` | PARAM_RE |
| `packages/harness/evoflow/collab/app_generator.py` | 162 | `_merge_declared_parameters`、`generate_app_from_plan` | — |
| `packages/harness/evoflow/collab/app_runner.py` | 1848 | `_dispatch_result_ok`、`is_workflow_bound_task`、`dispatch_workflow_task_now` | — |
| `packages/harness/evoflow/collab/app_schema.py` | 608 | `_as_str`、`_as_str_list`、`normalize_parameter` | — |
| `packages/harness/evoflow/collab/app_canvas.py` | 79 | `_default_position`、`canvas_from_steps` | START_NODE_ID、ANSWER_NODE_ID |
| `app/gateway/routers/apps.py` | 864 | `GenerateAppRequest`、`DryRunAppRequest`、`CreateAppKeyRequest`；`_audit_actor`、`_audit`、`_normalize_plan_for_storage` | — |
| `app/gateway/routers/apps_debug.py` | 134 | `DebugRunStepRequest`、`DebugRunFromRequest`；`debug_run_step_endpoint`、`debug_run_from_endpoint`、`get_step_trace_endpoint` | — |
| `packages/harness/evoflow/collab/app_engine.py` | 191 | `_render_text`、`_render_value`、`_render_steps` | PARAM_RE |

## 核心概念
- **Workflow = 有 schema 的计划**：输入/输出可校验，才能被重复调用。
- **Stage**：长流程的中间态（草稿 → 待审 → 发布）。
- **App Center**：把 Agent 产出的可交互页面当作一等产物管理。

## 自研实现要点
```text
workflow(id, name, inputs_schema, steps_json, version)
run(workflow_id, inputs) → run_id → 每步产物带 stage
```

## 业务规则
- 工作流版本化；旧版本可回放。
- 应用产物必须可离线打开（不依赖 Agent 在线）。
- 输入校验失败立即返回，不进模型。

## 常见坑
- 把工作流写成「提示词模板」，没有 schema → 不可自动化。
- 应用产物存在临时目录 → 重启即丢。

## 验收
- [ ] 同输入两次结果结构一致
- [ ] 产物可独立打开
- [ ] 版本可回放

### 源码核对记录（路径与符号实测）

- `packages/harness/evoflow/scheduler/tool_executor.py`（140 行）
  - 模块自述：Invoke host_direct tools from the local scheduler.…
- `packages/harness/evoflow/collab/app_engine.py`（191 行）
  - 模块自述：Application parameter rendering engine. Converts parameterized App definitions (with `{{param}}` placeholders)…
- `packages/harness/evoflow/collab/app_generator.py`（162 行）
  - 模块自述：Application generator: create reusable App definitions from model-generated plans. When a lead agent (or any m…
- `packages/harness/evoflow/collab/app_runner.py`（1848 行）；环境变量 `EVOFLOW_LANGGRAPH_URL`、`EVOFLOW_WORKFLOW_PROJECT_PATH`
  - 模块自述：Application execution runner: unified entry for both execution modes. - **lead_supervised**: Uses existing pla…
- `packages/harness/evoflow/collab/app_schema.py`（608 行）
  - 模块自述：Application document JSON contract + normalize (single write-path for App blobs). ## Storage layers (do not tr…
- `packages/harness/evoflow/collab/app_canvas.py`（79 行）
  - 模块自述：Canvas layout helpers for App workflows.…
- `app/gateway/routers/apps.py`（864 行）：类 `GenerateAppRequest`、`DryRunAppRequest`、`CreateAppKeyRequest`、`SaveAsAppRequest`
  - 模块自述：Application management and execution endpoints.…
- `app/gateway/routers/apps_debug.py`（134 行）：类 `DebugRunStepRequest`、`DebugRunFromRequest`
  - 模块自述：Debug endpoints for workflow applications. Provides single-step debug execution, run-from-step, and step trace…
- `packages/harness/evoflow/collab/app_engine.py`（191 行）
  - 模块自述：Application parameter rendering engine. Converts parameterized App definitions (with `{{param}}` placeholders)…

> 本节只证明**路径、行数、符号存在**；调用顺序与边界条件仍属「行为」，未逐行核对。

## 对照 EvoFlow 核对清单
- [ ] `app_engine.py` 的执行模型
- [ ] `stage/` 的状态定义
