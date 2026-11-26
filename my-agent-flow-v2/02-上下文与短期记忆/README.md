# 第 02 篇　上下文与短期记忆

> 状态：📋 篇骨架；4 章，其中 3 章已有正文，02.1–02.3 已接最小闭环。

## 能力域

本篇负责「上下文与短期记忆」这一层能力。每章先跑独立最小闭环，篇末再串成本篇闭环。

## 篇级最小闭环

长对话在预算内继续，关键事实不丢

## 章节

| 章 | 功能 | 知识点 | 最小闭环 | 状态 |
|---|---|---|---|---|
| [02.1](01-Context Window 与预算/README.md) | Context Window 与预算 | token 计量、预算分配、裁剪策略 | 超预算输入 → 裁剪 → prompt fits | ✅ 样板，已接 |
| [02.2](02-短期记忆：全量、滑窗、摘要/README.md) | 短期记忆：全量、滑窗、摘要 | 三种策略的收益/代价、信息丢失边界 | 同一段对话跑三种策略，比较 token 与保留内容 | ✅ 正文，已接 |
| [02.3](03-压缩、自动续写与再注入/README.md) | 压缩、自动续写与再注入 | 压缩边界、摘要保真、状态恢复 | 长 thread → 压缩 → 下一轮仍记得关键事实 | ✅ 正文，已接 |
| [02.4](04-上下文注入与提示注入防御/README.md) | 上下文注入与提示注入防御 | 不可信数据、分隔符、指令层级、内容扫描 | 恶意记忆/工具输出被标记且不执行 | ✅ 正文 |

## 运行与验收

本篇可在本机离线跑通（使用 stub provider）。

- 代码仓：/Users/main/my-agent-flow/backend
- 本地配置：backend/config.local.yaml 已指向 vendor: stub

步骤：
1) 安装依赖并选择本地配置
   cd /Users/main/my-agent-flow/backend
   uv sync
   export MYAGENTFLOW_CONFIG_PATH="$(pwd)/config.local.yaml"
2) 运行本篇测试
   uv run pytest -q tests/chapters/test_ch02_*.py
3) 可选演示脚本（当脚本存在时）
   uv run python scripts/ch02_context_demo.py
   预期生成 tmp/ch02/summary.txt，首行以 "OK: " 开头。

常见问题：
- ImportError：先执行 uv sync 再重试；确保在 backend 目录下运行。
- 无法联网：确认使用了 config.local.yaml（stub provider），本篇不依赖外网。

## v1 参考

- [03-工具深化与上下文控制](../../my-agent-flow/03-工具深化与上下文控制/README.md)
- 用法：v1 第 03 部分：工具中间件与上下文预算；第 04 部分：记忆注入。
- 注意：v1 是实现手册，v2 只借它的源码核对与文件地图；不要把 v1 的章节编号当成 v2 的学习顺序。
