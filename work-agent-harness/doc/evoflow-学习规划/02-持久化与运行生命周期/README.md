# 第 2 部分　持久化与运行生命周期 / Durability and Run Lifecycle

> 状态：🟡→✅ 推进中。第 1、2 章已逐行核对源码（provider / omit_transcript / thread_state_reader / lifecycle / langgraph_cancel）；第 3、4 章仍为骨架。

目标：让一次 Agent 运行从「进程内的一次性事件」变成 **可恢复、可取消、可远程驱动、可分享** 的长生命周期对象。

## 章节

| 章 | 主题 | 真实模块（已核对路径） |
|---|---|---|
| [1](01-检查点与线程恢复.md) ✅ | 检查点与线程恢复 Checkpoints | `packages/harness/evoflow/agents/checkpointer/`、`data/checkpoints/checkpoints.db` |
| [2](02-运行生命周期与取消.md) ✅ | 运行生命周期与取消 Run lifecycle | `session_execution/`、`cancellation/`、`app/gateway/run_status_reconcile.py` |
| [3](03-CLI与stdio-App-Server.md) | CLI 与 stdio App Server | `cli/`、`app_server/`、`desktop_stdio.py` |
| [4](04-分享生命周期.md) | 分享生命周期 Sharing | `app/gateway/routers/share.py`、`persistence/chat_share_repositories.py` |

## 这一部分要解决什么问题

1. **崩了怎么办**：进程被杀、机器重启后，会话与任务还在。
2. **怎么停下**：用户点停止、超时、被新消息打断（`multitask_strategy: interrupt`）。
3. **怎么被别的程序驱动**：CLI / stdio JSON-RPC 让编辑器、脚本、桌面端复用同一内核。
4. **怎么给别人看**：只读分享链接，不能把整个工作区暴露出去。

## 依赖关系

```text
Part 1 的 run/stream
   ├─→ checkpointer（状态落盘）→ 恢复
   ├─→ session_execution（生命周期/命令）→ 取消
   └─→ app_server / cli（外部入口）
                 └─→ share（只读投影）
```

## 验收口径

- 杀掉进程重启后，同一 thread 能继续对话且历史完整。
- 停止请求 3 秒内生效，且状态不会「卡在 running」。
- CLI 能在无 HTTP 的情况下完成一次完整对话。
- 分享页看不到未授权资源。
