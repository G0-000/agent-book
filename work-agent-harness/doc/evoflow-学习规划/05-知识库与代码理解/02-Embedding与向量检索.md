# 第 2 章　Embedding、向量检索与引用

## 本章目标
用最小的代价实现「能召回、能排序、能引用」的检索。

## 最小闭环
建索引 → 查询 → top-k 片段 → 注入上下文 → 回答带引用。

## 真实模块地图（源码证实：路径存在）
| 职责 | 路径 |
|---|---|
| 向量化 | `knowledge/embedding/` |
| 向量库 | `knowledge/vector/`（配置提到 `sqlite_vec`） |
| 索引编排 | `knowledge/service.py`、`index_builder.py` |
| 检索入口 | `app/gateway/routers/knowledge.py` |

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

## 对照 EvoFlow 核对清单
- [ ] `knowledge/vector/` 的具体实现与表结构
- [ ] 是否内置 rerank
