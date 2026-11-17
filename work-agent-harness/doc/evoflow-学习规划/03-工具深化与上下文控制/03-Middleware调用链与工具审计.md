# 第 3 章　Middleware 调用链与工具审计

> **对照状态** ✅ **已核对源码**：`agents/middlewares/`（71 个条目）、`agents/lead_agent/agent.py`（2002 行，装配逻辑在 705–760 行附近）。顺序注释、反向执行规则均来自源码原文。

## 本章目标
看懂 EvoFlow 的「Agent 循环」其实是一条**约 60 个中间件组成的流水线**，并理解注册顺序与执行顺序**方向相反**这一关键事实。

## 最小闭环
模型请求前注入动态 prompt → 工具调用前走审批 → 工具报错转成 ToolMessage → 循环检测 → 预算耗尽中止 → 澄清请求最后拦截。

## 1. 先纠正一个数字

`agents/middlewares/` 下有 **71 个条目**，但不是 71 个中间件：

| 类别 | 举例 | 说明 |
|---|---|---|
| 真中间件 | `context_compaction_middleware.py`、`loop_detection_middleware.py`、`tool_approval_middleware.py` | 实现 `AgentMiddleware` 钩子 |
| 一个文件多个类 | `tool_approval_middleware.py`（1553 行） | `ToolApprovalMiddleware`、`ToolApprovalReplayMiddleware`、`ToolApprovalDenyContinueMiddleware`、`ToolApprovalAnswersMiddleware` |
| 一个文件多个类 | `run_latency_timing_middleware.py` | `RunLatencyCycleMiddleware`、`RunLatencyWrapMiddleware`、`LiveActivityToolMiddleware` |
| 工具/辅助模块 | `middleware_timing.py`、`message_usage_helpers.py`、`stream_accumulator.py`、`model_request_messages.py`、`tool_approval_executor.py` | 被中间件调用，不是中间件 |
| 目录垃圾 | `__pycache__` | — |

**结论**：实际中间件类数量在 60 上下，数量本身没有意义，**顺序约束才是设计资产**。

## 2. 已核对的事实

| # | 事实 | 证据 |
|---|---|---|
| 1 | 运行时公共链由一个函数产出 | `build_lead_runtime_middlewares(lazy_init=True)`（在 `tool_error_handling_middleware.py:1087`） |
| 2 | 子代理用另一套：不带 uploads、不带 dangling patch | `build_subagent_runtime_middlewares()` |
| 3 | `after_model` 按列表**逆序**执行 | 源码注释：「after_model runs in reverse list order」 |
| 4 | 因此「要最后跑的 after_model」必须放在链**最前面** | `CheckpointTranscriptSlimMiddleware` 用 `insert(0, ...)`，注释写明「First in chain ⇒ after_agent runs last」 |
| 5 | 状态瘦身中间件放在最前，是为了让最终检查点丢掉 transcript | 同注释：「final checkpoint (esp. durability=exit) drops transcript blobs」 |
| 6 | 转写落库（Transcript）放得「早」，是为了它的 after_model 最后跑 | 注释：「Placed early so its after_model runs last ... capturing the final state」 |
| 7 | TokenUsage 在子代理链最后 append，所以它最先执行 | 注释：「after_model runs in reverse list order, so TokenUsageMiddleware (appended last) runs first」 |
| 8 | 澄清（Clarification）必须最后拦截 | 注释：「ClarificationMiddleware should be last to intercept clarification requests after model calls」 |
| 9 | Todo 必须排在澄清之前，否则待办管理被拦掉 | 注释：「TodoListMiddleware should be before ClarificationMiddleware」 |
| 10 | 图片细节注入必须早于澄清 | `ViewImageMiddleware` 注释 |
| 11 | 工具异常必须早于澄清转成 ToolMessage | `ToolErrorHandlingMiddleware` 注释 |
| 12 | 悬空 tool_call 必须在模型看到历史之前补上 | `DanglingToolCallMiddleware` 注释 |
| 13 | 上下文压缩在「hydrate + 工具过滤 + 计划守卫」之后，并且是**wrap_model_call 临时折叠、不写检查点** | 注释：`folds ephemerally at wrap_model_call (not checkpoint)` |
| 14 | UI 转写与压缩摘要只存 `evoflow_chat_messages` | 同注释 |
| 15 | ThreadData 必须早于 Sandbox，Uploads 必须在 ThreadData 之后 | 注释（thread_id 依赖） |
| 16 | 每个中间件带计时探针，阈值由 `EVOFLOW_MW_TIMING_MS` 控制 | `_instrument_middleware_timing_all()` |

## 3. 链的执行方向（关键）

