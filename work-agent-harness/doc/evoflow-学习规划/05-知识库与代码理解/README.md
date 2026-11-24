# 第 5 部分　知识库与代码理解 / Knowledge Base and Code Understanding

> 状态：✅ 代码已落地；`tests/chapters/test_ch05_*.py` 共 17 项通过。本部分实现的是离线最小闭环，不是 EvoFlow 全量知识库产品。

## 这一部分解决什么

Agent 有两类“外部知识”需求，处理链路不同：

- **文档知识库**：用户上传的 Markdown、文本、代码、docx/pptx，先解析、切块、向量化，再按相似度召回。
- **工作区代码**：不靠语义猜，靠符号表、FTS5 全文和 import/调用引用，回答“这个函数在哪、谁在调用”。

两条链路共享“解析 → 切块/结构化 → 落库 → 检索 → 引用”的骨架，但代码索引把结构信息放在第一位：符号名与行号必须准，语义检索只做兜底。

## 章节

| 章 | 主题 | 本项目实现 | 测试 |
|---|---|---|---|
| [1](01-上传解析与切块.md) | 上传解析与切块 | `parser.py`、`chunker.py`、`wiki_chunker.py`、`index_builder.py` | 5 |
| [2](02-Embedding与向量检索.md) | Embedding 与向量召回 | `embedding/`、`vector/sqlite_vec.py` | 4 |
| [3](03-Owned-Knowledge与知识地图.md) | Owned Knowledge 与知识地图 | `knowledge/owned/` | 4 |
| [4](04-Workspace代码索引.md) | 工作区代码索引 | `code_index/` | 4 |

## 两条通道的边界

| 通道 | 本章能力 | 本章不做什么 |
|---|---|---|
| 文档 RAG | 文本/Markdown/代码/docx/pptx 解析；PDF 需可选 `pypdf`；标题切块；64 维离线哈希向量；余弦召回 | 不接真实语义模型；不做 OCR；不做异步索引队列 |
| 代码索引 | Python AST 符号；FTS5 全文；Python import 别名；调用引用；单文件增量更新 | 不做 tree-sitter 全语言解析；不做 LSP；不做文件 watcher |

## 关键原则

1. **引用能回到原文**：块带 `char_start/char_end`，代码结果带 `path:line`。
2. **先结构后语义**：代码先查符号和引用，查不到再走 FTS；文档先按标题切，再向量召回。
3. **索引可增量**：同一个文件重索引先删旧符号/引用/FTS 行，再写新行。
4. **不索引依赖与密钥目录**：`.venv`、`node_modules`、`.git`、`.myaf` 直接跳过。

## 与 EvoFlow 的差异

| 主题 | EvoFlow | 本项目 | 原因 |
|---|---|---|---|
| 文档解析 | MarkItDown 统一转 Markdown | 文本直读 + docx/pptx stdlib 解包 + 可选 pypdf | 不引重依赖，保证离线可跑 |
| Embedding | 多 provider（OpenAI/本地模型） | 离线 BLAKE2 特征哈希，64 维 | 先跑通缓存/维度/召回链路 |
| 向量索引 | sqlite-vec `vec0` | 普通 SQLite 表 + Python 余弦 | 不装扩展，规模上限较低 |
| Owned Knowledge | 完整文档/任务/活动/标签/链接 | 建库、文档、目录、块、实体图 | 只保留本章闭环 |
| 代码解析 | tree-sitter + LSP + watcher | Python AST + 通用正则兜底 | 当前只追求 Python 项目可用 |
| 代码引用 | Python/JS/TS 导入绑定 | Python import 别名与 Call | 不假装支持未实现的语言 |

## 验收口径

```text
uv run pytest tests/chapters/test_ch05_*.py -q
17 passed, 13 warnings

uv run pytest tests/chapters -q
97 passed, 13 warnings
```

代码结果必须能给出 `文件:行号`；文档块必须能给出块 id、标题路径与字符区间。没有这些定位信息的“知识库”不算完成。
