# 第 2 章　后台命令、浏览器桥与 Computer Use

## 本章目标
让 Agent 能操作**长时间运行的进程**和**图形界面**，同时不把主对话阻塞。

## 最小闭环
启动后台命令 → 轮询输出 → 结束后读取完整日志；打开浏览器 → 截图 → 点击。

## 真实模块地图（源码证实：路径存在）
| 职责 | 路径 |
|---|---|
| 后台 bash | `app/gateway/routers/background_bash.py` |
| 浏览器桥 | `app/gateway/routers/browser_bridge.py`、`browser_stream.py`、`browser_snapshots.py` |
| 浏览器嵌入页 | `app/gateway/routers/browser_embed.py` |
| Computer Use 桥 | `app/gateway/routers/cua_bridge.py` |
| CUA 执行 | `plugins/cua_helper.py`、`plugins/cua_exec.ps1` |
| 桥接鉴权 | `plugins/bridge_auth.py` |
| 插件运行时 | `plugins/runtime.py`、`plugins/node_repl.py`、`plugins/node_repl_tool.py` |

## 核心概念
- **会话级资源**：浏览器/桌面会话必须挂在 session 上，随 session 关闭而回收。
- **桥接不是 RCE**：bridge 必须带随机 token + 只绑定 127.0.0.1，否则本机任意程序可驱动。
- **截图是带宽大户**：需要缩放、裁切、按需截取区域。

## 自研实现要点
- 后台进程：`Popen(argv, stdout=PIPE)`，输出写文件 + 头部 ring buffer；工具只返回尾部 N 行。
- 浏览器：CDP/Playwright 会话池，key = session_id；空闲 5 分钟回收。
- CUA：动作序列（move/click/type/key）+ 每步截图校验。

## 业务规则
- 后台命令必须有超时与最大输出上限。
- 浏览器会话不能被两个 run 并发驱动。
- CUA 不操作敏感应用（支付、密码管理器）。

## 常见坑
- `subprocess` 未 `start_new_session` → Ctrl-C 杀不掉。
- 浏览器 buffer 未消费导致进程阻塞。
- 截图原图直传模型 → token 爆炸 + 超时。

## 验收
- [ ] 后台任务可查、可停、可读尾部
- [ ] 浏览器会话随 session 回收
- [ ] 桥接端口仅本机可达

## 对照 EvoFlow 核对清单
- [ ] `browser_stream.py` 的流式截图策略
- [ ] `cua_helper.py` 支持的动作集合
