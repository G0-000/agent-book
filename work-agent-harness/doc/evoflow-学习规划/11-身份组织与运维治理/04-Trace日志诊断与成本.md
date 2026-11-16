# 第 4 章　Trace、日志、运行诊断、成本与用量

## 本章目标
让「一次慢/贵/错的 run」可以被定位到具体环节，而不是靠猜。

## 最小闭环
给一个 run_id → 看到完整 span 时间线（请求/模型/工具/落库）→ 看到 token 与费用 → 看到错误点。

## 真实模块地图（源码证实：路径存在）
| 职责 | 路径 |
|---|---|
| 观测域 | `packages/harness/evoflow/observability/`（`queries.py`、`dashboard.py`、`latency_waterfall.py`、`agent_trace_load.py`、`compaction_file_log.py`） |
| 成本/缓存计价 | `observability/cache_pricing.py`、`cache_metrics.py`、`model_list_projection.py` |
| 用量账本 | `persistence/usage_ledger.py`、`usage_by_module.py`、`session_context_usage.py` |
| 网关侧 | `app/gateway/debug_agent_trace.py`、`client_trace.py`、`hang_diagnostics.py` |
| 路由 | `routers/observability.py`、`admin` 相关 |

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

## 对照 EvoFlow 核对清单
- [ ] `latency_waterfall.py` 的阶段划分
- [ ] `usage_ledger.py` 的记账粒度
