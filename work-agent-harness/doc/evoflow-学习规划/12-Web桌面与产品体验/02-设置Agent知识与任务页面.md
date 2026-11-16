# 第 2 章　设置、Agent、知识、任务与管理页面

## 本章目标
让「配置」变成可理解的产品界面，而不是让人改 YAML。

## 最小闭环
设置页改模型 → 保存 → 立即生效（下一次请求用新模型）→ 有变更记录。

## 真实模块地图（源码证实：路径存在）
| 职责 | 路径 |
|---|---|
| 前端页面 | `evopanel/src/pages/`、`evopanel/src/react/`、`evopanel/src/components/` |
| 面板设置 API | `backend/app/gateway/routers/panel_settings.py` |
| 模型管理 API | `routers/models.py`、`packages/harness/evoflow/models/factory.py` |
| Agent 管理 | `routers/agents.py`、`packages/harness/evoflow/subagents/registry.py` |
| 知识/记忆 | `routers/knowledge.py`、`knowledge_owned.py`、`memory.py` |
| 任务/自动化 | `routers/sessions.py`、`automation_scheduler.py` |

## 核心概念
- **配置三层**：文件配置（启动项）→ 数据库配置（用户可改）→ 会话级覆盖（临时）。
- **生效半径**：改模型影响新 run，不影响正在跑的 run。
- **变更记录**：谁改了什么、什么时候，可回滚。
- **表单即 schema**：后端返回 schema，前端渲染，避免两边硬编码。

## 自研实现要点
```text
GET /settings/schema → {sections:[{key, type, default, help}]}
PUT /settings → 校验 → 落库 → 发布变更事件
```

## 业务规则
- 密钥字段永远不回显明文。
- 危险开关二次确认。
- 配置变更走审计。

## 常见坑
- 配置缓存不失效 → 改了不生效。
- 前端硬编码选项 → 后端新增值就崩。
- 密钥在 GET 响应里返回 → 泄露。

## 验收
- [ ] 改配置无需重启
- [ ] 密钥不明文回显
- [ ] 变更可回滚

## 对照 EvoFlow 核对清单
- [ ] `panel_settings.py` 的 schema 结构
- [ ] `models/factory.py` 的模型热切换
