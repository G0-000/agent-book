# 第 03 篇　工具与行动

> 状态：✅ 正文完成；7 章全部写完并接到代码/测试。

## 能力域

本篇负责「工具与行动」这一层能力。每章先跑独立最小闭环，篇末再串成本篇闭环。

## 篇级最小闭环

模型发起工具调用 → 执行 → 结果回灌 → 最终回答

## 章节

| 章 | 功能 | 知识点 | 最小闭环 | 状态 |
|---|---|---|---|---|
| [03.1](01-工具协议与注册/README.md) | 工具协议与注册 | JSON Schema、名称/描述、参数校验、幂等 | 注册 echo 工具 → 调用 → 返回 | ✅ 正文 |
| [03.2](02-工具分发与中间件/README.md) | 工具分发与中间件 | 分发器、中间件链、审计、错误归一 | 调用经过 before/after 钩子；拒绝返回结构化错误 | ✅ 正文 |
| [03.3](03-宿主边界与直接执行/README.md) | 宿主边界与直接执行 | 宿主/沙箱边界、cwd/env、路径守卫、超时 | 越界路径被拒绝；允许命令可执行 | ✅ 正文 |
| [03.4](04-后台任务与输出快照/README.md) | 后台任务与输出快照 | 异步任务生命周期、轮询、取消、输出环形缓冲 | 启动 sleep → 查询 → 停止 → 读快照 | ✅ 正文 |
| [03.5](05-浏览器与 Computer-Use/README.md) | 浏览器与 Computer-Use | 感知-行动循环、截图/点击、token 鉴权、权限 | token 缺失即拒绝；脚本化点击一次 | ✅ 正文 |
| [03.6](06-MCP、插件与 Skills/README.md) | MCP、插件与 Skills | 能力发现、schema 协商、OAuth、生命周期 | 连接假 MCP → 列工具 → 调一个 | ✅ 正文 |
| [03.7](07-权限、沙箱与审批/README.md) | 权限、沙箱与审批 | 最小权限、审批门、危险操作、审计 | 危险操作必须审批；拒绝后无副作用 | ✅ 正文 |

## 运行与验收

- 代码仓：/Users/main/my-agent-flow/backend
- 本地配置：backend/config.local.yaml 已指向 vendor: stub

步骤：
1) 安装依赖并选择本地配置
   cd /Users/main/my-agent-flow/backend
   uv sync
   export MYAGENTFLOW_CONFIG_PATH="$(pwd)/config.local.yaml"
2) 运行本篇测试
   uv run pytest -q tests/chapters/test_ch03_*.py
3) 可选演示脚本（当脚本存在时）
   uv run python scripts/ch03_tool_demo.py
   预期生成 tmp/ch03/tool.txt，首行以 "OK: " 开头。

常见问题：
- 权限被拒：第三章涉及宿主边界与审批，按错误提示检查路径/命令白名单与审批开关。
- 无法联网：确认使用了 config.local.yaml（stub provider），本篇不依赖外网。

## v1 参考

- [03-工具深化与上下文控制](../../my-agent-flow/03-工具深化与上下文控制/README.md)
- 用法：v1 第 03 部分：工具宿主、中间件、后台命令、浏览器桥。
- 注意：v1 是实现手册，v2 只借它的源码核对与文件地图；不要把 v1 的章节编号当成 v2 的学习顺序。
