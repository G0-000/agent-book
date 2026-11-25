# 第 8 部分　自动化与主动 Agent / Automation and Proactive Agents

> **落地状态：🟡 自动化组件与章节测试存在；未来调度运行链未接入 Gateway 或真实通知渠道。** 本地模块是 `automation/{store,scheduler,heartbeat,notify}.py`，四个 Part 8 测试文件均存在。不能把上游的 `proactive/` 员工系统、渠道投递或生产级重启补偿算作本地实现。逐章映射见[总文档、分章与代码落地对照](../00-导论/06-总文档分章与代码落地对照.md)。

目标：让 Agent 从「你问我答」扩展到「按时运行、有事通知」的可治理自动化。

## 章节

| 章 | 主题 | 本地实现 | 测试/缺口 |
|---|---|---|---|
| [1](01-Automation定义执行与历史.md) | Automation 定义、执行与历史 | `automation/store.py` | `test_ch08_01_automation.py`；无 Gateway runner |
| [2](02-定时规则调度器与重启补偿.md) | 定时规则、调度器与重启补偿 | `automation/scheduler.py` | `test_ch08_02_scheduler.py`；不等于生产级重启补偿 |
| [3](03-Heartbeat主动任务与智能体员工.md) | Heartbeat 与主动任务 | `automation/heartbeat.py` | `test_ch08_03_heartbeat.py`；无员工/主动 Agent 系统 |
| [4](04-通知投递与任务管理.md) | 通知投递与任务管理 | `automation/notify.py` | `test_ch08_04_notify.py`；未接 IM 渠道/UI |

## 三条时间线

| 形态 | 触发 | 当前状态 |
|---|---|---|
| 定时自动化 | cron/rrule | 有调度组件，未接持续运行的应用服务 |
| Heartbeat 主动 | 周期心跳 + 决策门 | 有组件，未接智能体员工 |
| 事件驱动 | IM 消息/任务变更 | 当前未实现渠道事件接入 |

## 关键原则与验收目标

可观测、可停止、可补偿、有预算；每次运行应有记录、停止后不残留触发、重启不重复执行。以上是目标，需逐章实现和集成后再标为通过。
