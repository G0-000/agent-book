# 第 4 章　外部 Agent Adapter 与 A2A 互操作

## 本章目标
让本系统与「另一个 Agent 系统」对话：互相发现能力、交换任务、汇总结果。

## 最小闭环
注册一个外部 Agent（能力卡）→ 发一条任务 → 收到结构化结果 → 并入本地任务账本。

## 真实模块地图（源码证实：路径存在）
| 职责 | 路径 |
|---|---|
| A2A 适配与编排 | `packages/harness/evoflow/a2a/adapter.py`、`orchestrator.py`、`models.py` |
| Agent Card | `a2a/agent_card.py` |
| 会议发言/结论 | `a2a/meeting_tool_speak.py`、`meeting_conclude.py` |
| 外部 Agent 注册 | `external_agents/registry.py`、`base.py`、`trae.py` |
| 路由 | `app/gateway/routers/a2a.py` |

## 核心概念
- **Agent Card**：能力、端点、鉴权方式的自我描述，是互操作的前提。
- **任务 vs 消息**：A2A 用 task 生命周期（submitted/working/done），不是纯 chat。
- **超时与幂等**：跨系统调用必须带 `task_id` 去重。
- **不可信对端**：返回内容按外部内容处理（防注入）。

## 自研实现要点
```text
peers(id, card_json, endpoint, auth_ref, health)
tasks(task_id, peer_id, state, artifacts[], updated_at)
```

## 业务规则
- 只与已登记且通过健康检查的 peer 通信。
- 跨系统产物落本地一份再引用。
- 失败重试不代表可重复副作用（要 peer 侧幂等）。

## 常见坑
- 把对端回复当指令执行。
- 无 task_id → 重试产生重复任务。
- 只支持同步 → 长任务超时。

## 验收
- [ ] 任务状态可追踪
- [ ] 重试不产生重复任务
- [ ] 对端内容不具指令效力

## 对照 EvoFlow 核对清单
- [ ] `agent_card.py` 的字段
- [ ] `orchestrator.py` 的调度策略
