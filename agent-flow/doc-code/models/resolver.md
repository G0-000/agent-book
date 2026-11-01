# models/resolver.py —— 对话模型名解析（单一入口）

> 文件路径: `backend/packages/harness/agentflow/models/resolver.py`
> 对标来源: `evoflow/models/resolver.py`
> 里程碑: M2（第二篇 · 第2章 配置、模型供应商与凭证）

---

## 一、模块结构图

```
┌──────────────────────────────────────────────────────┐
│ resolve_run_model(agent_code?, cfg?) → str           │
│   │                                                  │
│   ├─ ① runtime override: cfg.model_name / cfg.model │
│   ├─ ② agent config: AgentConfig.model（TODO M3）     │
│   └─ ③ global default: AppConfig.models.chat.model  │
│                                                      │
│ 找不到任何模型 → NoChatModelConfiguredError          │
└──────────────────────────────────────────────────────┘
```

## 二、顺序执行链

```
resolve_run_model(agent_code, cfg)
  │
  ├─▶ _runtime_override(cfg)          ← 读 cfg["model_name"] / cfg["model"]
  │     └─ "default" 视为未设置，跳过
  │
  ├─▶ _agent_model(agent_code)        ← M3 TODO：AgentConfig 未建，返回空串
  │
  ├─▶ _global_default_model()         ← load_config() → models.chat.model
  │
  ├─▶ _pick(runtime, agent, global)   ← 按优先级选第一个有效名
  │     └─ 名不在 AppConfig.known 集合里 → 静默降级到下一级
  │
  └─▶ 返回 chosen 或 raise NoChatModelConfiguredError
```

## 三、对外导出

| 名称 | 类型 | 说明 |
|---|---|---|
| `NoChatModelConfiguredError` | Exception | 阶梯上一个模型都没有时抛出 |
| `resolve_run_model(agent_code?, cfg?, require_configured=True)` | 函数 | 解析当前轮次应使用的模型名 |
| `resolve_run_model_with_source(agent_code?, cfg?)` | 函数 | 同上 + 返回来源层级常量（可观测） |

### 来源层级常量

| 常量 | 值 | 含义 |
|---|---|---|
| `SOURCE_RUNTIME` | 0 | 运行时覆盖（前端/会话指定） |
| `SOURCE_AGENT` | 1 | Agent 绑定配置（M3） |
| `SOURCE_GLOBAL_PRIMARY` | 2 | 全局默认（models.chat.model） |
| `SOURCE_GLOBAL_FIRST` | 3 | 多模型列表第一个（M6 扩展） |

## 四、设计要点

1. **单一入口**：所有调用方（CLI / factory / gateway）都走这里，避免散落多处 fallback 逻辑。
2. **容错降级**：runtime override 不匹配配置时只 log info，不 raise——过期前端缓存不能搞垮聊天管线。
3. **lazy import**：`get_app_config_safe()` 内部才 import app_config，避免循环依赖（factory.py 也 import 本模块）。

## 五、Q&A

**Q: runtime override 为什么不匹配时不报错？**
A: 前端可能缓存了过期模型名。严格报错会导致整轮对话不可用，降级到全局默认更稳。

**Q: agent tier 为什么是 TODO？**
A: M3 才建 AgentConfig（Agent 层绑定模型）。当前所有 Agent 都用全局 models.chat.model。
