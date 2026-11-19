# EvoFlow 功能与代码详解手册（0→1 复写用）

> **用途**：只讲清楚三件事——每个功能是什么、教材里代码怎么调、你自己要按什么顺序复写。**代码由你自己写**，本手册不代写实现。
>
> **教材基线**：EvoFlow `f22af53910a470ddba633be35e25878214c2984ec`（v1.3.22，2026-11-13），本机 EvoFlow 仓库。
> **本项目**：`<复刻仓库>`，包名 `myagentflow`（骨架已建，`uv sync` 已通过）。
> **许可**：EvoFlow 为 PolyForm Noncommercial。本手册只给源码位置、函数职责与调用关系，不复制教材实现。
>
> **每章结构**：① 功能理解 → ② 教材代码地图（真实函数/类）→ ③ 顺序执行链 → ④ 关键机制讲解 → ⑤ 复写设计 → ⑥ 复写步骤 → ⑦ 验收要点。
> 文中 `evoflow/...` 均指 `backend/packages/harness/evoflow/...`，`app/...` 指 `backend/app/...`。

---

# 第一部分 全局认识

## 第 0 章 系统怎么组成的

### 0.1 分层与数据流

```text
EvoPanel / Web / IM 渠道
   ▼ HTTP / SSE / 渠道消息
app/gateway（FastAPI：create_app + lifespan + routers）
   ▼ import evoflow.*（单向）
evoflow 核心层
   ├─ agents/lead_agent.make_lead_agent  ← langgraph.json 注册
   ├─ models.create_chat_model           ← 模型工厂
   ├─ tools / middlewares                ← 工具与调用链
   ├─ persistence                        ← 唯一 DB owner（SQLite）
   └─ runtime/ports                      ← 核心层回调应用层的唯一通道
   ▼
LangGraph 执行 + SQLite（业务库 / 观测库 / checkpoint 库）
```

**两条硬规则**（教材 `backend/ARCHITECTURE.md`，本项目照抄规则不照抄代码）：

- R1：`evoflow/`（本项目 `myagentflow/`）内不得 `import app.*`；需要应用层能力就在 `runtime/ports.py` 注册/获取。
- R2：新增包要登记职责；单包文件数别膨胀（教材 `agents/middlewares` 77 个文件、`tools/builtins` 48 个，是后期治理对象，你一开始就要按域拆）。

### 0.2 教材已经把“数据”分成三个库

`evoflow/config/data_paths.py` 里分得很清楚，复写时建议照这个语义分，不要全塞一个 DB：

| 函数 | 产出 | 含义 |
|---|---|---|
| `app_db_path(base_dir)` | 业务库 | 会话、消息、模型配置、资产等 |
| `observability_db_path(base_dir)` | 观测库 | trace、用量、成本 |
| `checkpoints_db_path(base_dir)` | checkpoint 库 | LangGraph 图状态 |
| `logs_dir(base_dir)` | 日志目录 | 运行日志 |
| `resolve_data_base_dir()` / `resolve_data_root()` | 数据根 | 支持 profile/多目录隔离 |

**关键理解**：业务表恢复（聊天记录）与 checkpoint 恢复（图状态）是两件事，复写和验收都要分开。

### 0.3 功能地图与章节

| 章 | 功能域 | 教材核心包 |
|---|---|---|
| 1 | 配置与模型 | `config/`、`models/` |
| 2 | 主 Agent 构建 | `agents/lead_agent/` |
| 3 | 会话、消息、Checkpoint | `persistence/`、`agents/checkpointer/` |
| 4 | Run 生命周期与入口 | `session_execution/`、`cli/`、`app_server/` |
| 5 | 工具系统 | `tools/` |
| 6 | 中间件与审批 | `agents/middlewares/`、`agents/tool_approval_*` |
| 7 | 事件流与 SSE | `runtime/ports.py`、`app/gateway/routers/events.py` |
| 8 | 上下文与压缩 | `context/`、`agents/context_compaction_core.py` |
| 9 | 记忆与资产 | `memory/`、`assets/`、`artifacts/` |
| 10 | 知识与代码索引 | `knowledge/`、`uploads/`、`code_index/` |
| 11 | 子代理与沙箱 | `subagents/`、`sandbox/`、`session_tool_binding/` |
| 12 | 计划、协作与自动化 | `agents/goal/`、`plans/`、`collab/`、`proactive/` |
| 13 | MCP、技能、外部 Agent | `mcp/`、`skills/`、`external_agents/`、`a2a/` |
| 14 | Gateway 与渠道 | `app/gateway/`、`app/channels/` |
| 15 | 身份权限与观测 | `authz/`、`observability/`、`eval/` |
| 16 | 产品面与端到端 | `app/gateway/routers/`、`evopanel/`（只看行为） |

### 0.4 复写节奏（每章通用）

- **L1 最小闭环**：fake 模型 / 内存库 / fixture，跑通一条成功路径。
- **L2 真实入口与状态**：接 CLI 或 HTTP，数据落 SQLite。
- **L3 功能补齐**：配置项、变体、并发、恢复。
- **L4 失败与边界**：缺配置、越权、超时、取消、损坏数据。

验收四类核验：**真实入口、成功+失败、状态与恢复、权限与隔离**。fake 通过记“已验收（替身）”，真实依赖跑通才记“已验收（真实）”。

---

# 第二部分 逐章功能与代码详解

## 第 1 章 配置与模型

### ① 功能理解

系统启动时要回答三个问题：配置从哪来、选哪个模型、密钥怎么安全地用。教材的特点是**配置分两层**：YAML 管静态项，**chat models 与 `primary_model` 已迁到 SQLite**（`evoflow_models` / `evoflow_app_settings`），`config.yaml` 里写 `models:` 会被忽略（见根目录 `config.example.yaml` 注释）。

### ② 教材代码地图

`evoflow/config/app_config.py`（约 1000 行）：

| 函数 | 职责 |
|---|---|
| `class AppConfig(BaseModel)` | 全部配置的类型化模型 |
| `_load_and_cache_app_config(config_path)` | 读文件并缓存 |
| `_get_config_mtime(config_path)` | 取文件 mtime，用于缓存失效 |
| `get_app_config()` | **全局入口**：有缓存且文件未变就直接返回 |
| `reload_app_config(config_path)` | 强制重读 |
| `reset_app_config()` / `set_app_config(config)` | 测试用：清缓存/注入配置 |
| `_apply_db_backed_config_overrides(config_data)` | 用 DB 里的配置覆盖 YAML |
| `reload_models_from_db()` | 模型变更后刷新 |
| `add_model_to_config` / `update_model_in_config` / `remove_model_from_config` | 管理面增删改模型 |
| `save_config()` | 写回配置 |

`evoflow/config/data_paths.py`：见第 0 章的三个库路径函数，另有 `is_safe_profile_id`、`resolve_profile_home` 做 profile 隔离。

`evoflow/models/resolver.py`（约 257 行，**选择优先级就看这个文件**）：

| 函数 | 职责 |
|---|---|
| `resolve_run_model(...)` / `resolve_run_model_with_source(...)` | 决定一次 run 用哪个模型，并能返回“是谁决定的” |
| `_runtime_override(cfg)` | 运行时显式指定（`configurable.model_name/model`） |
| `_agent_model(agent_code)` | Agent 级指定 |
| `_global_default_model()` | 全局默认 |
| `_pick(runtime, agent, global_name)` | **优先级裁决**：runtime > agent > global |
| `NoChatModelConfiguredError` | 一个模型都没有时的明确异常 |

`evoflow/models/factory.py`（约 1200 行，大量是供应商 thinking 参数适配）：

```python
def create_chat_model(
    name: str | None = None,
    thinking_enabled: bool | None = False,
    *,
    thinking_type: str | None = None,
    invocation_kind: str | None = None,   # 观测标签：main/title/memory/compress/subagent…
    **kwargs,
) -> BaseChatModel
```

辅助函数：`_default_resolved_model_name(config)`（没传名字时选谁）、`_resolve_model_use_path(model_config)`（`use` 字段 → 类路径）、`_is_local_noauth_endpoint(...)`（本地端点免 key）、`_sanitize_*_thinking_settings`（各供应商参数清洗）、`_instrument_vendor_call_timing(model)`（调用计时）。

`evoflow/models/credential_loader.py`：`load_claude_code_credential()` / `load_codex_cli_credential()`（从 CLI 凭证文件读 token）、`_read_secret_from_file_descriptor`（fd 方式读密钥）、`is_oauth_token(token)`。

