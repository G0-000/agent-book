# 第 1 章　Principal、ACL、Workspace 与身份入口

> **EvoFlow 对照状态 / Alignment status：** 🔍 结构已核对（路径、行数、符号均取自源码实测），**行为**（调用顺序、边界条件）尚未逐行核对。

## 本章目标
定义一个统一的「主体」概念，让权限判断只有一处实现。

## 最小闭环
用户登录 → 得到 principal → 访问某 workspace 资源 → ACL 判定 → 允许/拒绝并可解释。

## 真实模块地图（已核对：路径 · 行数 · 符号）

| 文件 | 行数 | 关键符号 | 模块常量 |
|---|---|---|---|
| `packages/harness/evoflow/authz/principals.py` | 735 | `_row_dict`、`_parse_json_list`、`_parse_json_obj` | LOCAL_ADMIN_PRINCIPAL_ID |
| `packages/harness/evoflow/authz/runtime_identity.py` | 265 | `set_current_principal_id`、`get_current_principal_id`、`principal_id_from_personal_scope` | — |
| `packages/harness/evoflow/authz/agent_actor.py` | 341 | `set_current_agent_actor`、`get_current_agent_actor`、`normalize_agent_actor` | — |
| `packages/harness/evoflow/authz/acl_store.py` | 247 | `encode_resource_ref`、`parse_resource_ref`、`principal_entitled_to_scope` | — |
| `packages/harness/evoflow/authz/groups.py` | 121 | `create_group`、`get_group`、`list_groups` | — |
| `packages/harness/evoflow/authz/membership.py` | 193 | `_member_row`、`list_scope_members`、`add_scope_member` | — |
| `packages/harness/evoflow/authz/resource_visibility.py` | 118 | `owner_scope_visible_to_principal`、`stamp_kwargs_from_request`、`stamp_new_app_from_request` | — |
| `packages/harness/evoflow/authz/scope.py` | 57 | `scope_id`、`org_scope`、`personal_scope` | — |
| `packages/harness/evoflow/authz/scope_paths.py` | 188 | `_safe_segment`、`resolve_base_dir`、`scopes_root` | — |
| `packages/harness/evoflow/authz/session_ownership.py` | 153 | `acl_session_list_filter_sql`、`stamp_session_ownership`、`add_session_participant` | — |
| `packages/harness/evoflow/authz/skill_roots.py` | 36 | `scope_skill_roots_for_principal` | — |
| `packages/harness/evoflow/authz/http_guard.py` | 549 | `resolve_authz_from_request`、`require_thread_visible`、`_has_auth_signals` | — |
| `packages/harness/evoflow/authz/admin_grants.py` | 115 | `is_org_admin`、`list_org_admins`、`promote_org_admin` | — |
| `packages/harness/evoflow/authz/mode.py` | 43 | `get_acl_mode`、`set_acl_mode`、`should_filter` | — |
| `app/gateway/routers/identity.py` | 411 | `CreatePrincipalBody`、`UpdatePrincipalBody`、`ResetPasswordBody`；`_require_admin`、`_require_self_or_admin`、`get_me` | — |
| `packages/harness/evoflow/mcp/oauth.py` | 217 | `_OAuthToken`、`OAuthTokenManager`；`build_oauth_tool_interceptor`、`get_initial_oauth_headers` | — |
| `packages/harness/evoflow/authz/acl_store.py` | 247 | `encode_resource_ref`、`parse_resource_ref`、`principal_entitled_to_scope` | — |

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

### 源码核对记录（路径与符号实测）

- `packages/harness/evoflow/authz/principals.py`（735 行）
  - 模块自述：Principal + identity persistence helpers.…
- `packages/harness/evoflow/authz/runtime_identity.py`（265 行）
  - 模块自述：Inject / resolve human identity for LangGraph runs and session stamps. Field contract: ``principal_id`` (who),…
- `packages/harness/evoflow/authz/agent_actor.py`（341 行）
  - 模块自述：Ambient employee / lead-agent actor for tool ACL (parallel to human principal_id). Model-facing tools must not…
- `packages/harness/evoflow/authz/acl_store.py`（247 行）
  - 模块自述：Resource ACL grants + audience intersection.…
- `packages/harness/evoflow/authz/groups.py`（121 行）
  - 模块自述：Groups (managed shared scopes).…
- `packages/harness/evoflow/authz/membership.py`（193 行）
  - 模块自述：Scope membership: can_read / can_write / can_manage.…
- `packages/harness/evoflow/authz/resource_visibility.py`（118 行）
  - 模块自述：Shared resource visibility: owner_scope_id isolation (always on).…
- `packages/harness/evoflow/authz/scope.py`（57 行）
  - 模块自述：ScopeId helpers: ``kind:ref`` encoding.…
