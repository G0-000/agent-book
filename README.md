# Agent Book

[![Deploy](https://github.com/G0-000/agent-book/actions/workflows/deploy.yml/badge.svg)](https://github.com/G0-000/agent-book/actions/workflows/deploy.yml)
[![GitHub Pages](https://img.shields.io/website?label=website&url=https%3A%2F%2FG0-000.github.io%2Fagent-book%2F)](https://G0-000.github.io/agent-book/)
[![Stars](https://img.shields.io/github/stars/G0-000/agent-book)](https://github.com/G0-000/agent-book)

Python / LangChain / LangGraph / AI Coding 学习笔记整理

## 在线站点

https://G0-000.github.io/agent-book/

本地预览：

```bash
pnpm install
pnpm docs:dev
```

## 课程目录

| 课程                      | 说明                                          | 详情                            |
| ------------------------- | --------------------------------------------- | ------------------------------- |
| [Python](./python/)       | Python 零基础入门到进阶（进程 / 线程 / 协程） | [README](./python/README.md)    |
| [LangChain](./langchain/) | LangChain 1.2 入门到 Agent / RAG 实战         | [README](./langchain/README.md) |
| [LangGraph](./langgraph/) | LangGraph 入门到智能体部署实战                | [README](./langgraph/README.md) |
| [AI Coding](./vibe_coding/) | Vibe Coding 零基础实战（Claude Code / Skills / Codex） | [README](./vibe_coding/README.md) |

## 仓库结构

```text
agent-book/
├── index.md              # 站点首页
├── .vitepress/           # VitePress 配置
├── .github/workflows/    # GitHub Pages 自动部署
├── python/               # Python 学习笔记（按章节拆分）+ 代码
├── langchain/            # LangChain 学习笔记 + 代码
├── langgraph/            # LangGraph 学习笔记 + 代码
└── vibe_coding/          # AI Coding（Vibe Coding）学习笔记 + 代码
```

站点直接复用各课程下的 Markdown 笔记，无需复制文件。

## 学习建议

1. 打开站点或对应课程 README，浏览笔记章节
2. 对照笔记复习
3. 站点上的「Notebook 在线阅读」页面（LangChain / LangGraph）可直接在浏览器中打开配套 Notebook 跟练
4. AI Coding 课程可对照 `vibe_coding/代码/AICoding/` 下的实战项目练习

## 版权说明

课程版权归 [尚硅谷](http://www.atguigu.com/) 所有，本仓库仅供学习交流使用。
