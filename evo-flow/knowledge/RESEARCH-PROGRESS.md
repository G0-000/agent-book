# EvoFlow 研究进度面板

> **定位**：本文件是 EvoFlow 源码研究与独立仿写工程的唯一总进度面板。它只记录研究任务、文档、状态、审核、统计、未决问题和下一步；不替代 [MASTER-PLAN.md](MASTER-PLAN.md)，也不重复架构或 Runtime 研究结论。
>
> **权威规划**：[MASTER-PLAN.md](MASTER-PLAN.md)。所有阶段、功能点与正式产物路径以该文件为准。
>
> **最后更新**：2026-11-13；已建立六阶段文档框架并登记已有实际成果。

## 状态图例

| 标识 | 含义 |
|---|---|
| ⬜ | 未开始 |
| 🔄 | 进行中 |
| 🧍‍♂️ | 已完成，等待审核 |
| ✅ | 审核通过 |
| ❌ | 审核未通过，需要修改 |
| ⏸️ | 暂停 |
| 🚫 | 阻塞 |

**状态规则：**

- “研究状态”仅表示源码研究/文档产出是否完成。
- “审核状态”仅在用户明确审核通过后才可标记为 ✅。
- 研究完成不等于审核通过；本文件不会因为自动检查或 Agent 自评而更新为 ✅。

## 整体进度面板

### 统计口径

本面板按 `MASTER-PLAN.md` 中可枚举的**研究功能点**统计，不把每个 Markdown 文件机械等同于一个功能点：

- 第一阶段：7 项系统全景研究内容。
- 第二阶段：Agent Runtime 7 项（检查点 A–F + 最终综合报告）、Multi-Agent 10 项、Harness 10 项、Memory 12 项，共 39 项。
- 第三阶段：8 项跨模块研究主题。
- 第四阶段：10 项工程机制专题。
- 第五阶段：12 项独立架构/实现设计任务。
- 第六阶段：10 项实现验证能力。

**总功能点数：86。** 本统计不包含目录占位、独立图文件或索引文件；它们随对应功能点完成而产生。

| 指标 | 当前值 | 说明 |
|---|---:|---|
| 总阶段数 | 6 | 固定，以总规划为准 |
| 已完成阶段数 | 0 | 没有任一阶段满足全部功能点完成且审核通过 |
| 进行中阶段数 | 1 | 第二阶段 |
| 部分完成、待补齐阶段数 | 1 | 第一阶段 |
| 未开始阶段数 | 4 | 第三至第六阶段 |
| 已审核通过阶段数 | 0 | 无用户明确阶段审核通过记录 |
| 待审核阶段数 | 2 | 第一阶段整体成果、第二阶段已完成检查点 |
| 总功能点数 | 86 | 见上方统计口径 |
| 已完成研究功能点数 | 4 | 第一阶段系统架构总图；第二阶段 A、B、C |
| 已审核通过功能点数 | 0 | A、B、C 均未获得用户明确审核通过 |
| 研究完成率 | 4.65% | `4 / 86 × 100%` |
| 审核通过率 | 0.00% | `0 / 86 × 100%` |

## 六阶段总览

| 阶段 | 研究内容 | 研究状态 | 审核状态 | 已完成/总功能点 | 主目录 |
|---|---|---|---|---:|---|
| 第一阶段 | 系统全景研究 | 🧍‍♂️ 部分完成 | 🧍‍♂️ 待补齐、待审核 | 1 / 7 | `01-system-overview/`（规划） |
| 第二阶段 | 核心 Runtime 深度研究 | 🔄 进行中 | 🧍‍♂️ 已有检查点待审核 | 3 / 39 | `02-core-runtime/` |
| 第三阶段 | 跨模块架构研究 | ⬜ 未开始 | ⬜ 未开始 | 0 / 8 | `03-system-integration/` |
| 第四阶段 | 关键工程机制研究 | ⬜ 未开始 | ⬜ 未开始 | 0 / 10 | `04-engineering-mechanisms/` |
| 第五阶段 | 独立架构设计与仿写 | ⬜ 未开始 | ⬜ 未开始 | 0 / 12 | `05-independent-implementation/` |
| 第六阶段 | 实现验证与差异分析 | ⬜ 未开始 | ⬜ 未开始 | 0 / 10 | `06-validation/` |