### ③ 顺序执行链

```text
启动/每次构建 Agent
  ▼ get_app_config()                        # mtime 未变 → 用缓存
  ▼ _apply_db_backed_config_overrides()      # DB 覆盖 YAML（模型等）
  ▼ resolver：_runtime_override → _agent_model → _global_default_model → _pick
  ▼ create_chat_model(resolved_name)
      ├─ config.get_model_config(name)      # 找不到 → ValueError
      ├─ _resolve_model_use_path()          # "包.模块:类名"
      ├─ resolve_class(...)                 # 动态拿到 provider 类
      ├─ model_dump(exclude_none=True)      # 展开为 kwargs
      ├─ 供应商参数清洗/thinking 适配
      └─ 实例化（此步**不发 HTTP**）
  ▼ 真正 HTTP 发生在 model._generate/_stream 内，由 vendor_roundtrip 记录请求/响应
```

### ④ 关键机制讲解（复写时最容易漏的四点）

1. **工厂只实例化，不发请求**。`create_chat_model` 的 docstring 写明了：HTTP 在模型实现内部。所以“建模型成功”不代表“密钥/网络可用”，你的测试要分别覆盖。
2. **配置缓存靠 mtime 失效**。改 YAML 不重载也能生效；改 DB 要走 `reload_models_from_db()`。复写时如果只做一次性 `load_config`，行为会更简单，但要在文档里写明差异。
3. **模型选择有明确优先级**，不要写成“永远用 primary_model”。运行时指定 > Agent 指定 > 全局默认。
4. **`use` 是字符串类路径**，教材用 `resolve_class` 动态解析。复写可以先改成 provider 枚举 + if/else，更简单也更不容易错，属于合理裁剪。

### ⑤ 复写设计

```text
myagentflow/config/{schema.py, loader.py, paths.py, errors.py}
myagentflow/models/{factory.py, resolver.py, credentials.py, fake.py, errors.py}
```

差异声明：第一版用 YAML 管模型（不迁 DB），`get_app_config` 用 mtime 缓存；provider 用枚举分发；`resolver` 保留三级优先级。

### ⑥ 复写步骤

- L1：`ModelConfig/AppConfig` + `load_config`（`$ENV` 展开）+ `FakeChatModel`（带 `usage_metadata`）+ `create_chat_model` 支持 fake。
- L2：`paths.py` 三个库路径与目录创建；接 `openai` provider；`credentials` 缺 key 报错与 `redact` 脱敏。
- L3：三级 resolver；错误归一化 `ModelError(provider, retryable)`；`config_version` 检查。
- L4：YAML 语法错、模型名不存在、`$ENV` 未设置、目录不可写、异常文本脱敏。

### ⑦ 验收要点

- “建模型成功”和“调用成功”分开测；缓存 mtime 变更后配置生效；缺 key 报错不含密钥片段。

---

## 第 2 章 主 Agent 构建（lead_agent）

### ① 功能理解

`lead_agent` 是默认主对话的图。它不是静态单例，而是**按 run 的 configurable 动态组装**：模型、工具集、提示词、中间件都随上下文变化，再用图缓存避免重复构建。

### ② 教材代码地图

`backend/langgraph.json`：

```json
"graphs": {
  "lead_agent": "evoflow.agents.lead_agent.agent:make_lead_agent",
  "goal_agent": "evoflow.agents.goal.goal_graph:make_goal_graph"
},
"checkpointer": { "path": "./packages/harness/evoflow/agents/checkpointer/async_provider.py:make_checkpointer" }
```

`evoflow/agents/lead_agent/agent.py:1001 make_lead_agent(config, runtime=None)`，内部关键步骤：

| 步骤 | 涉及符号 | 作用 |
|---|---|---|
| 记录入口耗时 | `observability.run_latency_trace.write_run_latency_event` | 观测埋点 |
| 刷新模型 | `_refresh_chat_models_from_db()` | 模型配置以 DB 为准 |
| 内置 Agent 物化 | `ensure_builtin_agents_materialized()` | 保证内置 agent 配置存在 |
| 合并运行时上下文 | `_user_context_from_server_runtime(runtime)` + `config["configurable"]` | 得到本次 run 的 cfg |
| 身份注入 | `authz.runtime_identity.enrich_run_context_identity(cfg)` | 把主体信息塞进 cfg |
| 读取模式 | `session_mode`、`model_name/model`、`is_plan_mode`（默认 True）、`is_bootstrap`、`agent_id/agent_name`、`tools_mode` | 决定本次图形态 |
| 子代理 | `subagent_enabled = True`（始终启用）、`max_concurrent_subagents`（默认 5） | 委派能力常开 |
| 工具集 | `agents/lead_agent/intent_tool_profile.py`：`BOOTSTRAP_TOOL_NAMES`、`CORE_TOOL_NAMES`、`NON_CORE_TOOL_GROUPS`、`TASK_SCENARIO_PROFILES`、`flat_bound_tool_names_for_session_mode`、`resolve_eager_tool_names_for_scenarios` | 按场景决定绑哪些工具 |
| 工具实体 | `from evoflow.tools import get_available_tools` | 取可用工具 |
| 提示词 | `prompt.apply_prompt_template`、`prompt_language.resolve_prompt_language`、`plan_prompt_blocks*` | 系统提示装配与语言 |
| 图缓存 | `graph_cache.get_or_build_lead_agent_graph(...)` | 命中则复用 |
| 建图 | `create_agent(...)`（agent.py 中两处：普通路径与另一分支） | 生成 CompiledGraph |

`evoflow/agents/lead_agent/graph_cache.py`：

| 符号 | 职责 |
|---|---|
| `class LeadAgentGraphCacheKey` | 缓存键（模型/工具/提示词等维度） |
| `get_or_build_lead_agent_graph(...)` | 命中返回缓存，否则构建并写入 |
| `lead_agent_graph_cache_enabled()` / `_max_entries()` | 开关与容量 |
| `clear_lead_agent_graph_cache()` / `register_lead_agent_graph_cache_cleared(cb)` | 失效与失效回调 |

### ③ 顺序执行链

```text
EvoPanel composer.handleSend()
  ▼ api.chatSend() → wsClient.chatSend()
  ▼ 确保 thread 存在
  ▼ POST /api/langgraph/threads/{threadId}/runs/stream    # assistant_id 默认 "lead_agent"
  ▼ LangGraph 按 langgraph.json 调 make_lead_agent(config, runtime)
      ├─ 刷新模型/内置 agent → 合并 cfg → 身份注入
      ├─ 判定 session_mode / is_plan_mode / 模型名
      ├─ intent_tool_profile 决定工具集 → get_available_tools
      ├─ build_lead_runtime_middlewares + lead 专属 middlewares
      ├─ apply_prompt_template 组装系统提示
      └─ get_or_build_lead_agent_graph → create_agent
  ▼ 图执行（模型 ⇄ 工具循环）→ 流式输出
```

（前端到 Run 创建的链路已在教材 `docs/knowledge/02-core-runtime/01-runtime-entry运行入口.md` 核对，可读该文档对照。）

### ④ 关键机制讲解

1. **图是“按 run 组装”的，不是全局单例**。所以复写时 `make_lead_agent(config)` 的入参要包含本次 run 的 configurable，不能只传全局配置。
2. **缓存键必须覆盖所有会改变图形态的因素**：模型、工具集、提示词版本、模式。漏掉工具集，第 5 章就会出现“工具加了却不生效”。
3. **工具不是全量绑定**。教材用 `intent_tool_profile` 按场景选工具（bootstrap/core/非核心组/场景包），这是控制上下文长度和稳定性的关键手段；复写第一版可以只保留“核心集 + 场景附加集”两档。
4. **`is_plan_mode` 默认 True**，且会显式写回 cfg，避免中间件读到不同缺省值。这类“默认值归一”细节值得照做。

### ⑤ 复写设计

`myagentflow/agents/lead_agent/{agent.py, graph_cache.py, prompt.py, tool_profile.py, state.py}`；`backend/langgraph.json` 已指向 `make_lead_agent`。

### ⑥ 复写步骤

- L1：fake 模型 + 空工具 + 静态提示，`make_lead_agent` 返回可执行图；两轮对话可续（内存 checkpointer）。
- L2：改为配置驱动；实现 `LeadAgentGraphCacheKey` 与 `get_or_build`；`langgraph.json` 注册可用。
- L3：工具集分两档（core/scenario）；系统提示分块；流式 `astream`。
- L4：模型超时、提示词缺变量、缓存键缺维度的回归测试、模式默认值归一测试。

