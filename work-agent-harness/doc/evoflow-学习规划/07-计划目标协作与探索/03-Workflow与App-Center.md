# 第 3 章　Workflow、App Center、Stage 与任务输入

## 本章目标
把「一次性的对话」升级为「可复用的流程」，并支持由 Agent 生成应用/页面。

## 最小闭环
定义 workflow（步骤 + 输入 schema）→ 用同一输入跑两次得到结构一致的结果 → 应用中心可查看。

## 真实模块地图（源码证实：路径存在）
| 职责 | 路径 |
|---|---|
| 工作流 | `packages/harness/evoflow/workflows/`、`scheduler/tool_executor.py` |
| 阶段 | `stage/` |
| 应用引擎/生成 | `collab/app_engine.py`、`app_generator.py`、`app_runner.py`、`app_schema.py`、`app_canvas.py` |
| 应用路由 | `app/gateway/routers/apps.py`、`apps_debug.py` |

## 核心概念
- **Workflow = 有 schema 的计划**：输入/输出可校验，才能被重复调用。
- **Stage**：长流程的中间态（草稿 → 待审 → 发布）。
- **App Center**：把 Agent 产出的可交互页面当作一等产物管理。

## 自研实现要点
```text
workflow(id, name, inputs_schema, steps_json, version)
run(workflow_id, inputs) → run_id → 每步产物带 stage
```

## 业务规则
- 工作流版本化；旧版本可回放。
- 应用产物必须可离线打开（不依赖 Agent 在线）。
- 输入校验失败立即返回，不进模型。

## 常见坑
- 把工作流写成「提示词模板」，没有 schema → 不可自动化。
- 应用产物存在临时目录 → 重启即丢。

## 验收
- [ ] 同输入两次结果结构一致
- [ ] 产物可独立打开
- [ ] 版本可回放

## 对照 EvoFlow 核对清单
- [ ] `app_engine.py` 的执行模型
- [ ] `stage/` 的状态定义