---

## 第一阶段：系统全景研究

**阶段目标**：建立整体地图，不深入各模块内部执行机制。规划依据：`MASTER-PLAN.md:163-205`。

> 当前已有 `docs/knowledge/architecture-map系统架构图.md`，它保留在知识库根目录；按已审核约定，不迁移、不重复生成。`01-system-overview/` 的其余文档框架已创建，但均为 ⬜ 未研究。

| 功能点 | 对应正式文档 | 实际已有成果/状态 | 研究状态 | 审核状态 |
|---|---|---|---|---|
| 系统架构总图 | `01-system-overview/architecture-map系统架构图.md` | 已有根目录成果：[architecture-map系统架构图.md](architecture-map系统架构图.md) | 🧍‍♂️ 已有成果，待完整审核 | 🧍‍♂️ |
| 仓库结构分析 | `01-system-overview/repository-structure仓库结构.md` | 框架已创建，⬜ 未研究 | ⬜ | ⬜ |
| 模块识别/模块清单 | `01-system-overview/module-inventory模块清单.md` | 框架已创建，⬜ 未研究 | ⬜ | ⬜ |
| 架构依赖关系 | `01-system-overview/dependency-map依赖地图.md` | 框架已创建，⬜ 未研究 | ⬜ | ⬜ |
| 技术栈分析 | `01-system-overview/technology-stack技术栈.md` | 框架已创建，⬜ 未研究 | ⬜ | ⬜ |
| 入口分析 | 在上述结构/依赖/架构文档中交叉记录 | 仅有系统总图中的概览证据 | ⬜ | ⬜ |
| 测试结构与开源完整性分析 | 在上述模块/技术栈文档中交叉记录 | 仅有系统总图中的概览证据 | ⬜ | ⬜ |

**第一阶段判定：** 仅系统架构总图已有成果；其余功能点和完整审核均未完成，因此阶段不能标记为完成或审核通过。

---

## 第二阶段：核心 Runtime 深度研究

**阶段目标**：按顺序研究 Agent Runtime、Multi-Agent、Harness、Memory。四个模块全部完成并审核通过后，才可进入第三阶段。规划依据：`MASTER-PLAN.md:209-340`。

### 2.1 当前模块：Agent Runtime

| 检查点 | 研究内容 | 研究文档 | 研究状态 | 审核状态 | 完成日期/备注 |
|---|---|---|---|---|---|
| A | 真实 Run 创建入口 | [01-runtime-entry运行入口.md](02-core-runtime/01-runtime-entry运行入口.md) | 🧍‍♂️ | 🧍‍♂️ | 2026-11-13；普通 EvoPanel 主对话 → LangGraph Run 入口、transport 与 Gateway 分支已整理 |
| B | Graph 解析、Lead Agent Factory、缓存 | [02-graph-factory-cache图工厂缓存.md](02-core-runtime/02-graph-factory-cache图工厂缓存.md) | 🧍‍♂️ | 🧍‍♂️ | 2026-11-13；锁定版 LangGraph API factory/graph cache 已整理 |
| C | Context、Prompt、模型调用 | `02-core-runtime/03-context-prompt-model上下文提示词模型.md` | 🧍‍♂️ | 🧍‍♂️ | 2026-11-13；Context、Prompt、模型调用与错误边界已完成源码研究，等待审核 |
| D | Middleware 注册、Hook、Wrap 顺序 | `02-core-runtime/04-middleware-runtime中间件运行时.md` | ⬜ | ⬜ | 文档框架已创建，未开始源码研究 |
| E | Tool 生命周期 | `02-core-runtime/05-tool-lifecycle工具生命周期.md` | ⬜ | ⬜ | 文档框架已创建，未开始源码研究 |
| F | State、Checkpoint、Stream、完成路径 | `02-core-runtime/06-state-checkpoint-stream状态检查点流.md` | ⬜ | ⬜ | 文档框架已创建，未开始源码研究 |
| 综合 | Agent Runtime 综合报告；仅在 A–F 全部完成并审核后填充 | `02-core-runtime/agent-runtime智能体运行时.md` | ⬜ | ⬜ | 文档框架已创建；不得提前写入综合研究结论 |

