# 第 3 章　CLI 与 stdio App Server

## 本章目标
让同一个 Agent 内核能被 **终端、编辑器、桌面端** 复用，而不必各自重写一遍逻辑。

## 最小闭环
`evoflow --chat "算一下 2+3"` → 标准输出 SSE 事件 → 退出码 0；同一套逻辑通过 stdio JSON-RPC 被宿主程序调用。

## 调用逻辑
```text
CLI  → 直接调用 harness 会话服务 → 流事件打印
stdio → 宿主进程 spawn → JSON-RPC 2.0 over stdin/stdout → chat_bridge → harness
HTTP  → Gateway（Part 10）
```
三者共用 `session_execution` 与 `chat_session_service`，差别只在传输层。

## 真实模块地图（源码证实：路径存在）
| 职责 | 路径 |
|---|---|
| CLI 入口 | `packages/harness/evoflow/cli/main.py`、`commands/`、`common.py` |
| stdio RPC | `app_server/stdio_rpc.py` |
| 嵌入式运行 | `app_server/embed.py` |
| 聊天桥接 | `app_server/chat_bridge.py` |
| 桌面 stdio | `desktop_stdio.py` |

## 核心概念
- **stdio 协议要点**：stdout 只能放协议消息，日志必须走 stderr，否则宿主解析失败。
- **一次连接一条会话**：连接即 session，断开即结束；不做隐式全局状态。
- **背压**：宿主读得慢时，事件要排队或合并，不能阻塞执行线程。

## 自研实现要点
```json
{"jsonrpc":"2.0","id":1,"method":"chat/send","params":{"session":"s1","text":"hi"}}
{"jsonrpc":"2.0","method":"chat/event","params":{"type":"delta","text":"你"}}
```
- 事件 `id` 单调递增，支持 `chat/resume` 从 last_id 续传。
- 退出：`chat/cancel` → 等终态事件 → 关闭管道。

## 业务规则
- 错误也走 JSON-RPC error，不往 stdout 打人类可读堆栈。
- 未授权方法直接拒绝，不暴露内部路径。

## 常见坑
- `print()` 调试污染 stdout。
- 子进程未随父进程退出 → 僵尸积累。
- 缓冲区不 flush → 宿主永远收不到最后一条事件。

## 验收
- [ ] CLI 与 HTTP 对同一输入产生等价事件序列
- [ ] stdout 无任何非协议输出
- [ ] 宿主 kill 后子进程同步退出

## 对照 EvoFlow 核对清单
- [ ] `stdio_rpc.py` 的方法清单与错误码
- [ ] CLI 是否复用 Gateway 还是直连 harness
