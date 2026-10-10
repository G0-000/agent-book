import type { DefaultTheme } from 'vitepress'

export const langchainSidebar: DefaultTheme.SidebarItem[] = [
  {
    text: 'LangChain',
    items: [
      { text: '01 · LangChain 概述', link: '/langchain/课件/01-LangChain概述' },
      { text: '02 · 模型的创建与调用', link: '/langchain/课件/02-模型的创建与调用' },
      { text: '03 · LangSmith 的使用', link: '/langchain/课件/03-LangSmith的使用' },
      { text: '04 · Message 与提示词模板', link: '/langchain/课件/04-Message与提示词模板' },
      { text: '05 · Tools', link: '/langchain/课件/05-Tools' },
      { text: '06 · 结构化输出', link: '/langchain/课件/06-结构化输出' },
      { text: '07 · 智能体', link: '/langchain/课件/07-智能体' },
      { text: '08 · 中间件', link: '/langchain/课件/08-中间件' },
      { text: '09 · 上下文与记忆', link: '/langchain/课件/09-上下文与记忆' },
      { text: '10 · RAG', link: '/langchain/课件/10-RAG' },
      { text: '11 · MCP 与 Skills', link: '/langchain/课件/11-MCP与Skills' },
    ],
  },
  {
    text: '相关链接',
    items: [{ text: 'Notebook 在线阅读', link: '/langchain/notebooks' }],
  },
]

export const langgraphSidebar: DefaultTheme.SidebarItem[] = [
  {
    text: 'LangGraph',
    items: [
      { text: '00 · 环境配置', link: '/langgraph/课件/00-环境配置' },
      { text: '01 · LangGraph 基础入门', link: '/langgraph/课件/01-LangGraph基础入门' },
      { text: '02 · 控制流与节点执行', link: '/langgraph/课件/02-LangGraph控制流与节点执行' },
      { text: '03 · 持久化与记忆管理', link: '/langgraph/课件/03-LangGraph持久化与记忆管理' },
      { text: '04 · 中断与工具与部署', link: '/langgraph/课件/04-LangGraph中断与工具与部署' },
      { text: '05 · 高级特性', link: '/langgraph/课件/05-LangGraph高级特性' },
    ],
  },
  {
    text: '相关链接',
    items: [{ text: 'Notebook 在线阅读', link: '/langgraph/notebooks' }],
  },
]

export const vibeSidebar: DefaultTheme.SidebarItem[] = [
  {
    text: 'AI Coding',
    items: [
      { text: '00 · 课程介绍与环境准备', link: '/vibe_coding/课件/00-课程介绍与环境准备' },
      { text: '01 · AI 编程基础理论', link: '/vibe_coding/课件/01-AI编程基础理论' },
      { text: '02 · AI 编程工具生态', link: '/vibe_coding/课件/02-AI编程工具生态' },
      { text: '03 · Claude Code 深度使用', link: '/vibe_coding/课件/03-ClaudeCode深度使用与进阶技巧' },
      { text: '04 · AI 技能系统（Skills）', link: '/vibe_coding/课件/04-AI技能系统Skills' },
      { text: '05 · 完整项目案例实操', link: '/vibe_coding/课件/05-完整项目案例实操' },
      { text: '06 · 项目实战（独立完成）', link: '/vibe_coding/课件/06-项目实战独立完成' },
      { text: '07 · Codex Desktop', link: '/vibe_coding/课件/07-CodexDesktop' },
      { text: '08 · 附录', link: '/vibe_coding/课件/08-附录' },
    ],
  },
]

