# 第 1 章　Gateway 启动依赖与聊天 API

## 本章目标
让服务「该起来时才起来」，并把会话/消息/流的 API 边界定清楚。

## 最小闭环
`/health` 返回依赖状态 → `POST /sessions/{key}/ensure-thread` 建线程 → `POST /runs/stream` 出流。

## 真实模块地图（源码证实：路径存在）
| 职责 | 路径 |
|---|---|
| 应用装配 | `backend/app/gateway/app.py`、`gateway_shell.py`、`router_registry.py` |
| 启动门/预热 | `startup_gate.py`、`background_startup.py`、`cold_start_prewarm.py` |
| 健康检查 | `health_routes.py` |
| 聊天会话 API | `routers/chat_sessions.py`、`sessions.py`、`runs.py` |
| 中间件/鉴权 | `middleware.py`、`auth.py` |
| 依赖注入 | `deps.py`、`db_async.py`、`runtime_adapters.py` |

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

## 对照 EvoFlow 核对清单
- [ ] `startup_gate.py` 的就绪判定
- [ ] `test_traffic_lanes.py` 的 lane 划分
