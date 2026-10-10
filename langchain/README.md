# 尚硅谷 LangChain 1.2 教程（2026 版）

> LangChain 学习一套通：从入门到 Agent / 中间件 / 记忆 / RAG 综合项目实战  
> 讲师：尚硅谷 · 宋红康

## 仓库结构

```text
langchain/
├── README.md                 # 本说明
├── 课件/                     # Markdown 课件（可在线阅读）
│   ├── 01-LangChain概述.md
│   ├── 02-模型的创建与调用.md
│   ├── ...
│   ├── 10-RAG.md
│   └── assets/               # 章节共用图片资源
└── 代码/
    └── langchain1.2_tutorial/  # Jupyter Notebook 实战代码
        ├── chapter02_model/
        ├── chapter03_langsmith/
        ├── ...
        ├── chapter10-RAG/
        ├── requirements.txt
        └── requirements_full.txt
```

---

## 学习路线 & 资料对照

| 章节                            | 课件                                                            | 代码                                                                                     |
| ------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ----------- |
| 第 01 章 · LangChain 概述       | [笔记](./课件/01-LangChain概述.md)             | [chapter01_summary](./代码/langchain1.2_tutorial/chapter01_summary/)                     |
| 第 02 章 · 模型的创建与调用     | [笔记](./课件/02-模型的创建与调用.md)       | [chapter02_model](./代码/langchain1.2_tutorial/chapter02_model/)                         |
| 第 03 章 · LangSmith 的使用     | [笔记](./课件/03-LangSmith的使用.md)         | [chapter03_langsmith](./代码/langchain1.2_tutorial/chapter03_langsmith/)                 |
| 第 04 章 · Message 与提示词模板 | [笔记](./课件/04-Message与提示词模板.md) | [chapter04_messages_prompt](./代码/langchain1.2_tutorial/chapter04_messages_prompt/)     |
| 第 05 章 · Tools                | [笔记](./课件/05-Tools.md)                             | [chapter05-tools](./代码/langchain1.2_tutorial/chapter05-tools/)                         |
| 第 06 章 · 结构化输出           | [笔记](./课件/06-结构化输出.md)                   | [chapter06-structured_output](./代码/langchain1.2_tutorial/chapter06-structured_output/) |
| 第 07 章 · 智能体               | [笔记](./课件/07-智能体.md)                           | [chapter07-Agents](./代码/langchain1.2_tutorial/chapter07-Agents/)                       |
| 第 08 章 · 中间件               | [笔记](./课件/08-中间件.md)                           | [chapter08-Middleware](./代码/langchain1.2_tutorial/chapter08-Middleware/)               |
| 第 09 章 · 上下文与记忆         | [笔记](./课件/09-上下文与记忆.md)               | [chapter09-memory](./代码/langchain1.2_tutorial/chapter09-memory/)                       |
| 第 10 章 · RAG                  | [笔记](./课件/10-RAG.md)                                 | [chapter10-RAG](./代码/langchain1.2_tutorial/chapter10-RAG/)                             |
| 第 11 章 · MCP 与 Skills（补充） | [笔记](./课件/11-MCP与Skills.md)                         | —           |

---

## 快速开始（本地跑代码）

```bash
cd langchain/代码/langchain1.2_tutorial

# 建议使用 conda / venv 创建独立环境后安装依赖
pip install -r requirements.txt
# 或完整依赖：
# pip install -r requirements_full.txt

# 用 Jupyter / VS Code / Cursor 打开对应章节的 .ipynb 即可跟练
```

---

## 使用建议

1. **看笔记**：打开 `课件/` 目录下对应章节的 Markdown 复习。
2. **练代码**：打开 `代码/langchain1.2_tutorial/` 下对应 `chapter*` 目录中的 Notebook 动手实践。
3. **做项目**：第 10 章 RAG + Assistant 客服知识库可作为综合实战收尾。

---

## 版权说明

课程版权归 [尚硅谷](http://www.atguigu.com/) 所有。本仓库整理笔记与代码目录，仅供学习交流使用。
