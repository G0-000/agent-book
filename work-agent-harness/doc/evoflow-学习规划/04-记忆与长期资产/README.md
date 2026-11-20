# 第 4 部分　记忆与长期资产 / Memory and Long-Term Assets

> 状态：✅ 三章代码与章节测试已落地；全量章节测试 `84 passed`。

目标：让系统记得住、查得到、删得掉，并且记忆进入 prompt 时不会被当指令执行。

## 章节

| 章 | 主题 | 主要文件 |
|---|---|---|
| [1](01-短期记忆与长期记忆.md) | 短期/长期记忆、命名空间、原子表、召回快照 | `agents/memory/`、`memory/`、`config/paths.py` |
| [2](02-记忆巩固知识图谱与注入防御.md) | 确定性巩固、`subject_key` 弱图谱、注入声明 | `memory/consolidate.py`、`agents/memory/prompt.py` |
| [3](03-资产产物事项与反思.md) | 产物契约、用户事项、反射解析 | `artifacts/`、`items/`、`reflection/` |

## 三种「记忆」不要混

| 类型 | 载体 | 生命周期 | 典型内容 |
|---|---|---|---|
| 工作记忆 | 上下文窗口 | 单轮/压缩周期 | 当前任务中间结论 |
| 会话记忆 | 消息表 + task 记忆 | 一个 thread | 本轮确认的事实 |
| 长期记忆 | `memory.json` + `mem_atoms` | 跨会话 | 用户偏好、领域事实 |

## 本章边界

- 召回是关键词，不是向量。
- 巩固是确定性合并，不调 LLM，不做衰减/GC。
- 事项只做 CRUD，不派发 Task。
- 记忆注入只做边界声明，不替换内容。

## 验收口径

```bash
cd /Users/main/my-agent-flow/backend
uv run pytest tests/chapters/test_ch04_*.py -q   # 17 passed
uv run pytest tests/chapters -q                 # 84 passed
uv run ruff check packages tests                # All checks passed
```