### ⑦ 验收要点

- 能讲清并复现 `langgraph.json → make_lead_agent → create_agent`；改工具集后缓存失效；同 thread 两轮上下文连续。

---

## 第 3 章 会话、消息与 Checkpoint

### ① 功能理解

三件事：会话与 thread 的映射、消息的持久化与分页展示、图状态的 checkpoint 恢复。教材里“给界面看的消息”和“喂给模型的消息”是**两条不同的读取路径**，这是很重要的设计。

### ② 教材代码地图

`evoflow/agents/checkpointer/async_provider.py`（122 行，很短，值得通读）：

| 函数 | 职责 |
|---|---|
| `make_checkpointer()` | `langgraph.json` 指定的 provider 入口 |
| `_async_checkpointer(config)` | 按配置建具体 saver（SQLite 等） |
| `_wrap_omit_transcript(saver)` | 包装 saver，裁剪 transcript 类内容 |

`evoflow/persistence/chat_session_service.py`（约 1670 行，会话生命周期主服务）：

| 函数 | 职责 |
|---|---|
| `make_new_session_key(agent_id="main")` | 生成会话 key |
| `create_new_session(...)` | 建会话 |
| `create_langgraph_thread(session_key)` / `delete_langgraph_thread` | 与 LangGraph thread 对齐 |
| `bind_session_thread(...)` / `ensure_session_thread(...)` | 会话 ↔ thread 绑定与确保存在 |
| `persist_user_message(...)` | 用户消息落库 |
| `append_message_and_touch_session(...)` / `upsert_message_and_touch_session(...)` / `append_messages_batch_and_touch_session(...)` | 写消息并更新会话活跃信息 |
| `fork_session_full` / `reset_session_full` / `truncate_session_from_message` | 分叉/重置/截断 |
| `delete_session_full` / `delete_sessions_bulk` | 删除及关联数据清理 |

`evoflow/persistence/chat_message_repositories.py`（约 2700 行，消息读写核心）：

| 函数 | 职责 |
|---|---|
| `_next_seq(session_key, conn)` | 分配递增序号（消息顺序的根本） |
| `pack_row_from_message(...)` | 消息对象 → 行 |
| `append_message(...)` / `append_messages_batch(...)` | 追加 |
| `upsert_message_by_message_id(...)` | 按 message_id 幂等写入（流式更新靠它） |
| `transcript_duplicate_exists(...)` | 去重 |
| `list_messages(...)` | 基础读取 |
| `list_messages_for_display_paginated(...)` / `_align_display_page_to_user_turn(...)` | **展示用**分页，按用户回合对齐 |
| `list_lead_chat_rows_for_model_hydration(...)` / `list_messages_for_model_input(...)` | **喂模型用**读取 |
| `get_session_hydration_watermark(...)` | 水线：恢复到哪 |
| `persist_conversation_summary(...)` / `load_conversation_summary_text(...)` / `find_latest_compaction_seq(...)` | 压缩摘要的存取（第 8 章用） |
| `latest_run_id_for_thread_id(...)` / `backfill_missing_run_ids_in_session(...)` | run_id 关联与回填 |

### ③ 顺序执行链

```text
一轮开始
  ▼ ensure_session_thread(session_key)         # 没有就建 thread 并绑定
  ▼ persist_user_message(...)                  # _next_seq 分配序号
  ▼ 图执行（checkpointer 保存状态）
  ▼ upsert_message_by_message_id(...)          # 流式过程中反复更新同一条 AI 消息
  ▼ append_message_and_touch_session(...)      # 收尾，更新会话
重启恢复
  ▼ 业务表：list_messages_for_display_paginated → 界面历史
  ▼ 模型侧：list_lead_chat_rows_for_model_hydration + 水线 → 上下文
  ▼ checkpoint：按 thread_id 恢复图状态
```

### ④ 关键机制讲解

1. **`message_id` 幂等 upsert 是流式写入的关键**：流式过程中同一条 AI 消息被不断更新，不能每来一个 token 就插一行。
2. **`seq` 由 `_next_seq` 统一分配**，分页和“从某条截断”都依赖它；复写时序号策略要先定，别用时间戳。
3. **展示读取与模型读取分离**：展示要按用户回合对齐、要裁剪工具载荷；喂模型要水线和压缩摘要。合成一个函数会互相拖累。
4. **三个库分离**（业务/观测/checkpoint），恢复语义才能说清。

### ⑤ 复写设计

`persistence/{db.py, schema.py, chat_sessions.py, chat_messages.py, runs.py}`、`agents/checkpointer/async_provider.py`。自建表 `chat_sessions / chat_messages / runs`，字段含 `seq`、`message_id`、`run_id`。

### ⑥ 复写步骤

- L1：内存消息列表 + 内存 checkpointer，两轮可续。
- L2：SQLite 三表；`_next_seq`；`upsert_by_message_id`；checkpointer 切 SQLite；重启续聊。
- L3：展示分页与模型读取拆成两个函数；会话分叉/截断（可选）。
- L4：序号冲突、重复 message_id、坏 checkpoint 文件、DB 不可写。

### ⑦ 验收要点

- 杀进程后同 thread 续聊；流式更新不产生重复消息行；分别给出“业务表恢复”和“checkpoint 恢复”的证据。

---

## 第 4 章 Run 生命周期、取消与入口

### ① 功能理解

一次运行有开始、进行、结束（成功/失败/取消）和清理；界面显示的“正在执行”要能和真实状态对齐，卡住时要能自愈。

### ② 教材代码地图

`evoflow/session_execution/lifecycle.py`（228 行）：

| 函数 | 职责 |
|---|---|
| `start_session_turn(...)` | 开始一个回合 |
| `adopt_session_run_id(...)` | 把 run_id 绑定到回合 |
| `end_session_turn(...)` | 正常收尾（异步） |
| `schedule_end_session_turn(...)` | 调度收尾（不阻塞主流程） |
| `force_end_session_turn(...)` | 强制结束 |
| `_after_run_ended(...)` | 结束后的清理钩子 |

`evoflow/session_execution/commands.py`：

| 函数 | 职责 |
|---|---|
| `stop_session_execution(...)` | 用户停止 |
| `mark_session_idle(session_key, reason="user_stop")` | 标记空闲 |
| `_post_stop_reconcile(...)` / `_schedule_post_stop_reconcile(...)` | 停止后对账：真实状态与显示状态拉齐 |
| `_clear_live_snapshot` / `_reset_collab_on_stop` | 清现场 |

`evoflow/session_execution/queries.py`：

| 函数 | 职责 |
|---|---|
| `build_session_execution_state(session_key)` | 给界面用的执行状态 |
| `derive_executing(run_status=...)` | 由 run 状态推导“是否执行中” |
| `_heal_sticky_running_against_langgraph(...)` | **自愈**：本地显示 running，但 LangGraph 已结束 → 纠正 |

`evoflow/cli/main.py:85 main` + `build_parser`：CLI 入口；`evoflow/app_server/stdio_rpc.py`、`chat_bridge.py`：本地 stdio RPC。

### ③ 顺序执行链

```text
start_session_turn → adopt_session_run_id → 图执行
  ▼ 正常：schedule_end_session_turn → end_session_turn → _after_run_ended
  ▼ 停止：stop_session_execution → mark_session_idle → 取消传播 → _post_stop_reconcile
查询：build_session_execution_state
  ▼ derive_executing
  ▼ 若疑似卡 running → _heal_sticky_running_against_langgraph
```

### ④ 关键机制讲解

1. **结束分“正常收尾”和“停止后对账”两条路**，只写一条会留下脏状态。
2. **状态自愈**：本地状态不可信时，回 LangGraph 查证再纠正。复写至少要有“启动时把 running 标记为 interrupted”的兜底。
3. **取消是传播+清理**，不是改个状态字段。

### ⑤⑥ 复写设计与步骤

`session_execution/{types.py, service.py, mirror.py}`、`cli/`、`app_server/`。

- L1：`RunService.start/wait`，状态落 `runs`。
- L2：CLI `chat/history/cancel`；后台执行 + 终态写库。
- L3：`cancel` 传播与清理；停止后对账；stdio RPC 最小方法 `chat.send/chat.cancel`。
- L4：重复 start、取消已结束 run、进程退出遗留 running 的自愈。

### ⑦ 验收要点

- 取消长任务后状态为 cancelled 且无残留任务；重启后无永久 running；RPC 正常与超时各一例。

