# 进度台账 / Progress Ledger

> 用于多轮推进时对齐「哪些章已与真实源码核对」。**本表只记源码核对，不记本项目代码是否实现**；实现与验收见下面「实现验收记录」。

**状态定义（五档，不许混用）**

| 标记 | 含义 | 判定条件 |
|---|---|---|
| ✅ | 已核对源码 | 逐行读过对应实现，章末核对清单已打勾 |
| 📄 | 原文迁移 | 内容完整迁自原始资料，**未**与 EvoFlow 源码核对（保真，但不等于正确） |
| 🔍 | 结构已核对 | 路径、行数、类/函数/常量已在源码实测；**行为**（调用顺序、边界条件）未逐行读 |
| 🟡 | 骨架待核对 | 自研框架 + 真实路径线索，实现细节未核对 |
| ⬜ | 未开始 | — |

**事实基准（全站统一）**：EvoFlow `f22af53910a470ddba633be35e25878214c2984ec`（v1.3.22，2026-11-13）。
注意 `work-agent-harness/` 下更早的学习文档曾以 `87a95772…` 为基准，**两套编号不同属正常，但引用时必须写明出自哪一套**。

源码核对更新：2026-11-17　实现验收更新：2026-11-23（Asia/Tokyo）

## 实现验收记录

> 与上面的源码核对相互独立。数字只在下表日期与命令范围内有效，不要复制到其他文档当“当前通过数”。

| 日期 | 范围 | 命令 | 结果 |
|---|---|---|---|
| 2026-11-23 | 第 1 部分 | `uv run pytest tests/chapters/test_ch01_*.py -q` | 14 passed |
| 2026-11-23 | 第 2 部分 | `uv run pytest tests/chapters/test_ch02_*.py -q` | 17 passed |
| 2026-11-23 | 第 3 部分 | `uv run pytest tests/chapters/test_ch03_*.py -q` | 15 passed |
| 2026-11-23 | 第 4 部分 | `uv run pytest tests/chapters/test_ch04_*.py -q` | 17 passed |
| 2026-11-23 | 全量章节 | `uv run pytest tests/chapters -q` | 84 passed |
| 2026-11-23 | 静态检查 | `uv run ruff check packages tests` | All checks passed |

历史数字：2026-11-17 曾记录全量 `54 passed`、目录曾写第 1 部分 `35`；两者均已被上表取代，保留仅为追溯。

## 总览

| Part | 章 | ✅ | 📄 | 🔍 | 🟡 | 依据 |
|---|---|---|---|---|---|---|
| 00-导论 | 4 | 3 | 0 | 1 | 0 | 02 模块地图仍是文件名推断，已改为「路径+符号」实测版 |
| 01-最小闭环 | 6 | 0 | 5 | 0 | 1 | 原文迁移；ch1 已核对 `config.example.yaml`，实现代码未读 |
| 02-持久化与运行生命周期 | 4 | 2 | 0 | 2 | 0 | ch1 检查点、ch2 生命周期已逐行核对 |
| 03-工具深化与上下文控制 | 4 | 3 | 0 | 1 | 0 | ch1 路径解析、ch3 中间件链、ch4 压缩触发已全文核对；ch2 仅到 REST 层 |
| 04-记忆与长期资产 | 3 | 0 | 0 | 3 | 0 | 三章均为路径/符号级核对；旧「注入扫描器」已删除，不再作为依据 |
| 05-知识库与代码理解 | 4 | 0 | 0 | 4 | 0 | — |
| 06-委派隔离与危险操作治理 | 3 | 0 | 0 | 3 | 0 | — |
| 07-计划目标协作与探索 | 5 | 0 | 0 | 5 | 0 | — |
| 08-自动化与主动Agent | 4 | 0 | 0 | 4 | 0 | — |
| 09-外部能力生态 | 4 | 0 | 0 | 4 | 0 | — |
| 10-HTTP网关与渠道 | 3 | 0 | 0 | 3 | 0 | — |
| 11-身份组织与运维治理 | 6 | 0 | 0 | 6 | 0 | — |
| 12-Web桌面与产品体验 | 4 | 0 | 0 | 4 | 0 | — |
| 13-全量集成与复刻验收 | 2 | 0 | 0 | 2 | 0 | — |
| **合计** | **56** | **8** | **5** | **42** | **1** | 8 ✅ / 5 📄 / 42 🔍 / 1 🟡 |