### 2.2 后续模块：Multi-Agent

正式文档：`02-core-runtime/multi-agent多智能体.md`。

| 功能点 | 研究文档 | 研究状态 | 审核状态 |
|---|---|---|---|
| Lead Agent 初始化和运行机制 | `02-core-runtime/multi-agent多智能体.md` | ⬜ | ⬜ |
| Goal Agent 创建和管理 | `02-core-runtime/multi-agent多智能体.md` | ⬜ | ⬜ |
| Lead Agent 任务拆分 | `02-core-runtime/multi-agent多智能体.md` | ⬜ | ⬜ |
| 子任务委派 | `02-core-runtime/multi-agent多智能体.md` | ⬜ | ⬜ |
| Context 与 state 传递 | `02-core-runtime/multi-agent多智能体.md` | ⬜ | ⬜ |
| 并发/串行执行 | `02-core-runtime/multi-agent多智能体.md` | ⬜ | ⬜ |
| 子 Agent 结果收集 | `02-core-runtime/multi-agent多智能体.md` | ⬜ | ⬜ |
| 超时、失败与重试 | `02-core-runtime/multi-agent多智能体.md` | ⬜ | ⬜ |
| 子 Agent 生命周期 | `02-core-runtime/multi-agent多智能体.md` | ⬜ | ⬜ |
| 最终结果汇总 | `02-core-runtime/multi-agent多智能体.md` | ⬜ | ⬜ |

### 2.3 后续模块：Harness

正式文档：`02-core-runtime/harness.md`。

| 功能点 | 研究文档 | 研究状态 | 审核状态 |
|---|---|---|---|
| Execution Loop：执行循环与终止条件 | `02-core-runtime/harness.md` | ⬜ | ⬜ |
| Context Control：上下文限制与压缩 | `02-core-runtime/harness.md` | ⬜ | ⬜ |
| Tool Control：工具权限与调用限制 | `02-core-runtime/harness.md` | ⬜ | ⬜ |
| Retry：重试与失败恢复 | `02-core-runtime/harness.md` | ⬜ | ⬜ |
| Timeout：超时控制 | `02-core-runtime/harness.md` | ⬜ | ⬜ |
| Isolation：执行隔离 | `02-core-runtime/harness.md` | ⬜ | ⬜ |
| Approval：人工审批 | `02-core-runtime/harness.md` | ⬜ | ⬜ |
| Resource：资源限制 | `02-core-runtime/harness.md` | ⬜ | ⬜ |
| Safety：安全约束 | `02-core-runtime/harness.md` | ⬜ | ⬜ |
| Observability：日志、追踪、执行记录 | `02-core-runtime/harness.md` | ⬜ | ⬜ |

### 2.4 后续模块：Memory

正式文档：`02-core-runtime/memory记忆层.md`。

| 功能点 | 研究文档 | 研究状态 | 审核状态 |
|---|---|---|---|
| 记忆数据结构 | `02-core-runtime/memory记忆层.md` | ⬜ | ⬜ |
| 记忆提取机制 | `02-core-runtime/memory记忆层.md` | ⬜ | ⬜ |
| 记忆分类和组织 | `02-core-runtime/memory记忆层.md` | ⬜ | ⬜ |
| SQLite 数据库结构（如存在） | `02-core-runtime/memory记忆层.md` | ⬜ | ⬜ |
| 向量索引与检索（如存在） | `02-core-runtime/memory记忆层.md` | ⬜ | ⬜ |
| 记忆存储 | `02-core-runtime/memory记忆层.md` | ⬜ | ⬜ |
| 记忆更新 | `02-core-runtime/memory记忆层.md` | ⬜ | ⬜ |
| 记忆删除 | `02-core-runtime/memory记忆层.md` | ⬜ | ⬜ |
| 记忆检索与 Context 注入 | `02-core-runtime/memory记忆层.md` | ⬜ | ⬜ |
| 长期/短期记忆关系 | `02-core-runtime/memory记忆层.md` | ⬜ | ⬜ |
| 记忆持久化与恢复 | `02-core-runtime/memory记忆层.md` | ⬜ | ⬜ |
| 记忆相关测试 | `02-core-runtime/memory记忆层.md` | ⬜ | ⬜ |

