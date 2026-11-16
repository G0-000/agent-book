# 第 1 章　MCP 连接、发现、调用与 OAuth

## 本章目标
把「一个外部服务」变成「一组可调用工具」，并解决连接复用、权限、结果体积三个问题。

## 最小闭环
配置一个 MCP server（stdio）→ 启动并握手 → 列出 tools → 调用一次 → 结果进上下文。

## 真实模块地图（源码证实：路径存在）
| 职责 | 路径 |
|---|---|
| 客户端与连接池 | `packages/harness/evoflow/mcp/client.py`、`pool.py` |
| 工具映射 | `mcp/tools.py`、`binding.py`、`annotations.py` |
| 配置读写 | `mcp/config_io.py`、`workspace_scope.py`、`status.py` |
| OAuth | `mcp/oauth.py` |
| 结果预算 | `mcp/result_budget.py` |
| 提示注入（把工具说明写进 prompt） | `mcp/prompt_section.py`、`native_prompt.py` |
| 路由 | `app/gateway/routers/mcp.py`、`mcp_server.py` |

## 核心概念
- **发现是动态的**：`tools/list` 结果随 server 变化，必须缓存 + 失效重取。
- **进程 vs HTTP**：stdio server 要按 workspace 隔离并回收；HTTP server 要处理 401/刷新。
- **结果预算**：MCP 返回可能是巨大 JSON → 必须截断并落盘（同 Part 3）。
- **工具命名冲突**：多 server 同名工具要用 `server.tool` 前缀。

## 自研实现要点
```text
McpServer(id, transport, cmd/url, env, scopes)
McpTool(server_id, name, schema, cached_at)
call: 取连接（池化）→ 序列化请求 → 超时 → 结果整形 → 审计
```

## 业务规则
- server 崩溃自动重启但限次数；连续失败禁用并告警。
- OAuth token 存加密库，不进日志。
- 只挂载当前 workspace 允许的 server。

## 常见坑
- 每次调用都新起进程 → 慢且泄漏。
- 不设超时 → 一个卡住的 server 拖死整轮。
- 把全部工具 schema 塞进 prompt → 上下文直接爆。

## 验收
- [ ] server 重启后工具可用
- [ ] 工具总数 200+ 时按需加载
- [ ] 大结果自动截断落盘

## 对照 EvoFlow 核对清单
- [ ] `mcp/pool.py` 的连接生命周期
- [ ] `result_budget.py` 的截断阈值
- [ ] 多实例负载均衡问题（参考 Harbor404📚）