---

## 第 5 章 工具系统

### ① 功能理解

工具要可发现、可调用、结果可控。教材把工具分**层级与场景**（不是全量塞给模型），并对参数、结果、大输出分别处理。

### ② 教材代码地图

`evoflow/tools/tool_catalog.py`：

| 函数 | 职责 |
|---|---|
| `normalize_tool_name` / `tool_aliases.py` | 名称与别名归一 |
| `resolve_tool_tier(name)` / `ToolTier` | 工具分层（核心/扩展等） |
| `_core_tool_names()` / `_plan_scenario_extra_tools()` / `_workspace_scenario_extra_tools()` | 核心集与场景附加集 |
| `should_mount_platform_tool(...)` / `should_auto_mount_agent_mode_system_tools(...)` | 是否挂载某工具 |
| `normalize_agent_tools_whitelist(...)` | Agent 白名单归一 |
| `enrich_tool_catalog_fields(doc)` / `catalog_fields_for_tool_name(name)` | 给前端展示用的目录信息 |

`evoflow/tools/arg_coerce.py`：`coerce_tool_call_args(tool_name, args)`（参数强转总入口）、`parse_loose_json_object`（模型输出的松散 JSON 修复）、`coerce_str_list`、`normalize_search_query_inputs`。

`evoflow/tools/tool_result_shaper.py`：`shape_tool_result(...)`（结果整形）、`_apply_inline_token_cap`（内联截断）、`format_prefetch_snippet`（预取片段）。

`evoflow/tools/tool_output_truncation.py`：`truncate_text_to_token_budget` / `formatted_truncate_tool_output`。

`evoflow/tools/large_result_store.py`、`tool_result_store.py`：大结果外存与引用。

工具实体入口：`from evoflow.tools import get_available_tools`（第 2 章构建图时调用）。内置工具在 `tools/builtins/`，宿主边界在 `tools/host_direct/`。

### ③ 顺序执行链

```text
模型产出 tool_call
  ▼ catalog：normalize_tool_name → 层级/白名单/场景判定是否可用
  ▼ arg_coerce.coerce_tool_call_args            # 类型强转 + 松散 JSON 修复
  ▼ （危险工具 → 第6章审批）
  ▼ 执行（超时/取消）
  ▼ shape_tool_result → 超预算 formatted_truncate_tool_output
  ▼ 仍超大 → large_result_store 外存 + ref
  ▼ 写回消息流，模型继续
```

### ④ 关键机制讲解

1. **参数先强转再执行**：模型给的参数经常是字符串数字、松散 JSON，`arg_coerce` 专门兜这个。
2. **结果三级处理**：整形 → 内联截断 → 外存引用。不要一刀切截断，否则长文件读取永远缺内容。
3. **工具挂载是策略**，由层级、场景、白名单共同决定，不是 `tools=all`。
4. **错误要变成模型可读的结果**，而不是异常炸掉整轮（由第 6 章 `ToolErrorHandlingMiddleware` 配合）。

### ⑤⑥ 复写设计与步骤

`tools/{types.py, catalog.py, executor.py, result.py, store.py}`、`builtins/{calculator.py, workspace_file.py, terminal.py}`、`host_direct/fs.py`。

- L1：`calculator` 注册并可被调用；异常归一化为 `ToolResult(ok=False)`。
- L2：`workspace_file` 限 workspace；`terminal` 白名单+cwd+超时；工具集注入主 Agent。
- L3：三级结果处理；别名/作用域；后台命令轮询与终止。
- L4：类型错、工具不存在、越界路径、非零退出、外存失败、并发污染。

### ⑦ 验收要点

- 模型读文件并复述；超长输出有截断与 ref 且能取回；`../../etc/passwd` 被拒。

---

## 第 6 章 中间件与审批

### ① 功能理解

横切逻辑（线程数据、沙箱、错误处理、大内容外置、护栏、生命周期、用量）全部走中间件，装配顺序就是行为顺序。

### ② 教材代码地图

`evoflow/agents/middlewares/tool_error_handling_middleware.py`：

```python
def build_lead_runtime_middlewares(*, lazy_init=True) -> list[AgentMiddleware]
def build_subagent_runtime_middlewares(*, lazy_init=True) -> list[AgentMiddleware]
class ToolErrorHandlingMiddleware(AgentMiddleware[AgentState])
```

`_build_runtime_middlewares(...)` 的实际装配顺序（lead 与 subagent 共用底座）：

```text
1 ThreadDataMiddleware            # 线程数据准备
2 SandboxMiddleware               # 沙箱上下文
3 DanglingToolCallMiddleware      # 仅 lead：修补悬挂 tool_call
4 GuardrailMiddleware             # 仅当 guardrails_config.enabled 且配置 provider
5 ToolErrorHandlingMiddleware     # 工具异常 → 可读错误
6 InvalidToolCallMiddleware       # 非法调用处理
7 LargeContentOffloadMiddleware   # 大内容外置
8 PreCallGuardrailAgentMiddleware # 调用前护栏
9 SessionRunLifecycleMiddleware   # 图内终态写 run_status
```

`build_subagent_runtime_middlewares` 在底座后追加 `TranscriptMiddleware`（持久化子对话），并在 `token_usage.enabled` 时**最后**追加 `TokenUsageMiddleware`——注释明确写着：`after_model` 按列表**逆序**执行，所以最后追加的反而最先跑，用于在 Transcript 持久化前规范化 `usage_metadata`。

其他相关：`evoflow/agents/tool_approval_service.py`、`tool_approval_config.py`、`tool_approval_pause_registry.py`、`tool_approval_resume.py`、`middlewares/tool_approval_middleware.py`。

### ③ 顺序执行链

```text
模型/工具调用
  ▼ before_* 按列表正序：ThreadData → Sandbox → … → Guardrail
  ▼ 执行
  ▼ after_* 按列表逆序：用量规范化 → Transcript 持久化 → 错误处理/审计
  ▼ 危险工具：ToolApprovalMiddleware 挂起 → pause_registry 记录 → 人工决定 → resume
```

### ④ 关键机制讲解

1. **顺序即语义**：`after_model` 逆序这点最容易踩坑，复写时必须写测试固定顺序。
2. **生命周期收尾放在图内**（`SessionRunLifecycleMiddleware`），Gateway 侧只是兜底；这样取消/异常也能写到终态。
3. **审批是“挂起-登记-恢复”三件套**，不是一个 if。

### ⑤⑥ 复写设计与步骤

`agents/middlewares/{base.py, thread_data.py, tool_errors.py, transcript.py, token_usage.py, approval.py}`。

- L1：审计中间件记录一次工具前后。
- L2：`tool_errors` 异常转结果；`token_usage` 规范化用量。
- L3：审批挂起/恢复/重放；`run_lifecycle` 图内写终态。
- L4：中间件自身异常不拖垮主流程；after 逆序的回归测试；审批拒绝后工具未执行（副作用断言）。

### ⑦ 验收要点

- 拒绝后危险命令确实没跑；用量在 Transcript 持久化前已规范化；终态在取消路径也能写。

---

## 第 7 章 事件流与 SSE

### ① 功能理解

核心层产生事件，应用层负责广播和 SSE 输出；断线能续看；核心层不出现 HTTP。

### ② 教材代码地图

`evoflow/runtime/ports.py`（763 行，是**核心层访问应用层能力的总线**）：

| 函数 | 职责 |
|---|---|
| `register(key, impl)` / `register_many(entries)` / `unregister(key)` | 应用层注册实现 |
| `get(key)` / `is_registered(key)` | 核心层取实现 |
| `get_event_broadcaster()` / `broadcast_event(thread_id, event_type, data)` | 事件广播 |
| `inject_langgraph_custom(thread_id, data)` | 向运行中的图注入自定义事件 |
| `schedule_inject_evf_frame(thread_id, payload)` | 注入教材自定义帧 |
| `resume_middle_layer_tool_approval(...)` | 审批恢复 |
| `publish_kb_citations(...)` | 知识引用推送 |
| `get_channel_service()` / `start_channel_service()` / `push_to_inbound_origin(...)` | 渠道能力 |
| `build_runtime_status_payload()` / `probe_gateway_ready_state()` | 运行状态探测 |

`app/gateway/routers/events.py`：

