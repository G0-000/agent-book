# 第 3 部分　工具深化与上下文控制 / Tool Depth and Context Control

> 状态：✅ 四章最小实现均已落地并有测试（15 passed）。  
> 边界：本部分只实现「可运行的最小闭环」，不把 EvoFlow 的 70 个中间件、浏览器桥、CUA 全量抄进来；未实现项在每章「未实现」小节列明。

## 这部分解决什么

前两部分解决「能跑、能存、能停」。这一部分解决三个更容易把 Agent 拖垮的问题：

1. **工具碰宿主**：路径能不能出工作区？命令跑太久怎么办？
2. **工具调用治理**：一次调用经过哪些层？失败会不会吞掉？审计留什么？
3. **上下文预算**：结果太大是截断还是落盘？预算超了怎么压缩？

## 章节

| 章 | 主题 | 本项目文件 | 状态 |
|---|---|---|---|
| [1](01-文件终端与宿主边界.md) | 路径守卫与宿主边界判定 | `tools/host_direct/workspace_path_guard.py` | ✅ 4 测试 |
| [2](02-后台命令浏览器桥与Computer-Use.md) | 后台任务表与桥接 token | `tools/host_direct/background_bash.py`、`bridge_auth.py` | ✅ 4 测试 |
| [3](03-Middleware调用链与工具审计.md) | 洋葱式中间件链与审计 | `agents/middlewares/chain.py`、`audit.py` | ✅ 3 测试 |
| [4](04-上下文预算压缩与自动后续.md) | 预算、截断、超大结果落盘 | `context/budget.py`、`context/tool_tokens.py`、`tools/tool_output_truncation.py`、`tools/large_result_store.py` | ✅ 4 测试 |

## 统一口径

- 代码根：`/Users/main/my-agent-flow/backend`
- 包根：`/Users/main/my-agent-flow/backend/packages/harness/myagentflow`
- EvoFlow 基准：`f22af53910a470ddba633be35e25878214c2984ec`（v1.3.22，PolyForm Noncommercial）
- 测试：`cd /Users/main/my-agent-flow/backend && uv run pytest tests/chapters/test_ch03_*.py -q`
- 静态检查：`uv run ruff check packages tests`

## 验收口径

- `confine` 下相对路径、`..`、软链逃逸都能给出正确结论。
- 后台任务可登记、查询、停止；输出快照最多回灌 8KB。
- 中间件顺序可预测；工具异常不被审计层吞掉。
- 单次 20K 字符工具结果落盘，模型只收到信封与路径。
