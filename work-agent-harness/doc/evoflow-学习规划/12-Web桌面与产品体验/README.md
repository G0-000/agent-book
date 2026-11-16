# 第 12 部分　Web、桌面与产品体验 / Web, Desktop, Product Experience

> 状态：🟡 骨架（真实路径已核对：`<EvoFlow 仓库>/evopanel`）。

目标：把内核能力变成**人能用的产品**：聊天、设置、知识、任务、桌面端。

## 章节

| 章 | 主题 | 真实模块 |
|---|---|---|
| [1](01-Web启动聊天会话与历史.md) | Web 启动、聊天会话与历史 | `evopanel/src/react/chat-app/`、`src/lib/ws-client.js` |
| [2](02-设置Agent知识与任务页面.md) | 设置、Agent、知识、任务与管理页面 | `evopanel/src/pages/`、`src/react/`、`routers/*` |
| [3](03-UI-RPC服务与Provider系统.md) | UI RPC 服务与 Provider 系统 | `evopanel/src/lib/tauri-api.js`、`zcode-provider/`、`app_server/` |
| [4](04-Tauri桌面权限语音与发布.md) | Tauri 桌面权限、语音与发布安装 | `evopanel/src-tauri/`、`backend/packaging/` |

## 前端的三条铁律

1. **乐观更新 + 可回滚**：消息先上屏，失败要能撤。
2. **流式要能中断**：停止按钮必须真停（见 Part 2）。
3. **状态以服务端为准**：前端缓存只是投影。

## 验收口径
- 断网重连后消息不丢不乱序。
- 停止按钮 3 秒内生效。
- 桌面端与 Web 行为一致（除系统能力）。
