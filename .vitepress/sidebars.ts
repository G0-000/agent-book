import type { DefaultTheme } from 'vitepress'
import { readdirSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

// doc-code 侧边栏：直接扫描 agent-flow/doc-code 目录生成，
// 与本地项目（AgentFlow/doc/doc-code）的 md 文件层级一一对应，避免手工列表漂移。
const docCodeRoot = fileURLToPath(new URL('../agent-flow/doc-code', import.meta.url))

// doc-dev 侧边栏：同样自动扫描（2026-10-19 由手工列表改为扫描——
// 手工列表曾漏掉新增文章，如 M0-M8 审查报告等；扫描后每篇文章自动入导航）。
const docDevRoot = fileURLToPath(new URL('../agent-flow/doc-dev', import.meta.url))

function docCodeTree(dir: string, linkPrefix: string): DefaultTheme.SidebarItem[] {
  return readdirSync(dir)
    .sort()
    .flatMap((entry) => {
      const abs = join(dir, entry)
      // cleanUrls 开启，链接不带 .md 后缀；目录名保持原样
      const link = `${linkPrefix}/${entry.endsWith('.md') ? entry.slice(0, -3) : entry}`
      if (statSync(abs).isDirectory()) {
        const item: DefaultTheme.SidebarItem = {
          text: entry,
          collapsed: true,
          items: docCodeTree(abs, link),
        }
        // 目录入口页取包内 __init__.md；无 __init__.md 时取 README.md（如 doc-dev/05-验收体系）；
        // 两者都没有时（tests/ 等）只作分组，不生成死链接
        if (existsSync(join(abs, '__init__.md'))) {
          item.link = `${link}/__init__`
        } else if (existsSync(join(abs, 'README.md'))) {
          item.link = `${link}/README`
        }
        return [item]
      }
      if (entry.endsWith('.md') && entry !== '__init__.md' && entry !== 'README.md') {
        return [{ text: entry.slice(0, -3), link }]
      }
      return []
    })
}

export const agentFlowDocCodeSidebar: DefaultTheme.SidebarItem[] = [
  { text: 'doc-code 总览', link: '/agent-flow/doc-code/README' },
  { text: 'doc-code 包入口', link: '/agent-flow/doc-code/__init__' },
  ...docCodeTree(docCodeRoot, '/agent-flow/doc-code'),
]

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

// 学习教程册侧边栏：自动扫描 doc/dev/学习教程册 目录生成，新增篇/章自动入导航
const tutorialRoot = fileURLToPath(new URL('../work-agent-harness/doc/dev/学习教程册', import.meta.url))

export const workAgentHarnessSidebar: DefaultTheme.SidebarItem[] = [
  {
    text: 'WorkAgentHarness',
    items: [
      { text: '项目说明', link: '/work-agent-harness/index' },
      { text: '文档中心', link: '/work-agent-harness/doc/README' },
      { text: '系统学习路线总规划', link: '/work-agent-harness/doc/系统学习路线-总规划' },
    ],
  },
  {
    text: '逐章仿写教程册',
    collapsed: false,
    items: [
      { text: '教程册总览', link: '/work-agent-harness/doc/dev/学习教程册/README' },
      ...docCodeTree(tutorialRoot, '/work-agent-harness/doc/dev/学习教程册'),
    ],
  },
  {
    text: '学习手册与记录',
    collapsed: false,
    items: [
      { text: '课程目录：分篇与章节', link: '/work-agent-harness/doc/dev/学习手册/课程目录' },
      { text: '功能地图', link: '/work-agent-harness/doc/dev/学习手册/功能地图' },
      { text: '功能单元路线', link: '/work-agent-harness/doc/dev/学习手册/功能单元路线' },
      { text: '功能清单', link: '/work-agent-harness/doc/dev/学习手册/功能清单' },
      { text: '最终验收', link: '/work-agent-harness/doc/dev/学习手册/最终验收' },
      { text: '学习记录', link: '/work-agent-harness/doc/dev/学习记录/README' },
      { text: 'AgentFlow 第一遍复盘', link: '/work-agent-harness/doc/第一次学习复盘' },
    ],
  },
  {
    text: '代码与开发文档',
    items: [
      { text: '代码文档说明', link: '/work-agent-harness/doc/code/README' },
      { text: '开发文档说明', link: '/work-agent-harness/doc/dev/README' },
    ],
  },
]

export const agentFlowSidebar: DefaultTheme.SidebarItem[] = [
  {
    text: '项目说明',
    items: [
      { text: 'agent-flow 说明', link: '/agent-flow/index' },
      { text: '文档库总入口', link: '/agent-flow/README' },
    ],
  },
  {
    text: '开发文档 doc-dev',
    items: [
      { text: 'doc-dev 总览', link: '/agent-flow/doc-dev/README' },
      ...docCodeTree(docDevRoot, '/agent-flow/doc-dev'),
    ],
  },
  {
    text: '代码文档 doc-code',
    items: agentFlowDocCodeSidebar,
  },
]
// 从零开始学 Agent 全书侧边栏（来源：/Users/main/agent_learning，手动 rsync 同步）
export const agentLearningSidebar: DefaultTheme.SidebarItem[] = [
  { text: '前言', link: '/agent-learning/preface' },
  {
    text: '第一部分：入门篇',
    link: '/agent-learning/part1',
    collapsed: false,
    items: [
      {
        text: '第1章 什么是 Agent？',
        link: '/agent-learning/chapter_intro/README',
        collapsed: true,
        items: [
          { text: '1.1 从聊天机器人到智能体的演进', link: '/agent-learning/chapter_intro/01_evolution' },
          { text: '1.2 Agent 的核心概念与定义', link: '/agent-learning/chapter_intro/02_core_concepts' },
          { text: '1.3 Agent 架构：感知-思考-行动循环', link: '/agent-learning/chapter_intro/03_architecture' },
          { text: '1.4 Agent 与传统程序的区别', link: '/agent-learning/chapter_intro/04_agent_vs_traditional' },
          { text: '1.5 Agent 的应用场景全景图', link: '/agent-learning/chapter_intro/05_use_cases' },
          { text: '1.6 智能体发展史：从符号主义到大模型驱动', link: '/agent-learning/chapter_intro/06_history' },
        ],
      },
      {
        text: '第2章 大语言模型基础',
        link: '/agent-learning/chapter_llm/README',
        collapsed: true,
        items: [
          { text: '2.1 拆穿 LLM 的"魔法"：从文字接龙到智能涌现', link: '/agent-learning/chapter_llm/01_how_llm_works' },
          { text: '2.2 不写代码也要"编程"：Prompt Engineering 是怎样把话术变成确定性指令的', link: '/agent-learning/chapter_llm/02_prompt_engineering' },
          { text: '2.3 Few-shot / Zero-shot / Chain-of-Thought 提示策略', link: '/agent-learning/chapter_llm/03_prompting_strategies' },
          { text: '2.4 模型 API 调用入门', link: '/agent-learning/chapter_llm/04_api_basics' },
          { text: '2.5 Token、Temperature 与模型参数详解', link: '/agent-learning/chapter_llm/05_model_parameters' },
          { text: '2.6 基座模型前沿进展与选型指南', link: '/agent-learning/chapter_llm/06_foundation_model_landscape' },
          { text: '2.7 基座模型架构详解', link: '/agent-learning/chapter_llm/07_model_architecture' },
          { text: '2.8 SFT 与强化学习训练数据准备', link: '/agent-learning/chapter_llm/08_training_data' },
        ],
      },
    ],
  },
  {
    text: '第二部分：核心能力篇',
    link: '/agent-learning/part2',
    collapsed: false,
    items: [
      {
        text: '第3章 工具调用（Tool Use / Function Calling）',
        link: '/agent-learning/chapter_tools/README',
        collapsed: true,
        items: [
          { text: '3.1 为什么 Agent 需要工具？', link: '/agent-learning/chapter_tools/01_why_tools' },
          { text: '3.2 Function Calling 机制', link: '/agent-learning/chapter_tools/02_function_calling' },
          { text: '3.3 自定义工具的设计与实现', link: '/agent-learning/chapter_tools/03_custom_tools' },
          { text: '3.4 工具描述的编写技巧', link: '/agent-learning/chapter_tools/04_tool_description' },
          { text: '3.5 实战：搜索引擎 + 计算器 Agent', link: '/agent-learning/chapter_tools/05_practice_search_calc' },
          { text: '3.6 论文解读：工具学习前沿进展', link: '/agent-learning/chapter_tools/06_paper_readings' },
        ],
      },
      {
        text: '第4章 记忆系统（Memory）',
        link: '/agent-learning/chapter_memory/README',
        collapsed: true,
        items: [
          { text: '4.1 为什么 Agent 需要记忆？', link: '/agent-learning/chapter_memory/01_why_memory' },
          { text: '4.2 短期记忆：对话历史管理', link: '/agent-learning/chapter_memory/02_short_term_memory' },
          { text: '4.3 长期记忆：向量数据库与检索', link: '/agent-learning/chapter_memory/03_long_term_memory' },
          { text: '4.4 工作记忆：Scratchpad 模式', link: '/agent-learning/chapter_memory/04_working_memory' },
          { text: '4.5 实战：带记忆的个人助理 Agent', link: '/agent-learning/chapter_memory/05_practice_memory_agent' },
          { text: '4.6 论文解读：记忆系统前沿进展', link: '/agent-learning/chapter_memory/06_paper_readings' },
          { text: '4.7 实战：MemGPT/Letta 记忆架构工程实践', link: '/agent-learning/chapter_memory/06b_memgpt_practice' },
        ],
      },
      {
        text: '第5章 规划与推理（Planning & Reasoning）',
        link: '/agent-learning/chapter_planning/README',
        collapsed: true,
        items: [
          { text: '5.1 Agent 如何"思考"？', link: '/agent-learning/chapter_planning/01_how_agents_think' },
          { text: '5.2 ReAct：推理 + 行动框架', link: '/agent-learning/chapter_planning/02_react_framework' },
          { text: '5.3 任务分解：将复杂问题拆解为子任务', link: '/agent-learning/chapter_planning/03_task_decomposition' },
          { text: '5.4 反思与自我纠错机制', link: '/agent-learning/chapter_planning/04_reflection' },
          { text: '5.5 实战：自动化研究助手 Agent', link: '/agent-learning/chapter_planning/05_practice_research_agent' },
          { text: '5.6 Plan-and-Execute 与 Test-time Compute Scaling', link: '/agent-learning/chapter_planning/07_plan_and_execute' },
          { text: '5.7 论文解读：规划与推理前沿研究', link: '/agent-learning/chapter_planning/06_paper_readings' },
        ],
      },
      {
        text: '第6章 检索增强生成（RAG）',
        link: '/agent-learning/chapter_rag/README',
        collapsed: true,
        items: [
          { text: '6.1 RAG 的概念与工作原理', link: '/agent-learning/chapter_rag/01_rag_concepts' },
          { text: '6.2 文档加载与文本分割', link: '/agent-learning/chapter_rag/02_document_loading' },
          { text: '6.3 向量嵌入与向量数据库', link: '/agent-learning/chapter_rag/03_embeddings_vectordb' },
          { text: '6.4 检索策略与重排序', link: '/agent-learning/chapter_rag/04_retrieval_strategies' },
          { text: '6.5 实战：智能文档问答 Agent', link: '/agent-learning/chapter_rag/05_practice_qa_agent' },
          { text: '6.6 论文解读：RAG 前沿进展', link: '/agent-learning/chapter_rag/06_paper_readings' },
          { text: '6.7 进阶 RAG：GraphRAG 与 Agentic RAG 工程实战', link: '/agent-learning/chapter_rag/07_advanced_rag' },
        ],
      },
      {
        text: '第7章 上下文工程',
        link: '/agent-learning/chapter_context_engineering/README',
        collapsed: true,
        items: [
          { text: '7.1 从提示工程到上下文工程', link: '/agent-learning/chapter_context_engineering/01_context_vs_prompt' },
          { text: '7.2 上下文窗口管理与注意力预算', link: '/agent-learning/chapter_context_engineering/02_context_window' },
          { text: '7.3 长时程任务的上下文策略', link: '/agent-learning/chapter_context_engineering/03_long_horizon' },
          { text: '7.4 实战：构建上下文管理器', link: '/agent-learning/chapter_context_engineering/04_practice_context_builder' },
          { text: '7.5 上下文工程前沿进展', link: '/agent-learning/chapter_context_engineering/05_latest_advances' },
        ],
      },
      {
        text: '第8章 Harness Engineering：驾驭 Agent 的系统工程',
        link: '/agent-learning/chapter_harness/README',
        collapsed: true,
        items: [
          { text: '8.1 什么是 Harness Engineering？', link: '/agent-learning/chapter_harness/01_what_is_harness' },
          { text: '8.2 六大工程支柱', link: '/agent-learning/chapter_harness/02_six_pillars' },
          { text: '8.3 AGENTS.md / CLAUDE.md：Agent 宪法写作指南', link: '/agent-learning/chapter_harness/03_agents_md' },
          { text: '8.4 生产级案例：OpenAI、LangChain、Stripe', link: '/agent-learning/chapter_harness/04_production_cases' },
          { text: '8.5 实战：构建你的第一个 Harness 系统', link: '/agent-learning/chapter_harness/05_practice_harness_builder' },
          { text: '8.6 结构化输出：保障 JSON 可靠性的工程实践', link: '/agent-learning/chapter_harness/06_structured_output' },
        ],
      },
      {
        text: '第9章 Skill System',
        link: '/agent-learning/chapter_skill/README',
        collapsed: true,
        items: [
          { text: '9.1 技能系统概述', link: '/agent-learning/chapter_skill/01_skill_overview' },
          { text: '9.2 技能的定义与封装', link: '/agent-learning/chapter_skill/02_skill_definition' },
          { text: '9.3 技能学习与获取', link: '/agent-learning/chapter_skill/03_skill_learning' },
          { text: '9.4 技能发现与注册', link: '/agent-learning/chapter_skill/04_skill_discovery' },
          { text: '9.5 实战：构建可复用的技能系统', link: '/agent-learning/chapter_skill/05_practice_skill_system' },
          { text: '9.6 论文解读：技能系统前沿研究', link: '/agent-learning/chapter_skill/06_paper_readings' },
          { text: '9.7 Tool、Skill 与 Sub Agent：三层能力抽象', link: '/agent-learning/chapter_skill/07_tool_skill_subagent' },
          { text: '9.8 Skills 圣经：Superpowers 工程实践指南', link: '/agent-learning/chapter_skill/08_superpowers_guide' },
        ],
      },
      {
        text: '第10章 Agentic-RL：智能体强化学习训练',
        link: '/agent-learning/chapter_agentic_rl/README',
        collapsed: true,
        items: [
          { text: '10.1 什么是 Agentic-RL', link: '/agent-learning/chapter_agentic_rl/01_agentic_rl_overview' },
          { text: '10.2 SFT + LoRA 基础训练', link: '/agent-learning/chapter_agentic_rl/02_sft_lora' },
          { text: '10.2b 分布式训练基础：DP / TP / PP / SP / ZeRO', link: '/agent-learning/chapter_agentic_rl/02b_distributed_training' },
          { text: '10.3 PPO：近端策略优化', link: '/agent-learning/chapter_agentic_rl/03_ppo' },
          { text: '10.4 DPO：直接偏好优化', link: '/agent-learning/chapter_agentic_rl/04_dpo' },
          { text: '10.5 GRPO/GSPO：组内相对策略优化与奖励函数设计', link: '/agent-learning/chapter_agentic_rl/05_grpo' },
          { text: '10.6 实战：完整 SFT + GRPO 训练 Pipeline', link: '/agent-learning/chapter_agentic_rl/06_practice_training' },
          { text: '10.7 最新研究进展（2025—2026）', link: '/agent-learning/chapter_agentic_rl/07_latest_research' },
          { text: '10.8 专为 Agent 的微调：让模型真正会用工具', link: '/agent-learning/chapter_agentic_rl/08_agent_finetuning' },
        ],
      },
      {
        text: '第11章 自我进化与持续学习',
        link: '/agent-learning/chapter_self_evolving/README',
        collapsed: true,
        items: [
          { text: '11.1 Prompt 自动调优', link: '/agent-learning/chapter_self_evolving/01_automatic_prompt_optimization' },
          { text: '11.2 Self-Evolution Agent：从会执行到会自我改进', link: '/agent-learning/chapter_self_evolving/02_self_evolution_agent' },
          { text: '11.3 Agentic 数据飞轮：让 Agent 自我进化', link: '/agent-learning/chapter_self_evolving/03_data_flywheel' },
        ],
      },
    ],
  },
  {
    text: '第三部分：框架实战篇',
    link: '/agent-learning/part3',
    collapsed: false,
    items: [
      {
        text: '第12章 LangChain 深入实战',
        link: '/agent-learning/chapter_langchain/README',
        collapsed: true,
        items: [
          { text: '12.1 LangChain 架构全景', link: '/agent-learning/chapter_langchain/01_langchain_overview' },
          { text: '12.2 Chain：构建处理管道', link: '/agent-learning/chapter_langchain/02_chains' },
          { text: '12.3 使用 LangChain 构建 Agent', link: '/agent-learning/chapter_langchain/03_langchain_agents' },
          { text: '12.4 LCEL：LangChain 表达式语言', link: '/agent-learning/chapter_langchain/04_lcel' },
          { text: '12.5 实战：多功能客服 Agent', link: '/agent-learning/chapter_langchain/05_practice_customer_service' },
          { text: '12.6 LangSmith 集成与可观测性', link: '/agent-learning/chapter_langchain/06_langsmith_integration' },
          { text: '12.7 LangChain 生态 2026', link: '/agent-learning/chapter_langchain/07_langchain_ecosystem_2026' },
          { text: '12.8 LangChain 生产化模式', link: '/agent-learning/chapter_langchain/08_production_patterns' },
        ],
      },
      {
        text: '第13章 LangGraph：构建有状态的 Agent',
        link: '/agent-learning/chapter_langgraph/README',
        collapsed: true,
        items: [
          { text: '13.1 为什么需要图结构？', link: '/agent-learning/chapter_langgraph/01_why_graph' },
          { text: '13.2 LangGraph 核心概念：节点、边、状态', link: '/agent-learning/chapter_langgraph/02_core_concepts' },
          { text: '13.3 构建你的第一个 Graph Agent', link: '/agent-learning/chapter_langgraph/03_first_graph_agent' },
          { text: '13.4 条件路由与循环控制', link: '/agent-learning/chapter_langgraph/04_conditional_routing' },
          { text: '13.5 Human-in-the-Loop：人机协作', link: '/agent-learning/chapter_langgraph/05_human_in_the_loop' },
          { text: '13.6 实战：工作流自动化 Agent', link: '/agent-learning/chapter_langgraph/06_practice_workflow_agent' },
        ],
      },
      {
        text: '第14章 OpenClaw：跨平台个人 AI 助理',
        link: '/agent-learning/chapter_openclaw/README',
        collapsed: true,
        items: [
          { text: '14.1 OpenClaw 全景：从 Clawdbot 到 OpenClaw 的演变', link: '/agent-learning/chapter_openclaw/01_history_and_positioning' },
          { text: '14.2 安装与四种部署方式', link: '/agent-learning/chapter_openclaw/02_install_and_deploy' },
          { text: '14.3 架构深度解析：Gateway / Agent Loop / Skills', link: '/agent-learning/chapter_openclaw/03_architecture' },
          { text: '14.4 多渠道路由：WhatsApp / Telegram / Discord / Slack / Signal', link: '/agent-learning/chapter_openclaw/04_channels' },
          { text: '14.5 Skills 与插件生态：ClawHub 与社区贡献', link: '/agent-learning/chapter_openclaw/05_skills_and_plugins' },
          { text: '14.6 实战：基于 OpenClaw 打造个人助理', link: '/agent-learning/chapter_openclaw/06_practice' },
          { text: '14.7 借鉴点：从消费品 Agent 学到的工程经验', link: '/agent-learning/chapter_openclaw/07_lessons_for_engineers' },
        ],
      },
      {
        text: '第15章 Hermes Agent：自我进化的 Agent',
        link: '/agent-learning/chapter_hermes/README',
        collapsed: true,
        items: [
          { text: '15.1 Hermes Agent 的诞生与"成长型 Agent"理念', link: '/agent-learning/chapter_hermes/01_birth_and_philosophy' },
          { text: '15.2 安装与快速上手（含 OpenClaw 迁移）', link: '/agent-learning/chapter_hermes/02_install_and_migration' },
          { text: '15.3 三层架构：Gateway / Engine / Plugin 子系统', link: '/agent-learning/chapter_hermes/03_three_layer_architecture' },
          { text: '15.4 核心：Self-Evolving Skills 闭环', link: '/agent-learning/chapter_hermes/04_self_evolving_skills' },
          { text: '15.5 三层记忆系统', link: '/agent-learning/chapter_hermes/05_memory' },
          { text: '15.6 Nudge Engine 与跨会话学习', link: '/agent-learning/chapter_hermes/06_nudge_engine' },
          { text: '15.7 借鉴哲学：从 Hermes 学到的"自进化"工程原则', link: '/agent-learning/chapter_hermes/07_lessons_philosophy' },
        ],
      },
      {
        text: '第16章 Claude Code 深度解析',
        link: '/agent-learning/chapter_claude_code/README',
        collapsed: true,
        items: [
          { text: '16.1 工业级 Harness 的前世：从 AutoGPT 到 Claude Code', link: '/agent-learning/chapter_claude_code/01_industry_history' },
          { text: '16.2 认识 Claude Code：从零到上手', link: '/agent-learning/chapter_claude_code/02_introduction' },
          { text: '16.3 核心架构深度解析', link: '/agent-learning/chapter_claude_code/03_architecture' },
          { text: '16.4 System Prompt、权限工程与 Prompt Cache', link: '/agent-learning/chapter_claude_code/04_system_prompt_and_permissions' },
          { text: '16.5 高级用法：MCP、Hooks 与 Skills', link: '/agent-learning/chapter_claude_code/05_advanced_usage' },
          { text: '16.6 生产实践与团队配置', link: '/agent-learning/chapter_claude_code/06_production_and_team' },
        ],
      },
      {
        text: '第17章 DeepSeek Harness：一切皆插件的开源底座',
        link: '/agent-learning/chapter_deepseek_harness/README',
        collapsed: true,
        items: [
          { text: '17.1 DeepSeek Harness 是什么：Cordis 内核与"一切皆插件"', link: '/agent-learning/chapter_deepseek_harness/01_what_is_dsh' },
          { text: '17.2 安装与四种运行模式', link: '/agent-learning/chapter_deepseek_harness/02_install_and_modes' },
          { text: '17.3 架构：Cordis 微内核与插件拓扑', link: '/agent-learning/chapter_deepseek_harness/03_cordis_architecture' },
          { text: '17.4 插件开发：tool / llm / skill / subagent 的插件接口', link: '/agent-learning/chapter_deepseek_harness/04_plugin_development' },
          { text: '17.5 横向对比：DeepSeek Harness vs Claude Code / OpenClaw / Hermes', link: '/agent-learning/chapter_deepseek_harness/05_comparison' },
          { text: '17.6 借鉴：可换内核 / 模型无关的工程哲学', link: '/agent-learning/chapter_deepseek_harness/06_lessons_philosophy' },
          { text: '17.7 总结：六大 Harness 框架选型矩阵', link: '/agent-learning/chapter_deepseek_harness/07_summary_and_decision_matrix' },
        ],
      },
    ],
  },
  {
    text: '第四部分：多 Agent 系统篇',
    link: '/agent-learning/part4',
    collapsed: false,
    items: [
      {
        text: '第18章 多 Agent 协作',
        link: '/agent-learning/chapter_18_multi_agent/README',
        collapsed: true,
        items: [
          { text: '18.1 单 Agent 的局限性', link: '/agent-learning/chapter_18_multi_agent/01_single_agent_limits' },
          { text: '18.2 多 Agent 通信模式', link: '/agent-learning/chapter_18_multi_agent/02_communication_patterns' },
          { text: '18.3 角色分工与任务分配', link: '/agent-learning/chapter_18_multi_agent/03_role_assignment' },
          { text: '18.4 Supervisor 模式 vs. 去中心化模式', link: '/agent-learning/chapter_18_multi_agent/04_supervisor_vs_decentralized' },
          { text: '18.5 实战：多 Agent 软件开发团队', link: '/agent-learning/chapter_18_multi_agent/05_practice_dev_team' },
          { text: '18.6 论文解读：多 Agent 系统前沿研究', link: '/agent-learning/chapter_18_multi_agent/06_paper_readings' },
          { text: '18.7 框架补充：CrewAI（角色扮演型多 Agent 框架）', link: '/agent-learning/chapter_18_multi_agent/07_crewai' },
        ],
      },
      {
        text: '第19章 Agent 通信协议',
        link: '/agent-learning/chapter_19_protocol/README',
        collapsed: true,
        items: [
          { text: '19.1 MCP（Model Context Protocol）详解', link: '/agent-learning/chapter_19_protocol/01_mcp_protocol' },
          { text: '19.2 A2A（Agent-to-Agent）协议', link: '/agent-learning/chapter_19_protocol/02_a2a_protocol' },
          { text: '19.3 ANP（Agent Network Protocol）协议', link: '/agent-learning/chapter_19_protocol/03_anp_protocol' },
          { text: '19.4 Agent 间的消息传递与状态共享', link: '/agent-learning/chapter_19_protocol/04_message_passing' },
          { text: '19.5 实战：基于 MCP 的工具集成', link: '/agent-learning/chapter_19_protocol/05_practice_mcp_integration' },
          { text: '19.6 框架补充：AutoGen（多 Agent 对话框架）', link: '/agent-learning/chapter_19_protocol/06_autogen' },
        ],
      },
    ],
  },
  {
    text: '第五部分：生产化篇',
    link: '/agent-learning/part5',
    collapsed: false,
    items: [
      {
        text: '第20章 Agent 的评估与优化',
        link: '/agent-learning/chapter_20_evaluation/README',
        collapsed: true,
        items: [
          { text: '20.1 如何评估 Agent 的表现？', link: '/agent-learning/chapter_20_evaluation/01_evaluation_methods' },
          { text: '20.2 基准测试与评估指标', link: '/agent-learning/chapter_20_evaluation/02_benchmarks' },
          { text: '20.3 Prompt 调优策略', link: '/agent-learning/chapter_20_evaluation/03_prompt_tuning' },
          { text: '20.4 成本控制与性能优化', link: '/agent-learning/chapter_20_evaluation/04_cost_optimization' },
          { text: '20.5 可观测性：日志、追踪与监控', link: '/agent-learning/chapter_20_evaluation/05_observability' },
          { text: '20.6 Agent 专项评估框架', link: '/agent-learning/chapter_20_evaluation/06_agent_evaluation' },
          { text: '20.7 A/B 测试与回归测试自动化', link: '/agent-learning/chapter_20_evaluation/07_ab_testing' },
          { text: '20.8 模型路由评估', link: '/agent-learning/chapter_20_evaluation/08_model_routing' },
        ],
      },
      {
        text: '第21章 安全与可靠性',
        link: '/agent-learning/chapter_21_security/README',
        collapsed: true,
        items: [
          { text: '21.1 Prompt 注入攻击与防御', link: '/agent-learning/chapter_21_security/01_prompt_injection' },
          { text: '21.2 幻觉问题与事实性保障', link: '/agent-learning/chapter_21_security/02_hallucination' },
          { text: '21.3 权限控制与沙箱隔离', link: '/agent-learning/chapter_21_security/03_permission_sandbox' },
          { text: '21.4 敏感数据保护', link: '/agent-learning/chapter_21_security/04_data_protection' },
          { text: '21.5 Agent 行为的可控性与对齐', link: '/agent-learning/chapter_21_security/05_alignment' },
          { text: '21.6 论文解读：安全与可靠性前沿研究', link: '/agent-learning/chapter_21_security/06_paper_readings' },
          { text: '21.7 Guardrails 运行时防护', link: '/agent-learning/chapter_21_security/07_guardrails_runtime' },
          { text: '21.8 红队测试方法论', link: '/agent-learning/chapter_21_security/08_red_teaming' },
        ],
      },
      {
        text: '第22章 部署与生产化',
        link: '/agent-learning/chapter_22_deployment/README',
        collapsed: true,
        items: [
          { text: '22.1 Agent 应用的部署架构', link: '/agent-learning/chapter_22_deployment/01_deployment_architecture' },
          { text: '22.2 API 服务化：FastAPI / Flask 封装', link: '/agent-learning/chapter_22_deployment/02_api_service' },
          { text: '22.3 容器化与云部署', link: '/agent-learning/chapter_22_deployment/03_containerization' },
          { text: '22.4 流式响应与并发处理', link: '/agent-learning/chapter_22_deployment/04_streaming_concurrency' },
          { text: '22.5 实战：部署一个生产级 Agent 服务', link: '/agent-learning/chapter_22_deployment/05_practice_production_agent' },
          { text: '22.6 模型推理服务化', link: '/agent-learning/chapter_22_deployment/06_model_serving' },
          { text: '22.7 Kubernetes 编排与 Serverless GPU', link: '/agent-learning/chapter_22_deployment/07_k8s_serverless' },
          { text: '22.8 长任务队列与成本治理', link: '/agent-learning/chapter_22_deployment/08_task_queue_cost' },
        ],
      },
    ],
  },
  {
    text: '第六部分：综合项目篇',
    link: '/agent-learning/part6',
    collapsed: false,
    items: [
      {
        text: '第23章 项目实战：AI 编程助手',
        link: '/agent-learning/chapter_23_coding_agent/README',
        collapsed: true,
        items: [
          { text: '23.1 项目架构设计', link: '/agent-learning/chapter_23_coding_agent/01_architecture' },
          { text: '23.2 代码理解与分析能力', link: '/agent-learning/chapter_23_coding_agent/02_code_understanding' },
          { text: '23.3 代码生成与修改能力', link: '/agent-learning/chapter_23_coding_agent/03_code_generation' },
          { text: '23.4 测试生成与 Bug 修复', link: '/agent-learning/chapter_23_coding_agent/04_testing_debugging' },
          { text: '23.5 集成设计：从组件到助手', link: '/agent-learning/chapter_23_coding_agent/05_full_implementation' },
        ],
      },
      {
        text: '第24章 项目实战：智能数据分析 Agent',
        link: '/agent-learning/chapter_24_data_agent/README',
        collapsed: true,
        items: [
          { text: '24.1 需求分析与架构设计', link: '/agent-learning/chapter_24_data_agent/01_requirements' },
          { text: '24.2 数据连接与查询', link: '/agent-learning/chapter_24_data_agent/02_data_connection' },
          { text: '24.3 自动化分析与可视化', link: '/agent-learning/chapter_24_data_agent/03_analysis_visualization' },
          { text: '24.4 报告生成与导出', link: '/agent-learning/chapter_24_data_agent/04_report_generation' },
          { text: '24.5 集成设计与可运行底座', link: '/agent-learning/chapter_24_data_agent/05_full_implementation' },
        ],
      },
      {
        text: '第25章 项目实战：多模态 Agent',
        link: '/agent-learning/chapter_25_multimodal/README',
        collapsed: true,
        items: [
          { text: '25.1 多模态能力概述', link: '/agent-learning/chapter_25_multimodal/01_multimodal_overview' },
          { text: '25.2 图像理解与生成', link: '/agent-learning/chapter_25_multimodal/02_image_understanding' },
          { text: '25.3 语音交互集成', link: '/agent-learning/chapter_25_multimodal/03_voice_interaction' },
          { text: '25.4 实战：多模态个人助理', link: '/agent-learning/chapter_25_multimodal/04_practice_multimodal_assistant' },
          { text: '25.5 Computer Use 与 GUI Agent', link: '/agent-learning/chapter_25_multimodal/05_computer_use_agent' },
          { text: '25.6 视频理解与多模态 RAG', link: '/agent-learning/chapter_25_multimodal/06_video_and_multimodal_rag' },
        ],
      },
      {
        text: '附录 A：常用 Prompt 模板大全',
        link: '/agent-learning/appendix/prompt_templates',
      },
      {
        text: '附录 B：Agent 开发常见问题 FAQ',
        link: '/agent-learning/appendix/faq',
      },
      {
        text: '附录 C：推荐学习资源与社区',
        link: '/agent-learning/appendix/resources',
      },
      {
        text: '附录 D：术语表',
        link: '/agent-learning/appendix/glossary',
      },
      {
        text: '附录 E：KL 散度详解',
        link: '/agent-learning/appendix/kl_divergence',
      },
      {
        text: '附录 F：开发环境搭建',
        link: '/agent-learning/chapter_setup/README',
        collapsed: true,
        items: [
          { text: 'F.1 Python 环境与依赖管理', link: '/agent-learning/chapter_setup/01_python_setup' },
          { text: 'F.2 关键库安装', link: '/agent-learning/chapter_setup/02_install_libs' },
          { text: 'F.3 API Key 管理与安全最佳实践', link: '/agent-learning/chapter_setup/03_api_key_management' },
          { text: 'F.4 第一个 Agent：Hello Agent！', link: '/agent-learning/chapter_setup/04_hello_agent' },
        ],
      },
    ],
  },
];
// 第1部分侧边栏（按篇拆分）
export const agentPart1Sidebar: DefaultTheme.SidebarItem[] = [
  {
    text: '第一部分：入门篇',
    link: '/agent-learning/part1',
    collapsed: false,
    items: [
      {
        text: '第1章 什么是 Agent？',
        link: '/agent-learning/chapter_intro/README',
        collapsed: true,
        items: [
          { text: '1.1 从聊天机器人到智能体的演进', link: '/agent-learning/chapter_intro/01_evolution' },
          { text: '1.2 Agent 的核心概念与定义', link: '/agent-learning/chapter_intro/02_core_concepts' },
          { text: '1.3 Agent 架构：感知-思考-行动循环', link: '/agent-learning/chapter_intro/03_architecture' },
          { text: '1.4 Agent 与传统程序的区别', link: '/agent-learning/chapter_intro/04_agent_vs_traditional' },
          { text: '1.5 Agent 的应用场景全景图', link: '/agent-learning/chapter_intro/05_use_cases' },
          { text: '1.6 智能体发展史：从符号主义到大模型驱动', link: '/agent-learning/chapter_intro/06_history' },
        ],
      },
      {
        text: '第2章 大语言模型基础',
        link: '/agent-learning/chapter_llm/README',
        collapsed: true,
        items: [
          { text: '2.1 拆穿 LLM 的"魔法"：从文字接龙到智能涌现', link: '/agent-learning/chapter_llm/01_how_llm_works' },
          { text: '2.2 不写代码也要"编程"：Prompt Engineering 是怎样把话术变成确定性指令的', link: '/agent-learning/chapter_llm/02_prompt_engineering' },
          { text: '2.3 Few-shot / Zero-shot / Chain-of-Thought 提示策略', link: '/agent-learning/chapter_llm/03_prompting_strategies' },
          { text: '2.4 模型 API 调用入门', link: '/agent-learning/chapter_llm/04_api_basics' },
          { text: '2.5 Token、Temperature 与模型参数详解', link: '/agent-learning/chapter_llm/05_model_parameters' },
          { text: '2.6 基座模型前沿进展与选型指南', link: '/agent-learning/chapter_llm/06_foundation_model_landscape' },
          { text: '2.7 基座模型架构详解', link: '/agent-learning/chapter_llm/07_model_architecture' },
          { text: '2.8 SFT 与强化学习训练数据准备', link: '/agent-learning/chapter_llm/08_training_data' },
        ],
      },
    ],
  },
];

// 第2部分侧边栏（按篇拆分）
export const agentPart2Sidebar: DefaultTheme.SidebarItem[] = [
  {
    text: '第二部分：核心能力篇',
    link: '/agent-learning/part2',
    collapsed: false,
    items: [
      {
        text: '第3章 工具调用（Tool Use / Function Calling）',
        link: '/agent-learning/chapter_tools/README',
        collapsed: true,
        items: [
          { text: '3.1 为什么 Agent 需要工具？', link: '/agent-learning/chapter_tools/01_why_tools' },
          { text: '3.2 Function Calling 机制', link: '/agent-learning/chapter_tools/02_function_calling' },
          { text: '3.3 自定义工具的设计与实现', link: '/agent-learning/chapter_tools/03_custom_tools' },
          { text: '3.4 工具描述的编写技巧', link: '/agent-learning/chapter_tools/04_tool_description' },
          { text: '3.5 实战：搜索引擎 + 计算器 Agent', link: '/agent-learning/chapter_tools/05_practice_search_calc' },
          { text: '3.6 论文解读：工具学习前沿进展', link: '/agent-learning/chapter_tools/06_paper_readings' },
        ],
      },
      {
        text: '第4章 记忆系统（Memory）',
        link: '/agent-learning/chapter_memory/README',
        collapsed: true,
        items: [
          { text: '4.1 为什么 Agent 需要记忆？', link: '/agent-learning/chapter_memory/01_why_memory' },
          { text: '4.2 短期记忆：对话历史管理', link: '/agent-learning/chapter_memory/02_short_term_memory' },
          { text: '4.3 长期记忆：向量数据库与检索', link: '/agent-learning/chapter_memory/03_long_term_memory' },
          { text: '4.4 工作记忆：Scratchpad 模式', link: '/agent-learning/chapter_memory/04_working_memory' },
          { text: '4.5 实战：带记忆的个人助理 Agent', link: '/agent-learning/chapter_memory/05_practice_memory_agent' },
          { text: '4.6 论文解读：记忆系统前沿进展', link: '/agent-learning/chapter_memory/06_paper_readings' },
          { text: '4.7 实战：MemGPT/Letta 记忆架构工程实践', link: '/agent-learning/chapter_memory/06b_memgpt_practice' },
        ],
      },
      {
        text: '第5章 规划与推理（Planning & Reasoning）',
        link: '/agent-learning/chapter_planning/README',
        collapsed: true,
        items: [
          { text: '5.1 Agent 如何"思考"？', link: '/agent-learning/chapter_planning/01_how_agents_think' },
          { text: '5.2 ReAct：推理 + 行动框架', link: '/agent-learning/chapter_planning/02_react_framework' },
          { text: '5.3 任务分解：将复杂问题拆解为子任务', link: '/agent-learning/chapter_planning/03_task_decomposition' },
          { text: '5.4 反思与自我纠错机制', link: '/agent-learning/chapter_planning/04_reflection' },
          { text: '5.5 实战：自动化研究助手 Agent', link: '/agent-learning/chapter_planning/05_practice_research_agent' },
          { text: '5.6 Plan-and-Execute 与 Test-time Compute Scaling', link: '/agent-learning/chapter_planning/07_plan_and_execute' },
          { text: '5.7 论文解读：规划与推理前沿研究', link: '/agent-learning/chapter_planning/06_paper_readings' },
        ],
      },
      {
        text: '第6章 检索增强生成（RAG）',
        link: '/agent-learning/chapter_rag/README',
        collapsed: true,
        items: [
          { text: '6.1 RAG 的概念与工作原理', link: '/agent-learning/chapter_rag/01_rag_concepts' },
          { text: '6.2 文档加载与文本分割', link: '/agent-learning/chapter_rag/02_document_loading' },
          { text: '6.3 向量嵌入与向量数据库', link: '/agent-learning/chapter_rag/03_embeddings_vectordb' },
          { text: '6.4 检索策略与重排序', link: '/agent-learning/chapter_rag/04_retrieval_strategies' },
          { text: '6.5 实战：智能文档问答 Agent', link: '/agent-learning/chapter_rag/05_practice_qa_agent' },
          { text: '6.6 论文解读：RAG 前沿进展', link: '/agent-learning/chapter_rag/06_paper_readings' },
          { text: '6.7 进阶 RAG：GraphRAG 与 Agentic RAG 工程实战', link: '/agent-learning/chapter_rag/07_advanced_rag' },
        ],
      },
      {
        text: '第7章 上下文工程',
        link: '/agent-learning/chapter_context_engineering/README',
        collapsed: true,
        items: [
          { text: '7.1 从提示工程到上下文工程', link: '/agent-learning/chapter_context_engineering/01_context_vs_prompt' },
          { text: '7.2 上下文窗口管理与注意力预算', link: '/agent-learning/chapter_context_engineering/02_context_window' },
          { text: '7.3 长时程任务的上下文策略', link: '/agent-learning/chapter_context_engineering/03_long_horizon' },
          { text: '7.4 实战：构建上下文管理器', link: '/agent-learning/chapter_context_engineering/04_practice_context_builder' },
          { text: '7.5 上下文工程前沿进展', link: '/agent-learning/chapter_context_engineering/05_latest_advances' },
        ],
      },
      {
        text: '第8章 Harness Engineering：驾驭 Agent 的系统工程',
        link: '/agent-learning/chapter_harness/README',
        collapsed: true,
        items: [
          { text: '8.1 什么是 Harness Engineering？', link: '/agent-learning/chapter_harness/01_what_is_harness' },
          { text: '8.2 六大工程支柱', link: '/agent-learning/chapter_harness/02_six_pillars' },
          { text: '8.3 AGENTS.md / CLAUDE.md：Agent 宪法写作指南', link: '/agent-learning/chapter_harness/03_agents_md' },
          { text: '8.4 生产级案例：OpenAI、LangChain、Stripe', link: '/agent-learning/chapter_harness/04_production_cases' },
          { text: '8.5 实战：构建你的第一个 Harness 系统', link: '/agent-learning/chapter_harness/05_practice_harness_builder' },
          { text: '8.6 结构化输出：保障 JSON 可靠性的工程实践', link: '/agent-learning/chapter_harness/06_structured_output' },
        ],
      },
      {
        text: '第9章 Skill System',
        link: '/agent-learning/chapter_skill/README',
        collapsed: true,
        items: [
          { text: '9.1 技能系统概述', link: '/agent-learning/chapter_skill/01_skill_overview' },
          { text: '9.2 技能的定义与封装', link: '/agent-learning/chapter_skill/02_skill_definition' },
          { text: '9.3 技能学习与获取', link: '/agent-learning/chapter_skill/03_skill_learning' },
          { text: '9.4 技能发现与注册', link: '/agent-learning/chapter_skill/04_skill_discovery' },
          { text: '9.5 实战：构建可复用的技能系统', link: '/agent-learning/chapter_skill/05_practice_skill_system' },
          { text: '9.6 论文解读：技能系统前沿研究', link: '/agent-learning/chapter_skill/06_paper_readings' },
          { text: '9.7 Tool、Skill 与 Sub Agent：三层能力抽象', link: '/agent-learning/chapter_skill/07_tool_skill_subagent' },
          { text: '9.8 Skills 圣经：Superpowers 工程实践指南', link: '/agent-learning/chapter_skill/08_superpowers_guide' },
        ],
      },
      {
        text: '第10章 Agentic-RL：智能体强化学习训练',
        link: '/agent-learning/chapter_agentic_rl/README',
        collapsed: true,
        items: [
          { text: '10.1 什么是 Agentic-RL', link: '/agent-learning/chapter_agentic_rl/01_agentic_rl_overview' },
          { text: '10.2 SFT + LoRA 基础训练', link: '/agent-learning/chapter_agentic_rl/02_sft_lora' },
          { text: '10.2b 分布式训练基础：DP / TP / PP / SP / ZeRO', link: '/agent-learning/chapter_agentic_rl/02b_distributed_training' },
          { text: '10.3 PPO：近端策略优化', link: '/agent-learning/chapter_agentic_rl/03_ppo' },
          { text: '10.4 DPO：直接偏好优化', link: '/agent-learning/chapter_agentic_rl/04_dpo' },
          { text: '10.5 GRPO/GSPO：组内相对策略优化与奖励函数设计', link: '/agent-learning/chapter_agentic_rl/05_grpo' },
          { text: '10.6 实战：完整 SFT + GRPO 训练 Pipeline', link: '/agent-learning/chapter_agentic_rl/06_practice_training' },
          { text: '10.7 最新研究进展（2025—2026）', link: '/agent-learning/chapter_agentic_rl/07_latest_research' },
          { text: '10.8 专为 Agent 的微调：让模型真正会用工具', link: '/agent-learning/chapter_agentic_rl/08_agent_finetuning' },
        ],
      },
      {
        text: '第11章 自我进化与持续学习',
        link: '/agent-learning/chapter_self_evolving/README',
        collapsed: true,
        items: [
          { text: '11.1 Prompt 自动调优', link: '/agent-learning/chapter_self_evolving/01_automatic_prompt_optimization' },
          { text: '11.2 Self-Evolution Agent：从会执行到会自我改进', link: '/agent-learning/chapter_self_evolving/02_self_evolution_agent' },
          { text: '11.3 Agentic 数据飞轮：让 Agent 自我进化', link: '/agent-learning/chapter_self_evolving/03_data_flywheel' },
        ],
      },
    ],
  },
];

// 第3部分侧边栏（按篇拆分）
export const agentPart3Sidebar: DefaultTheme.SidebarItem[] = [
  {
    text: '第三部分：框架实战篇',
    link: '/agent-learning/part3',
    collapsed: false,
    items: [
      {
        text: '第12章 LangChain 深入实战',
        link: '/agent-learning/chapter_langchain/README',
        collapsed: true,
        items: [
          { text: '12.1 LangChain 架构全景', link: '/agent-learning/chapter_langchain/01_langchain_overview' },
          { text: '12.2 Chain：构建处理管道', link: '/agent-learning/chapter_langchain/02_chains' },
          { text: '12.3 使用 LangChain 构建 Agent', link: '/agent-learning/chapter_langchain/03_langchain_agents' },
          { text: '12.4 LCEL：LangChain 表达式语言', link: '/agent-learning/chapter_langchain/04_lcel' },
          { text: '12.5 实战：多功能客服 Agent', link: '/agent-learning/chapter_langchain/05_practice_customer_service' },
          { text: '12.6 LangSmith 集成与可观测性', link: '/agent-learning/chapter_langchain/06_langsmith_integration' },
          { text: '12.7 LangChain 生态 2026', link: '/agent-learning/chapter_langchain/07_langchain_ecosystem_2026' },
          { text: '12.8 LangChain 生产化模式', link: '/agent-learning/chapter_langchain/08_production_patterns' },
        ],
      },
      {
        text: '第13章 LangGraph：构建有状态的 Agent',
        link: '/agent-learning/chapter_langgraph/README',
        collapsed: true,
        items: [
          { text: '13.1 为什么需要图结构？', link: '/agent-learning/chapter_langgraph/01_why_graph' },
          { text: '13.2 LangGraph 核心概念：节点、边、状态', link: '/agent-learning/chapter_langgraph/02_core_concepts' },
          { text: '13.3 构建你的第一个 Graph Agent', link: '/agent-learning/chapter_langgraph/03_first_graph_agent' },
          { text: '13.4 条件路由与循环控制', link: '/agent-learning/chapter_langgraph/04_conditional_routing' },
          { text: '13.5 Human-in-the-Loop：人机协作', link: '/agent-learning/chapter_langgraph/05_human_in_the_loop' },
          { text: '13.6 实战：工作流自动化 Agent', link: '/agent-learning/chapter_langgraph/06_practice_workflow_agent' },
        ],
      },
      {
        text: '第14章 OpenClaw：跨平台个人 AI 助理',
        link: '/agent-learning/chapter_openclaw/README',
        collapsed: true,
        items: [
          { text: '14.1 OpenClaw 全景：从 Clawdbot 到 OpenClaw 的演变', link: '/agent-learning/chapter_openclaw/01_history_and_positioning' },
          { text: '14.2 安装与四种部署方式', link: '/agent-learning/chapter_openclaw/02_install_and_deploy' },
          { text: '14.3 架构深度解析：Gateway / Agent Loop / Skills', link: '/agent-learning/chapter_openclaw/03_architecture' },
          { text: '14.4 多渠道路由：WhatsApp / Telegram / Discord / Slack / Signal', link: '/agent-learning/chapter_openclaw/04_channels' },
          { text: '14.5 Skills 与插件生态：ClawHub 与社区贡献', link: '/agent-learning/chapter_openclaw/05_skills_and_plugins' },
          { text: '14.6 实战：基于 OpenClaw 打造个人助理', link: '/agent-learning/chapter_openclaw/06_practice' },
          { text: '14.7 借鉴点：从消费品 Agent 学到的工程经验', link: '/agent-learning/chapter_openclaw/07_lessons_for_engineers' },
        ],
      },
      {
        text: '第15章 Hermes Agent：自我进化的 Agent',
        link: '/agent-learning/chapter_hermes/README',
        collapsed: true,
        items: [
          { text: '15.1 Hermes Agent 的诞生与"成长型 Agent"理念', link: '/agent-learning/chapter_hermes/01_birth_and_philosophy' },
          { text: '15.2 安装与快速上手（含 OpenClaw 迁移）', link: '/agent-learning/chapter_hermes/02_install_and_migration' },
          { text: '15.3 三层架构：Gateway / Engine / Plugin 子系统', link: '/agent-learning/chapter_hermes/03_three_layer_architecture' },
          { text: '15.4 核心：Self-Evolving Skills 闭环', link: '/agent-learning/chapter_hermes/04_self_evolving_skills' },
          { text: '15.5 三层记忆系统', link: '/agent-learning/chapter_hermes/05_memory' },
          { text: '15.6 Nudge Engine 与跨会话学习', link: '/agent-learning/chapter_hermes/06_nudge_engine' },
          { text: '15.7 借鉴哲学：从 Hermes 学到的"自进化"工程原则', link: '/agent-learning/chapter_hermes/07_lessons_philosophy' },
        ],
      },
      {
        text: '第16章 Claude Code 深度解析',
        link: '/agent-learning/chapter_claude_code/README',
        collapsed: true,
        items: [
          { text: '16.1 工业级 Harness 的前世：从 AutoGPT 到 Claude Code', link: '/agent-learning/chapter_claude_code/01_industry_history' },
          { text: '16.2 认识 Claude Code：从零到上手', link: '/agent-learning/chapter_claude_code/02_introduction' },
          { text: '16.3 核心架构深度解析', link: '/agent-learning/chapter_claude_code/03_architecture' },
          { text: '16.4 System Prompt、权限工程与 Prompt Cache', link: '/agent-learning/chapter_claude_code/04_system_prompt_and_permissions' },
          { text: '16.5 高级用法：MCP、Hooks 与 Skills', link: '/agent-learning/chapter_claude_code/05_advanced_usage' },
          { text: '16.6 生产实践与团队配置', link: '/agent-learning/chapter_claude_code/06_production_and_team' },
        ],
      },
      {
        text: '第17章 DeepSeek Harness：一切皆插件的开源底座',
        link: '/agent-learning/chapter_deepseek_harness/README',
        collapsed: true,
        items: [
          { text: '17.1 DeepSeek Harness 是什么：Cordis 内核与"一切皆插件"', link: '/agent-learning/chapter_deepseek_harness/01_what_is_dsh' },
          { text: '17.2 安装与四种运行模式', link: '/agent-learning/chapter_deepseek_harness/02_install_and_modes' },
          { text: '17.3 架构：Cordis 微内核与插件拓扑', link: '/agent-learning/chapter_deepseek_harness/03_cordis_architecture' },
          { text: '17.4 插件开发：tool / llm / skill / subagent 的插件接口', link: '/agent-learning/chapter_deepseek_harness/04_plugin_development' },
          { text: '17.5 横向对比：DeepSeek Harness vs Claude Code / OpenClaw / Hermes', link: '/agent-learning/chapter_deepseek_harness/05_comparison' },
          { text: '17.6 借鉴：可换内核 / 模型无关的工程哲学', link: '/agent-learning/chapter_deepseek_harness/06_lessons_philosophy' },
          { text: '17.7 总结：六大 Harness 框架选型矩阵', link: '/agent-learning/chapter_deepseek_harness/07_summary_and_decision_matrix' },
        ],
      },
    ],
  },
];

// 第4部分侧边栏（按篇拆分）
export const agentPart4Sidebar: DefaultTheme.SidebarItem[] = [
  {
    text: '第四部分：多 Agent 系统篇',
    link: '/agent-learning/part4',
    collapsed: false,
    items: [
      {
        text: '第18章 多 Agent 协作',
        link: '/agent-learning/chapter_18_multi_agent/README',
        collapsed: true,
        items: [
          { text: '18.1 单 Agent 的局限性', link: '/agent-learning/chapter_18_multi_agent/01_single_agent_limits' },
          { text: '18.2 多 Agent 通信模式', link: '/agent-learning/chapter_18_multi_agent/02_communication_patterns' },
          { text: '18.3 角色分工与任务分配', link: '/agent-learning/chapter_18_multi_agent/03_role_assignment' },
          { text: '18.4 Supervisor 模式 vs. 去中心化模式', link: '/agent-learning/chapter_18_multi_agent/04_supervisor_vs_decentralized' },
          { text: '18.5 实战：多 Agent 软件开发团队', link: '/agent-learning/chapter_18_multi_agent/05_practice_dev_team' },
          { text: '18.6 论文解读：多 Agent 系统前沿研究', link: '/agent-learning/chapter_18_multi_agent/06_paper_readings' },
          { text: '18.7 框架补充：CrewAI（角色扮演型多 Agent 框架）', link: '/agent-learning/chapter_18_multi_agent/07_crewai' },
        ],
      },
      {
        text: '第19章 Agent 通信协议',
        link: '/agent-learning/chapter_19_protocol/README',
        collapsed: true,
        items: [
          { text: '19.1 MCP（Model Context Protocol）详解', link: '/agent-learning/chapter_19_protocol/01_mcp_protocol' },
          { text: '19.2 A2A（Agent-to-Agent）协议', link: '/agent-learning/chapter_19_protocol/02_a2a_protocol' },
          { text: '19.3 ANP（Agent Network Protocol）协议', link: '/agent-learning/chapter_19_protocol/03_anp_protocol' },
          { text: '19.4 Agent 间的消息传递与状态共享', link: '/agent-learning/chapter_19_protocol/04_message_passing' },
          { text: '19.5 实战：基于 MCP 的工具集成', link: '/agent-learning/chapter_19_protocol/05_practice_mcp_integration' },
          { text: '19.6 框架补充：AutoGen（多 Agent 对话框架）', link: '/agent-learning/chapter_19_protocol/06_autogen' },
        ],
      },
    ],
  },
];

// 第5部分侧边栏（按篇拆分）
export const agentPart5Sidebar: DefaultTheme.SidebarItem[] = [
  {
    text: '第五部分：生产化篇',
    link: '/agent-learning/part5',
    collapsed: false,
    items: [
      {
        text: '第20章 Agent 的评估与优化',
        link: '/agent-learning/chapter_20_evaluation/README',
        collapsed: true,
        items: [
          { text: '20.1 如何评估 Agent 的表现？', link: '/agent-learning/chapter_20_evaluation/01_evaluation_methods' },
          { text: '20.2 基准测试与评估指标', link: '/agent-learning/chapter_20_evaluation/02_benchmarks' },
          { text: '20.3 Prompt 调优策略', link: '/agent-learning/chapter_20_evaluation/03_prompt_tuning' },
          { text: '20.4 成本控制与性能优化', link: '/agent-learning/chapter_20_evaluation/04_cost_optimization' },
          { text: '20.5 可观测性：日志、追踪与监控', link: '/agent-learning/chapter_20_evaluation/05_observability' },
          { text: '20.6 Agent 专项评估框架', link: '/agent-learning/chapter_20_evaluation/06_agent_evaluation' },
          { text: '20.7 A/B 测试与回归测试自动化', link: '/agent-learning/chapter_20_evaluation/07_ab_testing' },
          { text: '20.8 模型路由评估', link: '/agent-learning/chapter_20_evaluation/08_model_routing' },
        ],
      },
      {
        text: '第21章 安全与可靠性',
        link: '/agent-learning/chapter_21_security/README',
        collapsed: true,
        items: [
          { text: '21.1 Prompt 注入攻击与防御', link: '/agent-learning/chapter_21_security/01_prompt_injection' },
          { text: '21.2 幻觉问题与事实性保障', link: '/agent-learning/chapter_21_security/02_hallucination' },
          { text: '21.3 权限控制与沙箱隔离', link: '/agent-learning/chapter_21_security/03_permission_sandbox' },
          { text: '21.4 敏感数据保护', link: '/agent-learning/chapter_21_security/04_data_protection' },
          { text: '21.5 Agent 行为的可控性与对齐', link: '/agent-learning/chapter_21_security/05_alignment' },
          { text: '21.6 论文解读：安全与可靠性前沿研究', link: '/agent-learning/chapter_21_security/06_paper_readings' },
          { text: '21.7 Guardrails 运行时防护', link: '/agent-learning/chapter_21_security/07_guardrails_runtime' },
          { text: '21.8 红队测试方法论', link: '/agent-learning/chapter_21_security/08_red_teaming' },
        ],
      },
      {
        text: '第22章 部署与生产化',
        link: '/agent-learning/chapter_22_deployment/README',
        collapsed: true,
        items: [
          { text: '22.1 Agent 应用的部署架构', link: '/agent-learning/chapter_22_deployment/01_deployment_architecture' },
          { text: '22.2 API 服务化：FastAPI / Flask 封装', link: '/agent-learning/chapter_22_deployment/02_api_service' },
          { text: '22.3 容器化与云部署', link: '/agent-learning/chapter_22_deployment/03_containerization' },
          { text: '22.4 流式响应与并发处理', link: '/agent-learning/chapter_22_deployment/04_streaming_concurrency' },
          { text: '22.5 实战：部署一个生产级 Agent 服务', link: '/agent-learning/chapter_22_deployment/05_practice_production_agent' },
          { text: '22.6 模型推理服务化', link: '/agent-learning/chapter_22_deployment/06_model_serving' },
          { text: '22.7 Kubernetes 编排与 Serverless GPU', link: '/agent-learning/chapter_22_deployment/07_k8s_serverless' },
          { text: '22.8 长任务队列与成本治理', link: '/agent-learning/chapter_22_deployment/08_task_queue_cost' },
        ],
      },
    ],
  },
];

// 第6部分侧边栏（按篇拆分）
export const agentPart6Sidebar: DefaultTheme.SidebarItem[] = [
  {
    text: '第六部分：综合项目篇',
    link: '/agent-learning/part6',
    collapsed: false,
    items: [
      {
        text: '第23章 项目实战：AI 编程助手',
        link: '/agent-learning/chapter_23_coding_agent/README',
        collapsed: true,
        items: [
          { text: '23.1 项目架构设计', link: '/agent-learning/chapter_23_coding_agent/01_architecture' },
          { text: '23.2 代码理解与分析能力', link: '/agent-learning/chapter_23_coding_agent/02_code_understanding' },
          { text: '23.3 代码生成与修改能力', link: '/agent-learning/chapter_23_coding_agent/03_code_generation' },
          { text: '23.4 测试生成与 Bug 修复', link: '/agent-learning/chapter_23_coding_agent/04_testing_debugging' },
          { text: '23.5 集成设计：从组件到助手', link: '/agent-learning/chapter_23_coding_agent/05_full_implementation' },
        ],
      },
      {
        text: '第24章 项目实战：智能数据分析 Agent',
        link: '/agent-learning/chapter_24_data_agent/README',
        collapsed: true,
        items: [
          { text: '24.1 需求分析与架构设计', link: '/agent-learning/chapter_24_data_agent/01_requirements' },
          { text: '24.2 数据连接与查询', link: '/agent-learning/chapter_24_data_agent/02_data_connection' },
          { text: '24.3 自动化分析与可视化', link: '/agent-learning/chapter_24_data_agent/03_analysis_visualization' },
          { text: '24.4 报告生成与导出', link: '/agent-learning/chapter_24_data_agent/04_report_generation' },
          { text: '24.5 集成设计与可运行底座', link: '/agent-learning/chapter_24_data_agent/05_full_implementation' },
        ],
      },
      {
        text: '第25章 项目实战：多模态 Agent',
        link: '/agent-learning/chapter_25_multimodal/README',
        collapsed: true,
        items: [
          { text: '25.1 多模态能力概述', link: '/agent-learning/chapter_25_multimodal/01_multimodal_overview' },
          { text: '25.2 图像理解与生成', link: '/agent-learning/chapter_25_multimodal/02_image_understanding' },
          { text: '25.3 语音交互集成', link: '/agent-learning/chapter_25_multimodal/03_voice_interaction' },
          { text: '25.4 实战：多模态个人助理', link: '/agent-learning/chapter_25_multimodal/04_practice_multimodal_assistant' },
          { text: '25.5 Computer Use 与 GUI Agent', link: '/agent-learning/chapter_25_multimodal/05_computer_use_agent' },
          { text: '25.6 视频理解与多模态 RAG', link: '/agent-learning/chapter_25_multimodal/06_video_and_multimodal_rag' },
        ],
      },
      {
        text: '附录 A：常用 Prompt 模板大全',
        link: '/agent-learning/appendix/prompt_templates',
      },
      {
        text: '附录 B：Agent 开发常见问题 FAQ',
        link: '/agent-learning/appendix/faq',
      },
      {
        text: '附录 C：推荐学习资源与社区',
        link: '/agent-learning/appendix/resources',
      },
      {
        text: '附录 D：术语表',
        link: '/agent-learning/appendix/glossary',
      },
      {
        text: '附录 E：KL 散度详解',
        link: '/agent-learning/appendix/kl_divergence',
      },
      {
        text: '附录 F：开发环境搭建',
        link: '/agent-learning/chapter_setup/README',
        collapsed: true,
        items: [
          { text: 'F.1 Python 环境与依赖管理', link: '/agent-learning/chapter_setup/01_python_setup' },
          { text: 'F.2 关键库安装', link: '/agent-learning/chapter_setup/02_install_libs' },
          { text: 'F.3 API Key 管理与安全最佳实践', link: '/agent-learning/chapter_setup/03_api_key_management' },
          { text: 'F.4 第一个 Agent：Hello Agent！', link: '/agent-learning/chapter_setup/04_hello_agent' },
        ],
      },
    ],
  },

];
