# 第 12 部分　Web、桌面与产品体验 / Web, Desktop, Product Experience

> **落地状态：🟡 有少量后端 UI-RPC/设置接口；本项目 Web 前端和 Tauri 桌面端未落地。** 本地 `webui/rpc.py`、`app/gateway/routers/settings.py`、`app_server/stdio.py` 存在；本项目代码树没有 `src-tauri/` 或前端应用。EvoFlow 的 `/Users/main/EvoFlow/evopanel` 是参照源码，不是复刻代码。逐章映射见[总文档、分章与代码落地对照](../00-导论/06-总文档分章与代码落地对照.md)。

目标：把内核能力变成人能用的产品：聊天、设置、知识、任务与桌面端。

## 章节

| 章 | 主题 | 本地实现 | 状态 |
|---|---|---|---|
| [1](01-Web启动聊天会话与历史.md) | Web 启动、聊天与历史 | Gateway chat、`webui/static/` | 后端/静态目录；无本地前端应用 |
| [2](02-设置Agent知识与任务页面.md) | 设置、Agent、知识与任务页面 | `app/gateway/routers/settings.py` | 设置 API 子集；无页面和完整管理功能 |
| [3](03-UI-RPC服务与Provider系统.md) | UI RPC 与 Provider | `webui/rpc.py`、`app_server/stdio.py` | RPC/stdio 子集；provider 系统未证实 |
| [4](04-Tauri桌面权限语音与发布.md) | Tauri、权限、语音与发布 | 未发现本地桌面工程 | 未落地 |

## 产品验收目标

断网重连、停止按钮与 Web/桌面一致性均需等前端和服务端接线完成后再验收；当前不是已通过的行为。
