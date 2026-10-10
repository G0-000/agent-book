# 尚硅谷 LangGraph 教程

> 从入门到部署，零基础上手智能体 Agent 必备技能

## 仓库结构

```text
langgraph/
├── README.md                 # 本说明
├── 课件/                     # Markdown 课件（可在线阅读）
│   ├── 00-环境配置.md
│   ├── 01-LangGraph基础入门.md
│   ├── 02-LangGraph控制流与节点执行.md
│   ├── 03-LangGraph持久化与记忆管理.md
│   ├── 04-LangGraph中断与工具与部署.md
│   ├── 05-LangGraph高级特性.md
│   └── images/
└── 代码/
    └── langgraph/            # Jupyter Notebook 实战代码
        ├── chapter01/
        ├── chapter02/
        ├── chapter03/
        ├── chapter04/
        ├── chapter05/
        ├── hitl_demo/
        └── requirements_full.txt
```

---

## 学习路线 & 资料对照

| 章节                               | 课件                                           | 代码                                     |
| ---------------------------------- | ---------------------------------------------- | ---------------------------------------- | ----------- |
| 第 00 章 · 环境配置                | [笔记](./课件/00-环境配置.md)                  |
| 第 01 章 · LangGraph 基础入门      | [笔记](./课件/01-LangGraph基础入门.md)         | [chapter01](./代码/langgraph/chapter01/) |
| 第 02 章 · 控制流与节点执行        | [笔记](./课件/02-LangGraph控制流与节点执行.md) | [chapter02](./代码/langgraph/chapter02/) |
| 第 03 章 · 持久化与记忆管理        | [笔记](./课件/03-LangGraph持久化与记忆管理.md) | [chapter03](./代码/langgraph/chapter03/) |
| 第 04 章 · 中断与工具与部署        | [笔记](./课件/04-LangGraph中断与工具与部署.md) | [chapter04](./代码/langgraph/chapter04/) |
| 第 05 章 · 高级特性（流式 / 子图） | [笔记](./课件/05-LangGraph高级特性.md)         | [chapter05](./代码/langgraph/chapter05/) |

---

## 快速开始（本地跑代码）

```bash
cd langgraph/代码/langgraph

# 建议使用 conda / venv 创建独立环境后安装依赖
pip install -r requirements_full.txt

# 用 Jupyter / VS Code / Cursor 打开对应章节的 .ipynb 即可跟练
```

环境配置细节可参考：[00-环境配置.md](./课件/00-环境配置.md)

---

## 使用建议

1. **看笔记**：打开 `课件/` 目录下对应章节的 Markdown 复习。
2. **练代码**：打开 `代码/langgraph/` 下对应 `chapter*` 目录中的 Notebook 动手实践。
3. **HITL 演示**：可参考 `代码/langgraph/hitl_demo/` 做人机协作相关实验。

---

## 版权说明

课程版权归 [尚硅谷](http://www.atguigu.com/) 所有。本仓库整理笔记与代码目录，仅供学习交流使用。
