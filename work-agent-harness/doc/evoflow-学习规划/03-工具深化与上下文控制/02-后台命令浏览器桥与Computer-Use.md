# 第 2 章　后台命令与桥接鉴权

> **状态：** ✅ 本章代码与测试已落地：`background_bash.py` + `bridge_auth.py` + 4 个测试用例。  
> **范围：** 后台任务表（登记/查询/停止/输出快照）与桥接 token 校验。浏览器桥、CUA、HTTP 路由不在本章实现；原因见文末。

## 1. 为什么需要「后台任务表」

一条 `npm install` 可能跑 3 分钟，一条 `pytest` 可能跑 10 分钟。同步等待会带来三个问题：

1. 主对话被阻塞，用户看不到任何进度；
2. 网关/客户端超时，任务被误判失败；
3. 进程还在跑，但调用栈已经没了，之后没人能停它。

正确做法是：**命令一启动就登记成一条任务**，调用方立刻拿到 `task_id`；之后通过任务表查询、停止、读输出。

本章先实现任务表本身，不实现进程启动。进程启动属于工具层（拿到 argv、cwd、环境变量之后 `Popen`，再 `register_task`），本章只保证「登记之后生命周期可控」。

## 2. 一条后台任务要记什么

```python
@dataclass
class BackgroundBashTask:
    """一次后台命令的事实：id、命令、输出文件、状态、进程。"""
    task_id: str
    command: str
    description: str
    output_path: Path
    status: str = "running"          # running | completed | failed | stopped | cancelled
    exit_code: int | None = None
    error: str = ""
    proc: object | None = None
    started_at: float = field(default_factory=time.time)
    ended_at: float | None = None
    thread_id: str = ""
```

字段逐个解释：

| 字段 | 为什么必须有 |
|---|---|
| `task_id` | 调用方之后只能拿这个 id 来查/停，必须短且唯一 |
| `command` | 面板要展示「到底跑了什么」 |
| `output_path` | 进程输出写文件，内存里不堆全量日志 |
| `status` | 状态机：`running` → `completed` / `failed` / `cancelled` |
| `exit_code` | 失败排查的第一现场；被停止时用 `-1` 区分 |
| `proc` | 停止时要 `kill()` 的那个句柄 |
| `started_at` / `ended_at` | 面板排序、耗时统计 |
| `thread_id` | 多会话共用进程时，按会话过滤 |

`proc` 用 `object` 而不是 `subprocess.Popen`：测试里可以塞任何带 `kill()` 的假对象，也避免类型层把实现绑死。

## 3. 调用逻辑与 EvoFlow 源码导读

**调用逻辑（我们的最小实现）：**

```text
工具层（未来）
  ├─ Popen(argv, stdout=file, stderr=file)
  ├─ register_task(task)
  └─ 返回 task_id
        │
        ├─ 面板/接口：list_tasks() → task_to_summary()
        ├─ 轮询输出：read_output_snapshot() → 尾部 8KB + truncated
        └─ 用户取消：stop_task(task_id) → kill() → status=cancelled
```

入口是工具层的 `Popen`，出口是 `task_id`。本章的任务表不负责启动进程；它只保证「登记之后，查询/停止/读输出都有唯一事实来源」。

**EvoFlow 源码读法：**

1. `/Users/main/EvoFlow/backend/packages/harness/evoflow/tools/zcode_port/background.py`
   - 先读 `BackgroundBashTask` 字段，确认任务事实包含哪些内容；
   - 再读 `register_task` / `get_task` / `mark` / `stop_task` / `list_tasks` / `task_to_summary` / `read_output_snapshot`，注意它是函数式 API，不是 `Manager` 类。
2. `/Users/main/EvoFlow/backend/packages/harness/evoflow/tools/zcode_port/bash_tool.py`
   - 读 `_promote_to_background`：`Popen` 之后如何写输出文件、`register_task`、起 pump 线程、返回 `status: backgrounded`；
   - 注意它还会 `_emit("background", ...)`，把任务状态推给前端；本章没有事件总线，所以未实现。
3. 浏览器桥 / CUA 桥的 token 校验位置只做定位，未逐行核对；本章只实现两者共用的 `verify_bridge_token`，不声称已覆盖路由。

**调用顺序上的差异：** EvoFlow 的 `_promote_to_background` 是「命令超时后转后台」，进程已经在跑；本章把「登记」抽出来单独实现，启动方式留给工具层。这样测试不需要真的等一条命令超时。

## 4. 登记、查询、改状态

