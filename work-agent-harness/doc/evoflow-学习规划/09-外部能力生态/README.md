# 第 9 部分　外部能力生态 / External Capability Ecosystem

> 状态：🟡 骨架（真实路径已核对）。

目标：Agent 的能力不该写死在代码里——通过 **MCP / 插件 / Skills / A2A** 把外部能力接进来。

## 章节

| 章 | 主题 | 真实模块 |
|---|---|---|
| [1](01-MCP连接发现调用与OAuth.md) | MCP 连接、发现、调用与 OAuth | `mcp/`、`routers/mcp.py`、`routers/mcp_server.py` |
| [2](02-插件扩展壳与桥接.md) | 插件扩展壳、运行桥接、Capability 授权 | `plugins/`、`capability/`、`routers/plugins.py` |
| [3](03-Skills与资源市场.md) | Skills、资源市场、Community Provider | `skills/`、`routers/skills.py`、`community/` |
| [4](04-外部Agent-Adapter与A2A.md) | 外部 Agent Adapter 与 A2A 互操作 | `a2a/`、`external_agents/`、`routers/a2a.py` |

## 四种接入形态的区别

| 形态 | 谁定义能力 | 隔离级别 | 典型用途 |
|---|---|---|---|
| MCP | 外部服务（进程/HTTP） | 进程/网络边界 | 数据库、SaaS、内部平台 |
| 插件 | 本机脚本/桥接 | 本机进程 + token | 浏览器、桌面、Node REPL |
| Skills | 目录 + `SKILL.md` + 脚本 | 文件级 | 领域工作流、模板化任务 |
| A2A | 另一个 Agent | 服务边界 | 跨系统协作、会议 |

## 共同风险
- **能力膨胀**：工具越多，选择越差、上下文越挤 → 必须有工具检索/延迟加载（`tool_search`）。
- **信任边界**：外部返回的内容一律不可信（见 Part 4 注入防御）。
- **凭据管理**：OAuth token / API key 不能进 prompt、不能进日志。

## 验收口径
- 新增一个 MCP server 不改内核代码即可用。
- 工具总数 200+ 时仍能按需加载（不是全塞进 prompt）。
- Skills 可版本化安装/卸载。
