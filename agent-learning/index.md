# 从零开始学 Agent

> 系统讲解 Agent 开发全链路：从 LLM 基础、工具调用、记忆与规划，到 Harness 工程、多 Agent 系统与生产化部署。

## 本书信息

- **本地文档源**：`/Users/main/agent_learning`（mdbook 项目，`src/zh/` 为中文全书）
- **同步机制**：本目录为手动镜像。本地修改后需手动 rsync 回站点目录并推送：
  `rsync -a --include='*/' --include='*.md' --exclude='*' ~/agent_learning/src/zh/ ~/atguigu-note/agent-learning/`
- **结构**：全书共 6 部分、31 章、170 小节，另有附录与前言

## 目录结构

| 部分 | 内容 | 章节 |
|---|---|---|
| 第一部分 · 入门篇 | Agent 概念、LLM 基础 | 第 1–2 章 |
| 第二部分 · 核心能力篇 | 工具、记忆、规划、RAG、上下文工程、Harness、Skill、Agentic-RL、自我进化 | 第 3–11 章 |
| 第三部分 · 框架实战篇 | LangChain、LangGraph、OpenClaw、Hermes、Claude Code、DeepSeek Harness | 第 12–17 章 |
| 第四部分 · 多 Agent 系统篇 | 多 Agent 协作、通信协议（MCP/A2A/ANP） | 第 18–19 章 |
| 第五部分 · 生产化篇 | 评估优化、安全可靠性、部署生产化 | 第 20–22 章 |
| 第六部分 · 综合项目篇 | AI 编程助手、数据分析 Agent、多模态 Agent | 第 23–25 章 |
| 附录 | Prompt 模板、FAQ、资源、术语表、KL 散度、环境搭建 | A–F |

## 快速导航

- [前言](./preface)
- [第一部分：入门篇](./part1)
- [第二部分：核心能力篇](./part2)
- [第三部分：框架实战篇](./part3)
- [第四部分：多 Agent 系统篇](./part4)
- [第五部分：生产化篇](./part5)
- [第六部分：综合项目篇](./part6)

## 注意事项

- 本目录只镜像 **md 文档与被引用的图**（`../svg/`），mdbook 的 html 交互页（animations 等）未纳入站点
- 请勿在文档中写入真实密钥（API Key 等）
- 文中相对链接基于目录结构保持有效；若在本地整理时移动文件，注意同步更新互相引用
