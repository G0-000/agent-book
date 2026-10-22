# config/ — 配置加载与校验

> **源码路径**: `backend/packages/harness/workagentharness/config/`
> **对应功能**: WAH-RUN-001 配置加载与校验

## 文件清单

| 文件 | 职责 |
|---|---|
| `model_config.py` | `ChatModelConfig` 数据类：模型配置的最小契约 |
| `loader.py` | YAML 加载、环境变量展开、字段校验 |

## 顺序执行链

```text
load_chat_model_config(path)
  │
  ▼ 读文件
  ├─► Path.is_file() 检查存在性 → 不存在抛 FileNotFoundError
  ├─► yaml.safe_load() 解析 YAML
  │
  ▼ 取 models.chat
  ├─► raw.get("models", {}).get("chat", {})
  ├─► _expand_env() 递归展开 ${ENV_VAR}
  │
  ▼ 类型校验
  ├─► ChatModelConfig(**chat)  → TypeError 则字段无效
  ├─► provider / model 不能为空
  ├─► openai-compatible 必须有 api_key
  └─► temperature ∈ [0, 2]
  │
  ▼ 返回 ChatModelConfig (frozen dataclass)
```

## 关键设计

1. **环境变量展开是独占式的**：只有整个值是 `${VAR_NAME}` 格式才展开；`prefix_${KEY}` 这种混合文本不展开。避免半展开导致的解析歧义。
2. **frozen dataclass**：配置一旦加载就不可变，运行期不允许修改。
3. **只校验 models.chat**：当前最小闭环只做对话模型配置，其他配置域后续补。

## 边界与待补

- 无配置文件时用默认值？——目前直接报错
- 配置热更新？——不支持，重启才生效
- 多环境 profile？——不支持，单文件
- 配置 schema 自动生成 / JSON Schema？——不支持