> 上一版合计写作 54/13/41：**章节数算错（各 Part 相加为 56），且把「原文迁移」计入 ✅**。本次已按四档定义重算。

## 「从零实现（手把手）」覆盖

这是**第二个维度**，与上面的 ✅/📄/🔍/🟡（源码核对程度）相互独立：一章可以「源码核对 🔍 + 手把手已写」。

| 项 | 数量 | 说明 |
|---|---|---|
| 正文 42 章（01–13 各 Part 的技术章） | 42 / 42 | 全部含「从零实现（手把手）」节 |
| 其中按统一七节体例（`00-导论/04-实现手册体例.md`） | 41 | `02/01` 用「第 10 节」形式，内容等价、格式略异 |
| 代码落地（`my-agent-flow/backend`） | 见「实现验收记录」 | 不再在本行写裸测试数字，统一以带日期与命令范围的记录为准 |
| 已**实测跑通**代码的章节 | 4 | `02/01`（checkpointer 全链路）、`03/04`（压缩阈值）、`07/02`（账本防双领 + 超时回收）、`11/02`（JWT 验签 + 篡改拒绝）；其余按源码推导，未逐章实跑 |
| 已修掉的坑 | 2 | `07/02` 原测试用可疑的 `time_now()` → 改成显式 `now=last_seen+11`；`11/02` 原引用不存在的 `helpers_jwt.py` → 新增 Step 2 教创建 |

合并总文档：`agent-book/scripts/build_evoflow_master.py` → 输出到 `my-agent-flow/EvoFlow-学习规划-总文档.md`（改完子文档必须重跑）。

## 本轮新增的已核对章节

| 章节 | 读过的源码 | 得到的关键结论 |
|---|---|---|
| 02/01 检查点与线程恢复 | `checkpointer/provider.py`（264）、`omit_transcript.py`（270）、`thread_state_reader.py`（172） | 检查点**不存 messages**（`_TRANSCRIPT_CHANNELS` = messages/ui_messages），唯一例外是存在未配对 tool_call；SQLite 长连接 + WAL + busy_timeout=5000 + `SELECT 1` 探活；读状态不编译图 |
| 02/02 运行生命周期与取消 | `backend/packages/harness/myagentflow/session_execution/lifecycle.py`（228）、`langgraph_cancel.py`（279） | 状态写入单一入口；取消走 LangGraph HTTP API（默认 `:8070/api/langgraph`），活跃状态含 `interrupted`；**4s/0.25s 扫描确认**；404 归一为 `already_gone` |
| 03/03 Middleware 调用链与工具审计 | `agents/middlewares/`（71 条目）、`lead_agent/agent.py`（2002） | `after_model` **逆序**执行；需最后生效的放链头（`insert(0)`），需最先跑的放链尾（`append`）；澄清固定为链尾；压缩只在 `wrap_model_call` 临时折叠、不写检查点 |

## 下一批建议（按收益排序）

1. **03/04 上下文预算与压缩** — `context_compaction_middleware.py`（1538 行）是全书最有复用价值的单体实现。
2. **03/01 文件终端与宿主边界** — `workspace_guard_middleware.py` + `tools/` 路径围栏，决定安全下限。
3. **06/02 沙箱与权限预设** — `execution_security/permission_preset.py` 三档权限，复刻必须先立。
4. **05/04 代码索引** — `backend/packages/harness/myagentflow/code_index/store.py` 的表设计与 FTS5 用法。
5. **08/02 调度器** — `automation_scheduler.py` 的补偿与单飞。

## 范围三层（替代原来的「不做清单」）

