# 参考索引：测试索引

> **状态**：⬜ 未研究。用于集中登记各研究文档引用的测试、断言、命令与结果。

## 研究目标

- ⬜ 未研究：建立可追溯的测试名称、断言、命令和实际结果索引。

## 维护规则
- ⬜ 未研究：每个测试条目必须记录真实测试名称、关键断言、命令和实际结果。
- ⬜ 未研究：环境阻塞、skip、失败和通过必须明确区分。

## 索引表

| 阶段/文档 | 测试文件与名称 | 关键断言 | 命令 | 结果 | 备注 |
|---|---|---|---|---|---|
| 待研究 | ⬜ 未研究 | ⬜ 未研究 | — | — | 等待研究结果填充 |
| Agent Runtime C | `test_im_channel_prompt_gate.py::test_channel_survives_langgraph_context_coerce` | `channel`、`channel_chat_id` 经 context coercion 后保留 | C 测试集 | passed | Context schema 证据 |
| Agent Runtime C | `test_dynamic_prompt_role_revision.py` | cache invalidation 清空 thread/system/role cache；角色签名含 DB revision | C 测试集 | passed | Dynamic Prompt 失效证据 |
| Agent Runtime C | `test_model_resolver.py`、`test_model_resolver_e2e.py` | runtime 优先、无效 runtime 回退、四级阶梯 | C 测试集 | passed | 模型选择证据 |
| Agent Runtime C | `test_model_error_shows_as_ai_reply.py` | delta/body text、AIMessage、billing 不 fallback | C 测试集 | passed | 可见错误与恢复边界 |
| Agent Runtime C | `test_uploads_middleware.py` | 文档/图片上下文在模型前注入，vision blocks 保留 | C 测试集 | passed | 模型请求输入边界 |
| Agent Runtime C | 8 个测试文件合计 | 56 个测试通过 | `uv run --project backend pytest -q …` | 56 passed | 见检查点 C 报告 |

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
