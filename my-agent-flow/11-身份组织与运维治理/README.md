# 第 11 部分　身份、组织与运维治理 / Identity, Organization, Governance

> **落地状态：🟡 部分治理组件存在，组织级流程未实现。** 本地有 `authz/{acl,jwt,license}.py`、`observability/trace.py`、`eval/runner.py`、`agents/persona.py`；`guardrails/` 为空。章节测试文件存在于 ACL、JWT、Eval 三章。逐章映射见[总文档、分章与代码落地对照](../00-导论/06-总文档分章与代码落地对照.md)。

目标：让身份、权限、成本、质量和审计都能被追溯。

## 章节

| 章 | 主题 | 本地实现 | 测试/缺口 |
|---|---|---|---|
| [1](01-Principal-ACL与Workspace.md) | Principal、ACL 与 Workspace | `authz/acl.py` | `test_ch11_01_acl.py`；身份入口不完整 |
| [2](02-JWT-OIDC与Guardrails.md) | JWT、OIDC、Guardrails | `authz/jwt.py` | `test_ch11_02_jwt.py`；OIDC/Guardrails 未落地 |
| [3](03-组织分发License与审批.md) | 组织分发、License、审批 | `authz/license.py`、`admin/errors.py` | 组织分发/完整审批未实现 |
| [4](04-Trace日志诊断与成本.md) | Trace、诊断、成本与用量 | `observability/trace.py` | Trace 基础；没有完整成本账本 |
| [5](05-Eval质量评估与回归.md) | Eval 质量评估 | `eval/runner.py` | `test_ch11_05_eval.py`；是 runner 子集 |
| [6](06-人格内核.md) | 人格内核 | `agents/persona.py` | 基础文件；情绪/成长链未实现 |

## 治理目标（未全量达成）

身份/权限、成本/用量、质量/Eval、审计/诊断需要贯穿 Agent 实际运行入口。目录里存在模块或测试，不表示每次 run 已自动留下完整主体、模型、token 与成本记录。