原来的清单把「不复刻」和「不实现」混在一起，导致第 12 部分第 4 章还在写 Tauri 打包，与清单自相矛盾。改为三层，每章在标题下标注自己属于哪一层：

| 层 | 含义 | 判定 | 覆盖范围 |
|---|---|---|---|
| **A 复刻** | 自己写出来并能跑 | 有最小实现 + 可执行验收 | 内核闭环、持久化与生命周期、工具与上下文控制、记忆与知识、委派与计划、自动化主干、网关核心路由、Eval 基本盘 |
| **B 仅解释** | 读懂结构与取舍，**不实现** | 有真实路径与设计理由，无自研代码 | 60+ 中间件的逐项细节、组织与多租户治理全链路、渠道适配器全量（飞书/企微/钉钉/Slack/Telegram）、桌面端与 Tauri 打包、UI 全部页面 |
| **C 不做** | 明确不做，连解释也不必 | 与内核无关 | 10 余张 `*_repositories` 分表拆库（我们采用单库少表）、历史 YAML 迁移兼容路径、多端打包产物 |

> 第 12 部分第 4 章（Tauri）属于 **B 仅解释**：读它，是为了知道桌面端如何复用同一套 RPC 与权限模型，不是为了把安装包做出来。

## 源码语义核验（2026-11-17）

逐一回 `/Users/main/EvoFlow` 读代码核对「行为断言」，不只核对路径存在性。查出并改正 9 处：

| 章 | 原文（错） | 真实情况 |
|---|---|---|
| 01/01 | `AppConfig.redactor()`、`RedactingFilter`、`ModelRecord.__repr__` | 三者都不存在；真实脱敏是 `models/vendor_roundtrip.py:124 _redact_secrets`、`admin/platform_handlers.py:3650 _redact_channel_secrets`、`plans/service.py:172 redact_key` |
| 01/01 | `model_store.py` 自造建表列 | 换成 `persistence/schema.py:1031` 真实 DDL，并写明本复刻不复刻（模型放 config.yaml） |
| 01/02 | `StateGraph` 与 `call_model` 节点在 `agent.py` | EvoFlow 调 `create_agent`（`:1502`/`:1953`），无 `call_model` 节点 |
| 02/04 | `ShareStore.create()` 生成 token 并 hash 落库 | token 在 `routers/share.py:71` 生成、**明文**入库（`chat_share_repositories.py:121/172`）；`ShareStore` 不存在 |
| 03/03 | 中间件 71 个；装配在 705–760 | 70 个；`_build_middlewares:685-941`；逆序由 `langchain/agents/factory.py:1551` 连边实现，非 EvoFlow |
| 03/04 | 压缩后目标是 `refill_target()` | 该函数不存在；真实是 `compaction_trigger.py:20 POST_COMPRESS_REFILL_RATIO=1.22` / `:24 SAME_TURN_REFILL_RATIO=1.5` |
| 04/01 | 命名空间 `user/workspace/session/agent` | 实际是 `user/agent/workspace/person`（`memory/namespaces.py:6/10/17/27`），无 session |
| 10/02 | `completions()`、`_last_user()` | 两个 `chat_completions()`（`openai_compat_apps.py:274` / `openai_compat_models.py:49`）；无 `_last_user` |
| 10/03 | `Bus.inbound()` / `Bus.outbound()` | `publish_inbound:151` / `publish_outbound:341` |
| 12/02 | `read_settings()` / `write_settings()` 带版本号 | `get_app_setting:1113` / `set_app_setting:1132`；无版本号字段 |

已核验通过、未改动的：`utils/model_context_length.py` 三个阈值常量、`agents/lead_agent/agent.py:939` 澄清中间件在链尾、430 条源码路径存在性、298 组「文件+符号」配对、54 个本章测试断言。

## 配置层：按 EvoFlow 文件布局拆分（2026-11-17）

用户三次纠偏：`settings.py` → 单文件 `app_config.py` → **必须拆成 EvoFlow 的四个文件**。已按原布局落地，文件名/类名/函数名/字段名照抄，只做减法：

