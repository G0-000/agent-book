# 第 05.2 章　召回、快照与注入

> 状态：✅ 样板章（正文按六节写完；最小召回/快照/注入已接 `/api/chat`，完整化边界见 §6）。
> 所属：第 05 篇　长期记忆与资产

## 1. 功能与知识点

### 功能

用户在新 thread 提到旧偏好，Agent 能召回相关记忆，并把记忆作为“参考数据”放进 prompt，而不是当成新的系统指令。

这里有两个不同通道，不能混：

- **Standing memory（常驻记忆）**：每轮都可能注入的稳定摘要、事实、pin。入口是 `format_memory_for_injection`。
- **Archival recall（按 query 召回）**：只有当前消息值得检索时才查，命中结果格式化成单独的 archival 块。入口是 `facade.recall` → `format_atoms_block`。

### 知识点如何体现

| 知识点 | 在本功能里体现为 | 可观察证据 |
|---|---|---|
| 长期记忆不是聊天记录 | 只有 `remember` 写入的 atom 才参与召回；task JSON 的对话历史不会被当成长期事实 | 新 thread 能召回旧偏好，但看不到旧 thread 的原始对话 |
| 检索排序 | 关键词命中数、importance、pin 共同决定顺序；无 query 时按 importance + 更新时间 | 两条记忆同时命中，pin/importance 高的排前面 |
| 预算裁剪 | `max_chars` 限制最终注入长度，超出时截断尾部 | 超长命中集合被裁到预算内 |
| 召回快照 | 同一轮 prompt 使用同一份命中副本，UI/审计可回看 | 同一 thread 连续读快照得到同一组 hit |
| 注入防御 | 记忆块声明为 untrusted data；其中像指令的句子不得执行 | 记忆正文含“忽略系统指令”时，输出仍只是背景文本 |

**最小验收**：thread A 写入偏好 → thread B 用 query 召回 → 生成 archival 块 → 快照记录该轮命中；全程不需要 LLM。

## 2. 最小调用链

### 2.1 本地已实现链路

```mermaid
flowchart TD
    A[新 thread 用户消息] --> B[构造 query]
    B --> C[facade.recall(namespaces, query, top_k, max_chars)]
    C --> D[store.search_keyword_ns]
    D --> E[按命中/importance/pin 排序]
    E --> F[facade._filter_archived]
    F --> G[facade._budget 字符预算]
    G --> H[facade.format_atoms_block]
    H --> I[recall_snapshot.record_thread_recall]
    I --> J[拼进本轮 prompt 的 archival 段]
```

两个分支：

- `query` 为空：不检索，按 importance + 更新时间取该 namespace 的活跃 atom。
- `query` 非空：先取 `top_k * 3`（至少 12）候选，再过滤、截断到 `top_k` 和字符预算。

### 2.2 EvoFlow 的真实入口

上游不是在一个函数里全部做完，而是分两处：

- 常驻记忆：`agents/lead_agent/prompt.py: _get_memory_context()` → `agents/memory/prompt.py: format_memory_for_injection()` → `<memory>` 块。
- 按 query 召回：`agents/lead_agent/prompt.py: build_memory_query_recall_sections()` → `memory/facade.py: recall()` → `format_atoms_block()` → `recall_snapshot.record_thread_recall()`。

这解释了为什么本地要保留两套格式化：`format_memory_for_injection` 处理 `memory_data`（user/facts 结构），`format_atoms_block` 处理召回返回的 atom 列表。两者输出都必须是数据块，不是指令。

### 2.3 失败点

- namespace 为空：直接返回空列表，不抛异常。
- memory 文件/SQLite 不可用：应降级为空召回，不阻断主回答。
- 命中为空：archival 段为空，prompt 不出现空标签。
- 快照写入失败：不能影响本轮回答；快照是旁路审计，不是主链路。

## 3. 代码创建

按调用方向建，不按概念顺序建：

