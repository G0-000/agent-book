# 第 4 部分　记忆与长期资产 / Memory and Long-Term Assets

> 状态：✅ 三章组件级实现已验收（`2026-11-24`，`test_ch04_*.py` 19 passed）；源码核对 ✅ 三章已做行为级对照（`2026-11-24`）。
> 运行时接线：记忆存储、巩固、注入格式化均未接入 `build_graph` 或 system prompt；Agent 运行入口当前没有调用这些记忆组件。

目标（组件层）：你能亲手把当前 thread 的消息写成短期记忆，把明确选出的事实写成长记忆，再从新 thread 召回并格式化；当前只验证到组件调用，未接入 Agent 入口。

## 这一部分解决什么

先从第 1 章的可运行练习开始：

1. `AgentMemoryManager.add_to_task_history()` 把 user / assistant 消息写到当前 thread 的 task JSON；thread 不同，短期历史隔离。
2. 调用方明确挑出值得跨会话保留的事实，再用 `facade.remember()` 写进长期 atom；同一 `subject_key` 更新同一条记录。
3. 新 thread 用 `facade.recall()` 按用户 namespace 搜索，随后显式记录 `recall_snapshot` 并格式化成 `<memory>` 块。

这条练习展示的是本项目已有组件如何协作。`remember()` 不会自动读取聊天记录或调用 LLM 抽取事实；当前也没有 Agent 入口自动保存消息、触发召回或拼装 system prompt。不要把“长期记忆写入”误读为“聊天后自动形成长期记忆”。

EvoFlow 的记忆不是「把整段对话塞进向量库」，而是几条有不同生命周期的路径：

1. **短期层**：对话消息属于当前 thread；本项目练习把 user / assistant 文本写入 thread task JSON。
2. **长期层**：一条事实一个 atom，按命名空间隔离；同一 `subject_key` 只保留一个有效值。
3. **注入层**：召回结果按预算裁剪，包进 `<memory>` 并声明为不可信数据，最后由 system prompt 拼装。

本部分只复刻**存储与规则组件**，不接 Agent 入口，也不实现 EvoFlow 的异步记忆队列、工作区记忆和 LLM 事实抽取。EvoFlow 的长记忆自动生成入口可继续读上游 `agents/memory/queue.py` → `agents/memory/updater.py:MemoryUpdater.update_memory()`；本地没有复刻这条 LLM 管线。

## 上游文件地图

行数为本地实测；「保留」只列本部分真正实现并测试过的符号，未列出的上游能力一律视为未复刻。

