# 第 3 章　Middleware 调用链与工具审计

> **状态：** ✅ 本章代码与测试已落地：`agents/middlewares/chain.py`、`audit.py` + 3 个测试用例。  
> **范围：** 只实现「工具调用」这一层的洋葱链与审计。模型前后钩子、审批、循环检测、澄清拦截不在本章实现。

## 1. 先纠正一个容易写错的模型

很多教程把中间件写成两个列表：

```text
for mw in middlewares:
    args = mw.before_tool(name, args)
result = call(name, args)
for mw in reversed(middlewares):
    result = mw.after_tool(name, args, result)
```

这套写法有三个坑：

1. `after_tool` 必须手动逆序，写成正序就会出现「后申请的资源先失效」；
2. 工具抛异常时，`result` 未绑定，`after_tool` 要么拿 `None`，要么直接再抛一个异常把原始错误盖掉；
3. 中间件想「不改参数、只改结果」或「短路不调用工具」时，两个钩子表达不了。

EvoFlow 用的是另一种模型：每个中间件实现一个 `wrap_tool_call(request, handler)`，自己决定什么时候调用 `handler`。链在装配时嵌套起来，进入和退出顺序由嵌套结构保证，不靠人记得逆序。

## 2. 调用逻辑与 EvoFlow 源码导读

**调用逻辑（我们的最小实现）：**

```text
调用方
  └─ run_chain([outer, inner], request, call)
       ├─ outer.wrap_tool_call(request, handler=inner)
       │    ├─ inner.wrap_tool_call(request, handler=call)
       │    │    └─ call(request) → 工具结果
       │    └─ inner 返回（可改结果）
       └─ outer 返回（可改结果/记录耗时）
```

入口是 `run_chain()`，出口是工具结果（或中间件短路返回的值）。异常路径：工具抛异常 → 内层 `finally` 先退出 → 外层 `finally` 再退出 → 异常继续上抛。

**EvoFlow 源码读法：**

1. `/Users/main/EvoFlow/backend/packages/harness/evoflow/agents/lead_agent/agent.py`
   - 读 `_build_middlewares`（约 `:685`–`:941`），看中间件列表的装配顺序；
   - 注意列表顺序与执行顺序不是同一个方向：LangChain 编译图时把 `wrap_tool_call` 嵌套起来，列表第一个通常在最外层。
2. `/Users/main/EvoFlow/backend/packages/harness/evoflow/agents/middlewares/tool_error_handling_middleware.py`
   - 读 `wrap_tool_call`：工具名/参数从 `request.tool_call` 取，异常在这里被转成 `ToolMessage(status="error")`；
   - 这是「审计」和「错误处理」分开的典型：审计只记录，错误处理才改写结果。
3. 任意一个中间件文件（如 `loop_detection_middleware.py`）确认钩子签名统一为 `wrap_tool_call(request, handler)`，没有 `before_tool` / `after_tool`。

**调用顺序上的差异：** EvoFlow 的链由 `create_agent`/LangGraph 编译，`request` 是真实 `ToolCallRequest`；本章的 `run_chain` 是独立最小链，`request` 允许鸭子类型，便于单测。接入工具节点后，把真实请求传进来即可，链的嵌套语义不变。

## 3. 洋葱链长什么样

列表 `[outer, inner]` 装配后等价于：

```text
outer.wrap_tool_call(request, handler=inner_wrapped)
  └─ inner.wrap_tool_call(request, handler=call)
       └─ call(request)          真正执行工具
```

执行顺序：

```text
outer 进入 → inner 进入 → 工具 → inner 退出 → outer 退出
```

列表第一个在最外层。这样审计/计时中间件放在列表第一个，就能「最早看到请求、最晚看到结果」。

## 4. 写基类：默认放行

```python
class Middleware:
    """中间件基类：默认直接放行，子类覆盖 wrap_tool_call。"""
    name: str = "middleware"

    def wrap_tool_call(
        self,
        request: Any,
        handler: Callable[[Any], Any],
    ) -> Any:
        """包住一次工具调用；默认不改请求，直接交给下一层。"""
        return handler(request)
```

`request` 这里用 `Any` 而不是写死 LangChain 的 `ToolCallRequest`：本章的审计只读 `request.tool_call`，测试里可以用 `SimpleNamespace` 构造同样形状的请求。等真正接上 LangGraph 工具节点时，传进来的就是真实 `ToolCallRequest`，鸭子类型照样工作。

## 5. 组装链：一个循环 + 一个小函数

