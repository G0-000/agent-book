<script setup lang="ts">
import { withBase } from 'vitepress'

// 首页分类卡片区：Notes（基础课程）+ Agent（按篇阅读）+ Harness（实战项目）
const notesItems = [
  {
    title: 'Python',
    desc: '零基础入门到进阶：语法、流程控制、函数、数据容器、面向对象、异常、模块、进程线程与协程。',
    link: '/python/README',
  },
  {
    title: 'LangChain',
    desc: '模型调用、Tools、Agent、中间件、上下文与记忆、RAG 实战，配套 Notebook。',
    link: '/langchain/README',
  },
  {
    title: 'LangGraph',
    desc: '图编排、控制流、持久化与记忆、HITL 中断、工具节点、流式与子图，从入门到部署。',
    link: '/langgraph/README',
  },
  {
    title: 'AI Coding',
    desc: '自然语言指挥 AI 构建真实项目，基于 Claude Code 深度实践，覆盖 Skills 与 Codex。',
    link: '/vibe_coding/README',
  },
]

const agentPartItems = [
  {
    title: '入门篇',
    desc: 'Agent 概念、架构与传统程序的区别，LLM 基础（第 1–2 章）。',
    link: '/agent-learning/part1',
  },
  {
    title: '核心能力篇',
    desc: '工具调用、记忆、规划、RAG、上下文工程、Harness、Skill、Agentic-RL（第 3–11 章）。',
    link: '/agent-learning/part2',
  },
  {
    title: '框架实战篇',
    desc: 'LangChain、LangGraph、OpenClaw、Hermes、Claude Code、DeepSeek Harness（第 12–17 章）。',
    link: '/agent-learning/part3',
  },
  {
    title: '多 Agent 系统篇',
    desc: '多 Agent 协作模式，MCP / A2A / ANP 通信协议（第 18–19 章）。',
    link: '/agent-learning/part4',
  },
  {
    title: '生产化篇',
    desc: '评估与优化、安全可靠性、部署与生产化（第 20–22 章）。',
    link: '/agent-learning/part5',
  },
  {
    title: '综合项目篇',
    desc: 'AI 编程助手、数据分析 Agent、多模态 Agent 三个实战项目（第 23–25 章）。',
    link: '/agent-learning/part6',
  },
]

const projectItems = [
  {
    title: 'agent-flow',
    desc: 'AgentFlow 项目文档：开发过程（doc-dev）+ 代码结构（doc-code），代码与文档分开维护。',
    link: '/agent-flow/index',
  },
  {
    title: 'WorkAgentHarness',
    desc: '以 EvoFlow 为源码教材，对照 AgentFlow 第一遍学习，按功能从最小闭环到完整重实现。',
    link: '/work-agent-harness/index',
  },
]
</script>

<template>
  <div class="home-sections">
    <!-- 自定义 Hero：徽章 + 渐变标题 + 三行标语（Harness 在前） -->
    <section class="home-hero">
      <span class="hero-badge">学习笔记</span>
      <h1 class="hero-name">Agent-Book</h1>
      <p class="hero-tagline hero-main">从零开始学 Agent（六篇系统笔记）</p>
      <p class="hero-tagline">Harness 实战项目</p>
      <p class="hero-tagline">Notes 基础课程</p>
    </section>

    <!-- 分类一：Agent（科技蓝） -->
    <section class="home-section section-agent">
      <div class="section-head">
        <h2 class="section-title">Agent</h2>
        <p class="section-sub">从零开始学 Agent · 按篇阅读</p>
      </div>
      <div class="card-grid grid-4">
        <a v-for="item in agentPartItems" :key="item.title" class="card" :href="withBase(item.link)">
          <div class="card-body">
            <h3 class="card-title">{{ item.title }}</h3>
            <p class="card-desc">{{ item.desc }}</p>
          </div>
          <div class="card-foot">
            <span class="card-link">进入笔记</span>
            <span class="card-arrow">→</span>
          </div>
        </a>
      </div>
    </section>

    <!-- 分类三：Harness（青绿） -->
    <section class="home-section section-harness">
      <div class="section-head">
        <h2 class="section-title">Harness</h2>
        <p class="section-sub">实战项目文档</p>
      </div>
      <div class="card-grid grid-4">
        <a
          v-for="item in projectItems"
          :key="item.title"
          class="card"
          :href="withBase(item.link)"
        >
          <div class="card-body">
            <h3 class="card-title">{{ item.title }}</h3>
            <p class="card-desc">{{ item.desc }}</p>
          </div>
          <div class="card-foot">
            <span class="card-link">进入文档</span>
            <span class="card-arrow">→</span>
          </div>
        </a>
      </div>
    </section>

    <!-- 分类二：Notes（琥珀橙） -->
    <section class="home-section section-notes">
      <div class="section-head">
        <h2 class="section-title">Notes</h2>
        <p class="section-sub">基础课程笔记</p>
      </div>
      <div class="card-grid grid-4">
        <a v-for="item in notesItems" :key="item.title" class="card" :href="withBase(item.link)">
          <div class="card-body">
            <h3 class="card-title">{{ item.title }}</h3>
            <p class="card-desc">{{ item.desc }}</p>
          </div>
          <div class="card-foot">
            <span class="card-link">进入笔记</span>
            <span class="card-arrow">→</span>
          </div>
        </a>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-sections {
  max-width: 1152px;
  margin: 0 auto;
  padding: 0 24px 48px;
}