| 符号 | 职责 |
|---|---|
| `class EventBroadcaster` | 应用层广播器（订阅管理） |
| `_enqueue_sse(queue, payload)` | 写入 SSE 队列 |
| `event_generator(thread_id)` | SSE 生成器 |
| `subscribe_thread_panel_stream(request, thread_id)` | 面板订阅 |
| `subscribe_task_events(request, task_id)` | 任务事件订阅 |
| `internal_broadcast` / `internal_inject_custom` / `internal_inject_evf` | 内部 HTTP 注入端点 |
| `emit_task_started/progress/completed/failed/heartbeat` | 任务事件便捷函数 |
| `get_thread_stream_status` / `_collect_thread_stream_status` | 流状态查询 |

### ③ 顺序执行链

```text
核心层执行
  ▼ ports.broadcast_event(thread_id, type, data)     # 未注册则安全返回
  ▼ 应用层 EventBroadcaster 分发到各订阅队列
  ▼ event_generator 逐条 yield SSE
  ▼ 客户端订阅 subscribe_thread_panel_stream
断线重连
  ▼ get_thread_stream_status / 续读机制 → 补齐或对齐终态
```

### ④ 关键机制讲解

1. **ports 是注册表模式**：核心层只 `get(key)`，不知道 FastAPI 存在；这是 R1 能成立的根本原因。
2. **广播与图执行解耦**：还有 `internal_inject_custom` 这种 HTTP 注入通道，用于跨进程把事件塞回运行中的图。
3. **状态查询与流并存**：流断了我还能查状态，不能只有流。

### ⑤⑥ 复写设计与步骤

`runtime/{ports.py, events.py}`、`app/gateway/{events.py, routers/events.py}`。

- L1：`register/get/broadcast_event` + 内存 broadcaster，订阅者收到完整序列。
- L2：SSE 路由，事件带 `run_id + seq`；终态关流。
- L3：`Last-Event-ID` 续读 + 环形缓存；多订阅者；状态查询接口。
- L4：broadcaster 异常不影响 run；慢客户端背压；断连清理。

### ⑦ 验收要点

- `curl -N` 看事件，重连不重复不丢终态；`grep -rn "from app\." packages/harness/myagentflow` 无输出。

---

## 第 8 章 上下文与压缩

### ① 功能理解

先算 token，再决定要不要压缩；压缩不是删消息，而是生成摘要并保留恢复能力；工具历史有单独的“冷区”整理策略。

### ② 教材代码地图

`evoflow/agents/context_compaction_core.py`（约 2950 行，压缩主逻辑）：

| 函数 | 职责 |
|---|---|
| `estimate_messages_tokens(messages)` / `message_token_estimate(msg)` | 消息 token 估算 |
| `estimate_gate_tokens(messages)` | 门槛估算 |
| `resolve_compaction_gate_tokens(...)` | 压缩触发阈值裁决 |
| `_resolve_compaction_plan(...)` / `_emergency_force_plan(...)` | 生成压缩计划（含紧急兜底） |
| `detect_user_language(messages)` | 摘要语言跟随用户 |
| `is_compaction_message` / `is_conversation_summary_human` / `is_tool_history_human` | 识别摘要类消息，避免重复压缩 |
| `partition_compaction_artifacts(...)` | 切分哪些进摘要、哪些保留 |
| `_cap_summary_text(...)` | 摘要长度封顶 |

`evoflow/context/model_request_token_estimate.py`：`estimate_system_prompt_tokens`、`estimate_bound_tools_tokens`（绑定工具也吃预算）、`estimate_model_call_overhead`（每次调用固定开销）。

`evoflow/context/tool_history_merge.py`：

| 函数 | 职责 |
|---|---|
| `apply_cold_zone_policy(...)` | 冷区策略：老工具结果降级 |
| `rebuild_cold_prefix(...)` | 重建冷区前缀 |
| `format_tool_history_batch(entries)` | 工具历史成块 |
| `merge_cooldown_elapsed` / `mark_merge_cooldown` | 合并冷却，避免频繁整理 |

摘要的持久化在第 3 章：`persist_conversation_summary` / `load_conversation_summary_text` / `find_latest_compaction_seq` / `get_session_hydration_watermark`。

### ③ 顺序执行链

```text
组装请求
  ▼ estimate：系统提示 + 绑定工具 + 消息 + 固定开销
  ▼ resolve_compaction_gate_tokens → 是否触发
  ▼ _resolve_compaction_plan：切分保留区/摘要区（紧急时 _emergency_force_plan）
  ▼ 生成摘要（detect_user_language 定语言）→ _cap_summary_text
  ▼ persist_conversation_summary → 记录 compaction_seq 与水线
  ▼ 工具冷区：apply_cold_zone_policy → rebuild_cold_prefix
  ▼ 新上下文 = 摘要 + 保留区 → 继续对话
```

### ④ 关键机制讲解

1. **阈值是“裁决”出来的**，包含系统提示、绑定工具和固定开销，不是只数消息。
2. **摘要消息要有类型标记**，否则下次会把摘要再摘要，越滚越糟。
3. **冷区有冷却**，防止每次请求都重排工具历史。
4. **压缩与水线/恢复绑定**，所以第 3 章的读取函数必须一起设计。

### ⑤⑥ 复写设计与步骤

`context/{tokens.py, budget.py, history.py, compaction.py}`。

- L1：token 估算；超预算先丢最旧历史。
- L2：压缩计划（保留区/摘要区）+ 摘要生成（先规则/fake）+ 摘要落库与水线。
- L3：摘要消息类型标记、工具冷区与冷却、手动触发。
- L4：压缩失败退化为裁剪；保真度断言（最新用户输入与最后工具结果原样保留）；重复压缩不嵌套。

### ⑦ 验收要点

- 压缩前后 token 与消息序列对照；重启后摘要可用；不会出现“摘要的摘要”。

---

## 第 9 章 记忆与资产

### ① 功能理解

记忆是独立的数据域：写入、召回、巩固、遗忘、注入。注入提示词要带来源和预算。

### ② 教材代码地图

`evoflow/memory/facade.py`（375 行，对外门面）：

| 函数 | 职责 |
|---|---|
| `remember(...)` | 写入一条记忆 |
| `forget(atom_id, mode="soft")` | 软/硬遗忘 |
| `consolidate(...)` | 巩固合并 |
| `pin_atom(atom_id, pin=True)` | 置顶 |
| `mark_atom_stale(...)` / `mark_related_memories_stale(...)` | 过期与级联过期 |
| `list_atoms(...)` | 列出 |
| `get_core(...)` | 取核心记忆 |
| `recall(...)` | 召回 |
| `format_atoms_block(...)` + `_budget(atoms, max_chars)` | 注入文本格式化与预算 |
| `_try_embed_sync(text)` | 可选向量召回 |

配套：`memory/recall_snapshot.py`（召回快照）、`stale_on_close.py`（会话关闭过期）、`namespaces.py`（隔离）、`consolidate.py`、`episodes.py`；注入侧 `agents/middlewares/memory_middleware.py`；资产侧 `assets/`、`artifacts/`、`items/`。

### ③ 顺序执行链

```text
写入：remember → （达阈值）_maybe_enqueue_threshold → consolidate → pin/stale 维护
读取：recall(namespace, query) → 过滤 archived → 排序去重
注入：format_atoms_block + _budget(max_chars) → 进入系统提示（带来源）
关闭：stale_on_close → 旧记忆降级
```

### ④ 关键机制讲解

1. **遗忘有软/硬两档**，还有级联过期；不是简单 delete。
2. **注入预算单独算**，不能和上下文总预算混用。
3. **召回快照**让“当时召回了什么”可解释，排障全靠它。

### ⑤⑥ 复写设计与步骤

`memory/{facade.py, storage.py, recall.py, consolidate.py, middleware.py}`。

- L1：`remember/recall`（关键词）+ namespace 隔离。
- L2：`format_block(max_chars)` 注入，来源缺失不注入；软遗忘。
- L3：consolidate、pin/stale、召回快照。
- L4：跨 namespace 泄漏、预算为 0、并发写不重复。

### ⑦ 验收要点

- 同 namespace 跨会话可召回且带来源；换 namespace 不出现；能展示一次召回快照。

---

## 第 10 章 知识库与代码索引

### ① 功能理解

知识库以 dataset 为单位管理文件与 chunk，检索后回答要带引用；代码索引按符号提取，带降级策略。

### ② 教材代码地图

`evoflow/knowledge/service.py`（687 行，知识库服务）：

