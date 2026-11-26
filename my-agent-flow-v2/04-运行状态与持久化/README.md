# 第 04 篇　运行状态与持久化

> 状态：✅ 正文完成；4 章全部写完并接到代码/测试。

## 能力域

本篇负责「运行状态与持久化」这一层能力。每章先跑独立最小闭环，篇末再串成本篇闭环。

## 篇级最小闭环

中断后从 checkpoint 恢复，消息不丢不乱序

## 章节

| 章 | 功能 | 知识点 | 最小闭环 | 状态 |
|---|---|---|---|---|
| [04.1](01-消息与会话持久化/README.md) | 消息与会话持久化 | 关系模型、追加写、会话索引、事务 | 写消息 → 重载 → 顺序一致 | ✅ 正文 |
| [04.2](02-Checkpoint 与恢复/README.md) | Checkpoint 与恢复 | checkpoint 类型、状态快照、恢复语义 | 中断 → 存 checkpoint → 从下一节点恢复 | ✅ 正文 |
| [04.3](03-运行生命周期与事件/README.md) | 运行生命周期与事件 | 状态机、取消、超时、清理 | start → cancel → 终态 | ✅ 正文 |
| [04.4](04-分享、导出与一致性/README.md) | 分享、导出与一致性 | 分享 token、快照隔离、脱敏 | 只读分享；敏感字段不泄露 | ✅ 正文 |

## 运行与验收

- 代码仓：/Users/main/my-agent-flow/backend
- 本地配置：backend/config.local.yaml（不入库，已被 .gitignore 忽略，fresh clone 必须按步骤 0 自行创建）

步骤：
0) 创建本地配置（config.local.yaml 不入库，fresh clone 必做）
   cd /Users/main/my-agent-flow/backend
   cp config.example.yaml config.local.yaml
   打开 config.local.yaml，参考 config.example.yaml 中「离线开发替身
   （stub）」注释段，把 models 条目切到 stub：vendor 改成 stub、use 改成
   myagentflow.models.providers.stub:StubChatModel、model 改成 stub，
   并让 primary_model 指向该条目；同时删掉该条目里 openai 专用的
   base_url、api_key、request_timeout、max_retries 四个字段，并把
   checkpointer 的 type 改成 memory（与注释段一致；fresh clone 里
   backend/data/ 尚不存在）。
1) 安装依赖并选择本地配置
   cd /Users/main/my-agent-flow/backend
   uv sync
   export MYAGENTFLOW_CONFIG_PATH="$(pwd)/config.local.yaml"
2) 运行本篇测试
   uv run pytest -q tests/chapters/test_ch04_*.py
3) 可选演示脚本（当脚本存在时）
   uv run python scripts/ch04_checkpoint_demo.py
   预期生成 tmp/ch04/resume.txt，首行以 "OK: " 开头。

常见问题：
- 数据库路径：默认 sqlite 在 data/app/dev.sqlite，若删库请先创建父目录。
- 无法联网：确认使用了 config.local.yaml（stub provider），本篇不依赖外网。

## v1 参考

- [02-持久化与运行生命周期](../../my-agent-flow/02-持久化与运行生命周期/README.md)
- 用法：v1 第 02 部分：checkpointer、生命周期、CLI、share。
- 注意：v1 是实现手册，v2 只借它的源码核对与文件地图；不要把 v1 的章节编号当成 v2 的学习顺序。