| EvoFlow | 复刻 | 抄 / 裁 |
|---|---|---|
| `config/app_config.py:94 AppConfig`（14 分区） | `backend/packages/harness/myagentflow/config/app_config.py` | 5 分区：`log_level`/`models`/`primary_model`/`checkpointer`/`storage` |
| `config/model_config.py:78 ModelConfig`（30 列） | `backend/packages/harness/myagentflow/config/model_config.py` | 13 列，`name`（条目名）与 `model`（模型 ID）分开；含 `_drop_reserved_model_config_key`、`resolve_model_max_output_tokens` |
| `backend/packages/harness/myagentflow/config/checkpointer_config.py:10` | 同名文件 | 整份含模块单例 `get/set_checkpointer_config()` |
| `backend/packages/harness/myagentflow/config/storage_config.py:10` | 同名文件 | `backend`/`sqlite_path`；`DEFAULT_APP_DB_REL` 暂内联 |
| `models/resolver.py:38/63` | `backend/packages/harness/myagentflow/models/resolver.py` | `NoChatModelConfiguredError`、`resolve_run_model`、`get_app_config_safe`、`_global_default_model`（只留两层来源） |
| `backend/packages/harness/myagentflow/models/factory.py:879` | `backend/packages/harness/myagentflow/models/factory.py` | `create_chat_model(name=None, thinking_enabled=False, **kwargs)`，只实现 openai |

测试从 54 → 57 passed，ruff 清零；`01/01` 的示例代码、五个 Step、对照表全部按四文件重写，`10/01`、`10/02`、`02/03` 的调用示例同步为 `create_chat_model()`。

## 代码注释细则（2026-11-17）

用户指出 `CheckpointerType = Literal[...]` 没有注释。已把「每个符号都要有注释」写成硬规则：`00-导论/04-实现手册体例.md` 第 3 节扩成六条（命名照 EvoFlow / 每个符号必注释 / 注释写为什么 / 代码能跑 / 一步一验证 / 兜底显式），并附对象→必写内容→反例表。

代码侧已补注释的裸符号：`CheckpointerType`（逐值说明与依赖）、`_LEGACY_DEFAULT_MAX_OUTPUT_TOKENS`、`DEFAULT_CONTEXT`/`AUTO_COMPACT_RATIO`/`ABSOLUTE_CAP`/两个 REFILL、`ROLES`、`PATTERNS`/`INVISIBLE`/`BLOCKED`、`POSTGRES_INSTALL`/`POSTGRES_CONN_REQUIRED`、`DANGEROUS`/`WRITE_MARKERS`、`DEFAULT`（记忆模板）、`_VER`、`BRIDGE_TOKEN_ENV`、`ALLOWED_END`、`ALLOWED`（审批终态），以及六处 `_SCHEMA` 建表 DDL 与 `backend/packages/harness/myagentflow/plans/parser.py`、`backend/packages/harness/myagentflow/knowledge/chunker.py` 的正则常量。

文件头规矩：反例 `CheckpointerType = Literal["memory", "sqlite", "postgres"]` 已写进体例文档，作为「类型别名必须逐个取值说明」的标准样例。

## 补 `backend/packages/harness/myagentflow/config/models_yaml.py`（2026-11-17）

用户指出文档引了 `config/models_yaml.py:116 flatten_providers_dict()`，但复刻仓库里没有这个文件。已补：

- 新建 `backend/packages/harness/myagentflow/config/models_yaml.py`：`infer_vendor_from_connection`、`_coerce_model_entry`、`_ensure_vendor_field`、`flatten_providers_dict`、`_normalize_models_input`、`coerce_models_field_for_appconfig`，函数名与 EvoFlow 一致；
- 未抄 `unflatten_models_to_providers_dict`（方向是「库里的模型 → yaml」，我们没有模型库）；
- `AppConfig.models` 增加 `field_validator(mode="before")`，扁平列表与 `models.providers` 分组两种 yaml 都能读；
- 新增测试 `test_providers_layout_is_flattened`（provider 层 base_url/api_key 下传、条目字段覆盖、name 顺序），本章 6 例、全书 58 passed；
- `config.example.yaml` 补 providers 写法注释，`01/01` 对照表与示例代码补 `models_yaml.py` 一节。

