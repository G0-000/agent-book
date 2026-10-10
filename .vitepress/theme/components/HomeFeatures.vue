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
]
</script>

<template>
  <div class="home-sections">
    <!-- 分类一：Agent 从零开始学 Agent（按篇阅读） -->
    <section class="home-section">
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

    <!-- 分类二：Notes 基础课程笔记 -->
    <section class="home-section">
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

    <!-- 分类三：Harness 实战项目 -->
    <section class="home-section">
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
        <div class="card card-placeholder">
          <div class="card-body">
            <h3 class="card-title">更多实战项目</h3>
            <p class="card-desc">新项目文档将陆续加入此分类，敬请期待。</p>
          </div>
          <div class="card-foot">
            <span class="card-link card-link-dim">预留位置</span>
          </div>
        </div>
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

.home-section {
  margin-top: 48px;
}

.section-head {
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--vp-c-text-1);
  margin: 0;
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
  border-color: var(--vp-c-brand-1);
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
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
