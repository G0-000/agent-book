# 第 2 章　JWT、OIDC、Guardrails 与入口保护

## 本章目标
把认证（你是谁）与护栏（你能干什么/说什么）分开实现，且都能被配置。

## 最小闭环
OIDC 登录换 JWT → 请求带 token → 校验 → 进入业务；命中护栏规则 → 拦截并记录。

## 真实模块地图（源码证实：路径存在）
| 职责 | 路径 |
|---|---|
| Web 认证 | `packages/harness/evoflow/webui/auth.py`、`middleware.py` |
| OIDC | `webui/oidc.py`、`oidc_config.py` |
| 护栏 | `guardrails/builtin.py`、`middleware.py`、`provider.py` |
| 内容扫描 | `agents/content_scanner.py` |
| 安全设置 | `app/gateway/routers/security_settings.py`、`codex_auth.py` |

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

## 对照 EvoFlow 核对清单
- [ ] `guardrails/provider.py` 的扩展接口
- [ ] `oidc_config.py` 的必需字段
