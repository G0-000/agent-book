# 第 5 部分　知识库与代码理解 / Knowledge Base and Code Understanding

> 状态：🟡 骨架（真实路径已核对）。目标：让 Agent 回答「只有你的资料里才有答案」的问题，并能读自己的代码库。

## 章节

| 章 | 主题 | 真实模块 |
|---|---|---|
| [1](01-上传解析与切块.md) | 上传解析与切块 | `knowledge/parser.py`、`chunker.py`、`wiki_chunker.py`、`uploads/` |
| [2](02-Embedding与向量检索.md) | Embedding、向量检索与引用 | `knowledge/embedding/`、`knowledge/vector/`、`index_builder.py` |
| [3](03-Owned-Knowledge与知识地图.md) | Owned Knowledge 与知识地图 | `knowledge/owned/`、`folders.py`、`service.py`、`routers/knowledge_owned.py` |
| [4](04-Workspace代码索引.md) | Workspace 代码索引与符号上下文 | `code_index/`（tree-sitter + LSP + watcher） |

## 两条不同的知识通道

| 通道 | 数据 | 检索方式 | 典型问题 |
|---|---|---|---|
| 文档 RAG | 上传的 PDF/Word/MD | 向量 + 关键词混合 | 「合同里违约金怎么算」 |
| 代码索引 | 工作区源码 | FTS5 + 符号表 + 引用图 | 「谁调用了这个函数」 |

两者共享「切块 → 索引 → 检索 → 引用」骨架，但代码索引靠**结构**（符号、导入、调用）而不是纯语义。

## 关键原则

1. **引用必须可点回原文**：回答里带 chunk id / 文件:行号。
2. **切块要带上下文**：标题路径、文件路径、前后邻居。
3. **索引是增量产物**：文件变更 → 重切该文件 → 更新索引，不能全量重建。
4. **不索引密钥**：`.env`、凭证目录排除。

## 验收口径
- 上传 100 页 PDF，问细节能定位到页。
- 改一个文件后索引 10 秒内更新。
- 「某个函数被谁引用」能给出文件:行号列表。