```text
注册列表 [ m0, m1, m2, ..., mN ]

before_model   : m0 → m1 → m2 → ... → mN     （正序，逐层改写请求）
wrap_model_call: 嵌套，越靠后越在内层（包裹执行）
after_model    : mN → ... → m2 → m1 → m0     （逆序！）
wrap_tool_call : 嵌套，典型的「洋葱」结构
```

**这就是为什么**：
- 想让某个 after 钩子「最后说话（看到最终状态）」，就把它放在**列表最前面**；
- 想让某个 after 钩子「最先跑（拿到原始 usage）」，就把它**最后 append**。

## 4. 真实链路骨架（按源码装配顺序摘录）

```text
[insert(0)] CheckpointTranscriptSlimMiddleware   # after_agent 最后跑 → 最终检查点瘦身
build_lead_runtime_middlewares()                 # ThreadData → Sandbox → Uploads → DanglingToolCall → …
TurnContextMiddleware                            # 每轮上下文
SessionTranscriptHydrationMiddleware             # hydrate（从消息表灌历史）
UploadsMiddleware / ContextFilesMiddleware       # 上传元数据、本地路径
GoalAutoContinue / GoalContinuationAssembler      # 目标续跑
[gating] TodoMiddleware                          # 按 agent 工具白名单挂载
ContextCompactionMiddleware                      # 排在工具过滤 + 计划守卫之后注册
PlanGuardMiddleware / PlanDocMiddleware          # 计划阶段只读约束 / 计划落 outputs/plan.md
ToolApprovalMiddleware(+Replay/DenyContinue/Answers)
ClarificationMiddleware                          # 最后，拦截澄清请求
[append] RunLatencyCycleMiddleware               # 模型周期计时
[append] TranscriptMiddleware                    # after_model 最后跑 → 落最终转写
```

## 5. 工具审计与审批

| 职责 | 路径 | 要点 |
|---|---|---|
| 审批主流程 | `middlewares/tool_approval_middleware.py`（1553 行，4 个类） | 拦截 → 挂起 → 恢复 → 重放 |
| 审批执行/落库 | `middlewares/tool_approval_executor.py`、`agents/tool_approval_service.py` | 决策与副作用分离 |
| 暂停注册 | `agents/tool_approval_pause_registry.py` | run 挂起态登记 |
| 轨迹 | `agents/tool_approval_trace_log.py` | 谁批的、批了什么 |
| 黑名单 | `agents/tool_approval_denylist.py` | 永不批准的工具 |
| 会话工具锁定 | `middlewares/tool_surface_lock_middleware.py`、`tool_binding_sync_middleware.py` | 工具面固定，防运行中扩权 |

**审计三件套**：`run_id` + 工具名 + **参数摘要**（不是全参数，防泄密），决策与 actor 分列。

## 6. 自研实现要点

```python
class Chain:
    def before(self, req):
        for m in self.before_list: req = m(req)      # 正序
        return req
    def after(self, resp):
        for m in reversed(self.after_list): resp = m(resp)   # 逆序，刻意与注册顺序相反
        return resp
    def wrap_tool(self, call, run):
        f = run
        for m in reversed(self.wrap_list): f = m(f)   # 洋葱：最后注册的最外层
        return f(call)
```

- 每个中间件**只做一件事**，用显式 `order` 而不是「看别人有没有改」。
- 把顺序约束写成注释/断言（EvoFlow 用注释，容易腐化；建议用 `test_middleware_order` 固化）。
- `lazy_init=True`：中间件按需实例化，避免启动加载全部依赖。

## 7. 业务规则

- 澄清必须最后拦；待办、图片、工具异常都必须在它之前。
- 悬空 tool_call 必须在 hydrate 之后、模型调用之前修复。
- 压缩只能临时折叠，不得写进检查点（否则不可逆）。
- 审批挂起时 run 进 `waiting_approval`，恢复必须带同一 `approval_id` 且参数摘要一致。

## 8. 常见坑

| 坑 | 后果 | 对策 |
|---|---|---|
| 以为 after 是正序 | 数据被后跑的中间件覆盖 | 记住逆序；用测试断言 |
| 两个中间件改同一 prompt 字段 | 顺序敏感 bug，难复现 | 单一职责 + 明确 order |
| 压缩写进检查点 | 历史被永久删减 | 只在 wrap_model_call 折叠 |
| 澄清不在最后 | 澄清请求被其他钩子吞掉 | 固定为链尾 |
| 悬空 tool_call 未修 | 模型下一轮直接报错 | hydrate 后立即 patch |
| 中间件抛异常被吞 | 表现为「模型不回复」 | 异常必须转成可观测事件 |

## 9. 验收

- [ ] 顺序断言测试存在（改顺序即失败）
- [ ] 悬空 tool_call 可自愈
- [ ] 审批挂起/恢复严格一次
- [ ] 压缩不改变检查点内容
- [ ] 每轮有 per-middleware 耗时（可用 `EVOFLOW_MW_TIMING_MS` 打开）

