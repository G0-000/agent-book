# 第 4 章　Workspace 代码索引与符号上下文

> **EvoFlow 对照状态 / Alignment status：** 🔍 结构已核对（路径、行数、符号均取自源码实测），**行为**（调用顺序、边界条件）尚未逐行核对。

## 本章目标
让 Agent 在读代码时不必「全文搜索 + 猜」，而是用符号表和引用关系精确定位。

## 最小闭环
打开工作区 → 建索引 → 「函数 X 定义在哪」→「谁调用了 X」→ 给出文件:行号。

## 真实模块地图（已核对：路径 · 行数 · 符号）

| 文件 | 行数 | 关键符号 | 模块常量 |
|---|---|---|---|
| `packages/harness/evoflow/code_index/store.py` | 1927 | `resolve_index_root`、`_workspace_hash`、`index_db_path` | CODE_INDEX_REL_DIR、CODE_INDEX_DB_NAME |
| `packages/harness/evoflow/code_index/symbols.py` | 208 | `_append`、`_line_at`、`_regex_python_symbols` | — |
| `packages/harness/evoflow/code_index/internal_refs.py` | 173 | `_append_ref`、`extract_python_internal_refs`、`extract_js_ts_internal_refs` | — |
| `packages/harness/evoflow/code_index/import_bindings.py` | 144 | `python_import_aliases`、`_parse_js_named_bindings`、`js_ts_import_aliases` | — |
| `packages/harness/evoflow/code_index/type_relations.py` | 552 | `_line_at`、`_strip_generics`、`_split_type_parts` | — |
| `packages/harness/evoflow/code_index/tree_sitter_core.py` | 214 | `language_for_path`、`tree_sitter_available`、`parse_tree` | — |
| `packages/harness/evoflow/code_index/tokenize.py` | 145 | `index_tokenizer_version`、`split_identifier`、`_segment_cjk` | — |
| `packages/harness/evoflow/code_index/lsp_client.py` | 217 | `LspClient`；`_kind_name`、`flatten_document_symbols`、`_language_id` | — |
| `packages/harness/evoflow/code_index/lsp_pool.py` | 91 | `_session_key`、`get_lsp_client`、`try_lsp_symbols` | — |
| `packages/harness/evoflow/code_index/watcher.py` | 177 | `CodeIndexWatcherRegistry`；`_watch_key`、`start_index_watch`、`stop_index_watch` | — |
| `packages/harness/evoflow/code_index/format_results.py` | 134 | `format_search_index_body` | — |
| `packages/harness/evoflow/code_index/deps.py` | 395 | `_is_internal_spec`、`_discover_package_roots`、`_resolve_py_module` | — |

## 核心概念
- **FTS5 + 符号表**：文本检索给「大概位置」，符号表给「精确跳转」。
- **tree-sitter 优先，LSP 可选**：前者零依赖可离线，后者精度高但重。
- **增量**：watcher 只重解变更文件及其反向依赖。
- **预算**：返回给模型的不是整文件，而是签名 + 片段窗口。

## 自研实现要点
```text
symbols(file, name, kind, start_line, end_line, container)
refs(from_file, to_symbol, line)
query: name = "run" → 精确 → 前缀 → FTS
返回：path:line + 3 行上下文 + 调用者列表
```

## 业务规则
- 索引目录放工作区内（`.evoflow/code_index/`），随项目迁移。
- 大仓库必须限制索引文件数与体积，超出给警告。
- 二进制/生成物不索引。

## 常见坑
- 每次查询都全量解析 → 慢到不可用。
- 只做 grep → 同名函数混淆、无法区分定义与调用。
- 把整文件塞给模型 → 上下文爆。

## 验收
- [ ] 定义/引用查询准确率 ≥ 90%
- [ ] 增量更新 < 10s（中等仓库）
- [ ] 返回体积可控

### 源码核对记录（路径与符号实测）

- `packages/harness/evoflow/code_index/store.py`（1927 行）
  - 模块自述：SQLite FTS5 workspace index. When indexing runs ------------------ - **Full rebuild (blocking API)**: ``POST /…
- `packages/harness/evoflow/code_index/symbols.py`（208 行）
  - 模块自述：Per-language symbol extraction (tree-sitter first, LSP, AST/regex fallback).…
- `packages/harness/evoflow/code_index/internal_refs.py`（173 行）
  - 模块自述：Workspace-internal symbol use refs (Python / JS / TS / Java).…
- `packages/harness/evoflow/code_index/import_bindings.py`（144 行）
  - 模块自述：Map local import binding names -> workspace file paths.…
- `packages/harness/evoflow/code_index/type_relations.py`（552 行）
  - 模块自述：Class extends / implements (workspace-internal, best-effort).…
- `packages/harness/evoflow/code_index/tree_sitter_core.py`（214 行）
  - 模块自述：Unified tree-sitter symbol extraction (Python / JS / TS / Java).…
- `packages/harness/evoflow/code_index/tokenize.py`（145 行）
  - 模块自述：Code-aware tokenization for FTS index + query expansion. SQLite FTS5 ``unicode61`` keeps CamelCase identifiers…
- `packages/harness/evoflow/code_index/lsp_client.py`（217 行）：类 `LspClient`
  - 模块自述：Minimal LSP JSON-RPC client over stdio (documentSymbol).…
- `packages/harness/evoflow/code_index/lsp_pool.py`（91 行）
  - 模块自述：Pooled LSP sessions per (workspace, language server profile).…
- `packages/harness/evoflow/code_index/watcher.py`（177 行）：类 `CodeIndexWatcherRegistry`
  - 模块自述：Background workspace file watcher → incremental code index updates.…
- `packages/harness/evoflow/code_index/format_results.py`（134 行）
  - 模块自述：Format ``search_index`` payloads for tool output (shared by search tools).…
- `packages/harness/evoflow/code_index/deps.py`（395 行）
  - 模块自述：File-level import dependency extraction (Python / JS / TS / Java).…

> 本节只证明**路径、行数、符号存在**；调用顺序与边界条件仍属「行为」，未逐行核对。

## 对照 EvoFlow 核对清单
- [ ] `code_index/store.py` 的表结构与 FTS5 用法
- [ ] LSP 与 tree-sitter 的降级策略
