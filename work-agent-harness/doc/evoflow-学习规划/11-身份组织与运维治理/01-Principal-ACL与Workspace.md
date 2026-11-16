# 第 1 章　Principal、ACL、Workspace 与身份入口

## 本章目标
定义一个统一的「主体」概念，让权限判断只有一处实现。

## 最小闭环
用户登录 → 得到 principal → 访问某 workspace 资源 → ACL 判定 → 允许/拒绝并可解释。

## 真实模块地图（源码证实：路径存在）
| 职责 | 路径 |
|---|---|
| 主体/身份 | `packages/harness/evoflow/authz/principals.py`、`runtime_identity.py`、`agent_actor.py` |
| ACL 存储 | `authz/acl_store.py`、`groups.py`、`membership.py`、`resource_visibility.py` |
| 作用域 | `authz/scope.py`、`scope_paths.py`、`session_ownership.py`、`skill_roots.py` |
| HTTP 守卫 | `authz/http_guard.py`、`admin_grants.py`、`mode.py` |
| 路由 | `app/gateway/routers/identity.py`、`auth.py` |

## 核心概念
- **Principal = user | agent | service**，统一抽象后 ACL 只判 `principal → resource`。
- **资源用 scope_path 表达**（如 `workspace:w1/session:s2`），可前缀匹配。
- **Agent 也是主体**：Agent 以某个 actor 身份执行，其权限可低于用户。
- **可见性（visibility）** 与 **可写性** 分开判定。

## 自研实现要点
```text
acl(subject, scope_path, action, effect)  -- allow/deny，最长前缀优先
visible(principal, path) -> bool; can_write(principal, path) -> bool
```

## 业务规则
- 默认拒绝；显式允许优先于继承。
- 权限判断必须在服务端，UI 隐藏不算。
- Agent 不得继承用户的全部权限（最小必要）。

## 常见坑
- 只在路由层判断，内部服务被直接调用绕过。
- scope_path 用字符串拼接 → `:` 注入歧义。
- 共享资源与私有资源混用同一前缀。

## 验收
- [ ] 越权用例全部拒绝
- [ ] 权限解释可输出（为什么拒）
- [ ] Agent 权限不高于其委派者

## 对照 EvoFlow 核对清单
- [ ] `acl_store.py` 的匹配算法
- [ ] `mode.py` 的单机/多用户模式差异
