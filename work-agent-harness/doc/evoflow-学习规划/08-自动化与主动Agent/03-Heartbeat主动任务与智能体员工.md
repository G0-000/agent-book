# 第 3 章　Heartbeat 主动任务与智能体员工

## 本章目标
让 Agent 在没人提问时也会「抬头看一眼」：检查任务、发现异常、主动汇报。

## 最小闭环
心跳周期到 → 决策门判断「是否值得打扰用户」→ 是则生成一条主动消息 → 否则静默记录。

## 真实模块地图（源码证实：路径存在）
| 职责 | 路径 |
|---|---|
| 主动引擎 | `packages/harness/evoflow/proactive/engine.py` |
| 决策门 | `proactive/decision_gate.py` |
| 值守运行 | `proactive/duty_runs.py` |
| 智能体员工 | `proactive/employee_automation.py`、`employee_prompt.py`、`employee_prompting.py`、`departments.py` |
| 周期上限 | `proactive/cycle_limits.py` |
| 设计文档 | `proactive/DESIGN.md`、`proactive/USAGE.md` |

## 核心概念
- **心跳不是轮询一切**：只跑「有 duty 的」检查项，避免空转。
- **决策门**：抑制「没什么可说」的心跳——主动打扰是有成本的。
- **智能体员工**：有岗位、职责、汇报关系，可按部门组织。
- **静默优先**：默认不发消息，只在有结论/异常时发。

## 自研实现要点
```text
heartbeat: for duty in duties: if due → run(duty) → result
gate: 判断 result 是否有新信息 + 是否超频 → send or record
```

## 业务规则
- 每日主动消息条数上限。
- 相同内容不重复推送（内容指纹去重）。
- 用户静音时段不打扰。

## 常见坑
- 心跳过密 → 电费与 token 双烧。
- 决策门过松 → 变成骚扰机器人。
- 员工职责不清 → 同一件事两个员工重复汇报。

## 验收
- [ ] 无新信息时不发消息
- [ ] 超频被抑制
- [ ] 每条主动消息可追溯到 duty

## 对照 EvoFlow 核对清单
- [ ] `decision_gate.py` 的判定维度
- [ ] `departments.py` 的组织模型