```python
_LOCK = threading.Lock()
_TASKS: dict[str, BackgroundBashTask] = {}


def new_task_id() -> str:
    """生成 12 位十六进制任务 id。"""
    return uuid.uuid4().hex[:12]


def register_task(task: BackgroundBashTask) -> None:
    """登记任务；同 id 覆盖（重放/恢复时用）。"""
    with _LOCK:
        _TASKS[task.task_id] = task


def get_task(task_id: str) -> BackgroundBashTask | None:
    """按 id 取任务；不存在返回 None。"""
    with _LOCK:
        return _TASKS.get(task_id)


def mark(
    task: BackgroundBashTask,
    *,
    status: str,
    exit_code: int | None = None,
    error: str = "",
) -> None:
    """改状态与退出码，只在首次结束时写 ended_at。"""
    task.status = status
    task.exit_code = exit_code
    if error:
        task.error = error
    if status != "running" and task.ended_at is None:
        task.ended_at = time.time()
```

关键点：

- **锁只包字典操作**，不包进程 `kill()`。否则一个慢 `kill` 会把所有查询卡住。
- `register_task` 允许同 id 覆盖：恢复/重放时，旧记录可能已经不在，覆盖比报错更符合实际。
- `mark` 只在第一次进入终态时写 `ended_at`：重复上报（例如 pump 线程和停止操作同时到达）不会把结束时间改来改去。

## 5. 停止：只停 running，重复停止幂等

```python
def stop_task(task_id: str) -> BackgroundBashTask | None:
    """杀进程并置 cancelled；不存在返回 None。

    只停止 running 的任务：已结束的任务再 stop 是 no-op，不该改掉真实退出码。
    """
    task = get_task(task_id)
    if task is None:
        return None
    proc = task.proc
    if proc is not None and task.status == "running":
        try:
            proc.kill()  # type: ignore[attr-defined]
        except Exception as exc:
            task.error = str(exc)
        mark(task, status="cancelled", exit_code=-1)
    return task
```

为什么不做「不存在就抛异常」：调用方通常在 finally 里清理，任务已结束是正常情况，抛异常会打断清理。

为什么先判 `status == "running"`：已经 `completed` 的任务再 `kill()` 没有意义，还会把真实 `exit_code=0` 改成 `-1`，把成功写成失败。

## 6. 列表与摘要：给面板的最小形状

```python
def list_tasks(*, running_only: bool = False, thread_id: str | None = None) -> list[BackgroundBashTask]:
    """列任务，可按 running_only / thread_id 过滤。"""
    with _LOCK:
        items = list(_TASKS.values())
    if thread_id:
        tid = thread_id.strip()
        items = [t for t in items if not t.thread_id or t.thread_id == tid]
    if running_only:
        items = [t for t in items if t.status == "running"]
    items.sort(key=lambda t: t.started_at)
    return items


def task_to_summary(task: BackgroundBashTask) -> dict:
    """给状态面板的最小摘要。"""
    return {
        "workId": task.task_id,
        "kind": "bash",
        "title": (task.description or task.command or task.task_id)[:200],
        "status": "running" if task.status == "running" else (
            "cancelled" if task.status in {"stopped", "cancelled"} else (
                "failed" if task.status == "failed" else "resultPending"
            )
        ),
        "startedAt": int(task.started_at * 1000),
        "endedAt": int(task.ended_at * 1000) if task.ended_at else None,
        "cancellable": bool(task.status == "running"),
        "command": task.command,
        "outputPath": str(task.output_path),
        "exitCode": task.exit_code,
    }
```

`task_to_summary` 的 `status` 不是直接回传内部状态，而是映射成 UI 契约：

- `running` → `running`
- `completed` → `resultPending`（进程结束不等于结果已经展示给用户）
- `failed` → `failed`
- `stopped` / `cancelled` → `cancelled`

`thread_id` 过滤里保留 `not t.thread_id`：没有绑定会话的任务（例如系统级任务）对所有会话可见，否则会出现「任务在跑但列表里看不到」。

## 7. 输出快照：只回尾部 8KB

常量定义在文件头：`BACKGROUND_BASH_OUTPUT_MAX_BYTES = 8192`。改这个值只改一处，快照函数与测试都引用它。

```python
def read_output_snapshot(task: BackgroundBashTask) -> dict:
    """读输出文件尾部（最多 8192 字节），标是否截断。"""
    text = ""
    truncated = False
    try:
        raw = task.output_path.read_bytes() if task.output_path.is_file() else b""
        if len(raw) > BACKGROUND_BASH_OUTPUT_MAX_BYTES:
            truncated = True
            raw = raw[-BACKGROUND_BASH_OUTPUT_MAX_BYTES:]
        text = raw.decode("utf-8", errors="replace")
    except OSError as exc:
        return {"kind": "read_failed", "workId": task.task_id, "code": str(exc)}

    status_map = {
        "running": "running",
        "completed": "completed",
        "failed": "failed",
        "stopped": "cancelled",
        "cancelled": "cancelled",
    }
    return {
        "kind": "output",
        "workId": task.task_id,
        "status": status_map.get(task.status, "completed"),
        "output": text,
        "truncated": truncated,
        "outputPath": str(task.output_path),
    }
```

