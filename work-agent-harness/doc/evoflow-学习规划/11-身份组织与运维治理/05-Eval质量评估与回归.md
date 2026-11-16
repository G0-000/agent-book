# 第 5 章　Eval 质量评估与回归闭环

## 本章目标
把「感觉变好了」变成「可复现的分数变化」，并让它进入 CI。

## 最小闭环
定义 10 个场景 → 跑基线 → 改提示词/工具 → 再跑 → 对比通过率与成本。

## 真实模块地图（源码证实：路径存在）
| 职责 | 路径 |
|---|---|
| 评测引擎 | `packages/harness/evoflow/eval/eval_engine.py`、`case_spec.py`、`scenarios/`、`modules.py` |
| 指标 | `eval/performance.py`、`business_quality.py`、`security.py`、`eval_metrics.py` |
| 数据源 | `eval/data_sources.py`、`response_adapters.py` |
| 仪表盘 | `eval/dashboard.py` |
| 路由 | `app/gateway/routers/eval.py` |

## 核心概念
- **场景（scenario）即测试用例**：输入 + 期望性质（不含逐字答案）。
- **判定器**：规则断言（含工具名/参数）+ LLM 评判（需校准，防漂移）。
- **多维指标**：正确性、工具正确率、时延、成本、安全。
- **回归门槛**：不达标不得合并。

## 自研实现要点
```text
case(id, input, must_include[], must_call_tools[], must_not[], rubric)
run_eval(cases) → per-case result + aggregate
baseline.json 对比 → delta
```

## 业务规则
- 评测集版本化；改动需评审。
- LLM 评判需固定模型与提示，并抽样人工校验。
- 失败用例必须能单独复跑。

## 常见坑
- 用同一模型既生成又评判 → 自洽偏差。
- 用例过拟合提示词 → 换一批就崩。
- 只看平均分不看成本与时延。

## 验收
- [ ] 基线可复现（同输入同分）
- [ ] 回归门槛生效
- [ ] 失败用例可单跑

## 对照 EvoFlow 核对清单
- [ ] `eval/scenarios/` 的场景数与分类
- [ ] `eval/security.py` 的安全用例
- [ ] RAG/Agent 评测体系（参考 Harbor404📚）
