# 第 3 章　组织分发、License、Admin 与审批

## 本章目标
让「谁能安装什么、能用多少、谁批准」在组织内可管理。

## 最小闭环
管理员创建组织 → 分配席位 → 用户激活 License → 使用受限功能 → 审批流记录。

## 真实模块地图（源码证实：路径存在）
| 职责 | 路径 |
|---|---|
| 组织 | `packages/harness/evoflow/organizations/`、`routers/organizations.py` |
| License | `license/gate.py`、`entitlements.py`、`machine.py`、`issued_store.py`、`routers/license.py` |
| 管理 | `admin/`、`authz/admin_grants.py` |
| 审计/审批记录 | `routers/audit.py`、`persistence/audit_log.py` |

## 核心概念
- **entitlement（权益）** 与 **seat（席位）** 分离：功能开关 ≠ 人数限制。
- **机器绑定**：License 常与机器指纹绑定，需处理换机与离线。
- **审批（approval）** 是治理动作：谁在什么条件下批准了例外。
- **降级路径**：License 失效后应降级而非直接不可用（视策略）。

## 自研实现要点
```text
org(id, name, seats); member(org_id, principal, role)
entitlement(feature, limit, valid_until)
license(codec, machine_fp, issued_at, revoked)
```

## 业务规则
- 席位超限时明确提示，不静默拒绝。
- License 校验失败要在 UI 可解释。
- 审批记录不可被普通用户删除。

## 常见坑
- 只在前端判断权益 → 后端可绕过。
- 机器指纹随硬件变化频繁 → 频繁失效。
- 审批流无超时 → 请求永远挂起。

## 验收
- [ ] 超席位使用被拦
- [ ] License 失效可解释
- [ ] 审批记录完整

## 对照 EvoFlow 核对清单
- [ ] `license/codec.py` 的签名/编码方式
- [ ] `entitlements.py` 的功能清单
