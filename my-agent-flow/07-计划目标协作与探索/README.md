# 第 7 部分　计划、目标、协作与探索 / Planning, Goals, Collaboration, Exploration

> **落地状态：🟡 多个最小组件已落地并有章节测试；完整计划/Goal/协作系统未接通。** 目录含 Plan 解析/路由、Workflow、协作账本和幂等组件，Part 7 五个测试文件均存在。代码树没有独立 Goal 图、exploration、App-Center 或任务中心完整实现。逐章表见[总文档、分章与代码落地对照](../00-导论/06-总文档分章与代码落地对照.md)。

这一部分回答：Agent 如何把大任务拆开、分给谁、做到哪一步、什么时候该放弃。

## 章节

| 章 | 主题 | 本地实现 | 测试 |
|---|---|---|---|
| [1](01-Plan定义解析与Goal图.md) | Plan 定义解析与 Goal 图 | `plans/parser.py`、`plans/router.py`；未见 Goal 图 | `test_ch07_01_plan.py` |
| [2](02-协作账本与任务中心.md) | 协作账本与任务中心 | `collab/ledger.py`；无任务中心 UI/HTTP | `test_ch07_02_ledger.py` |
| [3](03-Workflow与App-Center.md) | Workflow、App Center、Stage | `plans/workflow.py`；App-Center/Stage 未实现 | `test_ch07_03_workflow.py` |
| [4](04-探索预算与策略路由.md) | 探索预算与策略路由 | `plans/router.py`、预算子集；无独立 exploration 模块 | `test_ch07_04_budget.py` |
| [5](05-暂停恢复幂等与重复执行.md) | 暂停恢复与幂等 | `session_execution/idempotency.py`；暂停恢复流程未接 | `test_ch07_05_idempotency.py` |

## 一句话概括

> 计划是声明，任务是状态，协作是分配，幂等是保险；当前代码只覆盖其中若干可独立验收的组件。

## 当前边界

章节测试存在不等于多步任务已经由聊天入口自动执行；外部副作用的恢复/防重也不能只凭幂等键文件推断完成。验收目标仍是后续集成目标。