为什么读尾部而不是头部：后台任务的价值通常是「最新进展 / 最新报错」，头部早就被调用方看过。

为什么标 `truncated`：模型必须知道「这不是全部」，否则会基于半截日志下结论。

为什么 `errors="replace"`：进程输出可能是任意字节，解码失败不能让整个查询接口 500。

## 8. 桥接 token：默认拒绝，常量时间比较

```python
BRIDGE_TOKEN_ENV = "MYAF_BRIDGE_TOKEN"


def verify_bridge_token(provided: str | None) -> bool:
    """校验宿主桥接 token；没配 token 一律拒绝，不「没配就放行」。"""
    expected = os.getenv(BRIDGE_TOKEN_ENV, "")
    if not expected or not provided:
        return False          # 没配 token 一律拒绝，不能「没配就放行」
    return hmac.compare_digest(provided, expected)
```

两个安全点：

1. **fail-closed**：`expected` 为空时返回 `False`。很多桥接实现为了「本地开发方便」在没配 token 时直接放行，这等于把本机执行权限裸露给任意能访问端口的进程。
2. **`hmac.compare_digest`**：普通 `==` 会在第一个不同字符处提前返回，攻击者能用响应时间逐位猜 token。

## 9. 测试

```python
def test_register_get_list(tmp_path):
    """任务登记、按 id 取、running_only 过滤、摘要形状。"""
    from myagentflow.tools.host_direct.background_bash import (
        BackgroundBashTask,
        get_task,
        list_tasks,
        mark,
        new_task_id,
        register_task,
        task_to_summary,
    )

    task = BackgroundBashTask(
        task_id=new_task_id(),
        command="sleep 1",
        description="demo",
        output_path=tmp_path / "out.log",
        thread_id="t1",
    )
    register_task(task)
    assert get_task(task.task_id) is task
    assert task in list_tasks(running_only=True)
    summary = task_to_summary(task)
    assert summary["status"] == "running" and summary["cancellable"] is True

    mark(task, status="completed", exit_code=0)
    assert list_tasks(running_only=True) == []
    assert task_to_summary(task)["status"] == "resultPending"


def test_stop_task(tmp_path):
    """停止运行中的进程并置 cancelled，重复 stop 幂等。"""
    from myagentflow.tools.host_direct.background_bash import (
        BackgroundBashTask,
        new_task_id,
        register_task,
        stop_task,
    )

    proc = subprocess.Popen(["sleep", "5"])
    task = BackgroundBashTask(
        task_id=new_task_id(),
        command="sleep 5",
        description="stop me",
        output_path=tmp_path / "out.log",
        proc=proc,
    )
    register_task(task)

    stopped = stop_task(task.task_id)
    assert stopped is not None
    assert stopped.status == "cancelled"
    proc.wait(timeout=5)
    assert proc.returncode is not None

    # 再停一次：已经是终态，不能再改退出码
    assert stop_task(task.task_id).exit_code == -1


def test_read_output_snapshot(tmp_path):
    """输出超过 8KB 只回尾部并标 truncated。"""
    from myagentflow.tools.host_direct.background_bash import (
        BACKGROUND_BASH_OUTPUT_MAX_BYTES,
        BackgroundBashTask,
        new_task_id,
        read_output_snapshot,
    )

    out = tmp_path / "out.log"
    payload = "a" * (BACKGROUND_BASH_OUTPUT_MAX_BYTES + 100)
    out.write_text(payload, encoding="utf-8")
    task = BackgroundBashTask(
        task_id=new_task_id(), command="echo", description="big", output_path=out
    )
    snap = read_output_snapshot(task)
    assert snap["truncated"] is True
    assert len(snap["output"]) == BACKGROUND_BASH_OUTPUT_MAX_BYTES
    assert snap["output"].endswith("a")


def test_bridge_token(monkeypatch):
    """没配 token 一律拒绝；配了才按常量时间比对。"""
    from myagentflow.tools.host_direct.bridge_auth import verify_bridge_token

    monkeypatch.delenv("MYAF_BRIDGE_TOKEN", raising=False)
    assert verify_bridge_token("anything") is False

    monkeypatch.setenv("MYAF_BRIDGE_TOKEN", "s3cret")
    assert verify_bridge_token("s3cret") is True
    assert verify_bridge_token("wrong") is False
    assert verify_bridge_token(None) is False
```