## 注释去噪（2026-11-17）

用户指出「（EvoFlow 同名字段 `_checkpointer_config`）」这类句子没必要。已清理：代码里不再写「EvoFlow 同名字段 / 同名函数 / 对齐某某行」，出处统一放文档对照表；受影响的 13 个文件（四个 config、resolver、factory、provider、budget、lifecycle、workspace_path_guard、测试 docstring）改为只讲行为与理由。

规则写入 `00-导论/04-实现手册体例.md` 3.3：注释不写对齐出处，文件头 docstring 最多说明「负责什么、为什么单独成文件」。

## 第 2 章代码核对（2026-11-17）

用户问「第 2 章相关代码都实现了么」。核对结论：手把手三步都已落地——`backend/packages/harness/myagentflow/agents/lead_agent/graph.py`（`build_graph(model, checkpointer=None)`，`MessagesState` + 单节点 `call_model`）与 `tests/chapters/test_ch01_02_graph.py`（2 例，实测 2 passed）。但文档上一版的「示例代码」贴的是一个 `Agent` 类（`render_prompt`/`start_run`/`execute`/`Redactor`/`Store`/`ToolRegistry`），仓库里从未有过，EvoFlow 也没有这个类——已删除并替换为真实的 `graph.py` 全文 + `chat.py` 调用节选。

同时修正：
- 章首「本章是手写 agent loop」→「只造单节点图，没有工具循环/中间件/system prompt」；
- 「本章目标 / 最小闭环 / 调用逻辑」三节从 run_id/事件流改写为 `invoke` 路径；
- 新增「代码实现状态」表（✅ graph.py 与 2 个测试；🟡 chat 路由接了图但未接 checkpointer；❌ 提示词注入、工具循环、run 生命周期分属 3/03、1/04、02/02）；
- 验收清单改成真实用例名（`test_single_turn`、`test_same_thread_keeps_history`）；
- 常见坑补 `build_graph(model, checkpointer=None)` 的第二个位置参数；
- 顺带清掉虚构的 `Redactor`：01/01 与 02 都改为「EvoFlow 用 `models/credential_sanitize.py` 的 `sanitize_api_key`/`sanitize_base_url`」。

## 第 3 章仓储拆分（2026-11-17）

用户指出我把 EvoFlow 的 `backend/packages/harness/myagentflow/persistence/chat_message_repositories.py`（消息）与 `backend/packages/harness/myagentflow/persistence/session_repositories.py`（会话）合并成了一个自造的 `persistence/messages.py`（`MessageStore` 类）。已按 EvoFlow 布局拆成三个文件：

| 文件 | 函数 | 说明 |
|---|---|---|
| `backend/packages/harness/myagentflow/persistence/db.py` | `get_db` / `db_connection_lock` / `reset_db` | 单例连接、WAL、busy_timeout、延迟建表 |
| `backend/packages/harness/myagentflow/persistence/session_repositories.py` | `upsert_session_row` / `get_session_row_for_ui` / `list_sessions_for_ui` / `delete_sessions_by_thread_id` | 表 `sessions` |
| `backend/packages/harness/myagentflow/persistence/chat_message_repositories.py` | `append_message` / `list_messages` / `count_messages` / `delete_messages_for_session` | 表 `chat_messages`，主键 `(thread_id, seq)` |

- 删除 `persistence/messages.py`；`tests/chapters/test_ch01_03_messages.py` 重写为 3 例，`test_ch01_06_e2e.py`、`test_ch13_01_e2e.py` 改用函数式 API + `monkeypatch` 设库路径。
- 文档同步：01/03 的示例代码、调用逻辑图、数据模型、业务规则、Step 1–4、对照表全部改成三文件叙述；01/06 与 13/01 的代码块同步改。
- 测试 **60 passed**，ruff 全绿。

