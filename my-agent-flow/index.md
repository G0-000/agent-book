# my-agent-flow · EvoFlow 复刻文档

> EvoFlow 的学习与复刻文档站。正文事实源在 `work-agent-harness/doc/evoflow-学习规划/`（本分区通过 VitePress `rewrites` 渲染成独立项目，不复制第二份文件，避免两边漂移）。

## 这份文档是什么

用一条可运行的**最小闭环**（配置 → 模型 → Agent → 会话 → 工具 → 流）入门，再逐部分拆解 EvoFlow 的真实工程实现（13 个 Part），最终能独立设计一套同类 Agent 框架。

配套代码工程：`/Users/main/my-agent-flow/backend`（包 `my-agent-flow`，`uv sync` 已通过）。
教材基线：EvoFlow `f22af539`（v1.3.22），本地 `/Users/main/EvoFlow`，PolyForm Noncommercial 1.0.0。

## 阅读入口

- [总目录与状态图例](README) — 13 个 Part 的索引、状态说明、维护约定
- [后端模块地图](00-导论/02-后端模块地图) — 先看清真实代码骨架
- [学习路线与写作约定](00-导论/03-学习路线与写作约定) — 每章固定结构与证据标记
- [最小闭环](01-最小闭环/README) — 从零跑通一条链路
- [进度台账](PROGRESS) — 逐章「是否已与真实源码核对」

## 13 个部分

| # | 部分 | 状态 |
|---|---|---|
| 0 | 导论（总览 / 来源与许可 / 模块地图 / 写作约定） | ✅ |
| 1 | 最小闭环（配置、Agent、会话、工具、流、验收） | ✅ 全文 |
| 2 | 持久化与运行生命周期 | ✅ 2/4 |
| 3 | 工具深化与上下文控制 | ✅ 1/4 |
| 4 | 记忆与长期资产 | 🟡 |
| 5 | 知识库与代码理解 | 🟡 |
| 6 | 委派隔离与危险操作治理 | 🟡 |
| 7 | 计划目标协作与探索 | 🟡 |
| 8 | 自动化与主动 Agent | 🟡 |
| 9 | 外部能力生态 | 🟡 |
| 10 | HTTP 网关与渠道 | 🟡 |
| 11 | 身份组织与运维治理 | 🟡 |
| 12 | Web 桌面与产品体验 | 🟡 |
| 13 | 全量集成与复刻验收 | 🟡 |

## 渲染说明

- 分区目录：`/Users/main/agent-book/my-agent-flow/`（只有本页一个文件）
- 正文目录：`/Users/main/agent-book/work-agent-harness/doc/evoflow-学习规划/`（73 个文件，含 `溯源/` 两份原始单文件）
- 渲染方式：`.vitepress/config.mts` 里 `rewrites` 把 `work-agent-harness/doc/evoflow-学习规划/:page` 映射为 `/my-agent-flow/:page`
- 更新文档：直接改正文目录，站点自动跟着变；不要在本分区里另存副本
