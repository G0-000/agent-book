# 第 4 章　Tauri 桌面权限、语音与发布安装

> **EvoFlow 对照状态 / Alignment status：** 🔍 结构已核对（路径、行数、符号均取自源码实测），**行为**（调用顺序、边界条件）尚未逐行核对。

> **范围层级：B 仅解释**（见 [进度台账 · 范围三层](../PROGRESS.md)）。本章读懂结构与权限模型即可，**不**复刻安装包与打包链路。

## 本章目标
桌面端要能用系统能力（文件、语音、进程），但这些能力必须有明确授权与打包策略。

## 最小闭环
桌面端启动 → 申请必要权限 → 语音输入转文字 → 对话 → 升级包可平滑更新。

## 真实模块地图（已核对：路径 · 行数 · 符号）

| 文件 | 行数 | 关键符号 | 模块常量 |
|---|---|---|---|


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

### 源码核对记录（路径与符号实测）


> 本节只证明**路径、行数、符号存在**；调用顺序与边界条件仍属「行为」，未逐行核对。

## 对照 EvoFlow 核对清单
- [ ] `src-tauri` 的 capability 清单
- [ ] `packaging/` 各平台产物差异

## 从零实现（手把手）
> 读完这章你知道 Tauri 外壳要配什么，以及为什么它属于「仅解释、不复刻」。
> 路径均相对 `backend/`，代码注释写「为什么」。

### Step 1　新建 tauri.conf.json：只配最小字段
**文件**：`src-tauri/tauri.conf.json（新建，示例配置，不在本章实现）`
**要写的逻辑**：Tauri 是薄壳：窗口 + 一个指向本地网关的 URL；权限用 allowlist 收紧，麦克风要单列。

**代码**

```python
{
  "build": {
    "devUrl": "http://localhost:8070/webui/static/index.html",
    "frontendDist": "../app/webui/static"
  },
  "app": {
    "windows": [{"title": "my-agent-flow", "width": 1100, "height": 760}],
    "security": {"csp": "default-src 'self' http://localhost:8070"}
  },
  "bundle": {"identifier": "dev.myaf.app", "active": true},
  "plugins": {
    "shell": {"open": false},
    "dialog": {"open": true},
    "microphone": {"enabled": true}
  }
}
```

**验证**

```bash
# 本章只解释配置，不构建：
python3 -c "import json;json.load(open('src-tauri/tauri.conf.json'));print('json ok')"
# 期望：json ok
```

### 与 EvoFlow 对照

| 我们的做法 | EvoFlow | 为什么 |
|---|---|---|
| 前端资源走本地网关 | `src-tauri` 配置 | 壳只负责窗口，业务全在后端 |
| allowlist 收紧 | 同文件 plugins | 默认全开等于把本机交给网页 |

### 知识点

- [agent-book](https://g0-000.github.io/agent-book/)：桌面壳
- Harbor404：桌面端发布

> **范围标记：B（仅解释）**。Tauri 打包不复刻，本章只说明配置项与权限边界。

### 验收

```bash
python3 -c "import json;json.load(open('src-tauri/tauri.conf.json'));print('ok')"
```
