# 第 11 部分　身份、组织与运维治理 / Identity, Organization, Governance

> 状态：🟡 骨架（真实路径已核对）。

目标：从「一个人一个本子」变成「一个组织在用」——身份、权限、成本、质量、审计都要能回答。

## 章节

| 章 | 主题 | 真实模块 |
|---|---|---|
| [1](01-Principal-ACL与Workspace.md) | Principal、ACL、Workspace 与身份入口 | `authz/`、`routers/identity.py` |
| [2](02-JWT-OIDC与Guardrails.md) | JWT、OIDC、Guardrails 与入口保护 | `webui/auth.py`、`webui/oidc.py`、`guardrails/` |
| [3](03-组织分发License与审批.md) | 组织分发、License、Admin 与审批 | `organizations/`、`license/`、`admin/`、`routers/audit.py` |
| [4](04-Trace日志诊断与成本.md) | Trace、日志、运行诊断、成本与用量 | `observability/`、`persistence/usage_ledger.py` |
| [5](05-Eval质量评估与回归.md) | Eval 质量评估与回归闭环 | `eval/`、`routers/eval.py` |
| [6](06-人格内核.md) | 人格内核：身份、情绪、记忆与成长 | `person_kernel.py`、`person_affect.py`、`person_wrap_up_reflect.py` |

## 治理的四条线

| 线 | 回答的问题 | 失败后果 |
|---|---|---|
| 身份/权限 | 谁能看、谁能做 | 越权、数据泄露 |
| 成本/用量 | 钱花在哪、谁花的 | 账单失控 |
| 质量/Eval | 变好了还是变坏了 | 静默退化 |
| 审计/诊断 | 出了什么事、怎么复现 | 无法定位 |

## 验收口径
- 任意一次 run 能定位到「谁发起、用了哪个模型、花了多少 token」。
- 权限变更后 1 分钟内生效。
- 评测集跑一次能给出回归对比。