- `packages/harness/evoflow/authz/scope_paths.py`（188 行）
  - 模块自述：Per-scope filesystem layout under ``{base_dir}/scopes/``. Layout (install still shares one ``.evoflow`` / EVOF…
- `packages/harness/evoflow/authz/session_ownership.py`（153 行）
  - 模块自述：Session ownership helpers (org_id / scope_id / created_by).…
- `packages/harness/evoflow/authz/skill_roots.py`（36 行）
  - 模块自述：Resolve skill discovery roots from AuthzContext / principal.…
- `packages/harness/evoflow/authz/http_guard.py`（549 行）
  - 模块自述：HTTP request guards for resource visibility (anti-IDOR).…
- `packages/harness/evoflow/authz/admin_grants.py`（115 行）
  - 模块自述：Org admin grants (separate from resource ACL).…
- `packages/harness/evoflow/authz/mode.py`（43 行）
  - 模块自述：ACL isolation is always on (multi-user). Mode API kept as no-op compat.…
- `app/gateway/routers/identity.py`（411 行）：类 `CreatePrincipalBody`、`UpdatePrincipalBody`、`ResetPasswordBody`、`PrincipalStatusBody`
  - 模块自述：Identity / ACL human-facing API (Phase 0/1).…
- `packages/harness/evoflow/mcp/oauth.py`（217 行）：类 `_OAuthToken`、`OAuthTokenManager`
  - 模块自述：OAuth token support for MCP HTTP/SSE servers.…
- `packages/harness/evoflow/authz/acl_store.py`（247 行）
  - 模块自述：Resource ACL grants + audience intersection.…

> 本节只证明**路径、行数、符号存在**；调用顺序与边界条件仍属「行为」，未逐行核对。

## 对照 EvoFlow 核对清单
- [ ] `acl_store.py` 的匹配算法
- [ ] `mode.py` 的单机/多用户模式差异

## 从零实现（手把手）
> 读完这章你能判断「这个人能不能看这个 workspace」：角色 → 权限 → 资源。
> 路径均相对 `backend/`，代码注释写「为什么」。

### Step 1　新建 acl.py：角色映射 + 判定
**文件**：`packages/harness/myagentflow/authz/acl.py（新建）`
**要写的逻辑**：`role → permissions` 用集合；`can()` 先查 owner（资源所有者永远有权），再查权限集。

**代码**

```python
"""ACL：角色 → 权限 → 资源。

为什么 owner 单独判：把 owner 也塞进角色表，
会出现「管理员改了策略把自己锁在门外」。
"""
from __future__ import annotations

from dataclasses import dataclass

ROLES: dict[str, set[str]] = {
    "owner": {"read", "write", "delete", "share"},
    "member": {"read", "write"},
    "viewer": {"read"},
}


@dataclass(frozen=True)
class Resource:
    kind: str
    id: str
    owner: str


def can(principal: str, roles: dict[str, str], resource: Resource, action: str) -> bool:
    if resource.owner == principal:
        return True                      # owner 永远有权
    role = roles.get(principal, "")
    return action in ROLES.get(role, set())
```

**验证**

```bash
uv run python -c "
from myagentflow.authz.acl import can, Resource
r = Resource('workspace','w1','alice')
print(can('alice', {}, r, 'delete'), can('bob', {'bob':'viewer'}, r, 'write'), can('bob', {'bob':'member'}, r, 'write'))
"
```

### Step 2　写测试：owner / 角色 / 无角色
**文件**：`tests/chapters/test_ch11_01_acl.py（新建）`
**要写的逻辑**：owner 能删；viewer 不能写；无角色全拒。

**代码**

```python
from __future__ import annotations


def test_acl():
    from myagentflow.authz.acl import Resource, can

    r = Resource("workspace", "w1", "alice")
    assert can("alice", {}, r, "delete") is True
    assert can("bob", {"bob": "viewer"}, r, "write") is False
    assert can("bob", {"bob": "member"}, r, "write") is True
    assert can("carol", {}, r, "read") is False
```

**验证**

```bash
uv run pytest tests/chapters/test_ch11_01_acl.py -v
# 期望：1 passed
```

### 与 EvoFlow 对照

| 我们的做法 | EvoFlow | 为什么 |
|---|---|---|
| owner 单独判定 | `authz/` 的 ACL | 策略改错会把 owner 锁在门外 |
| 权限用集合 | 同文件 | 字符串比较容易漏 case |

### 知识点

- [MCP 中台 Tool 治理：授权边界怎么划](https://harbor404.fushenlin.com/notes/mcp-tool-governance-architecture/)
- [系统课入口：权限与会话](https://g0-000.github.io/agent-book/)

### 验收

```bash
uv run pytest tests/chapters/test_ch11_01_acl.py -q
```
