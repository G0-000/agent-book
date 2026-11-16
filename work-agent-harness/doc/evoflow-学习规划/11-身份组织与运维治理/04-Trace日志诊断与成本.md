# 第 4 章　Trace、日志、运行诊断、成本与用量

> **EvoFlow 对照状态 / Alignment status：** 🔍 结构已核对（路径、行数、符号均取自源码实测），**行为**（调用顺序、边界条件）尚未逐行核对。

## 本章目标
让「一次慢/贵/错的 run」可以被定位到具体环节，而不是靠猜。

## 最小闭环
给一个 run_id → 看到完整 span 时间线（请求/模型/工具/落库）→ 看到 token 与费用 → 看到错误点。

## 真实模块地图（已核对：路径 · 行数 · 符号）

| 文件 | 行数 | 关键符号 | 模块常量 |
|---|---|---|---|
| `packages/harness/evoflow/observability/queries.py` | 2458 | `ObservabilityDiskFullError`；`disk_full_user_message`、`enrich_model_row_thinking`、`_store` | — |
| `packages/harness/evoflow/eval/dashboard.py` | 252 | `_clamp`、`_safe_score`、`_ts_str` | — |
| `packages/harness/evoflow/observability/latency_waterfall.py` | 522 | `_parse_iso_ms`、`_load_trace_events`、`_load_model_invocations_for_timeline` | — |
| `packages/harness/evoflow/observability/agent_trace_load.py` | 292 | `_store`、`_parse_payload_json`、`trace_events_by_lane` | — |
| `packages/harness/evoflow/observability/compaction_file_log.py` | 424 | `compaction_trace_now_str`、`_file_logging_disabled`、`_console_mirror_enabled` | — |
| `packages/harness/evoflow/observability/cache_pricing.py` | 174 | `CachePriceRule`；`_rule`、`detect_platform`、`resolve_cache_price` | ALIYUN_IMPLICIT_CACHE_READ_FRACTION、VOLCENGINE_RULES、ALIYUN_RULES |
| `packages/harness/evoflow/observability/cache_metrics.py` | 222 | `compute_cache_hit_rate`、`_row_cache_triplet`、`cache_triplet_from_row` | — |
| `packages/harness/evoflow/observability/model_list_projection.py` | 50 | `compute_model_list_projection`、`parse_stored_response_summary` | — |
| `packages/harness/evoflow/persistence/usage_ledger.py` | 1886 | `_day_utc`、`_f`、`_s` | CATEGORY_LLM、CATEGORY_MEDIA、CATEGORY_TOOL |
| `packages/harness/evoflow/persistence/usage_by_module.py` | 642 | `classify_session_module`、`resolve_usage_attribution`、`_load_session_map` | MODULE_CHAT、MODULE_EMPLOYEE、MODULE_WORKFLOW |
| `packages/harness/evoflow/persistence/session_context_usage.py` | 190 | `build_context_usage_snapshot`、`load_session_context_usage`、`load_last_observed_active_tokens` | — |
| `app/gateway/routers/debug_agent_trace.py` | 2801 | `_debug_ui_enabled`、`_repo_root`、`_backend_dir` | — |
| `app/gateway/routers/client_trace.py` | 159 | `_now_iso`、`trace_first_token_client`、`trace_stream_end_client` | — |
| `app/gateway/hang_diagnostics.py` | 649 | `_flag_enabled`、`_float_env`、`diagnostics_enabled` | — |
| `app/gateway/routers/observability.py` | 659 | `ObservabilityEnabledRequest`；`_obs_access_dep`、`_disk_full_http`、`_run_obs_or_disk_full` | — |
| `packages/harness/evoflow/persistence/usage_ledger.py` | 1886 | `_day_utc`、`_f`、`_s` | CATEGORY_LLM、CATEGORY_MEDIA、CATEGORY_TOOL |

## 核心概念
- **span 化**：模型调用、工具调用、压缩、落库各自一个 span，带父子关系。
- **延迟瀑布**：首 token 时间 / 生成时间 / 工具时间 / 排队时间分开算。
- **用量账本**：按 run/session/org 三个维度记账，支持对账。
- **采样**：全量 trace 成本高 → 成功样本采样、失败全量。

## 自研实现要点
```text
span(trace_id, span_id, parent_id, name, start, end, attrs_json)
usage(run_id, model, prompt_tokens, completion_tokens, cost, ts)
```

## 业务规则
- trace 中不得记录完整 prompt 原文（除非显式开启且脱敏）。
- 成本按模型定价表计算并留版本。
- 慢请求（> P99）自动留全量。

## 常见坑
- 只记总耗时 → 无法定位是模型慢还是工具慢。
- 计价表写死在代码 → 换价要发版。
- trace 采样导致关键失败样本丢失。