| 顺序 | 文件 | 本章职责 | 关键符号 |
|---|---|---|---|
| 1 | `memory/store.py` | 查活跃 atom、关键词命中、排序、更新访问时间 | `search_keyword_ns`、`touch_accessed` |
| 2 | `memory/facade.py` | 召回门面、归档过滤、字符预算、atom 块格式化 | `recall`、`_filter_archived`、`_budget`、`format_atoms_block` |
| 3 | `memory/recall_snapshot.py` | 冻结本轮命中，供 UI/审计读取 | `record_thread_recall`、`get_thread_recall` |
| 4 | `agents/memory/prompt.py` | 常驻记忆格式化与 untrusted 声明 | `format_memory_for_injection` |
| 5 | 调用方 | 先手写 query 验证，再接 Agent 入口 | 当前未接 `build_graph` |

### 3.1 召回门面

```python
def recall(
    namespaces: list[str],
    query: str,
    *,
    layers: list[str] | None = None,
    top_k: int = 8,
    max_chars: int = 1000,
    query_embedding: list[float] | None = None,
) -> list[dict[str, Any]]:
    """关键词召回；向量参数保留但当前不参与。"""
    del query_embedding
    ns = [n for n in namespaces if n]
    q = (query or "").strip()
    if not ns:
        return []
    if not q:
        hits = []
        for n in ns:
            hits.extend(mem_store.list_namespace_atoms(n, layers=layers, limit=top_k))
        hits.sort(
            key=lambda a: (float(a.get("importance") or 0), a.get("updated_at") or ""),
            reverse=True,
        )
        return _budget(hits[:top_k], max_chars)

    kw = mem_store.search_keyword_ns(ns, q, top_k=max(top_k * 3, 12), layers=layers)
    mem_store.touch_accessed([a["id"] for a in kw if a.get("id")])
    return _budget(_filter_archived(kw, q)[:top_k], max_chars)
```

这里要看三件事：候选为什么放大三倍、`touch_accessed` 为什么在过滤前、预算为什么放在最后。

### 3.2 注入格式化

```python
def format_atoms_block(atoms: list[dict[str, Any]], *, title: str = "Memory") -> str:
    """格式化成 <memory> 块；空列表返回空串。"""
    if not atoms:
        return ""
    lines: list[str] = []
    for atom in atoms:
        text = (atom.get("summary") or atom.get("content") or "").strip()
        if not text:
            continue
        layer = atom.get("layer") or ""
        kind = atom.get("kind") or ""
        prefix = f"[{layer}:{kind}] " if kind else f"[{layer}] "
        pin = "★ " if atom.get("pin") else ""
        lines.append(f"- {pin}{prefix}{text}")
    if not lines:
        return ""
    body = "\n".join(lines)
    tag = title.lower().replace(" ", "_")
    return f"<{tag}>\n{body}\n</{tag}>"
```

注意：这里没有删除可疑文本，只是包边界；删除会破坏证据，边界声明和下游扫描才是防御。

### 3.3 快照

```python
def record_thread_recall(
    thread_id: str,
    *,
    query: str = "",
    standing_preview: str = "",
    hits: list[dict[str, Any]] | None = None,
    source: str = "turn",
) -> None:
    """写快照；空 thread_id 直接忽略。"""
    tid = (thread_id or "").strip()
    if not tid:
        return
    compact = []
    for h in hits or []:
        if not isinstance(h, dict):
            continue
        text = str(h.get("summary") or h.get("content") or "").strip()
        if not text:
            continue
        compact.append({
            "id": str(h.get("id") or ""),
            "namespace_id": str(h.get("namespace_id") or ""),
            "layer": str(h.get("layer") or ""),
            "kind": str(h.get("kind") or ""),
            "content": text[:240],
            "pin": bool(h.get("pin")),
        })
        if len(compact) >= 24:
            break
    ...
```

快照存的是副本，不是 atom 引用；单条正文截到 240 字符，最多 24 条，线程上限由模块常量控制。

