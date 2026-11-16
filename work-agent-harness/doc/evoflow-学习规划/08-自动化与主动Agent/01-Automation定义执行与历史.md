# 第 1 章　Automation 定义、执行与运行历史

> **EvoFlow 对照状态 / Alignment status：** 🔍 结构已核对（路径、行数、符号均取自源码实测），**行为**（调用顺序、边界条件）尚未逐行核对。

## 本章目标
把「每天早上 9 点给我做一份行业简报」变成一条可管理、可回放的记录。

## 最小闭环
创建自动化（规则 + 指令 + 渠道）→ 到点生成 run → 结果写入会话并推送 → 历史里可查每次输出。

## 真实模块地图（已核对：路径 · 行数 · 符号）

| 文件 | 行数 | 关键符号 | 模块常量 |
|---|---|---|---|
| `packages/harness/evoflow/automation/output_paths.py` | 147 | `_slug_segment`、`resolve_automation_outputs_root`、`_normalize_ext` | — |
| `app/gateway/routers/automation_scheduler.py` | 665 | `_coerce_app_parameters`、`_apply_workflow_binding`、`_stamp_app_name` | — |
| `app/gateway/automation_runner.py` | 2212 | `_scheduler_owner_id`、`_langgraph_run_semaphore`、`_task_wants_langgraph_run` | DEFAULT_INTERVAL_SECONDS、AUTOMATIONS_DIR |
| `app/gateway/automation_chat_session.py` | 217 | `automation_session_key`、`_automation_session_title`、`_automation_session_context` | — |
| `packages/harness/evoflow/persistence/automation_repositories.py` | 540 | `_row_dict`、`list_automations`、`load_automation` | SLOT_CLAIM_STALE_MS_DEFAULT |
| `packages/harness/evoflow/persistence/channel_push_repositories.py` | 1473 | `new_push_id`、`_clip`、`_payload_to_json` | — |
| `app/gateway/routers/sessions.py` | 159 | `SessionSearchRequest`、`SessionSearchResult`、`SessionSearchResponse`；`_filter_search_hits`、`search_sessions`、`search_sessions_get` | — |

## 核心概念
- **定义与执行分离**：definition（规则+指令）→ occurrence（每次触发）→ run（执行）。
- **独立会话**：自动化有自己的会话线，不污染用户主对话。
- **输出路径**：产物写到约定目录，便于用户找。

## 自研实现要点
```text
automation(id, rule, prompt, channel, enabled, created_at)
occurrence(id, automation_id, planned_at, status, run_id)
run(run_id, session_id, started_at, status, artifact_refs)
```

## 业务规则
- 同一 automation 同一时刻只允许一个运行中 occurrence。
- 失败重试上限（如 2 次），超限标记需人工。
- 禁用即不再产生新 occurrence。

## 常见坑
- 定义与执行混在一张表 → 历史无法追溯。
- 自动化复用用户主会话 → 上下文互相污染。
- 无上限重试 → 失败后刷屏。

## 验收
- [ ] 每次触发有独立 run 记录
- [ ] 禁用后无新触发
- [ ] 历史可按时间/状态筛选

### 源码核对记录（路径与符号实测）

- `packages/harness/evoflow/automation/output_paths.py`（147 行）
  - 模块自述：Canonical deliverable paths for prompt-only automation runs.…
- `app/gateway/routers/automation_scheduler.py`（665 行）
  - 模块自述：Automation scheduler API: status, CRUD on ``~/.evoflow/tasks/automations``, manual run. CRUD mirrors ``evopane…
- `app/gateway/automation_runner.py`（2212 行）；环境变量 `EVOFLOW_AUTOMATIONS_DIR`、`EVOFLOW_AUTOMATION_CATCHUP`、`EVOFLOW_AUTOMATION_CATCHUP_LOOKBACK_MINUTES`、`EVOFLOW_AUTOMATION_CATCHUP_MAX_RUNS`
  - 模块自述：Background scheduler for EvoPanel-style automations under ``~/.evoflow/tasks/automations``. Default execution …
- `app/gateway/automation_chat_session.py`（217 行）
  - 模块自述：Link scheduled automation LangGraph runs to EvoPanel ``evoflow_chat_sessions``.…
- `packages/harness/evoflow/persistence/automation_repositories.py`（540 行）
  - 模块自述：Scheduled automations (cron / once) in ``evoflow_automations``.…
- `packages/harness/evoflow/persistence/channel_push_repositories.py`（1473 行）
  - 模块自述：SQLite audit log for channel push / callback leave-a-trail. Failures must never break the push path — callers …
- `app/gateway/routers/sessions.py`（159 行）：类 `SessionSearchRequest`、`SessionSearchResult`、`SessionSearchResponse`
  - 模块自述：Gateway router for session search.…

> 本节只证明**路径、行数、符号存在**；调用顺序与边界条件仍属「行为」，未逐行核对。

## 对照 EvoFlow 核对清单
- [ ] `automation_repositories` 的字段与 occurrence 语义
- [ ] `automation_runner` 如何选择模型与工具