| 函数 | 职责 |
|---|---|
| `list_datasets` / `get_dataset` / `create_dataset` / `update_dataset` / `delete_dataset` | 知识库 CRUD |
| `upload_file(...)` / `list_files` / `delete_file` | 文件管理 |
| `sync_local_source(dataset_id, force=False)` | 本地目录同步 |
| `list_chunks(dataset_id, page, page_size)` | chunk 查看 |
| `search(...)` / `search_knowledge_bases(...)` | 检索 |
| `_rerank_search_hits(...)` | 命中重排 |
| `dataset_llm_index_enabled(dataset_id)` | 是否启用 LLM 索引 |

`evoflow/knowledge/chunker.py`：`chunk_text(...)`（主入口）、`_split_paragraphs`、`_make_chunk(parts, char_start, char_end)`（**保留字符区间**）、`_hard_split(text, chunk_size, overlap)`（兜底硬切）。

`evoflow/knowledge/index_builder.py`：`build_document_summary(text, file_name)`、`enrich_chunk_indexes(chunks, file_name)`、`embedding_text_for_chunk(chunk)`（**嵌入文本与展示文本分开**）、`summary_vector_chunk_id(file_id)`（摘要向量 chunk）。

`evoflow/code_index/symbols.py`：`extract_symbols(...)` 主入口，内部 `_ast_python_symbols`（AST 优先）、`_regex_python_symbols`（正则降级）、`_javalang_symbols`、`_regex_js_symbols`、`_fallback_symbols`（最后兜底）。

### ③ 顺序执行链

```text
create_dataset → upload_file → parser 提取文本
  ▼ chunk_text（段落优先，_hard_split 兜底，记录 char_start/char_end）
  ▼ enrich_chunk_indexes + build_document_summary
  ▼ embedding_text_for_chunk → 向量索引（含摘要向量 chunk）
查询：search → _rerank_search_hits → 组装上下文 → 答案 + 引用
代码：extract_symbols（AST → 正则 → 兜底）→ 符号表可查
```

### ④ 关键机制讲解

1. **chunk 必须带字符区间**，引用才能回跳。
2. **嵌入文本不等于展示文本**，`embedding_text_for_chunk` 会补文件名/标题等上下文。
3. **符号提取有降级链**，AST 挂了还能正则，不至于整个索引空掉。

### ⑤⑥ 复写设计与步骤

`knowledge/{parser.py, chunker.py, embedding.py, vector.py, service.py}`、`uploads/manager.py`、`code_index/symbols.py`。

- L1：`.md/.txt`；`chunk_text` 带区间；`FakeEmbedder`；检索 + 引用。
- L2：落库幂等；引用回跳断言；AST 符号提取。
- L3：内容 hash 增量；多 dataset 隔离；嵌入文本与展示文本分离；低阈值回答“未找到”。
- L4：坏文件/空文件/超大/编码异常；跨 dataset 拒绝；大文件后台 ingest。

### ⑦ 验收要点

- 上传手册提问，答案引用能切回原文；重复 ingest chunk 数不变；AST 失效时正则降级仍出符号。

---

## 第 11 章 子代理与沙箱

### ① 功能理解

子代理是“注册 + 配置解析 + 执行 + 护栏”四层；沙箱是可替换 provider，默认拒绝。

### ② 教材代码地图

`evoflow/subagents/registry.py`：

| 函数 | 职责 |
|---|---|
| `get_subagent_config(name)` | 取某个子代理配置 |
| `_agent_config_to_subagent_config(agent_cfg)` | Agent 配置 → 子代理配置 |
| `_resolve_subagent_system_prompt(agent_cfg)` | 子代理系统提示 |
| `resolve_subagent_type(name)` | 类型解析 |
| `list_subagents()` / `get_subagent_names()` / `get_available_subagent_names()` | 列表与可用性 |
| `_timeout_for_subagent(...)` | 超时裁决 |

`evoflow/subagents/executor.py`（约 1100 行）：

| 符号 | 职责 |
|---|---|
| `class SubagentExecutor` | 委派执行主类 |
| `class SubagentResult` / `SubagentStatus` | 结果与状态 |
| `_filter_tools(...)` | 子代理工具过滤 |
| `_get_model_name(config, parent_model)` | 子代理模型选择（可继承父级） |
| `cancel_background_tasks_for_parent_thread(...)` | 父线程取消时清理后台子任务 |
| `get_background_task_result(...)` / `list_background_tasks()` / `cleanup_background_task(...)` | 后台任务结果与清理 |

`evoflow/sandbox/sandbox_provider.py`：`SandboxProvider(ABC)`、`get_sandbox_provider()`、`set_sandbox_provider()`、`reset/shutdown`，以及 `_resolve_provider_class(use)`（`use` 字符串解析 provider 类，与模型工厂同套路）。

### ③ 顺序执行链

```text
主 Agent 发起 delegate
  ▼ registry.get_subagent_config → resolve 提示词/超时/模型
  ▼ executor._filter_tools → 受限工具集
  ▼ SandboxProvider 提供执行环境（默认拒绝，白名单放行）
  ▼ 子代理执行（独立上下文）→ SubagentResult
  ▼ 父线程取消 → cancel_background_tasks_for_parent_thread → cleanup
```

### ④ 关键机制讲解

1. **子代理配置来自 Agent 配置转换**，不是另起一套配置体系。
2. **模型可继承父级也可覆盖**，超时单独裁决。
3. **后台任务有结果查询与清理接口**，否则一定会泄漏。

### ⑤⑥ 复写设计与步骤

`subagents/{types.py, registry.py, executor.py, guard.py}`、`sandbox/{provider.py, policy.py}`。

- L1：一个示例子代理完成委派并返回结构化结果。
- L2：独立上下文、工具过滤、LocalSandbox（cwd+白名单+超时）。
- L3：后台任务结果/清理、取消传播、深度限制。
- L4：越权工具、超时、嵌套超限、审批拒绝未执行、无残留任务。

### ⑦ 验收要点

- 委派成功一例、越权拒绝一例、父取消后子任务清理一例，三者都有记录。

---

## 第 12 章 计划、协作与自动化

### ① 功能理解

先澄清一个容易读错的地方：教材 `evoflow/plans/` **不是“任务计划图”**，而是**套餐/能力绑定**——`plans/service.py` 里是 `list_catalog`、`list_bindings`、`create_binding`、`patch_binding`、`verify_binding`、`resolve_capability`，`plans/types.py` 是 `ResolvedRoute`。真正的目标执行图在 `evoflow/agents/goal/`（`langgraph.json` 里的 `goal_agent`）。自动化与心跳在 `proactive/`、`automation/` 和 `app/gateway/automation_runner.py`、`routers/automation_scheduler.py`。

### ② 教材代码地图

| 域 | 入口 | 职责 |
|---|---|---|
| 目标图 | `agents/goal/`（`goal_graph:make_goal_graph`）、`goal_auto_continue_middleware.py`、`goal_prompt_assembler.py` | 目标拆解与自动续跑 |
| 套餐/能力绑定 | `plans/service.py`：`list_catalog`、`create_binding`、`verify_binding`、`resolve_capability` | 能力目录、绑定与校验 |
| 协作 | `collab/`、`workflows/`、`stage/` | 协作账本与工作流 |
| 自动化 | `app/gateway/automation_runner.py`、`routers/automation_scheduler.py`、`evoflow/automation/` | 自动化执行与调度 |
| 心跳/主动 | `proactive/` | 主动任务 |
| 探索（待评估） | `exploration/`、`exploration_graph/` | 探索与思维图 |

### ③ 顺序执行链

```text
目标：用户任务 → goal 图 → 节点执行 → goal_auto_continue 判断是否继续 → 终态
自动化：定义 → 调度器触发 → automation_runner 执行 → 运行历史 → 通知投递
套餐：catalog → binding → verify_binding → resolve_capability 决定可用能力
```

### ④ 关键机制讲解

1. **先分清“计划”三种含义**：目标图（goal）、自动化（automation）、套餐绑定（plans）。复写时命名不要混。
2. **自动续跑由 middleware 驱动**（`goal_auto_continue_middleware`），不是外层 while 循环。
3. **调度必须有运行历史与重启补偿**，否则重启后任务状态无法解释。

### ⑤⑥ 复写设计与步骤

`agents/goal/`、`automation/{definitions.py, scheduler.py, runner.py, notify.py}`；套餐绑定域可延后。

- L1：两步 Goal 图顺序执行。
- L2：状态落库；暂停/恢复幂等（幂等键定义写清）。
- L3：自动续跑 middleware；定时触发 + 运行历史 + 本地通知出口。
- L4：重复触发、错过窗口、执行中取消、通知失败重试。

### ⑦ 验收要点