---

## 第三阶段：跨模块架构研究

**阶段目标**：在四个核心模块完成后，研究它们的连接、协作、数据与状态传递。规划依据：`MASTER-PLAN.md:344-435`。

| 功能点 | 研究文档 | 研究状态 | 审核状态 |
|---|---|---|---|
| 模块交互：Runtime、Harness、Memory、Multi-Agent 的调用边界 | `03-system-integration/module-interaction模块交互.md` | ⬜ | ⬜ |
| 执行数据流：用户输入到最终输出 | `03-system-integration/execution-dataflow执行数据流.md` | ⬜ | ⬜ |
| 状态管理：共享与隔离状态 | `03-system-integration/state-management状态管理.md` | ⬜ | ⬜ |
| 消息传递：Lead Agent 与 Goal Agent 通信 | `03-system-integration/event-and-message-flow事件消息流.md` | ⬜ | ⬜ |
| 任务生命周期：开始到结束的组件路径 | `03-system-integration/lifecycle-management生命周期管理.md` | ⬜ | ⬜ |
| 持久化边界 | `03-system-integration/state-management状态管理.md` | ⬜ | ⬜ |
| 事件机制：事件总线、回调、消息队列 | `03-system-integration/event-and-message-flow事件消息流.md` | ⬜ | ⬜ |
| 模块依赖与可替换性 | `03-system-integration/module-interaction模块交互.md` | ⬜ | ⬜ |

---

## 第四阶段：关键工程机制研究

**阶段目标**：按工程能力而非模块边界，研究稳定性、可靠性与扩展性机制。规划依据：`MASTER-PLAN.md:439-479`。

| 功能点 | 研究文档 | 研究状态 | 审核状态 |
|---|---|---|---|
| Context Management：Token 预算、裁剪、压缩、恢复 | `04-engineering-mechanisms/context-management上下文管理.md` | ⬜ | ⬜ |
| Prompt Engineering：模板、动态组装、注入 | `04-engineering-mechanisms/prompt-engineering提示词工程.md` | ⬜ | ⬜ |
| Tool System：协议、Schema、注册、执行器 | `04-engineering-mechanisms/tool-system工具系统.md` | ⬜ | ⬜ |
| Middleware：链、顺序、拦截、扩展 | `04-engineering-mechanisms/middleware-system中间件系统.md` | ⬜ | ⬜ |
| Checkpoint：快照、恢复、状态持久化 | `04-engineering-mechanisms/checkpoint-and-persistence检查点持久化.md` | ⬜ | ⬜ |
| Error Handling：异常分类、传播、恢复 | `04-engineering-mechanisms/error-and-retry错误重试.md` | ⬜ | ⬜ |
| Retry：退避、失败限制、重试策略 | `04-engineering-mechanisms/error-and-retry错误重试.md` | ⬜ | ⬜ |
| Permission：工具/Agent/访问权限 | `04-engineering-mechanisms/permission-and-security权限安全.md` | ⬜ | ⬜ |
| Security：沙箱、输入安全、执行隔离 | `04-engineering-mechanisms/permission-and-security权限安全.md` | ⬜ | ⬜ |
| Observability：日志、Tracing、事件、指标 | `04-engineering-mechanisms/observability可观测性.md` | ⬜ | ⬜ |

---

## 第五阶段：独立架构设计与仿写

