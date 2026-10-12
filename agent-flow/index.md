# agent-flow

> 本站《agent-flow》目录：AgentFlow 项目的**在线文档镜像**。
> 项目本身位于本机 `/Users/main/AgentFlow`，代码与文档分开存放。

## 文档位置

| 位置 | 说明 |
|---|---|
| **本地唯一文档源** | `/Users/main/AgentFlow/doc/`（项目代码在 `/Users/main/AgentFlow`，代码与 doc 分开） |
| **在线站点镜像** | 本站 `/agent-flow/` 目录（即上表本地 doc 的拷贝） |

## 文档结构

```
agent-flow/
├── README.md        ← 文档库总入口（分类导航）
├── doc-dev/         ← 开发过程文档：项目怎么来的、怎么推进
│   ├── 00-快速上手/    AI 接管指南
│   ├── 01-里程碑/      学习路线 + M0–M7（M7 应用层为规划）
│   ├── 02-架构设计/    总体设计 + 目录结构
│   ├── 03-决策记录/    ADR-001 ~ 004
│   ├── 04-模块实现/    agents / config-models / persistence / tools-cli
│   ├── 05-验收体系/    各里程碑验收清单与验证记录
│   ├── 06-问题日志/    问题日志（先看速查表）
│   └── 07-开发规范/    开发指南 + 全流程步骤
└── doc-code/         ← 代码结构文档：代码长什么样、每个文件干嘛
    （与 agentflow/ 目录一一对应的模块说明，每个模块一个子目录）
```

## 注意问题

1. **同步机制**：本站 `agent-flow/` 是 `/Users/main/AgentFlow/doc/` 的拷贝。在原项目里修改/新增文档后，需**同步一份到本站目录并推送**，在线站点才会更新。
2. **生成工具不在本站**：`doc-code/` 由原项目里的 `_gen_file_docs.py`、`_migrate_headers.py` 生成，工具脚本保留在原项目，本站不含脚本。
3. **密钥勿入文档**：原项目的 `.env`、`config.yaml` 含真实密钥，位于项目根目录、不在 doc 内，也不会出现在本站。在文档中请只用占位符（如 `your-api-key-here`）。
4. **相对链接**：文档内部互相引用的相对链接在站内保持可用；移动文档时请同步更新链接。
5. **侧边栏登记**：新增章节文件后，需要在 `.vitepress/sidebars.ts` 的 `agentFlowSidebar` 中登记，才会出现在侧边栏。

## 快速入口

- [文档库总入口](README)
- [开发文档 doc-dev](doc-dev/README)
- [代码文档 doc-code](doc-code/agents/__init__)
