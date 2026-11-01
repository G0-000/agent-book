# models/credential_loader.py —— 凭证自动加载

> 文件路径: `backend/packages/harness/agentflow/models/credential_loader.py`
> 对标来源: `evoflow/models/credential_loader.py`
> 里程碑: M2（第二篇 · 第2章 配置、模型供应商与凭证）

---

## 一、模块结构图

```
┌──────────────────────────────────────────────────────┐
│ load_claude_code_credential() → ClaudeCodeCredential │
│   ① $CLAUDE_CODE_OAUTH_TOKEN / $ANTHROPIC_AUTH_TOKEN│
│   ② $CLAUDE_CODE_OAUTH_TOKEN_FILE_DESCRIPTOR         │
│   ③ $CLAUDE_CODE_CREDENTIALS_PATH                   │
│   ④ ~/.claude/.credentials.json                      │
│                                                      │
│ load_codex_cli_credential() → runtimeCliCredential   │
│   ~/.codex/auth.json 或 $CODEX_AUTH_PATH            │
└──────────────────────────────────────────────────────┘
```

## 二、顺序执行链

```
load_claude_code_credential()
  │
  ├─▶ ① 读环境变量 $CLAUDE_CODE_OAUTH_TOKEN / $ANTHROPIC_AUTH_TOKEN
  │     └─ 有值 → ClaudeCodeCredential(source="claude-cli-env") 返回
  │
  ├─▶ ② 读 $CLAUDE_CODE_OAUTH_TOKEN_FILE_DESCRIPTOR（fd 文件描述符）
  │     └─ os.read(fd) 读 secret → source="claude-cli-fd"
  │
  ├─▶ ③ $CLAUDE_CODE_CREDENTIALS_PATH 显式路径
  │
  ├─▶ ④ ~/.claude/.credentials.json
  │     └─ json → claudeAiOauth.accessToken
  │           └─ is_expired? → warn 并返回 None
  │
  └─▶ 都没有 → None（调用方决定是否必需）
```

## 三、对外导出

| 名称 | 类型 | 说明 |
|---|---|---|
| `ClaudeCodeCredential` | dataclass | Claude Code OAuth 凭证（access_token/refresh_token/expires_at） |
| `runtimeCliCredential` | dataclass | Codex CLI 凭证（access_token/account_id） |
| `load_claude_code_credential()` | 函数 | 加载 Claude Code OAuth（按优先级 ①→④） |
| `load_codex_cli_credential()` | 函数 | 加载 Codex CLI token |
| `is_oauth_token(token)` | 函数 | 判断是否 OAuth token（vs API key） |
| `OAUTH_ANTHROPIC_BETAS` | str | Claude Code OAuth 必需的 beta header |

## 四、设计要点

1. **best-effort**：找不到返回 None，不抛异常——调用方决定凭证是否必需。
2. **优先级明确**：环境变量 > fd > 显式路径 > 默认路径，顺序可预测。
3. **过期缓冲**：`is_expired` 提前 1 分钟判定，避免请求中途 token 过期。
4. **日志不打 token 本身**：只记录 source 和 expires_at，防泄漏。

## 五、Q&A

**Q: OAuth token 和 API key 有什么区别？**
A: API key 是 `sk-ant-api03-...`，放 `x-api-key` 头；OAuth token 是 `sk-ant-oat...`，放 `Authorization: Bearer` 头 + 额外 beta header。

**Q: 为什么有文件描述符（fd）模式？**
A: Claude Code CLI 启动时通过 fd 把 token 传给子进程，避免 token 出现在命令行参数里（ps 可见）。