- 同一任务重复执行结果一致；暂停/恢复状态一致；调度有真实触发记录与历史。

---

## 第 13 章 MCP、技能与外部 Agent

### ① 功能理解

MCP 负责外部工具，技能负责提示词资产，外部 Agent 走 adapter。三者都遵循“配置 → 连接/加载 → 注入 → 调用 → 结果预算”。

### ② 教材代码地图

`evoflow/mcp/client.py`：`build_server_params(server_name, config)`（单个 server 参数）、`build_servers_config(extensions_config)`（整体配置）。

`evoflow/mcp/pool.py`：

| 符号 | 职责 |
|---|---|
| `class McpConnectionPool` | 连接池主类 |
| `_ServerEntry` | 单 server 条目 |
| `get_mcp_connection_pool()` / `reset_mcp_connection_pool(timeout_sec)` | 池获取与重置 |
| `call_timeout_sec()` / `server_timeout_sec_from_config(raw_cfg)` | 超时裁决 |
| `looks_like_connection_error(exc)` / `_walk_exception_tree` | 连接错误识别（用于重连） |

`evoflow/mcp/binding.py`（工具绑定）、`result_budget.py`（结果预算）、`oauth.py`（授权）。

`evoflow/skills/loader.py`：`load_skills(...)`（主入口）、`get_skills_root_path()`、`_candidate_profile_roots()`、`_dedupe_skills_by_name`、`_resolve_scope_shadowing`（**作用域遮蔽**）、`enabled_plugin_skill_names`、`find_skill_directory`。

`evoflow/skills/injection.py`：`build_skill_injection_message(...)`、`format_skill_injection_block(skill)`、`skill_injection_execution_hint(...)`。

外部 Agent：`external_agents/`、`a2a/`。

### ③ 顺序执行链

```text
MCP：build_servers_config → pool 建连 → list_tools → binding 映射进工具目录
    → 调用（call_timeout_sec）→ result_budget 截断 → 连接错误识别后重连
技能：load_skills（多 root + 去重 + 作用域遮蔽）
    → 命中技能 → format_skill_injection_block → build_skill_injection_message 注入
```

### ④ 关键机制讲解

1. **连接池要带错误识别与重置**，否则 MCP 一次断连后永远不可用。
2. **技能有作用域遮蔽**：同名技能按作用域覆盖，复写时别只按名字去重。
3. **结果预算在 MCP 层就有**，不是等到上下文压缩才处理。

### ⑤⑥ 复写设计与步骤

`mcp/{client.py, pool.py, binding.py}`、`skills/{loader.py, injection.py}`。

- L1：连本地 MCP server，列工具并调用一次。
- L2：schema 映射与结果预算；技能加载与 frontmatter 校验。
- L3：连接错误重连、技能作用域遮蔽、OAuth fake 流。
- L4：连接失败、令牌过期、工具消失、越权、超时。

### ⑦ 验收要点

- 本地 MCP 一次真实调用往返；同名技能按作用域正确遮蔽；结果超预算被截断。

---

## 第 14 章 Gateway 与渠道

### ① 功能理解

应用层负责进程装配、HTTP/SSE、渠道接入。核心层不感知这些。

### ② 教材代码地图

`app/gateway/app.py`：`create_app(defer_routers=True)`（建 FastAPI、中间件、路由、健康检查）、`lifespan(app)`（启动装配与关闭）。`app/gateway/routers/` 约 77 个路由文件，按域划分（`chat_sessions.py`、`langgraph_proxy.py`、`runs.py`、`events.py`、`knowledge.py`、`automation_scheduler.py`…）。

`app/channels/base.py`：`class Channel(ABC)`（渠道抽象）。
`app/channels/manager.py`（约 4000 行）：`class ChannelManager` 负责渠道会话、入站解析、流式文本累积、产物投递等；可见 `_persist_channel_session_index`、`_build_human_input`、`_extract_response_text`、`_accumulate_stream_text`、`_prepare_artifact_delivery` 等职责划分。
渠道实现：`feishu.py`、`dingtalk.py`、`telegram.py`、`slack.py`、`wecom.py`，消息总线 `message_bus.py`。

### ③ 顺序执行链

```text
lifespan：加载配置 → 建 DB/图 → ports.register 各实现（broadcaster/channel…）→ 挂 routers → 起渠道
HTTP：鉴权 → 参数校验 → RunService → SSE/JSON
渠道：入站 → 归一化 → _build_human_input → RunService → 流式累积 → 出站格式化/产物投递
```

### ④ 关键机制讲解

1. **port 注册发生在应用层启动**，所以核心层任何时候都不 import app。
2. **渠道有大量“文本累积/格式化”逻辑**，IM 的流式不是把 SSE 原样转发，而是要聚合成可编辑的消息。
3. **路由按域拆**，不要学成一个巨型 main.py。

### ⑤⑥ 复写设计与步骤

`app/gateway/{app.py, deps.py}`、`routers/{chat.py, runs.py, sessions.py, events.py}`、`app/channels/{base.py, manager.py, bus.py, fake.py}`。

- L1：健康检查 + 聊天接口。
- L2：SSE 接入第 7 章；会话/运行查询分页；fake 渠道入站→出站。
- L3：渠道注册与生命周期、消息格式化、失败重试。
- L4：参数错误、未授权、渠道断连、限流、优雅关闭。

### ⑦ 验收要点

- `curl` 打通聊天与 SSE；fake 渠道收发各一条；关闭时无悬挂任务；真实 IM 未接记“已验收（替身）”。

---

## 第 15 章 身份权限与可观测

### ① 功能理解

每个请求有主体，资源访问默认拒绝；每次运行有 trace、用量与成本；评估可回归。

### ② 教材代码地图

`evoflow/authz/principals.py`：

| 函数 | 职责 |
|---|---|
| `get_principal` / `principal_from_row` | 主体读取 |
| `resolve_principal_by_identity(...)` | 按身份解析主体 |
| `create_principal` / `set_principal_status` / `update_principal` | 主体管理 |
| `ensure_webui_principal` / `get_or_create_local_admin` | WebUI 主体与本地管理员兜底 |
| `resolve_or_provision_oidc_principal(...)` | OIDC 主体自动供应 |
| `personal_scope_for(principal)` | 个人作用域（隔离的关键） |
| `principal_to_public(...)` | 对外字段（不泄露内部字段） |

另有 `authz/http_guard.py`（HTTP 守卫）、`runtime_identity.py`（第 2 章的 `enrich_run_context_identity`）、`acl_store.py`、`resource_visibility.py`。

`evoflow/observability/agent_activity_stream.py`：`emit_agent_activity(...)`、`emit_panel_activity(...)`、`_broadcast_panel_activity(...)`（活动流广播，走 ports）。

`evoflow/observability/cache_pricing.py`：`resolve_cache_price(provider, model)`（按平台匹配价格规则）、`estimate_row_request_cost_cny(...)`（单行成本）、`estimate_row_cache_savings_cny(...)`（缓存节省）、`detect_platform(...)`。

`evoflow/eval/`：评估。

### ③ 顺序执行链

```text
请求 → http_guard 解析凭证 → resolve_principal → ACL/可见性（默认拒绝）
     → enrich_run_context_identity 写入 cfg → 进入图执行
运行 → emit_agent_activity / emit_panel_activity → ports 广播
     → token_usage（第6章）→ resolve_cache_price → estimate_row_request_cost_cny → 成本聚合
```

### ④ 关键机制讲解

1. **身份要一路传到图内**（第 2 章的 `enrich_run_context_identity`），否则工具层无法做权限判断。
2. **个人作用域由 `personal_scope_for` 统一计算**，不要在各模块各写一套。
3. **成本按平台规则匹配**，未配置价格的模型要记 0 并标注，不能报错中断。

### ⑤⑥ 复写设计与步骤

`authz/{principals.py, acl.py, guard.py}`、`observability/{trace.py, cost.py}`、`backend/packages/harness/myagentflow/eval/runner.py`。

- L1：无凭证拒绝；主体对资源 allow/deny 各一例。
- L2：run 级 trace；token 与成本聚合。
- L3：个人作用域隔离、trace 查询、eval fixture 回归。
- L4：过期凭证、跨主体读他人会话、价格缺失记 0。

### ⑦ 验收要点

- 401/403 证据；跨主体访问被拒；一条 trace 含模型与工具 span；成本可复算。

---

## 第 16 章 产品面与端到端收口

### ① 功能理解

