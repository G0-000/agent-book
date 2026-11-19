# 第 2 部分　持久化与运行生命周期 / Durability and Run Lifecycle

> 状态：🟡 推进中。第 1 章已实现并验收；第 2、3、4 章是范围内最小实现，章节开头都写清了「未做什么」。

目标：让一次 Agent 运行从「进程内的一次性事件」变成 **可恢复、可取消、可被外部程序驱动、可分享** 的长生命周期对象。

## 章节

| 章 | 主题 | 状态 | 本章真实代码 |
|---|---|---|---|
| [1](01-检查点与线程恢复.md) | 检查点与线程恢复 Checkpoints | ✅ 已实现 + 5 测试 | `agents/checkpointer/{provider,omit_transcript,thread_state_reader}.py` |
| [2](02-运行生命周期与取消.md) | 运行生命周期与取消 Run lifecycle | 🟡 进程内注册表 + 4 测试 | `session_execution/lifecycle.py` |
| [3](03-CLI与stdio-App-Server.md) | CLI 与 stdio App Server | 🟡 `chat`/`state` + `ping`/`state` + 5 测试 | `cli/main.py`、`app_server/stdio.py` |
| [4](04-分享生命周期.md) | 分享生命周期 Sharing | 🟡 token 存储 + 3 测试 | `collab/shares.py` |

**状态口径**：✅ = 本章声明的行为全部实现且有测试；🟡 = 范围缩小/部分实现，章节内「本章不做」逐条列了缺什么。

## 这一部分要解决什么问题

1. **崩了怎么办**：进程被杀后，同一 `thread_id` 能从检查点续上；历史从消息表 hydrate。
2. **怎么停下**：同线程只允许一个 run；取消是信号，执行方在安全点收尾。
3. **怎么被别的程序驱动**：CLI 与 stdio 两个入口，stdout 只放协议。
4. **怎么给别人看**：token 分享链接，可过期、可撤销，库里不存明文 token。

## 依赖关系

```text
Part 1 的 run/stream
   ├─→ checkpointer（状态落盘）→ 恢复
   ├─→ session_execution（进程内单活/取消）
   └─→ cli / app_server（外部入口）
                 └─→ collab/shares（token 生命周期）
```

## 本部分明确未实现（留给后续）

- 检查点：`async_provider.py`、`session_search.py`、checkpoint 中间件二次瘦身。
- 生命周期：DB 状态表、停止扫描、调 LangGraph Server 取消、跨进程可见。
- stdio：`chat/send` / `chat/event` 流式协议、TCP 监听、Windows UTF-8 包装。
- 分享：HTTP 路由、不可变快照内容、鉴权。

## 验收口径

```bash
cd /Users/main/my-agent-flow/backend
uv run pytest tests/chapters/test_ch02_*.py -q     # 17 passed
uv run python -m ruff check packages tests
```

- 同一 thread 重启后能读回检查点；检查点 `messages` 为空（未完成 tool_call 除外）。
- 同线程第二次 run 被拒；取消后的 run 不能报 `finished`。
- CLI `state` 不需要模型配置；stdio 坏行不拖垮进程。
- 过期 token 与撤销 token 状态可区分。