export const pythonSidebar: DefaultTheme.SidebarItem[] = [
  {
    text: 'Python',
    items: [
      { text: '01 · 必备基础知识', link: '/python/课件/01-必备基础知识' },
      { text: '02 · 初识 Python', link: '/python/课件/02-初识Python' },
      { text: '03 · Python 核心基础', link: '/python/课件/03-Python核心基础' },
      { text: '04 · 流程控制语句', link: '/python/课件/04-流程控制语句' },
      { text: '05 · 函数入门', link: '/python/课件/05-函数入门' },
      { text: '06 · 数据容器', link: '/python/课件/06-数据容器' },
      { text: '07 · 面向对象', link: '/python/课件/07-面向对象' },
      { text: '08 · 函数进阶', link: '/python/课件/08-函数进阶' },
      { text: '09 · 错误与异常', link: '/python/课件/09-错误与异常' },
      { text: '10 · 模块与包', link: '/python/课件/10-模块与包' },
      { text: '11 · 迭代器 vs 生成器', link: '/python/课件/11-迭代器vs生成器' },
      { text: '12 · 文件操作', link: '/python/课件/12-文件操作' },
      { text: '13 · 进程与线程', link: '/python/课件/13-进程与线程' },
      { text: '14 · 协程', link: '/python/课件/14-协程' },
    ],
  },
]

