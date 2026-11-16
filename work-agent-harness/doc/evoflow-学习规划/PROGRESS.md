# 进度台账 / Progress Ledger

> 用于多轮推进时对齐「哪些章已与真实源码核对」。规则：只有逐行读过对应实现、并在章末核对清单打勾的章，才能标 ✅。

更新时间：2026-11-16

## 总览

| Part | 章节数 | ✅ | 🟡 | 说明 |
|---|---|---|---|---|
| 00-导论 | 4 | 4 | 0 | 原文拆分，已核对 |
| 01-最小闭环 | 6 + README | 6 | 0 | 原文逐字迁移 |
| 02-持久化与运行生命周期 | 4 | 2 | 2 | ch1 检查点、ch2 生命周期已核对 |
| 03-工具深化与上下文控制 | 4 | 1 | 3 | ch3 Middleware 链已核对 |
| 04-记忆与长期资产 | 3 | 0 | 3 | — |
| 05-知识库与代码理解 | 4 | 0 | 4 | — |
| 06-委派隔离与危险操作治理 | 3 | 0 | 3 | — |
| 07-计划目标协作与探索 | 5 | 0 | 5 | — |
| 08-自动化与主动Agent | 4 | 0 | 4 | — |
| 09-外部能力生态 | 4 | 0 | 4 | — |
| 10-HTTP网关与渠道 | 3 | 0 | 3 | — |
| 11-身份组织与运维治理 | 6 | 0 | 6 | — |
| 12-Web桌面与产品体验 | 4 | 0 | 4 | — |
| 13-全量集成与复刻验收 | 2 | 0 | 2 | — |
| **合计** | **54** | **13** | **41** | |

## 本轮新增的已核对章节

| 章节 | 读过的源码 | 得到的关键结论 |
|---|---|---|
| 02/01 检查点与线程恢复 | `checkpointer/provider.py`（264）、`omit_transcript.py`（270）、`thread_state_reader.py`（172） | 检查点**不存 messages**（`_TRANSCRIPT_CHANNELS` = messages/ui_messages），唯一例外是存在未配对 tool_call；SQLite 长连接 + WAL + busy_timeout=5000 + `SELECT 1` 探活；读状态不编译图 |
| 02/02 运行生命周期与取消 | `session_execution/lifecycle.py`（228）、`langgraph_cancel.py`（279） | 状态写入单一入口；取消走 LangGraph HTTP API（默认 `:8070/api/langgraph`），活跃状态含 `interrupted`；**4s/0.25s 扫描确认**；404 归一为 `already_gone` |
| 03/03 Middleware 调用链与工具审计 | `agents/middlewares/`（71 条目）、`lead_agent/agent.py`（2002） | `after_model` **逆序**执行；需最后生效的放链头（`insert(0)`），需最先跑的放链尾（`append`）；澄清固定为链尾；压缩只在 `wrap_model_call` 临时折叠、不写检查点 |

## 下一批建议（按收益排序）

1. **03/04 上下文预算与压缩** — `context_compaction_middleware.py`（1538 行）是全书最有复用价值的单体实现。
2. **03/01 文件终端与宿主边界** — `workspace_guard_middleware.py` + `tools/` 路径围栏，决定安全下限。
3. **06/02 沙箱与权限预设** — `execution_security/permission_preset.py` 三档权限，复刻必须先立。
4. **05/04 代码索引** — `code_index/store.py` 的表设计与 FTS5 用法。
5. **08/02 调度器** — `automation_scheduler.py` 的补偿与单飞。

## 明确「不做」的清单（避免无限扩张）

- 不逐行复刻 60+ 中间件：只保留「顺序约束 + 5 个核心中间件（hydrate / dangling / compaction / approval / clarification）」。
- 不复刻 10 余张 `*_repositories` 分表：单库 + 少表。
- 不复刻 Tauri / 打包链路：与内核无关。
