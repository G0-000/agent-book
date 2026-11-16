# 第 4 章　Workspace 代码索引与符号上下文

## 本章目标
让 Agent 在读代码时不必「全文搜索 + 猜」，而是用符号表和引用关系精确定位。

## 最小闭环
打开工作区 → 建索引 → 「函数 X 定义在哪」→「谁调用了 X」→ 给出文件:行号。

## 真实模块地图（源码证实：路径存在）
| 职责 | 路径 |
|---|---|
| 索引存储 | `code_index/store.py`（`<workspace>/.evoflow/code_index/index.db`，FTS5） |
| 符号与引用 | `code_index/symbols.py`、`internal_refs.py`、`import_bindings.py`、`type_relations.py` |
| 语法解析 | `code_index/tree_sitter_core.py`、`tokenize.py` |
| LSP | `code_index/lsp_client.py`、`lsp_pool.py` |
| 文件监视 | `code_index/watcher.py` |
| 结果格式化 | `code_index/format_results.py`、`deps.py` |

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

## 对照 EvoFlow 核对清单
- [ ] `code_index/store.py` 的表结构与 FTS5 用法
- [ ] LSP 与 tree-sitter 的降级策略