## 10. 对照 EvoFlow 核对清单

- [x] after_model 逆序执行
- [x] 链头 insert 与链尾 append 的意图
- [x] 澄清/待办/图片/异常的相对顺序约束
- [x] 压缩「临时折叠不写检查点」
- [ ] `_build_runtime_middlewares()` 完整列表（本次只读注释与装配片段，未逐行确认全部 40+ 项）
- [ ] `checkpoint_transcript_slim_middleware.py` 与 `OmitTranscriptCheckpointer` 是否重复
- [ ] 中间件数量按类精确统计（需按 `class .*Middleware` 计数）

## 从零实现（手把手）
> 读完这章你知道中间件「谁先谁后」为什么重要，并写出一个能记录每次工具调用的审计中间件。
> 路径均相对 `backend/`，代码注释写「为什么」。

### Step 1　新建 chain.py：顺序 + 反向收尾
**文件**：`packages/harness/myagentflow/agents/middlewares/chain.py（新建）`
**要写的逻辑**：`before` 正序、`after` 逆序（洋葱模型）；任何一层抛异常都要保证已进入的层能收尾。

**代码**

```python
"""中间件链：进正序、出逆序。

为什么 after 要逆序：它是「清理」语义——后申请的资源先释放，
否则 A 依赖 B 的资源时，A 先清理会让 B 拿到已失效的对象。
"""
from __future__ import annotations

from collections.abc import Callable, Iterable
from typing import Any


class Middleware:
    name: str = "middleware"

    def before_tool(self, name: str, args: dict[str, Any]) -> dict[str, Any]:
        return args              # 默认不改参数

    def after_tool(self, name: str, args: dict[str, Any], result: Any) -> Any:
        return result            # 默认不改结果


def run_chain(mws: Iterable[Middleware], name: str, args: dict[str, Any],
              call: Callable[[str, dict[str, Any]], Any]) -> Any:
    entered: list[Middleware] = []
    current = args
    try:
        for mw in mws:
            current = mw.before_tool(name, current)
            entered.append(mw)
        result = call(name, current)
    finally:
        for mw in reversed(entered):     # 逆序收尾
            result = mw.after_tool(name, current, locals().get("result"))
    return result
```

**验证**

```bash
uv run python -c "from myagentflow.agents.middlewares.chain import Middleware, run_chain; print('import ok')"
```

### Step 2　加审计中间件：记录谁调了什么
**文件**：`packages/harness/myagentflow/agents/middlewares/audit.py（新建）`
**要写的逻辑**：只记录工具名、参数摘要、耗时、成功与否；参数要截断，避免把密钥写进日志。

**代码**

```python
"""审计中间件：每次工具调用留一行。"""
from __future__ import annotations

import json
import logging
import time
from typing import Any

from myagentflow.agents.middlewares.chain import Middleware

logger = logging.getLogger("myaf.audit")


def _brief(args: dict[str, Any], limit: int = 120) -> str:
    text = json.dumps(args, ensure_ascii=False, default=str)
    return text if len(text) <= limit else text[:limit] + "…"   # 截断：日志里不该出现完整密钥


class AuditMiddleware(Middleware):
    name = "audit"

    def __init__(self) -> None:
        self._t0: dict[str, float] = {}

    def before_tool(self, name: str, args: dict[str, Any]) -> dict[str, Any]:
        self._t0[name] = time.time()
        return args

    def after_tool(self, name: str, args: dict[str, Any], result: Any) -> Any:
        cost = time.time() - self._t0.pop(name, time.time())
        logger.info("tool=%s args=%s cost=%.3fs ok=%s", name, _brief(args), cost,
                    not isinstance(result, Exception))
        return result
```

**验证**

```bash
uv run python -c "
from myagentflow.agents.middlewares.audit import AuditMiddleware
from myagentflow.agents.middlewares.chain import run_chain
print(run_chain([AuditMiddleware()], 'echo', {'text':'hi'}, lambda n,a: a['text']))
"
```

### 与 EvoFlow 对照

| 我们的做法 | EvoFlow | 为什么 |
|---|---|---|
| 进正序 / 出逆序 | `lead_agent/agent.py` 的中间件装配顺序 | 顺序错会导致资源提前释放 |
| 参数截断后入日志 | 工具审计日志 | 全量参数会把 token/密钥写进日志 |
| finally 里逆序收尾 | 中间件异常处理 | 抛异常也要保证清理 |

### 知识点

- [LangGraph 课程：图、节点与执行顺序（正序进/逆序出的前提）](https://g0-000.github.io/agent-book/langgraph/)
- [日志分析平台的演变：审计日志该记什么、怎么留](https://harbor404.fushenlin.com/notes/note-b7134f72/)

### 验收

```bash
uv run python -c "from myagentflow.agents.middlewares.chain import run_chain; print('ok')"
```