**阶段目标**：基于前四阶段结论，独立设计而非复制 EvoFlow 的 Agent 系统。规划依据：`MASTER-PLAN.md:483-596`。

| 功能点 | 研究文档 | 研究状态 | 审核状态 |
|---|---|---|---|
| 独立实现路线图与开发顺序 | `05-independent-implementation/implementation-roadmap实现路线图.md` | ⬜ | ⬜ |
| 目标总体架构 | `05-independent-implementation/target-architecture目标架构.md` | ⬜ | ⬜ |
| 独立 Agent Runtime 规格 | `05-independent-implementation/module-specifications/agent-runtime智能体运行时.md` | ⬜ | ⬜ |
| 独立 Multi-Agent 规格 | `05-independent-implementation/module-specifications/multi-agent多智能体.md` | ⬜ | ⬜ |
| 独立 Harness 规格 | `05-independent-implementation/module-specifications/harness.md` | ⬜ | ⬜ |
| 独立 Memory 规格 | `05-independent-implementation/module-specifications/memory记忆层.md` | ⬜ | ⬜ |
| 数据库设计 | `05-independent-implementation/database-design数据库设计.md` | ⬜ | ⬜ |
| API 设计 | `05-independent-implementation/api-design接口设计.md` | ⬜ | ⬜ |
| 技术选型与决策 | `05-independent-implementation/technology-decisions技术决策.md` | ⬜ | ⬜ |
| 核心接口与数据结构定义 | `05-independent-implementation/target-architecture目标架构.md` | ⬜ | ⬜ |
| 生命周期、工具协议、Multi-Agent 通信、Memory API、错误规范 | `05-independent-implementation/module-specifications/` 与 `api-design接口设计.md` | ⬜ | ⬜ |
| 独立实现测试策略 | `06-validation/test-strategy测试策略.md` | ⬜ | ⬜ |

---

## 第六阶段：实现验证与差异分析

**阶段目标**：用测试和代码证据验证独立实现，并与 EvoFlow 做功能和架构对照。规划依据：`MASTER-PLAN.md:600-639`。

| 功能点 | 研究文档 | 研究状态 | 审核状态 |
|---|---|---|---|
| Agent Runtime 可接收任务并完成循环 | `06-validation/test-strategy测试策略.md` | ⬜ | ⬜ |
| Model 可切换供应商 | `06-validation/test-strategy测试策略.md` | ⬜ | ⬜ |
| Context 管理验证 | `06-validation/test-strategy测试策略.md` | ⬜ | ⬜ |
| Tools 注册与调用验证 | `06-validation/test-strategy测试策略.md` | ⬜ | ⬜ |
| Harness 控制执行验证 | `06-validation/test-strategy测试策略.md` | ⬜ | ⬜ |
| Checkpoint 保存与恢复验证 | `06-validation/test-strategy测试策略.md` | ⬜ | ⬜ |
| Multi-Agent 委派与汇总验证 | `06-validation/test-strategy测试策略.md` | ⬜ | ⬜ |
| Memory 存储、检索与更新验证 | `06-validation/test-strategy测试策略.md` | ⬜ | ⬜ |
| Error Handling 与 Persistence 恢复验证 | `06-validation/test-strategy测试策略.md` | ⬜ | ⬜ |
| EvoFlow 功能/架构/性能对照与最终评估 | `06-validation/feature-comparison功能对照.md`、`architecture-differences架构差异.md`、`performance-evaluation性能评估.md`、`final-assessment最终评估.md` | ⬜ | ⬜ |

---

## 当前正在进行

| 项 | 当前状态 |
|---|---|
| 阶段 | 第二阶段：核心 Runtime 深度研究 |
| 模块 | Agent Runtime |
| 当前检查点 | **C：Context、Prompt、模型调用** 尚未开始；必须先获得 A、B 审核结论后推进 |
| 当前阶段状态 | 🔄 进行中 |

## 等待审核