| EvoFlow 上游文件（行数） | 本项目文件（行数） | 章 | 保留与裁剪 |
|---|---|---|---|
| `memory/namespaces.py`（39） | `memory/namespaces.py`（59） | 1 | 保留 `user_ns` / `agent_ns` / `workspace_ns` / `person_ns` / `parse_namespace`；四类命名空间与上游一致，没有 `session` 命名空间 |
| `agents/memory/agent_memory.py`（214） | `agents/memory/agent_memory.py`（153） | 1 | 保留 agent/task 两级 JSON、`get_combined_memory`、`add_fact_to_agent_memory`、`add_to_task_history`；简化日志与异常文案 |
| `memory/store.py`（747） | `memory/store.py`（497） | 1、2 | 保留 `mem_namespaces` / `mem_atoms`、`upsert_atom`、`soft_delete_atom`、`supersede_atom`、关键词召回、`touch_accessed`；省略向量列、FTS5 外部表、实体表、`mark_atom_stale` |
| `memory/facade.py`（375） | `memory/facade.py`（258） | 1、2 | 保留 `remember` / `forget` / `consolidate` / `recall` / `get_core`；省略 `pin_atom`、`mark_atom_stale`、`mark_related_memories_stale`、`list_atoms`、自动入队与向量召回 |
| `memory/recall_snapshot.py`（90） | `memory/recall_snapshot.py`（111） | 1 | 保留同一套进程内快照：每线程最多 24 条命中、500 个线程上限、`get` 返回副本 |
| `memory/consolidate.py`（318） | `memory/consolidate.py`（219） | 2 | 保留 `text_overlap`、`_keep_prefer`、`_merge_content`、`consolidate_namespace`、`should_enqueue_threshold`；省略衰减、GC、异步 job、embedding 相似度 |
| `agents/memory/prompt.py`（427） | `agents/memory/prompt.py`（134） | 2 | 保留 `format_memory_for_injection` 与 `full` / `chat_compact` 两档；省略记忆更新 prompt、history 段、tiktoken 计数、`_standing_fact_allowed` 过滤 |
| `artifacts/chat_artifact.py`（229） | `artifacts/chat_artifact.py`（201） | 3 | 保留六类产物、稳定 id、批量去重、`ThreadState` 字符串键；省略 `platform` 类型 |
| `items/models.py`（77） | `items/models.py`（99） | 3 | 保留状态/优先级枚举、`UserItem`、`to_public_dict`；字段与上游同名 |
| `items/store.py`（146） | `items/store.py`（157） | 3 | 保留 JSON 原子替换、mtime 缓存失效、增删改查；路径改 `MYAF_DATA_DIR` |
| `items/service.py`（890） | `items/service.py`（271） | 3 | 保留 `list_items` / `get_item` / `create_item` / `update_item` / `delete_item`；省略可见性过滤、Task 派发与回写、员工唤醒、inbox 迁移、完成时记忆 stale |
| `reflection/resolvers.py`（102） | `reflection/resolvers.py`（89） | 3 | 保留 `resolve_variable` / `resolve_class` 与 `module:attr` 错误分类 |
| `memory/storage.py`（135）、`memory/document_codec.py`（243） | — | — | 不上收：这是 Owned Memory 的文档编解码，留给知识库方向 |
| `agents/memory/queue.py`（387）、`updater.py`（464）、`workspace_memory.py`（578） | — | — | 不复刻：异步更新队列、LLM 事实抽取、工作区记忆属于后续阶段 |

## 核心概念不要混

| 概念 | 是什么 | 不是什么 | EvoFlow 对应 |
|---|---|---|---|
| atom（记忆原子） | 一条可独立召回、独立删除的事实，存在 `mem_atoms` 一行 | 不是一整份 `memory.json`，也不是一条聊天消息 | `memory/store.py: upsert_atom` |
| namespace（命名空间） | 记忆的归属域：`user:` / `agent:` / `workspace:` / `person:` | 不是数据库 schema，也不是 thread_id | `memory/namespaces.py` 四个构造函数 |
| layer / kind | layer 是记忆层次（episodic / semantic / procedural），kind 是内容类别（fact / preference / context…） | 不是权限角色，也不决定召回算法 | `_norm_layer` 与 `kind` 字段 |
| subject_key（弱图谱） | 同一实体/主题的关联键；同键写入复用原 atom、`revision += 1` | 不是图数据库，不是外键，也不保证实体消歧 | `store.upsert_atom` 的 `replace_subject` 分支 |
| revision / supersede | 同 subject 更新时 revision 递增；巩固时被合并的行写 `superseded_by` 并软删 | 不是物理删除，也不是版本控制快照 | `supersede_atom` / `update_atom_fields` |
| pin / importance / confidence / vitality | pin 是人工保护；importance 决定排序；confidence 过滤噪声；vitality 决定是否归档 | 不是四个可以互相替代的分数 | `facade.remember` 的噪声门与 `_filter_archived` |
| recall snapshot（召回快照） | 本轮召回结果的只读副本，供 UI 和审计回看 | 不是长期记忆，不跨进程持久化 | `memory/recall_snapshot.py` |
| consolidation（巩固） | 确定性合并同 subject 与高文本重叠条目，可带衰减/GC | 不是 LLM 总结，不是异步队列本身 | `memory/consolidate.py` |

另外三类长期资产也要分开：