`test_stop_task` 用真实 `sleep 5` 而不是假进程：要验证 `kill()` 之后进程确实退出，假对象验证不了这一点。

## 10. 手把手从零做一遍

```bash
cd /Users/main/my-agent-flow/backend
touch packages/harness/myagentflow/tools/host_direct/background_bash.py
touch packages/harness/myagentflow/tools/host_direct/bridge_auth.py
```

先写 `background_bash.py`：按第 2、4→7 节顺序放 `BackgroundBashTask`、全局表、`new_task_id` / `register_task` / `get_task` / `mark` / `stop_task` / `list_tasks` / `task_to_summary` / `read_output_snapshot`。

再写 `bridge_auth.py`：只有 `BRIDGE_TOKEN_ENV` 与 `verify_bridge_token` 两个符号。

最后写 `tests/chapters/test_ch03_02_host_direct.py`，跑：

```bash
uv run pytest tests/chapters/test_ch03_02_host_direct.py -q
```

实测输出：

```text
4 passed, 13 warnings in 0.05s
```

## 11. 本章不做什么（必须如实说）

- **没有** `start_background_bash()`。进程启动要处理 argv、cwd、环境变量、pump 线程、退出通知，属于工具装配层；本章只做登记之后的生命周期。
- **没有** HTTP `GET/DELETE /api/tasks/{id}`。没有路由层，404/409 无从谈起；本章用 `None` 表示「没见过」，用 `status` 表示「见过但已结束」。
- **没有** 浏览器桥、CUA 桥、截图/点击。它们需要真实设备/浏览器会话，本章只实现两者共用的 token 校验。
- **没有** 落库。任务表是进程内 `dict`，进程重启即丢；跨进程查询属于后续 Gateway 章节。

## 12. EvoFlow 对照与差异（文件级）

| EvoFlow 文件 | 本项目文件 | 本章实现的符号/字段 | 未实现部分 |
|---|---|---|---|
| `tools/zcode_port/background.py` | `tools/host_direct/background_bash.py` | `BackgroundBashTask`、`BACKGROUND_BASH_OUTPUT_MAX_BYTES`、`new_task_id`、`register_task`、`get_task`、`mark`、`stop_task`、`list_tasks`、`task_to_summary`、`read_output_snapshot` | 落库、跨进程查询、事件推送 |
| `tools/zcode_port/bash_tool.py` | 未创建 | — | `_promote_to_background`、pump 线程、`_emit` |
| `routers/browser_bridge.py` / `routers/cua_bridge.py` | `tools/host_direct/bridge_auth.py` | `BRIDGE_TOKEN_ENV`、`verify_bridge_token` | 路由、截图、点击、设备会话 |

**有意省略的原因：** 本章要验证的是「任务事实模型 + 输出边界 + 鉴权失败关闭」，不是完整后台执行器。把 `Popen`/pump/事件总线提前塞进来，测试会变成集成测试，失败定位会很慢。

## 13. 验收

- [x] 登记后可查、可按 running / thread 过滤
- [x] 停止运行中进程并置 `cancelled`
- [x] 重复停止幂等，不改真实退出码
- [x] 输出超过 8KB 只回尾部并标 `truncated`
- [x] 没配 token 一律拒绝；正确/错误/None 三种输入判定正确
- [x] `4 passed`，ruff 通过

## 14. 下一章衔接

任务表解决「命令跑起来之后」。下一章解决「工具调用本身经过哪些层」：洋葱式中间件链、顺序保证、异常不被吞、审计留痕。

## 附：源码基准

- EvoFlow baseline：`f22af53910a470ddba633be35e25878214c2984ec`（v1.3.22，PolyForm Noncommercial）。
- 参考文件：`/Users/main/EvoFlow/backend/packages/harness/evoflow/tools/zcode_port/background.py`。
- 许可：EvoFlow 为 PolyForm Noncommercial；本章为学习性转述与自有最小实现。

## 源码核对记录（路径与符号实测）

- 状态：🔍 结构级。任务表字段与 REST 路径已核；未逐行读 2045 行 `bash_tool`。
- 已核上游：`tools/zcode_port/background.py`（243）、`tools/zcode_port/bash_tool.py`（2045）、`app/gateway/routers/browser_bridge.py`（145）、`app/gateway/routers/cua_bridge.py`（357）。
- 本地对应：`tools/host_direct/background_bash.py`（167）、`tools/host_direct/bridge_auth.py`（30）。
- 结论：本地只有任务表、停止、输出快照和桥接 token；没有 `Popen` 启动函数，没有 `/api/browser/*` 与 `/api/cua/*` 路由。本章的「可执行后台命令 + 浏览器桥」尚未端到端闭合。