最小可用页面 + 管理 API + 一条端到端任务。教材前端在 `evopanel/`，本阶段只参照行为，不复刻前端工程。

### ② 教材代码地图

行为入口看 `app/gateway/routers/`：`chat_sessions.py`（会话）、`agents.py`（Agent 管理）、`knowledge.py` / `knowledge_owned.py`（知识）、`apps.py`（应用）、`automation_scheduler.py`（自动化）、`models` 相关走 `backend/packages/harness/myagentflow/config/app_config.py` 的 `add_model_to_config` 等。

### ③ 顺序执行链

```text
页面发消息 → chat API → SSE 渲染 → 历史分页
管理面：模型/Agent/知识/任务 → 对应 router → 核心层服务 → 配置或 DB 变更 → 必要的 reload
```

### ④⑤⑥ 复写要点

- L1：静态页 + SSE，能发消息看回复。
- L2：会话列表与历史分页；一次模型配置管理。
- L3：知识与任务管理入口；错误与加载态。
- L4（端到端）：一条任务必须同时包含真实入口、一次工具调用、一次记忆召回、一次压缩或恢复、一次鉴权失败、一次断流续看，逐项给证据。

### ⑦ 验收要点

端到端记录含：入口操作、每步预期与实测、依赖真假、未覆盖项；缺一类核验都不算收口。

---

# 第三部分 附录

## 附录 A 功能状态表（唯一状态表）

状态词：`未学习 / 未实现 / 未验收 / 已验收（真实） / 已验收（替身） / 部分验收（列明项） / 已排除（附理由）`。

| ID | 功能 | 章 | 状态 |
|---|---|---:|---|
| MF-BASE-001 | 骨架、uv workspace、`.gitignore`、配置样例、本手册 | 0 | 已验收（真实）：`uv sync` 通过 |
| MF-CFG-001/002 | 配置加载、数据路径 | 1 | 未实现 |
| MF-MOD-001/002/003 | 模型工厂、凭证、规范化 | 1 | 未实现 |
| MF-RUN-001/002 | 主 Agent 构建与图注册 | 2 | 未实现 |
| MF-RUN-003/004/005 | 会话、Checkpoint、消息存储 | 3 | 未实现 |
| MF-RUN-006/007/008 | 生命周期、CLI、AppServer | 4 | 未实现 |
| MF-TOOL-001~004、007 | 目录、参数、结果、内置工具、后台命令 | 5 | 未实现 |
| MF-TOOL-005/006/008 | 中间件、审计用量、审批 | 6 | 未实现 |
| MF-EVT-001~004 | 事件、port、SSE、状态同步 | 7 | 未实现 |
| MF-CTX-001~003 | 预算、工具历史、压缩恢复 | 8 | 未实现 |
| MF-MEM-001~004 | 短/长期记忆、巩固注入、资产 | 9 | 未实现 |
| MF-KNOW-001~005 | 上传、切块、检索、引用、代码索引 | 10 | 未实现 |
| MF-EXEC-001~004 | 子代理、委派、沙箱、绑定清理 | 11 | 未实现 |
| MF-PLAN-001~003、MF-COLL-001 | 目标图、协作、幂等恢复 | 12 | 未实现 |
| MF-AUTO-001~003 | 自动化、定时心跳、通知 | 12 | 未实现 |
| MF-MCP-001~003、MF-SKILL-001/002、MF-EXT-001 | MCP、技能、外部 Agent | 13 | 未实现 |
| MF-API-001~003、MF-CHAN-001/002 | Gateway、查询、渠道 | 14 | 未实现 |
| MF-AUTH-001/002、MF-OBS-001~003 | 身份、守卫、trace、成本、eval | 15 | 未实现 |
| MF-UI-001/002、MF-E2E-001 | 产品面与端到端 | 16 | 未实现 |

**待评估域**（不写成已实现，也不轻易排除）：`exploration/`、`exploration_graph/`、`reflection/`、`person_*`、`community/`、`plugins/`、`capability/`。到第 12–13 章时逐项判定“必须对齐 / 裁剪对齐 / 替身对齐 / 有据排除”。

## 附录 B 复写时的命名对照（避免读混）

| 教材概念 | 实际含义 | 复写建议命名 |
|---|---|---|
| `lead_agent` | 主对话图 | `agents/lead_agent` |
| `goal_agent` / `agents/goal` | 目标执行图 | `agents/goal` |
| `plans/` | 套餐与能力绑定，**不是任务计划** | `plans/`（套餐）或延后 |
| `automation/` + `proactive/` | 自动化与主动心跳 | `automation/` |
| `runtime/ports.py` | 核心层→应用层能力注册表 | `runtime/ports.py` |
| `persistence` 三个库 | 业务 / 观测 / checkpoint | `app.db` / `observability.db` / `checkpoints.db` |

## 附录 C 单条验收记录模板

```text
ID:            MF-RUN-004
日期:          YYYY-MM-DD
教材基线:      f22af539
教材证据:      agents/checkpointer/async_provider.py:make_checkpointer
本项目证据:    myagentflow/agents/checkpointer/async_provider.py
入口/命令:     <CLI 或 HTTP>
预期:          <一句话>
实测:          <粘贴关键输出>
失败路径:      <至少一条>
依赖真假:      fake 模型 + 真实 SQLite
状态:          已验收（替身）——真实模型未验证
差异/未覆盖:   <列出>
```

## 附录 D 最容易犯的十个错

1. 不记教材 sha，拿 HEAD 当事实。
2. 先建模块再找行为，组件存在但没接线。
3. 只在 pytest 调函数就宣称完成。
4. 把内存补发当持久化恢复。
5. 图缓存键漏掉工具集。
6. 工具异常直接抛出炸掉整轮。
7. 把 SSE/HTTP 写进核心层，破坏 R1。
8. 忽略 `after_model` 逆序，用量/持久化顺序错。
9. 把 `plans/` 当任务计划图（它是套餐绑定）。
10. 拿不到真实 Key/租户就写“排除”，而不是替身验收。

## 附录 E 分章源码阅读清单

- 第 1 章：`config.example.yaml`、`backend/packages/harness/myagentflow/config/app_config.py`、`config/data_paths.py`、`backend/packages/harness/myagentflow/models/resolver.py`、`models/factory.py:create_chat_model`、`models/credential_loader.py`
- 第 2 章：`backend/langgraph.json`、`agents/lead_agent/agent.py:1001`、`graph_cache.py`、`intent_tool_profile.py`、`prompt.py`、`docs/knowledge/02-core-runtime/01-runtime-entry运行入口.md`
- 第 3 章：`agents/checkpointer/async_provider.py`（通读）、`persistence/chat_session_service.py`、`backend/packages/harness/myagentflow/persistence/chat_message_repositories.py`
- 第 4 章：`session_execution/{lifecycle.py, commands.py, queries.py}`、`backend/packages/harness/myagentflow/cli/main.py`、`app_server/stdio_rpc.py`
- 第 5 章：`tools/tool_catalog.py`、`arg_coerce.py`、`tool_result_shaper.py`、`tool_output_truncation.py`、`large_result_store.py`
- 第 6 章：`agents/middlewares/tool_error_handling_middleware.py`（重点读 `_build_runtime_middlewares`）、`agents/tool_approval_*`
- 第 7 章：`runtime/ports.py`、`app/gateway/routers/events.py`
- 第 8 章：`agents/context_compaction_core.py`、`context/model_request_token_estimate.py`、`context/tool_history_merge.py`
- 第 9 章：`memory/facade.py`、`recall_snapshot.py`、`stale_on_close.py`、`agents/middlewares/memory_middleware.py`
- 第 10 章：`knowledge/service.py`、`chunker.py`、`index_builder.py`、`code_index/symbols.py`
- 第 11 章：`backend/packages/harness/myagentflow/subagents/registry.py`、`subagents/executor.py`、`sandbox/sandbox_provider.py`
- 第 12 章：`agents/goal/`、`plans/service.py`、`app/gateway/automation_runner.py`、`proactive/`
- 第 13 章：`backend/packages/harness/myagentflow/mcp/client.py`、`mcp/pool.py`、`backend/packages/harness/myagentflow/skills/loader.py`、`skills/injection.py`
- 第 14 章：`app/gateway/app.py:create_app/lifespan`、`app/channels/base.py`、`app/channels/manager.py`
- 第 15 章：`authz/principals.py`、`authz/http_guard.py`、`observability/agent_activity_stream.py`、`observability/cache_pricing.py`
- 第 16 章：`app/gateway/routers/`、`evopanel/`（只看行为）
