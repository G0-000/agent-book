# evo-flow

> 本站《evo-flow》目录：EvoFlow 工程知识库的**在线文档镜像**。
> 源文档位于本机 `/Users/main/EvoFlow/docs/knowledge/`，该目录被 EvoFlow 的 `mkdocs.yml` 以 `exclude_docs` 排除，属于内部工程研究资料，不进入 EvoFlow 公开用户文档导航。

## 文档位置

| 位置 | 说明 |
|---|---|
| **本地唯一文档源** | `/Users/main/EvoFlow/docs/knowledge/` |
| **在线站点镜像** | 本站 `/evo-flow/knowledge/` 目录（即本地 knowledge 的完整拷贝） |
| **本地源码项目** | `/Users/main/EvoFlow` |

## 文档结构

```
evo-flow/
└── knowledge/                  ← 工程知识库（与本地目录一一对应）
    ├── README.md               知识库入口与中文技术文档约定
    ├── MASTER-PLAN.md          权威研究总规划（六阶段、目录约定、审核机制）
    ├── RESEARCH-PROGRESS.md    唯一总进度面板（状态、检查点、未决问题）
    ├── architecture-map系统架构图.md   系统边界、运行拓扑、数据流全景
    ├── 01-system-overview/     第一阶段：系统全景研究
    ├── 02-core-runtime/        第二阶段：核心 Runtime（Agent / Multi-Agent / Harness / Memory）
    ├── 03-system-integration/  第三阶段：跨模块架构研究
    ├── 04-engineering-mechanisms/ 第四阶段：关键工程机制研究
    ├── 05-independent-implementation/ 第五阶段：独立架构设计与仿写
    ├── 06-validation/          第六阶段：实现验证与差异分析
    ├── diagrams/               Mermaid 图源文件（.mmd）
    └── references/             源码索引、测试索引、未决问题
```

## 阅读顺序建议

1. [知识库入口](knowledge/README) — 先了解文档约定与证据标准。
2. [研究进度面板](knowledge/RESEARCH-PROGRESS) — 看当前六阶段状态与待办。
3. [权威研究总规划](knowledge/MASTER-PLAN) — 看阶段边界与目录约定。
4. [系统架构知识图谱](knowledge/architecture-map系统架构图) — 建立整体地图。
5. 再按阶段进入各专题文档。

## 状态图例

源文档统一使用以下状态标识，本镜像原样保留：

| 标识 | 含义 |
|---|---|
| ⬜ | 未开始（研究框架已建，尚无源码结论） |
| 🔄 | 进行中 |
| 🧍‍♂️ | 已完成，等待用户审核 |
| ✅ | 审核通过 |
| ❌ | 审核未通过，需要修改 |
| ⏸️ | 暂停 |
| 🚫 | 阻塞 |

文档中的证据标记同样原样保留：`[源码证实]`、`[测试已读]`、`[待确认]`、`[外部框架边界]`、`[探针验证]`、`[设计推断]`。标有 ⬜ 的文档只是研究框架，不代表已得出结论。

## 同步说明

1. **单向同步**：本站 `evo-flow/knowledge/` 是 `/Users/main/EvoFlow/docs/knowledge/` 的严格拷贝，内容以源目录为准；不在本站单独改写研究结论。
2. **同步方式**：源目录新增或修改文章后，用 `rsync` 覆盖同步到本站，并重新构建站点。
3. **图与附件**：`diagrams/*.mmd` 一并同步；Markdown 中的 Mermaid 代码块在本站以源码形式展示。
4. **侧边栏登记**：`knowledge/` 下的阶段目录由 `.vitepress/sidebars.ts` 自动扫描生成，新增文章无需手工登记；若新增顶层目录，需要补充侧边栏入口。
5. **密钥勿入文档**：源码索引与调用链只记录路径、符号和行号，不写入任何真实凭证。

## 快速入口

- [知识库入口](knowledge/README)
- [研究进度面板](knowledge/RESEARCH-PROGRESS)
- [权威研究总规划](knowledge/MASTER-PLAN)
- [系统架构知识图谱](knowledge/architecture-map系统架构图)
