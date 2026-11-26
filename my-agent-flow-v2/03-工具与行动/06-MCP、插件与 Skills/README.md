# 第 03.6 章　MCP、插件与 Skills

> 状态：✅ 正文按六节写完；stdio MCP 客户端、插件加载、技能注册已实现并有 4 个用例。**MCP 尚未接进 ToolRegistry**。
> 所属：第 03 篇　工具与行动

## 1. 功能与知识点

### 功能

工具不必都内置，三种外部来源各自一套机制：

1. **MCP（stdio）**：`McpClient` 启动子进程，按 JSON-RPC 逐行收发 `initialize` / `tools/list` / `tools/call`。
2. **插件**：`PluginSpec(name, entry="module:function")`，`load()` 动态导入；失败返回 `None` 并记日志，不拖垮宿主。
3. **Skills**：`manifest.json`（`name/version/entry`）+ `SkillRegistry.install()`；版本必须 `x.y.z`，重名拒绝。

三者共同点：**外部代码不可信**，加载失败必须隔离，不能让一个坏包导致服务起不来。

### 知识点如何体现

| 知识点 | 在本功能里体现为 | 可观察证据 |
|---|---|---|
| 协议逐行 | `_request()` 写一行 JSON、读一行 JSON | 多请求顺序不乱 |
| 错误不是结果 | 响应带 `error` 时抛 `RuntimeError` | `test_mcp_stdio_roundtrip` 的 boom |
| 加载失败隔离 | `load()` catch 后返回 None | `test_plugin_load_and_failure_isolation` |
| manifest 安装时校验 | 缺字段/版本不合法直接抛 | `test_skill_manifest_rejects_bad_version` |
| 重名不覆盖 | `install()` 抛「技能已安装」 | `test_skill_manifest_and_install` |
| 空响应要报错 | `readline()` 空 → `RuntimeError` | 防止进程死了还等 |

**最小验收**：假 MCP server 上 `initialize/list_tools/call_tool` 各拿到正确结果，`boom` 抛错；坏插件返回 None；坏 manifest 安装失败。

## 2. 最小调用链

```mermaid
flowchart TD
    A[McpClient(command)] --> B[Popen stdio]
    B --> C[initialize]
    C --> D[tools/list]
    D --> E[tools/call]
    E --> F[结果回给调用方]
    G[PluginSpec] --> H[importlib.import_module]
    H --> I{成功?}
    I -- 否 --> J[log + None]
    I -- 是 --> K[可调用对象]
    L[技能包目录] --> M[read_manifest 校验]
    M --> N[SkillRegistry.install]
```

### 2.1 JSON-RPC 收发

```python
payload = {"jsonrpc": "2.0", "id": self._id, "method": method, "params": params or {}}
self._proc.stdin.write(json.dumps(payload) + "\n")
self._proc.stdin.flush()
line = self._proc.stdout.readline()
if not line:
    raise RuntimeError(f"MCP 服务无响应：{method}")
```

一次请求对应一次响应。**不做并发请求**：id 配对需要读线程，本章先保证顺序正确。

### 2.2 manifest 校验

```python
_VER = re.compile(r"^\d+\.\d+\.\d+$")
for key in ("name", "version", "entry"):
    if not data.get(key):
        raise ValueError(f"manifest 缺少字段：{key}")
if not _VER.match(data["version"]):
    raise ValueError(f"版本号不合法：{data['version']}")
```

版本只认三段数字：`v1.0` 或日期版本会让「谁更新」无法比较。

### 2.3 失败点

- MCP server 写了日志到 stdout：会污染 JSON 行，必须要求它只输出协议行（真实 server 通常写 stderr）。
- 子进程卡死：`readline()` 会永久阻塞；本章没有超时。
- 插件 entry 指向不存在模块：返回 None，调用方要自己判空。

## 3. 代码创建

| 顺序 | 文件 | 本章职责 | 关键符号 |
|---|---|---|---|
| 1 | `mcp/client.py` | stdio JSON-RPC | `McpClient` |
| 2 | `skills/loader.py` | 插件动态导入 | `PluginSpec`、`load`、`load_all` |
| 3 | `skills/registry.py` | manifest 校验与安装 | `Manifest`、`read_manifest`、`SkillRegistry` |
| 4 | `tests/chapters/test_ch03_06_mcp_skills.py` | 三条链路 | 4 个用例 |

### 3.1 为什么 MCP 先做 stdio

HTTP/SSE 传输要额外处理鉴权、重连、会话 id；stdio 把「协议本身」讲清楚，也最适合本地工具服务器。

### 3.2 取舍：自动注册 vs 显式桥接

MCP 工具现在没有自动进 `ToolRegistry`：`tools/list` 回来的 schema 要显式转换并注册，还要决定权限级别。自动注册会有「一个 MCP server 暴露 60 个工具」的问题，先把桥接做成显式函数，再做开关。

### 3.3 上游对照

EvoFlow 的 MCP 层还做：HTTP/OAuth、重连、工具缓存、schema 转换、按 server 限权；Skills 还做热插拔、依赖安装、版本升级。本章只做本地 stdio + 基础生命周期。

## 4. 测试

### 4.1 覆盖矩阵

| 类型 | 用例 | 验证什么 |
|---|---|---|
| 正常 | `test_mcp_stdio_roundtrip` | initialize/list/call 三步 + error 抛错 |
| 正常 | `test_skill_manifest_and_install` | 安装成功、重复安装拒绝 |
| 失败 | `test_skill_manifest_rejects_bad_version` | `v1.0` 被拒 |
| 容错 | `test_plugin_load_and_failure_isolation` | 好插件返回函数，坏插件返回 None |

### 4.2 运行

```bash
cd /Users/main/my-agent-flow/backend
uv run pytest tests/chapters/test_ch03_06_mcp_skills.py -q
```

当前结果：`4 passed`。

## 5. 完整化

1. **MCP → ToolRegistry 桥接**：`list_tools()` 的 schema 转成 `ToolSpec`，按 server 前缀命名（`fs.read_file`）。
2. **超时与重连**：`_request` 加读超时，进程退出后自动重启一次。
3. **并发请求**：读线程 + id 匹配，支持同 server 多请求。
4. **HTTP 传输**：SSE/Streamable HTTP + OAuth。
5. **Skills 热插拔**：卸载、升级、依赖检查；现在只能安装一次。
6. **权限分级**：MCP 工具默认按「外部不可信」处理，需显式 allow 才能执行写操作。
7. **工具数量治理**：一个 server 工具过多时按相关性筛选，避免 schema 撑爆上下文。

每项都要有独立测试；当前只完成本地协议与生命周期。

## 6. 边界与验收

### 本章不做什么

- MCP 工具不进图；`/api/chat` 的工具表只有内置 echo/文件/命令。
- 不做 HTTP/OAuth、不做重连、不做请求超时。
- Skills 不做热插拔/升级/依赖安装。
- 不校验插件代码安全性；「能 import」不等于「可信」。

### 验收

```bash
cd /Users/main/my-agent-flow/backend
uv run pytest tests/chapters/test_ch03_06_mcp_skills.py -q
```

预期：`4 passed`。失败时先查：子进程是否用了当前解释器（`sys.executable`）、server 是否把日志写到 stdout、manifest 版本号是否带 `v` 前缀。

### 下一章依赖

03.7 的策略要覆盖「外部工具」：MCP/插件工具默认不属于 shell，若直接放行，等于绕过审批。桥接时必须给每个工具标权限级别。