```python
def run_chain(
    middlewares: Iterable[Middleware],
    request: Any,
    call: Callable[[Any], Any],
) -> Any:
    """把中间件按列表顺序包成洋葱，执行最外层。

    列表 [m0, m1, m2] 的执行顺序：
        m0 进入 → m1 进入 → m2 进入 → 真正工具 → m2 退出 → m1 退出 → m0 退出

    第一个中间件在最外层：它能最早改写请求、最晚看到结果（典型审计/计时）。
    """
    handler = call
    for mw in reversed(list(middlewares)):
        # 默认参数绑定：不绑的话闭包会共享最后一个 handler
        handler = _wrap_one(mw, handler)
    return handler(request)


def _wrap_one(mw: Middleware, inner: Callable[[Any], Any]) -> Callable[[Any], Any]:
    """把单个中间件包在 inner 外面；抽出来是为了避免闭包捕获错层。"""
    def wrapped(request: Any) -> Any:
        return mw.wrap_tool_call(request, inner)

    return wrapped
```

为什么从 `reversed` 开始包：

- 先包最后一个中间件，它最靠近工具；
- 再包前一个，它套在外面；
- 循环结束时，列表第一个自然成为最外层。

如果正序包，列表第一个会变成最内层，审计只能看到「工具执行完」而看不到「请求原始参数」。

为什么把 `_wrap_one` 抽出来：直接在循环里写闭包，`mw` 和 `inner` 会捕获循环变量，最后所有层都指向同一个中间件。抽成函数后，参数按调用时绑定，每一层各拿各的。

## 6. 审计中间件：失败也留痕，但异常继续抛

```python
def _brief(args: dict[str, Any], limit: int = 120) -> str:
    """把工具参数压成一行短文本并截断，供审计日志用。"""
    text = json.dumps(args, ensure_ascii=False, default=str)
    return text if len(text) <= limit else text[:limit] + "…"   # 截断：日志里不该出现完整密钥


def _tool_name(request: Any) -> str:
    """从 ToolCallRequest 里取工具名；结构不对时给 unknown_tool。"""
    tool_call = getattr(request, "tool_call", None)
    if isinstance(tool_call, dict):
        return str(tool_call.get("name") or "unknown_tool")
    return "unknown_tool"


def _tool_args(request: Any) -> dict[str, Any]:
    """从 ToolCallRequest 里取参数；非 dict 一律当空参数。"""
    tool_call = getattr(request, "tool_call", None)
    if isinstance(tool_call, dict):
        args = tool_call.get("args") or {}
        return args if isinstance(args, dict) else {}
    return {}


class AuditMiddleware(Middleware):
    """记录每次工具调用的参数、耗时与结果的中间件。"""
    name = "audit"

    def wrap_tool_call(self, request: Any, handler: Any) -> Any:
        name = _tool_name(request)
        args = _tool_args(request)
        t0 = time.perf_counter()
        try:
            result = handler(request)
        except Exception as exc:
            # 失败也要留痕，但异常必须继续抛：审计层不负责吞错
            cost = time.perf_counter() - t0
            logger.info(
                "tool=%s args=%s cost=%.3fs ok=False error=%s",
                name, _brief(args), cost, exc.__class__.__name__,
            )
            raise
        cost = time.perf_counter() - t0
        logger.info("tool=%s args=%s cost=%.3fs ok=True", name, _brief(args), cost)
        return result
```

三个设计选择：

1. **计时用 `perf_counter`**：`time.time()` 会被系统时钟调整影响，耗时统计应该用单调时钟。
2. **参数摘要截断到 120 字符**：完整参数可能带 API key、完整文件内容；日志不是转录。
3. **异常只记录、不吞**：审计层把 `Exception` 转成「成功」或空结果是反模式，调用方会以为工具真的返回了空。

## 7. 测试：顺序、异常、审计

```python
def test_chain_is_onion():
    """列表第一个在最外层：进正序、出逆序。"""
    from myagentflow.agents.middlewares.chain import Middleware, run_chain

    events: list[str] = []

    class Rec(Middleware):
        def __init__(self, name: str) -> None:
            self.name = name

        def wrap_tool_call(self, request, handler):
            events.append(f"{self.name}:in")
            try:
                return handler(request)
            finally:
                events.append(f"{self.name}:out")

    result = run_chain(
        [Rec("outer"), Rec("inner")],
        _request(),
        lambda req: events.append("call") or "ok",
    )
    assert result == "ok"
    assert events == ["outer:in", "inner:in", "call", "inner:out", "outer:out"]
```

`Rec` 用 `try/finally` 记录退出：这样即使工具抛异常，也能验证退出顺序。`lambda req: events.append("call") or "ok"` 是先记录再返回 `"ok"`，因为 `append` 返回 `None`，`or` 会继续取 `"ok"`。

