# 第 3 章　Owned Knowledge 与知识地图

## 本章目标
让「知识」成为一种有归属、有结构的资产：属于某个工作区/项目，并能以脑图形式呈现。

## 最小闭环
创建知识库 → 导入资料 → 看到目录树 → 在对话中按知识库范围检索。

## 真实模块地图（源码证实：路径存在）
| 职责 | 路径 |
|---|---|
| Owned 知识 | `packages/harness/evoflow/knowledge/owned/` |
| 目录/文件夹 | `knowledge/folders.py` |
| 服务层 | `knowledge/service.py` |
| 路由 | `app/gateway/routers/knowledge_owned.py` |

## 核心概念
- **归属（ownership）**：知识库绑定 workspace/user，检索时默认只搜自己有权限的。
- **知识地图**：节点 = 主题，边 = 从属/相关；由文档结构 + 记忆巩固共同生成。
- **作用域隔离**：团队知识 vs 个人知识必须能共存且不串味。

## 自研实现要点
```text
kb(id, owner_scope, name, created_at)
kb_doc(kb_id, doc_id); kb_node(node_id, kb_id, parent_id, title, ref_chunk_ids)
检索时先过滤 kb_id ∈ 当前 scope，再做向量检索
```

## 业务规则
- 跨知识库检索必须显式指定，不做隐式全局召回。
- 知识地图节点可追溯到源 chunk。

## 常见坑
- 权限只在 UI 做过滤，检索层不过滤 → 越权召回。
- 思维导图与源文档脱钩，改文档后图不更新。

## 验收
- [ ] 未授权知识库检索不到
- [ ] 地图节点可点回原文
- [ ] 文档更新后地图增量刷新

## 对照 EvoFlow 核对清单
- [ ] `knowledge/owned/` 的存储形态
- [ ] 知识地图生成管线（memory + knowledge 交汇）
