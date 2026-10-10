# __init__.py — __init__.py

> **文件路径**: `backend/packages/harness/agentflow/__init__.py`
> **目录位置**: __init__.py
> **职责**: 核心层包总入口

## 📋 结构图

```text
┌───────────────────────────────────┐
│ agentflow/__init__.py —— 包入口   │
│ 子模块:                           │
│   ├─ agents/                      │
│   ├─ authz/                       │
│   ├─ cli/                         │
│   ├─ collab/                      │
│   ├─ community/                   │
│   ├─ config/                      │
│   ├─ knowledge/                   │
│   ├─ mcp/                         │
│   ├─ memory/                      │
│   ├─ models/                      │
│   ├─ observability/               │
│   ├─ persistence/                 │
│   ├─ plans/                       │
│   ├─ sandbox/                     │
│   ├─ scheduler/                   │
│   ├─ skills/                      │
│   ├─ subagents/                   │
│   ├─ tools/                       │
│   ├─ webui/                       │
└───────────────────────────────────┘
```

## 📤 关键导出

（无顶层导出，见结构图）

## 💡 设计思想

1. 只做统一导出/包声明，不承载业务逻辑。

## 🎯 实用场景

1. （待补充具体场景）

## ⚠️ 风险点

1. 勿在此放业务逻辑（保持包入口纯净）

---
_自动生成于 doc-code 规范落地（2026-09-28）。来源：__init__.py 头部注释 + 顶层符号。_