## 4. 测试

### 4.1 先写失败用例

```python
def test_archival_recall_formats_and_snapshots(data_dir):
    ns = user_ns("u1")
    atom_id = facade.remember(
        ns, "用户偏好简短的中文回答",
        kind="preference", subject_key="response_style", source="user",
    )
    hits = facade.recall([ns], "中文回答", top_k=3)
    assert [a["id"] for a in hits] == [atom_id]

    block = facade.format_atoms_block(hits, title="memory_archival")
    assert block.startswith("<memory_archival>")
    assert "简短的中文回答" in block

    recall_snapshot.record_thread_recall("thread-b", query="中文回答", hits=hits)
    snap = recall_snapshot.get_thread_recall("thread-b")
    assert snap["hit_count"] == 1
```

### 4.2 覆盖矩阵

| 类型 | 用例 | 验证什么 |
|---|---|---|
| 正常 | `test_short_and_long_memory_call_flow` | thread A 写入，thread B 召回 |
| 排序 | `test_facade_noise_filter_and_recall` | 低置信度被过滤，命中排序正确 |
| 格式化 | `test_get_core_and_format_block` | 常驻块/召回块的标签与内容 |
| 预算 | 追加 `max_chars` 边界用例 | 超长命中被截断，空命中返回空串 |
| 快照 | `test_recall_snapshot_trims_and_copies` | 24 条上限、副本语义、线程隔离 |
| 注入 | `test_prompt_wraps_untrusted_and_compact_filters` | untrusted 声明与 compact 过滤 |

### 4.3 运行

```bash
cd /Users/main/my-agent-flow/backend
uv run pytest tests/chapters/test_ch04_01_memory.py tests/chapters/test_ch04_02_consolidate.py -q
```

当前结果：`14 passed`（这两个文件合计）。

## 5. 完整化

最小闭环通过后，按顺序加，不要一次全上：

1. **混合召回**：关键词 + 向量 + 重排；先保留关键词兜底，向量失败不影响主链路。
2. **命名空间/权限过滤**：按 principal 只召回可见 namespace；无权时返回空，不泄露存在性。
3. **去重**：同一 atom 被多路命中只保留一次；archival 与 standing 重叠时以 standing 为主。
4. **注入扫描**：对记忆正文做 prompt injection 扫描，命中只标记/降权，不直接删除证据。
5. **接入 Agent 入口**：每轮构造 query → 召回 → 快照 → 拼 prompt；召回失败降级为空。
6. **可观察性**：记录 `query`、命中 id、预算前后字符数、是否降级；不要把完整记忆正文写进普通日志。

每一项都要有独立测试。没有测试的扩展不算完成。

## 6. 边界与验收

### 本章不做什么

- 召回是关键词，不是向量；`query_embedding` 只是保留签名。
- 快照是进程内、按 thread 的旁路副本，不跨进程持久化。
- 不自动从对话抽取事实；自动抽取属于 05.4。
- 已接最小闭环：`/api/chat` 用 `user:default` 做关键词召回 → 快照 → `build_system_prompt(memory_block=...)`；但向量/混合/多用户权限未接，不能声称“完整长期记忆”。

### 验收

```bash
cd /Users/main/my-agent-flow/backend
uv run pytest tests/chapters/test_ch04_01_memory.py tests/chapters/test_ch04_02_consolidate.py -q
```

预期：`14 passed`。若失败，先查三处：`MYAF_DATA_DIR` 是否隔离、`MYAF_MEMORY_DB` 是否指到临时库、`reset_paths_cache()` 是否在 fixture 里调用。

### 下一章依赖

05.3 会在本章的 atom/召回之上做巩固、冲突与治理；本章的 `format_atoms_block` 和快照字段是后续治理审计的输入。

代码测试：`tests/chapters/test_ch05_02_injection.py` 2 个用例，覆盖 standing + archival 注入和空 namespace。
