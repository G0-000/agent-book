# 参考索引：源码索引

> **状态**：⬜ 未研究。用于集中登记各研究文档实际引用的源码路径、符号与行号。

## 研究目标

- ⬜ 未研究：建立可追溯的源码、符号、行号与证据等级索引。

## 维护规则
- ⬜ 未研究：每个已完成研究结论应登记来源文件、符号、行号和证据等级。
- ⬜ 未研究：不把规划路径、README 叙述或推测写成源码证据。

## 索引表

| 阶段/文档 | 源码路径 | 符号 | 行号 | 证据等级 | 备注 |
|---|---|---|---:|---|---|
| 待研究 | ⬜ 未研究 | ⬜ 未研究 | — | — | 等待研究结果填充 |
| Agent Runtime C | `evoflow/langgraph_run_config.py` | `merge_configurable_into_context` | 85-110 | 源码证实 | 提交前 configurable/context 合并，context 同名键优先 |
| Agent Runtime C | `agents/lead_agent/runtime_context.py` | `LeadAgentRuntimeContext`、`merge_model_request_runtime_context` | 17-86；198-221 | 源码证实 | Context schema、模型请求阶段白名单覆盖 |
| Agent Runtime C | `agents/lead_agent/agent.py` | `make_lead_agent` | 1044-1054；1784-1807；1855-1901 | 源码证实 | factory 合并、动态 Prompt 元数据、初始 Prompt/模型构造 |
| Agent Runtime C | `agents/lead_agent/prompt.py` | `apply_prompt_template` | 2204-2289；2405-2471 | 源码证实 | Skill、memory 开关、工具目录和最终 Prompt 组装 |
| Agent Runtime C | `middlewares/dynamic_system_prompt_middleware.py` | `DynamicSystemPromptOnScenarioMiddleware` | 451-728 | 源码证实 | 指纹、缓存复用与动态重建 |
| Agent Runtime C | `models/resolver.py` | `resolve_run_model` | 63-114；211-246 | 源码证实 | 四级模型选择与无效 runtime 回退 |
| Agent Runtime C | `models/factory.py` | `create_chat_model` | 845-1136 | 源码证实 | provider 参数、thinking、credential、观测元数据 |
| Agent Runtime C | `middlewares/model_fallback_middleware.py` | `ModelFallbackMiddleware` | 1106-1134；1812-2010 | 源码证实 | 重试/fallback/可见 AIMessage |

## 研究范围

- ⬜ 未研究：仅覆盖本文件主题；跨模块内容只记录可验证的接口边界。
- ⬜ 未研究：不得以 README、规划草图或名称推断替代真实源码证据。

## 具体功能点

- ⬜ 未研究：依据 MASTER-PLAN.md 与实际源码细化本主题功能点。
- ⬜ 未研究：记录输入、输出、状态、副作用、异常与外部依赖边界。

## 需要分析的源码文件

- ⬜ 未研究：定位真实入口、核心类/函数、配置、持久化和测试文件。
- ⬜ 未研究：完成后记录真实路径、符号和精确行号。

## 需要追踪的调用链

- ⬜ 未研究：从真实输入/启动入口追踪到可观察输出或终止条件。
- ⬜ 未研究：逐跳记录输入、输出、副作用、错误处理与框架边界。

## 需要绘制的架构图

- ⬜ 未研究：模块依赖图。
- ⬜ 未研究：关键执行或数据流时序图。
- ⬜ 未研究：仅在源码关系被证实后绘制事实图。

## 需要验证的测试

- ⬜ 未研究：定位相关测试文件、测试名称和关键断言。
- ⬜ 未研究：记录命令、实际结果、skip、失败或环境阻塞。

## 研究证据标准

| 标记 | 含义 |
|---|---|
| 源码证实 | 真实源码路径、符号和行号已核对。 |
| 测试证实 | 已检查真实断言并记录实际运行结果。 |
| 探针验证 | 已用锁定版本依赖或本仓代码执行最小实验。 |
| 外部框架边界 | 调用进入第三方锁定版本组件，内部不作为本仓事实。 |
| 设计推断 | 明确列出支持证据的推断。 |
| 待确认 | 证据不足，禁止写成结论。 |

## 审核标准

- [ ] 所有关键结论可回溯至真实路径、符号和行号。
- [ ] 调用链没有用推测补全的跳点。
- [ ] 图只表达源码已证实关系。
- [ ] 测试登记真实断言和运行结果。
- [ ] 已同步更新 RESEARCH-PROGRESS.md。
- [ ] 只有用户明确审核后才可更新为 ✅。

## 仿写学习目标

- ⬜ 未研究：形成独立实现的职责、接口、数据结构和验证要求。
- ⬜ 未研究：区分应学习的约束与不应直接复制的实现细节。