export const agentFlowSidebar: DefaultTheme.SidebarItem[] = [
  {
    text: '项目说明',
    items: [
      { text: '项目 agent-flow 说明', link: '/agent-flow/index' },
      { text: '文档库总入口', link: '/agent-flow/README' },
    ],
  },
  {
    text: '开发文档 doc-dev',
    items: [
      {
        text: '00 · 快速上手',
        items: [{ text: 'AI 接管指南', link: '/agent-flow/doc-dev/00-快速上手/AI接管指南' }],
      },
      {
        text: '01 · 里程碑',
        items: [
          { text: '学习路线', link: '/agent-flow/doc-dev/01-里程碑/00-学习路线' },
          { text: 'M0 · 环境搭建', link: '/agent-flow/doc-dev/01-里程碑/M0-环境搭建' },
          { text: 'M1 · 思考与规划', link: '/agent-flow/doc-dev/01-里程碑/M1-思考与规划' },
          { text: 'M1 · 最小 Agent', link: '/agent-flow/doc-dev/01-里程碑/M1-最小Agent' },
          { text: 'M2 · 工具与中间件', link: '/agent-flow/doc-dev/01-里程碑/M2-工具与中间件' },
          { text: 'M3 · 记忆与知识', link: '/agent-flow/doc-dev/01-里程碑/M3-记忆与知识' },
          { text: 'M4 · 子代理与沙箱', link: '/agent-flow/doc-dev/01-里程碑/M4-子代理与沙箱' },
          { text: 'M5 · 长任务与协作', link: '/agent-flow/doc-dev/01-里程碑/M5-长任务与协作' },
          { text: 'M6 · 扩展与治理', link: '/agent-flow/doc-dev/01-里程碑/M6-扩展与治理' },
        ],
      },
      {
        text: '02 · 架构设计',
        items: [
          { text: '总体设计', link: '/agent-flow/doc-dev/02-架构设计/总体设计' },
          { text: '目录结构', link: '/agent-flow/doc-dev/02-架构设计/目录结构' },
        ],
      },
      {
        text: '03 · 决策记录',
        items: [
          { text: 'ADR-001 · workspace 双包', link: '/agent-flow/doc-dev/03-决策记录/ADR-001-workspace双包' },
          { text: 'ADR-002 · 依赖版本对齐原版', link: '/agent-flow/doc-dev/03-决策记录/ADR-002-依赖版本对齐原版' },
          { text: 'ADR-003 · 配置与模型工厂', link: '/agent-flow/doc-dev/03-决策记录/ADR-003-配置与模型工厂' },
          { text: 'ADR-004 · 持久化与检查点', link: '/agent-flow/doc-dev/03-决策记录/ADR-004-持久化与检查点' },
        ],
      },
      {
        text: '04 · 模块实现',
        items: [
          { text: 'agents 域', link: '/agent-flow/doc-dev/04-模块实现/agents域' },
          { text: 'config-models 域', link: '/agent-flow/doc-dev/04-模块实现/config-models域' },
          { text: 'persistence 域', link: '/agent-flow/doc-dev/04-模块实现/persistence域' },
          { text: 'tools-cli 域', link: '/agent-flow/doc-dev/04-模块实现/tools-cli域' },
        ],
      },
      {
        text: '05 · 验收体系',
        items: [
          { text: '验收体系总览', link: '/agent-flow/doc-dev/05-验收体系/README' },
          { text: '验收例子', link: '/agent-flow/doc-dev/05-验收体系/验收例子' },
          { text: 'M0 · 验收清单', link: '/agent-flow/doc-dev/05-验收体系/M0-验收清单' },
          { text: 'M0-M6 · 全面审计报告', link: '/agent-flow/doc-dev/05-验收体系/M0-M6-全面审计报告' },
          { text: 'M1 · 验收清单', link: '/agent-flow/doc-dev/05-验收体系/M1-验收清单' },
          { text: 'M1 · 验证记录', link: '/agent-flow/doc-dev/05-验收体系/M1-验证记录' },
          { text: 'M2 · 验收清单', link: '/agent-flow/doc-dev/05-验收体系/M2-验收清单' },
          { text: 'M2 · 验证记录', link: '/agent-flow/doc-dev/05-验收体系/M2-验证记录' },
          { text: 'M3 · 验收清单', link: '/agent-flow/doc-dev/05-验收体系/M3-验收清单' },
          { text: 'M3 · 验证记录', link: '/agent-flow/doc-dev/05-验收体系/M3-验证记录' },
          { text: 'M4 · 验收清单', link: '/agent-flow/doc-dev/05-验收体系/M4-验收清单' },
          { text: 'M5 · 验收清单', link: '/agent-flow/doc-dev/05-验收体系/M5-验收清单' },
          { text: 'M6 · 验收清单', link: '/agent-flow/doc-dev/05-验收体系/M6-验收清单' },
          { text: 'M7 · 验收清单', link: '/agent-flow/doc-dev/05-验收体系/M7-验收清单' },
          { text: 'M8 · 验收清单', link: '/agent-flow/doc-dev/05-验收体系/M8-验收清单' },
        ],
      },
      { text: '06 · 问题日志', link: '/agent-flow/doc-dev/06-问题日志/问题日志' },
      {
        text: '07 · 开发规范',
        items: [
          { text: '开发指南', link: '/agent-flow/doc-dev/07-开发规范/开发指南' },
          { text: '全流程步骤', link: '/agent-flow/doc-dev/07-开发规范/全流程步骤' },
          { text: 'M2 · 开发规范', link: '/agent-flow/doc-dev/07-开发规范/M2-开发规范' },
        ],
      },
      { text: 'doc-dev 总览', link: '/agent-flow/doc-dev/README' },
    ],
  },
  {
    text: '代码文档 doc-code',
    items: [
      { text: 'agents', link: '/agent-flow/doc-code/agents/__init__' },
      { text: 'authz', link: '/agent-flow/doc-code/authz/__init__' },
      { text: 'cli', link: '/agent-flow/doc-code/cli/__init__' },
      { text: 'collab', link: '/agent-flow/doc-code/collab/__init__' },
      { text: 'community', link: '/agent-flow/doc-code/community/__init__' },
      { text: 'config', link: '/agent-flow/doc-code/config/__init__' },
      { text: 'knowledge', link: '/agent-flow/doc-code/knowledge/__init__' },
      { text: 'mcp', link: '/agent-flow/doc-code/mcp/__init__' },
      { text: 'memory', link: '/agent-flow/doc-code/memory/__init__' },
      { text: 'models', link: '/agent-flow/doc-code/models/__init__' },
      { text: 'observability', link: '/agent-flow/doc-code/observability/__init__' },
      { text: 'persistence', link: '/agent-flow/doc-code/persistence/__init__' },
      { text: 'plans', link: '/agent-flow/doc-code/plans/__init__' },
      { text: 'sandbox', link: '/agent-flow/doc-code/sandbox/__init__' },
      { text: 'scheduler', link: '/agent-flow/doc-code/scheduler/__init__' },
      { text: 'skills', link: '/agent-flow/doc-code/skills/__init__' },
      { text: 'subagents', link: '/agent-flow/doc-code/subagents/__init__' },
      { text: 'tests', link: '/agent-flow/doc-code/tests/__init__' },
      { text: 'tools', link: '/agent-flow/doc-code/tools/__init__' },
      { text: 'webui', link: '/agent-flow/doc-code/webui/__init__' },
    ],
  },
]
