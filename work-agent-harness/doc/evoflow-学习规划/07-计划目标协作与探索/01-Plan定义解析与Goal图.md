# 第 1 章　Plan 定义解析与 Goal 图

## 本章目标
把「用户一句话」变成「可校验的计划结构」，并让目标之间有关系（依赖、包含、互斥）。

## 最小闭环
用户说「做一份竞品分析报告」→ 生成 4 步计划 → 每步有验收标准 → 执行时按依赖推进。

## 真实模块地图（源码证实：路径存在）
| 职责 | 路径 |
|---|---|
| 计划工具 | `packages/harness/evoflow/tools/builtins/plan_tool.py` |
| 目标 | `agents/goal/`、`routers/goal.py`、`v4/goal_engine.py` |
| 任务状态 | `agents/mission_state/` |
| 计划守卫（中间件） | `agents/middlewares/` 中的 `plan_guard_middleware`、`plan_doc_middleware`（见模块地图） |
| 计划路由 | `app/gateway/routers/plans.py` |

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

## 对照 EvoFlow 核对清单
- [ ] `plan_tool.py` 的 schema（`<task_plan>` JSON 格式）
- [ ] `plan_guard_middleware` 的重注入策略