.home-hero {
  position: relative;
  margin: 56px 0 16px;
  padding: 48px 28px;
  text-align: center;
  border-radius: 20px;
  border: 1px solid var(--vp-c-divider);
  overflow: hidden;
  background:
    radial-gradient(900px 360px at 15% -10%, rgba(37, 99, 235, 0.16), transparent 60%),
    radial-gradient(760px 320px at 95% 0%, rgba(14, 165, 233, 0.14), transparent 55%),
    linear-gradient(rgba(37, 99, 235, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(37, 99, 235, 0.05) 1px, transparent 1px),
    var(--vp-c-bg-soft);
  background-size: auto, auto, 28px 28px, 28px 28px, auto;
}

.home-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--vp-c-brand-1), transparent);
  opacity: 0.8;
}

.hero-badge {
  display: inline-block;
  padding: 4px 14px;
  margin-bottom: 18px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-brand-1);
  background: linear-gradient(120deg, rgba(37, 99, 235, 0.12), rgba(14, 165, 233, 0.12));
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 30%, transparent);
}

.hero-name {
  margin: 0;
  font-size: 52px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0.5px;
  background: linear-gradient(120deg, #2563eb, #0ea5e9 55%, #14b8a6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero-tagline {
  margin: 8px 0 0;
  font-size: 15px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.hero-tagline.hero-main {
  margin-top: 14px;
  font-size: 17px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

/* 后两行标语按分类色调：Harness 青绿 / Notes 琥珀 */
.home-hero p:nth-of-type(2) {
  color: #0d9488;
}

.home-hero p:nth-of-type(3) {
  color: #f59e0b;
}

.home-section {
  /* 分类主色，默认 Agent：科技蓝 */
  --sec-a: #2563eb;
  --sec-b: #0ea5e9;
  margin-top: 48px;
}

/* Harness：青绿 */
.section-harness {
  --sec-a: #0d9488;
  --sec-b: #22d3ee;
}

/* Notes：琥珀橙 */
.section-notes {
  --sec-a: #f59e0b;
  --sec-b: #f97316;
}

.section-head {
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.section-title {
  position: relative;
  padding-left: 12px;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
  background: linear-gradient(120deg, var(--sec-a), var(--sec-b));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--sec-a), var(--sec-b));
}

.section-sub {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.card-grid {
  display: grid;
  gap: 16px;
}

.grid-4 {
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
}

@media (max-width: 960px) {
  .grid-4 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .grid-4 {
    grid-template-columns: 1fr;
  }

  .home-hero {
    padding: 36px 20px;
  }
}

.card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  text-decoration: none;
  transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
  min-height: 170px;
}

.card:hover {
  border-color: var(--sec-a);
  transform: translateY(-4px);
  box-shadow: 0 12px 28px color-mix(in srgb, var(--sec-a) 18%, transparent);
  text-decoration: none;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px;
  color: var(--vp-c-text-1);
}

.card-desc {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.65;
  color: var(--vp-c-text-2);
}

.card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
}

.card-link {
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-brand-1);
}

.card-arrow {
  color: var(--vp-c-brand-1);
  font-size: 15px;
  transition: transform 0.2s;
}

.card:hover .card-arrow {
  transform: translateX(3px);
}

.card-link-dim {
  color: var(--vp-c-text-3);
}

.card-placeholder {
  border-style: dashed;
  cursor: default;
  opacity: 0.75;
}

.card-placeholder:hover {
  transform: none;
  box-shadow: none;
}
</style>