| 研究成果 | 文档 | 研究状态 | 等待的审核结论 |
|---|---|---|---|
| 第一阶段系统架构总图 | [architecture-map系统架构图.md](architecture-map系统架构图.md) | 🧍‍♂️ 部分成果 | 是否认可现有总图及第一阶段补齐范围 |
| Agent Runtime 检查点 A：Run 创建入口 | [01-runtime-entry运行入口.md](02-core-runtime/01-runtime-entry运行入口.md) | 🧍‍♂️ | 入口链、源码路径、边界与未决项是否合格 |
| Agent Runtime 检查点 B：Factory/缓存 | [02-graph-factory-cache图工厂缓存.md](02-core-runtime/02-graph-factory-cache图工厂缓存.md) | 🧍‍♂️ | factory 链、锁定版框架证据、cache 结论是否合格 |
| Agent Runtime 检查点 C：Context、Prompt、模型调用 | [03-context-prompt-model上下文提示词模型.md](02-core-runtime/03-context-prompt-model上下文提示词模型.md) | 🧍‍♂️ | Context 三层合并、动态 Prompt、模型选择/工厂与错误处理是否合格 |

## 下一步任务

1. **人工审核检查点 A、B 与 C**，分别决定是否将审核状态更新为 ✅ 或 ❌。
2. 若 A、B、C 审核通过，开始第二阶段 Agent Runtime 的**检查点 D：Middleware（中间件）注册、Hook 与 Wrap 顺序**，在既有框架中填入真实源码研究证据：
   ```text
   docs/knowledge/02-core-runtime/04-middleware-runtime中间件运行时.md
   ```
3. 检查点 D 仍必须遵守 A–F 分段证据机制，不得提前进入 Tool 或 Checkpointer 的完整实现研究。

## 待解决问题与阻塞项

| 问题 | 影响范围 | 当前状态 | 后续处理 |
|---|---|---|---|
| 第一阶段正式研究框架已创建但未填充源码证据 | 第一阶段完整性与审核 | ⏸️ 待后续研究/审核 | 不迁移现有 `architecture-map系统架构图.md`；在框架中逐项填充真实研究 |
| A、B、C 尚无用户明确审核通过结论 | 第二阶段推进与统计审核通过率 | 🧍‍♂️ 等待审核 | 用户明确通过后才更新为 ✅ |
| EvoPanel Vitest 依赖解析曾被 npm registry 网络连接重置阻塞 | 检查点 A 的前端测试证据 | 🚫 环境/网络阻塞 | 网络恢复或依赖已安装后重试原命令 |
| 总计划提及的 `docs/EvoFlow-Research-Plan.md` 当前不存在 | 规划路径一致性 | ⏸️ 已以 `MASTER-PLAN.md` 为唯一权威规划 | 未经用户指示不创建或迁移 |

## 进度更新规则

每次完成一个检查点或功能点，必须同步更新本文件：

1. 更新研究状态与审核状态；
2. 登记或核对对应文档路径；
3. 重新计算整体统计、研究完成率和审核通过率；
4. 更新“当前正在进行”“等待审核”“下一步任务”；
5. 记录完成日期、重要证据变更、测试结果和阻塞项；
6. 只有用户明确审核通过，才把审核状态改为 ✅；
7. 阶段只有在功能点全部完成、正式文档存在、质量检查完成且用户审核通过后，才可标记为 ✅。

## 更新记录

| 日期 | 变更 | 说明 |
|---|---|---|
| 2026-11-13 | 创建总进度面板 | 登记第一阶段已有系统总图；登记第二阶段 Agent Runtime 检查点 A、B 已完成待审核；其余功能点按总计划初始化为未开始 |
| 2026-11-13 | 建立六阶段文档框架 | 创建未研究的阶段文档、参考索引和 Mermaid 图占位；不新增源码分析结论，不改变功能点研究/审核状态 |
| 2026-11-13 | 完成 Agent Runtime 检查点 C | 真实源码研究 Context、Prompt、模型选择/实例化和模型错误处理；相关测试 56 passed；状态为完成待审核 |