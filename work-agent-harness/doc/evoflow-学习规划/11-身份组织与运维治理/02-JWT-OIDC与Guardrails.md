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

## 从零实现（手把手）
> 读完这章你能自己校验 JWT（不引库）：验签、验过期、验 issuer，任何一项不过就拒。
> 路径均相对 `backend/`，代码注释写「为什么」。

### Step 1　新建 jwt.py：HS256 验签 + 声明校验
**文件**：`packages/harness/myagentflow/authz/jwt.py（新建）`
**要写的逻辑**：base64url 解码 → `hmac.compare_digest` 验签 → 校验 `exp` / `iss` / `aud`；顺序不能反，先验签再读声明。

**代码**

```python
"""JWT 校验：HS256，手写。

为什么不用现成库：这一步要理解「先验签再读 payload」这件事，
顺序反了等于相信未经验证的内容。
"""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import time


def _b64d(part: str) -> bytes:
    pad = "=" * (-len(part) % 4)
    return base64.urlsafe_b64decode(part + pad)


def verify(token: str, secret: str, audience: str, issuer: str,
           now: float | None = None) -> dict:
    try:
        head_b64, body_b64, sig_b64 = token.split(".")
    except ValueError as exc:
        raise ValueError("token 结构不合法") from exc

    expected = hmac.new(secret.encode(), f"{head_b64}.{body_b64}".encode(), hashlib.sha256).digest()
    if not hmac.compare_digest(_b64d(sig_b64), expected):
        raise ValueError("签名不匹配")

    claims = json.loads(_b64d(body_b64))
    now = now or time.time()
    if claims.get("exp") and now > claims["exp"]:
        raise ValueError("token 已过期")
    if claims.get("aud") != audience:
        raise ValueError("audience 不匹配")
    if claims.get("iss") != issuer:
        raise ValueError("issuer 不匹配")
    return claims
```

**验证**

```bash
uv run python -c "
import base64, hashlib, hmac, json, time
def b64(o): return base64.urlsafe_b64encode(json.dumps(o).encode()).decode().rstrip('=')
h, b = b64({'alg':'HS256'}), b64({'sub':'u1','aud':'myaf','iss':'myaf','exp':time.time()+60})
sig = base64.urlsafe_b64encode(hmac.new(b'k', f'{h}.{b}'.encode(), hashlib.sha256).digest()).decode().rstrip('=')
from myagentflow.authz.jwt import verify
print(verify(f'{h}.{b}.{sig}', 'k', 'myaf', 'myaf')['sub'])
"
```

### Step 2　新建测试辅助：helpers_jwt.py
**文件**：`tests/chapters/helpers_jwt.py（新建）`
**要写的逻辑**：测试里造合法 token 不能靠复制粘贴 Step 1 的 bash 片段，抽成一个可复用的 `make_token()`；**辅助代码不是被测代码**，所以放 `tests/` 而不是 `myagentflow/authz/`。

**代码**

```python
"""测试用 HS256 token 生成器（只服务测试，不参与运行时）。"""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import time

SECRET = "k"          # 与测试里 verify(..., "k", ...) 保持一致


def _b64(obj: dict) -> str:
    raw = json.dumps(obj, separators=(",", ":")).encode()
    return base64.urlsafe_b64encode(raw).decode().rstrip("=")   # JWT 用无填充 base64


def make_token(sub: str = "u1", exp_offset: float = 60,
               aud: str = "myaf", iss: str = "myaf",
               secret: str = SECRET) -> str:
    """exp_offset 是相对现在的秒数：正数=未来过期，负数=已过期。"""
    header = _b64({"alg": "HS256", "typ": "JWT"})
    body = _b64({"sub": sub, "aud": aud, "iss": iss, "exp": time.time() + exp_offset})
    sig = base64.urlsafe_b64encode(
        hmac.new(secret.encode(), f"{header}.{body}".encode(), hashlib.sha256).digest()
    ).decode().rstrip("=")
    return f"{header}.{body}.{sig}"
```

**验证**

```bash
uv run python -c "
from tests.chapters.helpers_jwt import make_token
print(make_token()[:24], '...')
"
# 期望：打印三段式 token 的开头，形如 eyJhbGciOiJIUzI1NiIs...
```

### Step 3　写测试：篡改 payload 必失败
**文件**：`tests/chapters/test_ch11_02_jwt.py（新建）`
**要写的逻辑**：改一位 payload 后验签失败；过期 token 报错。

**代码**

```python
from __future__ import annotations

import pytest


def test_tamper_detected():
    from tests.chapters.helpers_jwt import make_token
    from myagentflow.authz.jwt import verify

    good = make_token(sub="u1", exp_offset=60)
    claims = verify(good, "k", "myaf", "myaf")
    assert claims["sub"] == "u1"

    bad = good[:-2] + ("aa" if good[-2:] != "aa" else "bb")
    with pytest.raises(ValueError):
        verify(bad, "k", "myaf", "myaf")

    with pytest.raises(ValueError):
        verify(make_token(sub="u1", exp_offset=-10), "k", "myaf", "myaf")
```

**验证**

```bash
uv run pytest tests/chapters/test_ch11_02_jwt.py -v
# 期望：1 passed（Token 由 Step 2 的 helpers_jwt 生成）
```

### 与 EvoFlow 对照

| 我们的做法 | EvoFlow | 为什么 |
|---|---|---|
| 先验签再读声明 | `authz/` 的 JWT 校验 | 顺序反了等于信任未验签内容 |
| exp/aud/iss 三项都查 | 同文件 | 只查 exp 会接受别的服务发的 token |

### 知识点

- [提示词注入四层防御：为什么 token 之外还要守内容](https://harbor404.fushenlin.com/notes/agent-prompt-injection-defense/)

### 验收

```bash
uv run pytest tests/chapters/test_ch11_02_jwt.py -q
```