异常传播测试：

```python
def test_chain_propagates_error():
    """工具抛异常时，中间件仍退出且异常不被吞。"""
    import pytest
    from myagentflow.agents.middlewares.chain import Middleware, run_chain

    events: list[str] = []

    class Rec(Middleware):
        def wrap_tool_call(self, request, handler):
            events.append("in")
            try:
                return handler(request)
            finally:
                events.append("out")

    def boom(req):
        events.append("call")
        raise ValueError("tool failed")

    with pytest.raises(ValueError):
        run_chain([Rec()], _request(), boom)
    assert events == ["in", "call", "out"]
```

审计测试：

```python
def test_audit_logs_success(caplog):
    """审计记录工具名、参数摘要、耗时、ok=True。"""
    from myagentflow.agents.middlewares.audit import AuditMiddleware
    from myagentflow.agents.middlewares.chain import run_chain

    with caplog.at_level("INFO", logger="myaf.audit"):
        run_chain(
            [AuditMiddleware()],
            _request("echo", {"text": "hi"}),
            lambda req: "pong",
        )
    assert any("tool=echo" in r.message and "ok=True" in r.message for r in caplog.records)
```

## 8. 手把手从零做一遍

```bash
cd /Users/main/my-agent-flow/backend
mkdir -p packages/harness/myagentflow/agents/middlewares
touch packages/harness/myagentflow/agents/middlewares/__init__.py
```

新建 `chain.py`：先写 `Middleware` 基类，再写 `run_chain`，最后写 `_wrap_one`。建议顺序不要反：先有基类，测试才能构造 `Rec`。

新建 `audit.py`：先写 `_brief` / `_tool_name` / `_tool_args` 三个纯函数，再写 `AuditMiddleware.wrap_tool_call`。纯函数先写的好处是，审计逻辑不需要构造完整请求就能测。

新建 `tests/chapters/test_ch03_03_middleware.py`，跑：

```bash
uv run pytest tests/chapters/test_ch03_03_middleware.py -q
```

实测输出：

```text
3 passed, 13 warnings in 0.02s
```

## 9. 本章不做什么（必须如实说）

- **没有** `AgentMiddleware` 全量实现。EvoFlow 的中间件有 70 个文件，覆盖模型前后、审批、循环检测、预算、澄清；本章只做工具调用这一层。
- **没有** 接 `create_agent` / `ToolNode`。本章的 `run_chain` 是独立可测的最小链；真正接入时由工具节点把 `request` 传进来。
- **没有** 审批与拦截。`wrap_tool_call` 允许中间件不调用 `handler` 直接返回，但本章没有实现审批 UI/策略。
- **没有** 日志落盘。审计输出走标准 `logging`，是否写文件由部署侧配置。

## 10. EvoFlow 对照与差异（文件级）

| EvoFlow 文件 | 本项目文件 | 本章实现的符号/字段 | 未实现部分 |
|---|---|---|---|
| `agents/middlewares/`（约 70 个文件） | `agents/middlewares/chain.py`、`agents/middlewares/audit.py` | `Middleware`、`run_chain`、`AuditMiddleware`、`_brief` | 审批、循环检测、预算、澄清、模型前后钩子 |
| `agents/lead_agent/agent.py` | 未创建 | — | `_build_middlewares`、LangGraph 图装配 |
| `agents/middlewares/tool_error_handling_middleware.py` | `agents/middlewares/audit.py` | 异常记录 + 继续抛 | 把异常转成 `ToolMessage(status="error")` |

**有意省略的原因：** 本章要证明「嵌套顺序 + 异常语义 + 审计职责」三件事；把 70 个中间件抄进来会掩盖主线。错误转 `ToolMessage` 属于工具装配层，等接上 LangGraph 再加。

## 11. 验收

- [x] 列表第一个在最外层，进入正序、退出逆序
- [x] 工具异常继续上抛，不被审计层吞掉
- [x] 中间件退出在异常路径上仍然执行
- [x] 审计记录工具名、参数摘要、耗时、成功标记
- [x] `3 passed`，ruff 通过

## 12. 下一章衔接

中间件链解决「调用经过哪些层」。下一章解决「结果太大、上下文超预算」：token 估算、内联截断、超大结果落盘。

## 附：源码基准

- EvoFlow baseline：`f22af53910a470ddba633be35e25878214c2984ec`（v1.3.22，PolyForm Noncommercial）。
- 参考文件：`/Users/main/EvoFlow/backend/packages/harness/evoflow/agents/middlewares/`（工具钩子统一为 `wrap_tool_call`）。
- 许可：EvoFlow 为 PolyForm Noncommercial；本章为学习性转述与自有最小实现。