## 验收
- [ ] 任一 run 可看瀑布图
- [ ] 用量可按 org 汇总
- [ ] 失败样本 100% 留痕

### 源码核对记录（路径与符号实测）

- `packages/harness/evoflow/observability/queries.py`（2458 行）：类 `ObservabilityDiskFullError`
  - 模块自述：Read-only queries for ``evoflow_obs_*`` SQLite tables.…
- `packages/harness/evoflow/eval/dashboard.py`（252 行）
  - 模块自述：健康总览数据聚合 —— 综合多维度得分、告警、Agent 排行、评测记录。 去 Mock 原则：所有数据来自真实统计；无数据返回 0/空结构，不生成随机假数据。 有最近 scenario run 时，将 scenario…
- `packages/harness/evoflow/observability/latency_waterfall.py`（522 行）
  - 模块自述：Reconstruct per-request latency waterfall from trace events + model/tool invocations. Groups ``collab_cycle`` …
- `packages/harness/evoflow/observability/agent_trace_load.py`（292 行）
  - 模块自述：Load per-thread agent-trace sections from ``evoflow_obs_*`` SQLite (no log files).…
- `packages/harness/evoflow/observability/compaction_file_log.py`（424 行）；环境变量 `EVOFLOW_COMPACTION_TRACE_CONSOLE`、`EVOFLOW_COMPACTION_TRACE_LOG`、`EVOFLOW_COMPACTION_TRACE_LOG_DIR`、`EVOFLOW_COMPACTION_TRACE_LOG_FILE`
  - 模块自述：上下文压缩专用追踪日志：写入独立文件，便于排查超窗 / 空返回 / 压缩失效。 环境变量： - ``EVOFLOW_COMPACTION_TRACE_LOG``：``0`` / ``false`` / ``off`` 关…
- `packages/harness/evoflow/observability/cache_pricing.py`（174 行）：类 `CachePriceRule`
  - 模块自述：Official-ish CNY pricing for prompt-cache savings (Aliyun Bailian + Volcengine Ark).…
- `packages/harness/evoflow/observability/cache_metrics.py`（222 行）
  - 模块自述：Prompt-cache rollup and estimated savings for observability dashboards.…
- `packages/harness/evoflow/observability/model_list_projection.py`（50 行）
  - 模块自述：Lightweight list-view projection for model invocations. List endpoints must not ``SELECT`` ``request_json`` / …
- `packages/harness/evoflow/persistence/usage_ledger.py`（1886 行）
  - 模块自述：Unified usage / cost ledger (main app DB). Append-only events + UTC-day rollup for settings「使用统计」.…
- `packages/harness/evoflow/persistence/usage_by_module.py`（642 行）
  - 模块自述：Product-surface usage breakdown for Settings → 使用统计. Classifies ledger events into human modules users recogni…
- `packages/harness/evoflow/persistence/session_context_usage.py`（190 行）
  - 模块自述：Persist model-bound context fill snapshots on ``evoflow_chat_sessions.context_json``.…
- `app/gateway/routers/debug_agent_trace.py`（2801 行）；环境变量 `EVOFLOW_DEBUG_TRACE_UI`、`EVOFLOW_LANGGRAPH_URL`
  - 模块自述：Dev-only JSON APIs: aggregate per-thread debug logs (model payloads, collab cycle, tools). Structured index ``…
- `app/gateway/routers/client_trace.py`（159 行）
  - 模块自述：Client-side timing trace endpoints (SSE latency measurement). These endpoints receive timing data from the fro…
- `app/gateway/hang_diagnostics.py`（649 行）；环境变量 `EVOFLOW_GATEWAY_EXIT_ON_SOCKET_FAILURE`、`EVOFLOW_GATEWAY_HANG_DIAGNOSTICS`、`EVOFLOW_GATEWAY_HANG_DUMP_MIN_INTERVAL_SECONDS`、`EVOFLOW_GATEWAY_HANG_HEARTBEAT_SECONDS`
- `app/gateway/routers/observability.py`（659 行）：类 `ObservabilityEnabledRequest`
  - 模块自述：Gateway REST API for SQLite observability (``evoflow_obs_*``).…
- `packages/harness/evoflow/persistence/usage_ledger.py`（1886 行）
  - 模块自述：Unified usage / cost ledger (main app DB). Append-only events + UTC-day rollup for settings「使用统计」.…

> 本节只证明**路径、行数、符号存在**；调用顺序与边界条件仍属「行为」，未逐行核对。

## 对照 EvoFlow 核对清单
- [ ] `latency_waterfall.py` 的阶段划分
- [ ] `usage_ledger.py` 的记账粒度
