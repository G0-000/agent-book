# 第 2 章　JWT、OIDC、Guardrails 与入口保护

> **EvoFlow 对照状态 / Alignment status：** 🔍 结构已核对（路径、行数、符号均取自源码实测），**行为**（调用顺序、边界条件）尚未逐行核对。

## 本章目标
把认证（你是谁）与护栏（你能干什么/说什么）分开实现，且都能被配置。

## 最小闭环
OIDC 登录换 JWT → 请求带 token → 校验 → 进入业务；命中护栏规则 → 拦截并记录。

## 真实模块地图（已核对：路径 · 行数 · 符号）

| 文件 | 行数 | 关键符号 | 模块常量 |
|---|---|---|---|
| `packages/harness/evoflow/webui/auth.py` | 731 | `_QrTokenData`、`QrTokenStore`；`hash_password`、`verify_password`、`generate_password` | WEBUI_DEFAULT_HTTP_PORT |
| `packages/harness/evoflow/webui/middleware.py` | 190 | `_is_public_share_get`、`_is_public_path`、`_extract_token` | — |
| `packages/harness/evoflow/webui/oidc.py` | 267 | `OidcStateStore`；`_b64url_no_pad`、`pkce_challenge`、`_fetch_discovery` | — |
| `packages/harness/evoflow/webui/oidc_config.py` | 91 | `_normalize_config`、`get_oidc_config`、`set_oidc_config` | DEFAULT_OIDC_CONFIG |
| `packages/harness/evoflow/guardrails/builtin.py` | 23 | `AllowlistProvider` | — |
| `packages/harness/evoflow/guardrails/provider.py` | 56 | `GuardrailRequest`、`GuardrailReason`、`GuardrailDecision` | — |
| `packages/harness/evoflow/agents/content_scanner.py` | 89 | `scan_content`、`scan_memory_entries` | — |
| `app/gateway/routers/security_settings.py` | 235 | `ExecutionSecurityPatchBody`；`_detect_runtime_versions`、`_merge_execution_security`、`get_execution_security_status` | — |
| `app/gateway/routers/codex_auth.py` | 180 | `LoginStartRequest`、`LoginPollRequest`、`EnsureModelRequest`；`_http_from_auth_error`、`require_local_plan_admin`、`codex_auth_status` | — |
| `packages/harness/evoflow/guardrails/provider.py` | 56 | `GuardrailRequest`、`GuardrailReason`、`GuardrailDecision` | — |

## 核心概念
- **JWT 只做认证**，授权仍走 ACL（别把权限塞进 token）。
- **护栏是策略层**：输入侧（注入/敏感）、输出侧（泄露/合规）、工具侧（危险动作）。
- **可插拔 provider**：内置规则 + 外部审核服务。
- **失败开放 vs 失败关闭**：安全相关必须 fail-closed。

## 自研实现要点
```text
authenticate(req) → principal | 401
guard(input|output|tool, ctx) → pass | block(reason, rule_id) | redact
```

## 业务规则
- token 短期 + refresh；密钥轮换。
- 拦截必须留审计（规则 id + 摘要，不存原文）。
- 护栏规则可灰度。

## 常见坑
- 把角色写进 JWT 且长期不失效。
- 护栏只在 UI 前置，API 直调绕过。
- 拦截后返回原文片段 → 二次泄露。

## 验收
- [ ] 过期 token 被拒
- [ ] 护栏在服务端生效
- [ ] 拦截有审计且不泄露原文

### 源码核对记录（路径与符号实测）

- `packages/harness/evoflow/webui/auth.py`（731 行）：类 `_QrTokenData`、`QrTokenStore`；环境变量 `EVOFLOW_VITE_PORT`、`EVOFLOW_WEBUI_HTTP_PORT`、`EVOFLOW_WEBUI_SECRET`
  - 模块自述：WebUI remote-access authentication core. Provides: * Password hashing (PBKDF2-HMAC-SHA256, 100k iterations) — …
- `packages/harness/evoflow/webui/middleware.py`（190 行）
  - 模块自述：JWT authentication middleware for WebUI remote access. When WebUI is enabled, this middleware gates remote req…
- `packages/harness/evoflow/webui/oidc.py`（267 行）：类 `OidcStateStore`
  - 模块自述：OIDC authorization-code flow with PKCE for enterprise SSO.…
- `packages/harness/evoflow/webui/oidc_config.py`（91 行）；环境变量 `EVOFLOW_OIDC_ALLOWED_EMAIL_DOMAIN`、`EVOFLOW_OIDC_CLIENT_ID`、`EVOFLOW_OIDC_CLIENT_SECRET`、`EVOFLOW_OIDC_ENABLED`
  - 模块自述：OIDC / enterprise SSO configuration (stored in evoflow_app_settings).…
- `packages/harness/evoflow/guardrails/builtin.py`（23 行）：类 `AllowlistProvider`
  - 模块自述：Built-in guardrail providers that ship with EvoFlow.…
- `packages/harness/evoflow/guardrails/provider.py`（56 行）：类 `GuardrailRequest`、`GuardrailReason`、`GuardrailDecision`、`GuardrailProvider`
  - 模块自述：GuardrailProvider protocol and data structures for pre-tool-call authorization.…
- `packages/harness/evoflow/agents/content_scanner.py`（89 行）
  - 模块自述：Content security scanner — detects prompt injection in user-provided content. Scans context files, uploaded do…
- `app/gateway/routers/security_settings.py`（235 行）：类 `ExecutionSecurityPatchBody`
  - 模块自述：Security center API — OS execution security, policy overlays, audit logs. Endpoints under ``/api/settings/secu…
- `app/gateway/routers/codex_auth.py`（180 行）：类 `LoginStartRequest`、`LoginPollRequest`、`EnsureModelRequest`
  - 模块自述：ChatGPT / Codex subscription auth for Settings → 模型.…
- `packages/harness/evoflow/guardrails/provider.py`（56 行）：类 `GuardrailRequest`、`GuardrailReason`、`GuardrailDecision`、`GuardrailProvider`
  - 模块自述：GuardrailProvider protocol and data structures for pre-tool-call authorization.…

> 本节只证明**路径、行数、符号存在**；调用顺序与边界条件仍属「行为」，未逐行核对。

## 对照 EvoFlow 核对清单
- [ ] `guardrails/provider.py` 的扩展接口
- [ ] `oidc_config.py` 的必需字段
