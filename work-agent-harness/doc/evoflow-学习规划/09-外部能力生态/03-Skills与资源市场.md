# 第 3 章　Skills、资源市场与 Community Provider

## 本章目标
把「一类任务的做事方法」打包成可安装、可版本化的资产，而不是每次靠提示词重新教。

## 最小闭环
安装一个 skill 目录（含 `SKILL.md`）→ 触发时按描述命中 → 加载正文与脚本 → 执行后产出文件。

## 真实模块地图（源码证实：路径存在）
| 职责 | 路径 |
|---|---|
| 加载与解析 | `packages/harness/evoflow/skills/loader.py`、`parser.py`、`frontmatter.py` |
| 选择与注入 | `skills/selection.py`、`injection.py`、`active.py`、`bound.py` |
| 安装 | `skills/installer.py`、`user_install.py`、`skillhub_pack.py` |
| 安全校验 | `skills/security.py`、`validation.py` |
| 作用域/路径 | `skills/skill_scope.py`、`paths.py`、`skill_uri.py` |
| 路由 | `app/gateway/routers/skills.py` |
| 公共 skills | 仓库根 `skills/public/`、`skills/EVOFLOW_TOOLS.md` |

## 核心概念
- **描述即路由**：`description` 是触发器，写得含糊就永远不命中或误命中。
- **渐进加载**：先只加载 `name/description`，命中后才读正文（省 token）。
- **目录即包**：`SKILL.md` + `scripts/` + `assets/`，可整体安装/卸载。
- **安全**：skill 可含脚本 → 必须校验来源与可执行范围。

## 自研实现要点
```text
skills(id, name, description, path, version, scope, installed_at)
match(query): 描述关键词 + 语义 → top1 → 读正文 → 注入
```

## 业务规则
- skill 名唯一；重名安装需显式覆盖。
- skill 内的脚本继承会话的工具权限，不额外提权。
- 卸载必须清理注入缓存。

## 常见坑
- 把长文档写进 `SKILL.md` 正文 → 命中即爆上下文。
- description 写成「帮助用户」→ 永不命中。
- 安装了但选择器没刷新 → 用不上。

## 验收
- [ ] 描述命中率可测试
- [ ] 未命中不注入正文
- [ ] 安装/卸载幂等

## 对照 EvoFlow 核对清单
- [ ] `skills/selection.py` 的匹配算法
- [ ] `skillhub_pack.py` 的包格式
