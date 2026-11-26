# 第 05 篇　长期记忆与资产

> 状态：✅ 正文完成；5 章全部写完并接到代码/测试。

## 能力域

本篇负责「长期记忆与资产」这一层能力。每章先跑独立最小闭环，篇末再串成本篇闭环。

## 篇级最小闭环

新 thread 能召回旧偏好，并能注入 prompt

## 章节

| 章 | 功能 | 知识点 | 最小闭环 | 状态 |
|---|---|---|---|---|
| [05.1](01-长期记忆写入：atom 与 namespace/README.md) | 长期记忆写入：atom 与 namespace | 语义/情景记忆、命名空间隔离、subject_key、revision | 写一条偏好 → 新 thread 能查到 | ✅ 正文 |
| [05.2](02-召回、快照与注入/README.md) | 召回、快照与注入 | 关键词/向量/混合召回、排序、预算、快照、注入声明 | 召回 top-k → 快照 → 格式化为 `<memory>` | ✅ 样板，代码已接 |
| [05.3](03-巩固、冲突与治理/README.md) | 巩固、冲突与治理 | 去重/巩固、冲突解决、pin/置信度/过期、遗忘与审计 | 重复 atom 合并成一条；冲突取新值 | ✅ 正文 |
| [05.4](04-异步抽取与更新队列/README.md) | 异步抽取与更新队列 | 防抖、异步任务、LLM 抽取、JSON schema、失败隔离 | 假 LLM 抽取 → 入队 → 写回 | ✅ 正文 |
| [05.5](05-产物、事项与反思/README.md) | 产物、事项与反思 | artifact 契约、item/task 边界、稳定 id、反射解析 | 创建产物/事项 → 列表 → 更新/删除 | ✅ 正文 |

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
   uv run pytest -q tests/chapters/test_ch05_*.py
3) 可选演示脚本（当脚本存在时）
   uv run python scripts/ch05_memory_demo.py
   预期生成 tmp/ch05/recall.txt，首行以 "OK: " 开头。

常见问题：
- 召回依赖：本篇默认使用离线 stub；如需向量召回，请在配置里启用相应后端。
- 无法联网：确认使用了 config.local.yaml（stub provider），本篇不依赖外网。

## v1 参考

- [04-记忆与长期资产](../../my-agent-flow/04-记忆与长期资产/README.md)
- 用法：v1 第 04 部分：短期/长期记忆、巩固、资产/事项。
- 注意：v1 是实现手册，v2 只借它的源码核对与文件地图；不要把 v1 的章节编号当成 v2 的学习顺序。
