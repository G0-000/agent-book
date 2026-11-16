# 第 1 章　Gateway 启动依赖与聊天 API

> **EvoFlow 对照状态 / Alignment status：** 🔍 结构已核对（路径、行数、符号均取自源码实测），**行为**（调用顺序、边界条件）尚未逐行核对。

## 本章目标
让服务「该起来时才起来」，并把会话/消息/流的 API 边界定清楚。

## 最小闭环
`/health` 返回依赖状态 → `POST /sessions/{key}/ensure-thread` 建线程 → `POST /runs/stream` 出流。

## 真实模块地图（已核对：路径 · 行数 · 符号）

| 文件 | 行数 | 关键符号 | 模块常量 |
|---|---|---|---|
| `app/gateway/app.py` | 543 | `lifespan`、`create_app`、`__getattr__` | — |
| `app/gateway/gateway_shell.py` | 60 | `_desktop_stdio_mode`、`install_pre_start_middleware`、`load_webui_settings_deferred` | — |
| `app/gateway/router_registry.py` | 277 | `_include_module_router`、`register_core_routers`、`register_extended_routers` | — |
| `app/gateway/startup_gate.py` | 165 | `StartupGateMiddleware`；`_path`、`_is_exempt`、`_needs_core_routers` | — |
| `app/gateway/background_startup.py` | 1341 | `init_startup_state`、`is_startup_ready`、`resolve_local_embedding_warmup_target` | — |
| `app/gateway/cold_start_prewarm.py` | 167 | `mark_core_routers_ready`、`wait_core_routers_ready`、`core_routers_ready` | — |
| `app/gateway/health_routes.py` | 150 | `register_health_routes` | — |
| `app/gateway/routers/chat_sessions.py` | 2063 | `ForkSessionBody`、`TruncateSessionBody`；`_transcript_db_busy_http`、`_request_principal_id`、`_require_session_access` | — |
| `packages/harness/evoflow/admin/sessions.py` | 355 | `_cutoff_iso`、`_get_db`、`_search_messages` | — |
| `packages/harness/evoflow/assets/memory_runs.py` | 52 | `record_asset_phase_run` | — |
| `packages/harness/evoflow/webui/middleware.py` | 190 | `_is_public_share_get`、`_is_public_path`、`_extract_token` | — |
| `packages/harness/evoflow/mcp/oauth.py` | 217 | `_OAuthToken`、`OAuthTokenManager`；`build_oauth_tool_interceptor`、`get_initial_oauth_headers` | — |
| `packages/harness/evoflow/code_index/deps.py` | 395 | `_is_internal_spec`、`_discover_package_roots`、`_resolve_py_module` | — |
| `app/gateway/db_async.py` | 25 | `run_db` | — |
| `app/gateway/runtime_adapters.py` | 346 | `register_runtime_adapters` | — |
| `app/gateway/lazy_langgraph.py` | 324 | `ExternalLangGraphProxy`、`LazyLangGraphMount`；`mount_langgraph_in_process`、`ensure_langgraph_mounted`、`_read_request_body` | — |
| `tests/test_traffic_lanes.py` | 120 | `test_health_is_control`、`test_stream_is_stream`、`test_tasks_catalog_is_best_effort` | — |

## 核心概念
- **启动门（startup gate）**：DB/migration/插件 未就绪时拒绝流量而不是假装健康。
- **路由注册表**：所有 router 集中注册，便于审计「有哪些入口」。
- **两种运行模式**：in-process LangGraph 与 external LangGraph 代理（`lazy_langgraph.py`）。
- **长连接通道**：`/runs/stream` 属 stream lane，与普通请求分开治理（`test_traffic_lanes.py`）。

## 自研实现要点
```text
on_startup: migrate → warm caches → set state.ready=True
middleware: trace_id → auth → rate_limit → route
```

## 业务规则
- 健康检查区分 `liveness` 与 `readiness`。
- 未鉴权请求不进业务代码。
- 每个流都有最大时长与心跳。

## 常见坑
- 健康检查只返回 200，但 DB 挂了 → 假健康。
- 长连接与短请求同一连接池 → 互相拖死。
- 迁移在请求路径里跑 → 首次请求超时。

## 验收
- [ ] 依赖未就绪时 readiness=false
- [ ] 流有心跳与超时
- [ ] 路由清单可导出

