# 第 1 章　Automation 定义、执行与运行历史

## 本章目标
把「每天早上 9 点给我做一份行业简报」变成一条可管理、可回放的记录。

## 最小闭环
创建自动化（规则 + 指令 + 渠道）→ 到点生成 run → 结果写入会话并推送 → 历史里可查每次输出。

## 真实模块地图（源码证实：路径存在）
| 职责 | 路径 |
|---|---|
| 自动化域 | `packages/harness/evoflow/automation/`（`output_paths.py`）、`routers/automation_scheduler.py` |
| 执行器 | `app/gateway/automation_runner.py` |
| 自动化会话 | `app/gateway/automation_chat_session.py` |
| 持久化 | `persistence/automation_repositories.py`、`channel_push_repositories.py` |
| 路由 | `app/gateway/routers/sessions.py`、`tasks` 相关路由 |

## 核心概念
- **定义与执行分离**：definition（规则+指令）→ occurrence（每次触发）→ run（执行）。
- **独立会话**：自动化有自己的会话线，不污染用户主对话。
- **输出路径**：产物写到约定目录，便于用户找。

## 自研实现要点
```text
automation(id, rule, prompt, channel, enabled, created_at)
occurrence(id, automation_id, planned_at, status, run_id)
run(run_id, session_id, started_at, status, artifact_refs)
```

## 业务规则
- 同一 automation 同一时刻只允许一个运行中 occurrence。
- 失败重试上限（如 2 次），超限标记需人工。
- 禁用即不再产生新 occurrence。

## 常见坑
- 定义与执行混在一张表 → 历史无法追溯。
- 自动化复用用户主会话 → 上下文互相污染。
- 无上限重试 → 失败后刷屏。

## 验收
- [ ] 每次触发有独立 run 记录
- [ ] 禁用后无新触发
- [ ] 历史可按时间/状态筛选

## 对照 EvoFlow 核对清单
- [ ] `automation_repositories` 的字段与 occurrence 语义
- [ ] `automation_runner` 如何选择模型与工具
