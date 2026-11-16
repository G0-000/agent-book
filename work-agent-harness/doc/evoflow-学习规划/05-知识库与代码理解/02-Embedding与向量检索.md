# 第 2 章　Embedding、向量检索与引用

> **EvoFlow 对照状态 / Alignment status：** 🔍 结构已核对（路径、行数、符号均取自源码实测），**行为**（调用顺序、边界条件）尚未逐行核对。

## 本章目标
用最小的代价实现「能召回、能排序、能引用」的检索。

## 最小闭环
建索引 → 查询 → top-k 片段 → 注入上下文 → 回答带引用。

## 真实模块地图（已核对：路径 · 行数 · 符号）

| 文件 | 行数 | 关键符号 | 模块常量 |
|---|---|---|---|
| `packages/harness/evoflow/knowledge/service.py` | 687 | `_enrich_dataset`、`dataset_llm_index_enabled`、`list_datasets` | — |
| `packages/harness/evoflow/knowledge/index_builder.py` | 77 | `build_document_summary`、`enrich_chunk_indexes`、`embedding_text_for_chunk` | — |
| `app/gateway/routers/knowledge.py` | 418 | `CreateDatasetRequest`、`UpdateDatasetRequest`、`SyncLocalRequest`；`_org_admin_dep`、`list_knowledge_bases`、`create_knowledge_base` | — |

## 核心概念
- **混合检索**：向量（语义）+ BM25/FTS（关键词），两路结果融合（RRF 或加权）。
- **改写成查询**：多轮对话里先把「它」还原成实体再检索。
- **重排（rerank）**：top-50 → rerank → top-5，成本可控且效果显著。

## 自研实现要点
```text
embed(chunk.text) → 1536/768 维 → 存 sqlite-vec / faiss
retrieve(q): vec_top20 + fts_top20 → 去重 → rerank → 取 5 → 附 chunk_id
```

## 业务规则
- 向量维度与模型绑定，换模型必须重建索引（记录 `embedding_model` 版本）。
- 检索结果必须带 `score`，低分直接不注入（宁可不答也别乱答）。

## 常见坑
- 换 embedding 模型不重建 → 相似度全乱。
- 只做向量 → 专有名词查不到。
- 召回过量 → 上下文被垃圾片段占满。

## 验收
- [ ] 专有名词查询命中
- [ ] 语义改写查询命中
- [ ] 索引版本与模型版本一致

### 源码核对记录（路径与符号实测）

- `packages/harness/evoflow/knowledge/service.py`（687 行）
  - 模块自述：Knowledge base service layer — business logic for CRUD, file upload, search. All DB operations go through the …
- `packages/harness/evoflow/knowledge/index_builder.py`（77 行）
  - 模块自述：Build document summary + per-chunk index strings (rule-based, no user config).…
- `app/gateway/routers/knowledge.py`（418 行）：类 `CreateDatasetRequest`、`UpdateDatasetRequest`、`SyncLocalRequest`、`CreateFolderRequest`；环境变量 `EVOFLOW_HOME`、`EVOFLOW_KB_UPLOAD_DIR`
  - 模块自述：Knowledge base API router. Provides CRUD for knowledge bases, file upload, chunk listing, semantic search, and…

> 本节只证明**路径、行数、符号存在**；调用顺序与边界条件仍属「行为」，未逐行核对。

## 对照 EvoFlow 核对清单
- [ ] `knowledge/vector/` 的具体实现与表结构
- [ ] 是否内置 rerank
