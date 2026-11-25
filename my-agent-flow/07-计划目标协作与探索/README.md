# 第 7 部分　计划、目标、协作与探索 / Planning, Goals, Collaboration, Exploration

> 状态：🟡 骨架（真实路径已核对）。这一部分回答：Agent 如何**把大任务拆开、分给谁、做到哪一步、什么时候该放弃**。

## 章节

| 章 | 主题 | 真实模块 |
|---|---|---|
| [1](01-Plan定义解析与Goal图.md) | Plan 定义解析与 Goal 图 | `tools/builtins/plan_tool.py`、`agents/goal/`、`agents/mission_state/` |
| [2](02-协作账本与任务中心.md) | 协作账本、团队分工、任务中心 | `collab/`、`routers/collab.py`、`routers/meetings.py` |
| [3](03-Workflow与App-Center.md) | Workflow、App Center、Stage | `workflows/`、`stage/`、`collab/app_engine.py` |
| [4](04-探索预算与策略路由.md) | 探索预算、策略路由与思维图 | `exploration/`、`exploration_graph/` |
| [5](05-暂停恢复幂等与重复执行.md) | 暂停恢复、幂等与重复执行 | `collab/continue_subtask_session.py`、幂等键设计 |

## 一句话概括

> 计划是**声明**（要做什么），任务是**状态**（做到哪），协作是**分配**（谁做），幂等是**保险**（重跑不出错）。

## 验收口径
- 一个 5 步计划可被暂停、恢复、改道而不重复执行副作用。
- 子任务状态可从看板读出，不靠问模型。
- 探索类任务有预算上限，到点必须给「当前最优 + 未覆盖项」。