| 类型 | 载体 | 生命周期 | 典型内容 |
|---|---|---|---|
| 工作记忆 | 上下文窗口 | 单轮/压缩周期 | 当前任务中间结论 |
| 会话记忆 | 消息表 + task 记忆 | 一个 thread | 本轮确认的事实 |
| 长期记忆 | `memory.json` + `mem_atoms` | 跨会话 | 用户偏好、领域事实 |
| 产物 artifact | 会话产物契约 | 随会话展示 | 图片、PDF、网页、链接 |
| 事项 item | `user_items.json` | 用户手动维护 | 待办、跟进、个人任务 |
| 反思 resolver | `module:attr` 运行时解析 | 配置驱动 | 按配置加载类/对象 |

## 一条记忆的完整路径

```text
写入：facade.remember
  → 置信度噪声门（conf < 0.55 且非 pin/无 subject/非 user 来源直接丢）
  → store.upsert_atom（同 subject 复用 atom，revision + 1）
  → 达到阈值后由调用方显式 consolidate（本项目不自动入队）

召回：facade.recall(namespaces, query)
  → search_keyword_ns（关键词命中数 + importance + pin）
  → touch_accessed（更新 last_accessed_at）
  → _filter_archived（低 vitality 非 pin 丢弃）
  → _budget（按字符预算裁剪）
  → recall_snapshot.record_thread_recall（冻结本轮命中）

注入：agents.memory.prompt.format_memory_for_injection
  → <memory> 包裹 + untrusted data 声明
  → build_graph/system prompt 拼装（本项目尚未接线）
```

## 章节

| 章 | 主题 | 主要文件 | 知识点 |
|---|---|---|---|
| [1](01-短期记忆与长期记忆.md) | 短期写入、长期事实写入与跨 thread 召回 | `agents/memory/`、`memory/`、`config/paths.py` | task JSON、atom、namespace、subject_key、revision、快照 |
| [2](02-记忆巩固知识图谱与注入防御.md) | 确定性巩固、`subject_key` 弱图谱、注入声明 | `memory/consolidate.py`、`agents/memory/prompt.py` | 文本重叠、pin 优先、supersede、untrusted data |
| [3](03-资产产物事项与反思.md) | 产物契约、用户事项、反射解析 | `artifacts/`、`items/`、`reflection/` | 稳定 id、artifact/item/task 边界、JSON 原子写、`module:attr` |

## 本章边界

- 召回是关键词，不是向量；`query_embedding` 只保留签名。
- 巩固是确定性合并，pin 优先；不调 LLM，不做衰减/GC 或异步队列。
- 事项只做 CRUD，不派发 Task，不做可见性过滤。
- 记忆注入只做边界声明，不替换内容；当前未接入 system prompt。
- 产物只复刻六类通用类型，不复刻 `platform` 卡片。

## 验收口径

```bash
cd /Users/main/my-agent-flow/backend
uv run pytest tests/chapters/test_ch04_*.py -q   # 19 passed
uv run pytest tests/chapters -q                 # 124 passed
uv run ruff check packages tests                # All checks passed
```

## 源码核对记录（路径与符号实测）

| 章 | 已读上游文件 | 行为结论 | 状态 |
|---|---|---|---|
| 1 | `memory/namespaces.py`、`agents/memory/agent_memory.py`、`memory/store.py`、`memory/facade.py`、`memory/recall_snapshot.py` | 四类命名空间、agent/task 双文件、同 subject 复用 revision、软删、快照上限与副本语义均与上游一致；本地省略向量、stale、自动入队 | ✅ 行为级 |
| 2 | `memory/consolidate.py`、`agents/memory/prompt.py` | A1 同 subject、A2 文本相似、pin 保护、`<memory>` 边界一致；本地省略衰减/GC、embedding 相似、history 注入与事实过滤 | ✅ 行为级 |
| 3 | `artifacts/chat_artifact.py`、`items/models.py`、`items/store.py`、`items/service.py`、`reflection/resolvers.py` | 产物稳定 id、事项 CRUD、JSON 原子写、反射解析一致；本地省略 platform 产物、可见性过滤、Task 派发/回写/迁移 | ✅ 行为级 |

> 行为级指：本章声明的行为已逐段读过上游实现，差异写入各章「与 EvoFlow 对照」；不代表本地实现了上游全部能力。