### 源码核对记录（路径与符号实测）

- `app/gateway/app.py`（543 行）；环境变量 `EVOFLOW_ANYIO_THREAD_LIMIT`、`EVOFLOW_EMBED_APP_SERVER`、`EVOFLOW_FE_LOG`、`EVOFLOW_FE_LOG_ENABLE`
- `app/gateway/gateway_shell.py`（60 行）；环境变量 `EVOFLOW_APP_SERVER_STDIO`
  - 模块自述：Middleware that must be registered before uvicorn startup (not in deferred router pass).…
- `app/gateway/router_registry.py`（277 行）；环境变量 `EVOFLOW_V4_DEMO`、`EVOFLOW_V4_ROUTES`
  - 模块自述：Register Gateway API routers (lazy imports — run after liveness bind).…
- `app/gateway/startup_gate.py`（165 行）：类 `StartupGateMiddleware`
  - 模块自述：Return structured 503 while Gateway routes / LangGraph are still starting.…
- `app/gateway/background_startup.py`（1341 行）；环境变量 `EVOFLOW_APP_SERVER_STDIO`、`EVOFLOW_EMBEDDING_WARMUP_DELAY_SEC`、`EVOFLOW_HOME`、`EVOFLOW_LEAD_AGENT_WARM`
  - 模块自述：Gateway background startup — runs after early lifespan yield.…
- `app/gateway/cold_start_prewarm.py`（167 行）；环境变量 `EVOFLOW_SKIP_GATEWAY_PREWARM`
  - 模块自述：Cold-start prewarm — run BEFORE the asyncio event loop accepts HTTP. CPython: fat imports + ``ensure_app_schem…
- `app/gateway/health_routes.py`（150 行）
  - 模块自述：Health probes — registered first so liveness is available before heavy API routers.…
- `app/gateway/routers/chat_sessions.py`（2063 行）：类 `ForkSessionBody`、`TruncateSessionBody`；环境变量 `EVOFLOW_SESSIONS_LIST_SHED_LIMIT`、`EVOFLOW_SESSIONS_LIST_TIMEOUT_S`
  - 模块自述：Chat session index + application-owned transcript (not LangGraph checkpoint).…
- `packages/harness/evoflow/admin/sessions.py`（355 行）
  - 模块自述：Past chat session search (evoflow.db) — replaces built-in ``session_search`` tool.…
- `packages/harness/evoflow/assets/memory_runs.py`（52 行）
  - 模块自述：Thin helpers: record Asset Hub Phase1/Phase2 runs into the DB log.…
- `packages/harness/evoflow/webui/middleware.py`（190 行）
  - 模块自述：JWT authentication middleware for WebUI remote access. When WebUI is enabled, this middleware gates remote req…
- `packages/harness/evoflow/mcp/oauth.py`（217 行）：类 `_OAuthToken`、`OAuthTokenManager`
  - 模块自述：OAuth token support for MCP HTTP/SSE servers.…
- `packages/harness/evoflow/code_index/deps.py`（395 行）
  - 模块自述：File-level import dependency extraction (Python / JS / TS / Java).…
- `app/gateway/db_async.py`（25 行）；环境变量 `EVOFLOW_DB_THREAD_POOL_SIZE`
  - 模块自述：Offload sync SQLite repository work from the Gateway asyncio event loop. FastAPI handlers must not call ``get_…
- `app/gateway/runtime_adapters.py`（346 行）
  - 模块自述：Register application-layer adapters into the kernel runtime ports. This is the **only** sanctioned bridge from…
- `app/gateway/lazy_langgraph.py`（324 行）：类 `ExternalLangGraphProxy`、`LazyLangGraphMount`；环境变量 `EVOFLOW_FORCE_BG_JOB_ISOLATED_LOOPS`
  - 模块自述：Deferred LangGraph in-process mount — keeps ``create_app()`` import-light.…
- `tests/test_traffic_lanes.py`（120 行）
  - 模块自述：Gateway traffic lane classifier — unknown APIs must not default to Control.…

> 本节只证明**路径、行数、符号存在**；调用顺序与边界条件仍属「行为」，未逐行核对。

## 对照 EvoFlow 核对清单
- [ ] `startup_gate.py` 的就绪判定
- [ ] `test_traffic_lanes.py` 的 lane 划分
