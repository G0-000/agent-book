# 第 3 章　Owned Knowledge 与知识地图

> **EvoFlow 对照状态 / Alignment status：** 🔍 结构已核对（路径、行数、符号均取自源码实测），**行为**（调用顺序、边界条件）尚未逐行核对。

## 本章目标
让「知识」成为一种有归属、有结构的资产：属于某个工作区/项目，并能以脑图形式呈现。

## 最小闭环
创建知识库 → 导入资料 → 看到目录树 → 在对话中按知识库范围检索。

## 真实模块地图（已核对：路径 · 行数 · 符号）

| 文件 | 行数 | 关键符号 | 模块常量 |
|---|---|---|---|
| `packages/harness/evoflow/knowledge/folders.py` | 176 | `root_folder_id`、`ensure_root_folder`、`list_folders` | ROOT_NAME |
| `packages/harness/evoflow/knowledge/service.py` | 687 | `_enrich_dataset`、`dataset_llm_index_enabled`、`list_datasets` | — |
| `app/gateway/routers/knowledge_owned.py` | 840 | `ReindexBaseBody`；`list_bases`、`create_base`、`get_base` | — |

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

### 源码核对记录（路径与符号实测）

- `packages/harness/evoflow/knowledge/folders.py`（176 行）
  - 模块自述：Wiki-style folder tree for knowledge bases.…
- `packages/harness/evoflow/knowledge/service.py`（687 行）
  - 模块自述：Knowledge base service layer — business logic for CRUD, file upload, search. All DB operations go through the …
- `app/gateway/routers/knowledge_owned.py`（840 行）：类 `ReindexBaseBody`
  - 模块自述：Owned knowledge base Gateway API — local-first RAG (spec: owned-knowledge-base-spec.md).…

> 本节只证明**路径、行数、符号存在**；调用顺序与边界条件仍属「行为」，未逐行核对。

## 对照 EvoFlow 核对清单
- [ ] `knowledge/owned/` 的存储形态
- [ ] 知识地图生成管线（memory + knowledge 交汇）
