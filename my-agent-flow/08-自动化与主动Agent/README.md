# 第 8 部分　自动化与主动 Agent / Automation and Proactive Agents

> 状态：🟡 骨架（真实路径已核对）。

目标：让 Agent 从「你问我答」变成「到点自己做、有事主动找你」。

## 章节

| 章 | 主题 | 真实模块 |
|---|---|---|
| [1](01-Automation定义执行与历史.md) | Automation 定义、执行与运行历史 | `automation/`、`app/gateway/automation_runner.py`、`automation_chat_session.py` |
| [2](02-定时规则调度器与重启补偿.md) | 定时规则、调度器、重启补偿 | `routers/automation_scheduler.py`、`proactive/schedule.py` |
| [3](03-Heartbeat主动任务与智能体员工.md) | Heartbeat 主动任务与智能体员工 | `proactive/`（`engine.py`、`duty_runs.py`、`employee_automation.py`、`departments.py`） |
| [4](04-通知投递与任务管理.md) | 通知渠道投递与任务管理界面 | `app/channels/channel_result_push.py`、`proactive/feishu_notify.py`、`routers/tasks` |

## 三条时间线

| 形态 | 触发 | 谁执行 | 结果去哪 |
|---|---|---|---|
| 定时自动化 | cron/rrule | 独立 run | 会话 + 通知 |
| Heartbeat 主动 | 周期心跳 + 决策门 | 智能体员工 | 任务/消息 |
| 事件驱动 | IM 消息/任务变更 | 渠道 → run | 回原渠道 |

## 关键原则

1. **可观测**：每次自动执行都要有 run 记录与结果，不能「悄悄跑」。
2. **可停止**：一条自动化必须能被禁用，且禁用后不再有残留触发器。
3. **可补偿**：进程重启后错过的触发要补齐，但**不能重复执行**（幂等键）。
4. **有预算**：主动任务不能无限消耗 token，要有每日上限。

## 验收口径
- 禁用自动化后 1 分钟内不再触发。
- 停机 2 小时后重启，错过的任务按策略补齐且不重复。
- 每次主动执行可在任务中心追溯到输入与产物。
