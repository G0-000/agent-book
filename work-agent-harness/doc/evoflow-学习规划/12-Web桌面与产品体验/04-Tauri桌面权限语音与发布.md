# 第 4 章　Tauri 桌面权限、语音与发布安装

> **范围层级：B 仅解释**（见 [进度台账 · 范围三层](../PROGRESS.md)）。本章读懂结构与权限模型即可，**不**复刻安装包与打包链路。

## 本章目标
桌面端要能用系统能力（文件、语音、进程），但这些能力必须有明确授权与打包策略。

## 最小闭环
桌面端启动 → 申请必要权限 → 语音输入转文字 → 对话 → 升级包可平滑更新。

## 真实模块地图（源码证实：路径存在）
| 职责 | 路径 |
|---|---|
| 桌面壳 | `evopanel/src-tauri/`（`commands/gateway.rs` 等） |
| 语音 UI | `evopanel/src/voice-overlay/`、`cua-glow-overlay` |
| 语音后端 | `backend/app/gateway/speech/` |
| 打包 | `backend/packaging/`（PyInstaller spec、macOS/Unix/Windows 脚本、官方插件包） |
| 发布资产 | 仓库 `docker/`、`Makefile`、`.github/` |

## 核心概念
- **最小权限**：Tauri 能力白名单（fs、shell、audio），默认关闭。
- **本地进程管理**：桌面端要拉起/守护后端 sidecar，并处理端口冲突。
- **升级**：签名 + 增量；升级不能丢本地数据目录。
- **离线可用性**：模型不可用时明确提示，不静默转空。

## 自研实现要点
```text
sidecar: spawn backend → 等 health ready（超时 30s）→ 连接
权限: capabilities.json 只声明必要项
```

## 业务规则
- 首次运行引导授权，拒绝则降级为 Web 能力。
- 日志与数据目录固定，升级不覆盖用户数据。
- 崩溃自动重启限次，并上报一次诊断。

## 常见坑
- 端口写死 → 与本地其他服务冲突。
- 升级覆盖 config → 用户配置丢失。
- 权限全开 → 安全审计不过。

## 验收
- [ ] 冷启动 10s 内可对话
- [ ] 升级保留数据
- [ ] 权限最小化可审计

## 对照 EvoFlow 核对清单
- [ ] `src-tauri` 的 capability 清单
- [ ] `packaging/` 各平台产物差异
