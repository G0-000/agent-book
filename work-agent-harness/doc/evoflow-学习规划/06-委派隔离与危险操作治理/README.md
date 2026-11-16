# 第 6 部分　委派、隔离与危险操作治理 / Delegation, Isolation, Dangerous Ops

> 状态：🟡 骨架（真实路径已核对）。

目标：让「一个 Agent 干不完的活」可以分给子 Agent，同时让**危险操作**在越界前被拦住。

## 章节

| 章 | 主题 | 真实模块 |
|---|---|---|
| [1](01-子代理注册选择与结果汇总.md) | 子代理注册、选择、结果汇总 | `subagents/`、`agents/xiaomi/`、`routers/agents.py` |
| [2](02-沙箱宿主执行与权限配置.md) | 沙箱、宿主执行、权限配置 | `sandbox/`、`execution_security/`、`community/aio_sandbox` |
| [3](03-工具绑定审批取消与清理.md) | 会话工具绑定、审批、取消与清理 | `session_tool_binding/`、`agents/tool_approval_*`、`execution_security/approval.py` |

## 为什么单独一部分

- **委派解决能力边界**：上下文有限、任务可并行、需要不同专长。
- **隔离解决信任边界**：同一个 Agent 不能既读生产库又随意执行 shell。
- **治理解决责任边界**：谁批准的、执行了什么、能不能撤销。

## 验收口径
- 子 Agent 失败不影响主流程（降级为「工具失败」）。
- 沙箱内执行无法写宿主路径。
- 每个高危动作都能回答「谁批的、什么时候、批的是哪条命令」。
