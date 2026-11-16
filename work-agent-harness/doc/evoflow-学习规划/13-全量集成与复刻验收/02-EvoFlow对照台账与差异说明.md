# 第 2 章　EvoFlow 对照台账与差异说明

## 本章目标
用一张表把「学了什么、做了什么、故意没做什么」写清楚，避免复刻变成盲抄。

## 对照维度

| 维度 | EvoFlow 的做法（已核对路径） | 复刻建议 | 差异理由 |
|---|---|---|---|
| Agent 循环 | LangGraph 图 + 71 个 middleware | 先做 chain，后上图 | 图带来可观测/可恢复，但学习曲线陡 |
| 持久化 | checkpointer + `*_repositories` 数十张表 | 单库 + 少量表 | 规模不同，过度拆表无收益 |
| 流式 | AG-UI → v4 投影 → 镜像 → 恢复 | 事件日志 + last_seq | 协议层可后续再加 |
| 工具 | `tools/` 目录化 + catalog + 截断/落盘 | 同结构小规模 | 这是必须学的部分 |
| 上下文 | `context/` 十余个模块 | 先估算+截断+摘要 | 全量压缩机制成本高 |
| 记忆 | `memory/` + 命名空间 + 巩固 | 表 + 混合检索 | 巩固可后置 |
| 知识 | `knowledge/` + `code_index/` | 先 RAG，后代码索引 | 代码索引收益高但工程量大 |
| 委派 | `subagents/` + 沙箱 + 审批 | 先委派，后沙箱 | 沙箱依赖平台能力 |
| 自动化 | `proactive/` + 调度器 | 表驱动调度 | 必须表驱动 |
| 生态 | MCP + plugins + skills + a2a | 先 MCP + skills | 性价比最高 |
| 治理 | `authz/` + `license/` + `observability/` + `eval/` | 先 trace + 用量 | 没有观测就没有优化 |
| 桌面 | Tauri + packaging | 后置 | 不影响内核 |

## 三个不要抄的地方（学习结论）

1. **不要抄模块数量本身**：EvoFlow 的细分来自真实踩坑，不是设计目标；先写清问题再拆模块。
2. **不要抄「到处 patched_*」**：`models/` 里的厂商补丁是被现实逼出来的，先做统一适配层。
3. **不要抄许可边界之外的东西**：PolyForm Noncommercial 1.0.0，商用需授权；自研代码保持独立实现。

## 验收
- [ ] 每条差异有「为什么」而不只是「不同」
- [ ] 有明确的「不实现」清单
- [ ] 台账随进展更新，不一次性写完

## 对照 EvoFlow 核对清单
- [ ] 各域真实文件数与行数量级（用于评估复刻成本）
- [ ] 与本仓库 `backend/` 的差异（两者是否同源需确认）

## 从零实现（手把手）
> 读完这章你能自动生成一份「模块对照表」：哪些有、哪些缺、哪些只解释。
> 路径均相对 `backend/`，代码注释写「为什么」。

### Step 1　新建 diff_ledger.py：扫两棵树对比
**文件**：`tools/diff_ledger.py（新建，路径相对 `backend/`）`
**要写的逻辑**：扫 EvoFlow 与 myagentflow 的包目录，输出「已有 / 空壳 / 缺失」三态表；空壳判断用「目录存在但只有 __init__.py」。

**代码**

```python
"""生成对照台账：EvoFlow 有、我们有没有。

为什么用脚本而不是手写：手写台账一定会过期，
这类事实必须每次从代码树重新算。
"""
from __future__ import annotations

import sys
from pathlib import Path


def scan(root: Path) -> dict[str, int]:
    """返回 包名 → 该包下 .py 文件数（不含 __init__.py）。"""
    out: dict[str, int] = {}
    if not root.exists():
        return out
    for pkg in sorted(root.iterdir()):
        if not pkg.is_dir() or pkg.name.startswith("__"):
            continue
        files = [p for p in pkg.rglob("*.py") if p.name != "__init__.py"]
        out[pkg.name] = len(files)
    return out


def classify(ref: int, ours: int) -> str:
    """三态：EvoFlow 有、我们一个源文件都没有 → 空壳；实现了六成以上 → 已实现。"""
    if ref == 0:
        return "新增"          # 只我们有
    if ours == 0:
        return "空壳"          # 目录在、没有实现
    if ours / ref >= 0.6:
        return "已实现"
    return "部分"


def main(evo_root: str, my_root: str) -> int:
    ref = scan(Path(evo_root))
    ours = scan(Path(my_root))
    print("| 模块 | EvoFlow 文件数 | 我们 | 状态 |")
    print("|---|---|---|---|")
    for name in sorted(set(ref) | set(ours)):
        print(f"| {name} | {ref.get(name, 0)} | {ours.get(name, 0)} | {classify(ref.get(name, 0), ours.get(name, 0))} |")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1], sys.argv[2]))
```

**验证**

```bash
uv run python tools/diff_ledger.py \
  /Users/main/EvoFlow/backend/packages/harness/evoflow \
  packages/harness/myagentflow
# 期望：打印一张 Markdown 表，空包会显示「空壳」
```

### 与 EvoFlow 对照

| 我们的做法 | EvoFlow | 为什么 |
|---|---|---|
| 台账由脚本生成 | `PROGRESS.md` 的核对表 | 手写台账必然过期 |
| 空壳 = 只有 __init__ | 同文件 classify | 「目录存在」不等于「实现了」 |

### 知识点

- agent-book：验收标准
- Harbor404：复刻项目的差异管理

### 验收

```bash
uv run python tools/diff_ledger.py /Users/main/EvoFlow/backend/packages/harness/evoflow packages/harness/myagentflow | head -5
```
