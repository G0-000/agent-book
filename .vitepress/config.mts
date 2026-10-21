import { defineConfig } from 'vitepress'
import type { HeadConfig } from 'vitepress'
import { langchainSidebar, langgraphSidebar, vibeSidebar, pythonSidebar, agentFlowSidebar, workAgentHarnessSidebar, agentLearningSidebar, agentPart1Sidebar, agentPart2Sidebar, agentPart3Sidebar, agentPart4Sidebar, agentPart5Sidebar, agentPart6Sidebar } from './sidebars'

const site = 'https://G0-000.github.io'
const homeUrl = site + '/agent-book/'

function jsonLd(schema: object): HeadConfig {
  return ['script', { type: 'application/ld+json' }, JSON.stringify(schema)]
}

function breadcrumb(pageUrl: string, crumbs: { name: string; url?: string }[]): HeadConfig {
  return jsonLd({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      ...(c.url ? { item: c.url } : {}),
    })),
  })
}

export default defineConfig({
  title: 'Agent-Book 学习笔记',
  description: 'Python / LangChain / LangGraph / AI Coding 学习笔记，以及实战项目文档',
  lang: 'zh-CN',

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/agent-book/logo.svg' }],
    jsonLd({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Agent-Book 学习笔记',
      url: homeUrl,
      inLanguage: 'zh-CN',
      description: 'Python / LangChain / LangGraph / AI Coding 学习笔记，以及实战项目文档',
    }),
  ],

  // GitHub Pages 项目站：https://G0-000.github.io/agent-book/
  base: '/agent-book/',

  transformHead(ctx) {
    const isHome = ctx.pageData.relativePath === 'index.md'
    const rel = ctx.pageData.relativePath.replace(/\.md$/, '')
    const pageUrl = isHome ? homeUrl : site + '/agent-book/' + rel
    const head: HeadConfig[] = [['link', { rel: 'canonical', href: pageUrl }]]

    const course = rel.split('/')[0]
    const labels: Record<string, string> = {
      python: 'Python',
      langchain: 'LangChain',
      langgraph: 'LangGraph',
      vibe_coding: 'AI Coding',
      'agent-flow': 'agent-flow',
      'work-agent-harness': 'WorkAgentHarness',
    }
    if (labels[course]) {
      head.push(
        breadcrumb(pageUrl, [
          { name: 'Agent-Book 学习笔记', url: homeUrl },
          { name: labels[course], url: homeUrl + course + '/' },
          { name: ctx.pageData.title },
        ]),
      )
    }
    return head
  },

  // 直接复用仓库根目录下的现有课件
  srcDir: '.',
  srcExclude: ['**/代码/**', '**/.venv/**', '**/node_modules/**', '**/langgraph-runtime-viz/**'],

  // 死链检查保持开启，仅忽略“刻意排除/目录导航”导致的预期失效链接：
  // 1. 指向课程内 代码/ 示例目录的链接：示例代码目录在站点构建中被 srcExclude 排除，
  //    这些链接用于 GitHub 仓库内导航（README 分章表格中的代码列）
  // 2. langgraph-runtime-viz：独立 HTML 应用，未纳入站点构建
  // 3. agent-flow 文档中的“目录 index”链接（如 00-快速上手/index、./doc-dev/index）：
  //    GitHub 仓库中可打开目录页，VitePress 站点中无对应 index.md，属文档原有导航写法
  ignoreDeadLinks: [/代码|%E4%BB%A3%E7%A0%81/, /langgraph-runtime-viz/, /\/index$/, /diagrams\//],

  cleanUrls: true,

  themeConfig: {
    siteTitle: 'Agent-Book',

    logo: '/agent-book/logo.svg',

    nav: [
      { text: '首页', link: '/' },
      {
        text: 'Agent',
        items: [
          { text: '从零开始学 Agent（总览）', link: '/agent-learning/index' },
          { text: '前言', link: '/agent-learning/preface' },
          { text: '第一部分 · 入门篇', link: '/agent-learning/part1' },
          { text: '第二部分 · 核心能力篇', link: '/agent-learning/part2' },
          { text: '第三部分 · 框架实战篇', link: '/agent-learning/part3' },
          { text: '第四部分 · 多 Agent 系统篇', link: '/agent-learning/part4' },
          { text: '第五部分 · 生产化篇', link: '/agent-learning/part5' },
          { text: '第六部分 · 综合项目篇', link: '/agent-learning/part6' },
        ],
      },
      {
        text: 'Harness',
        items: [
          { text: 'agent-flow', link: '/agent-flow/index' },
          { text: 'WorkAgentHarness', link: '/work-agent-harness/index' },
        ],
      },
      {
        text: 'Notes',
        items: [
          { text: 'Python', link: '/python/README' },
          { text: 'LangChain', link: '/langchain/README' },
          { text: 'LangGraph', link: '/langgraph/README' },
          { text: 'AI Coding', link: '/vibe_coding/README' },
        ],
      },
    ],

    sidebar: {
      '/python/': pythonSidebar,
      '/langchain/': langchainSidebar,
      '/langgraph/': langgraphSidebar,
      '/vibe_coding/': vibeSidebar,
      '/agent-flow/': agentFlowSidebar,
      '/work-agent-harness/': workAgentHarnessSidebar,
      // 从零开始学 Agent：总览/前言/附录显示全书目录；各篇与章节只显示对应篇（键按段数排序匹配，用精确页键+目录前缀键）
      '/agent-learning/SUMMARY': agentLearningSidebar,
      '/agent-learning/index': agentLearningSidebar,
      '/agent-learning/preface': agentLearningSidebar,
      '/agent-learning/appendix/': agentLearningSidebar,
      '/agent-learning/animations/': agentLearningSidebar,
      '/agent-learning/svg/': agentLearningSidebar,
      '/agent-learning/part1': agentPart1Sidebar,
      '/agent-learning/chapter_intro/': agentPart1Sidebar,
      '/agent-learning/chapter_llm/': agentPart1Sidebar,
      '/agent-learning/part2': agentPart2Sidebar,
      '/agent-learning/chapter_tools/': agentPart2Sidebar,
      '/agent-learning/chapter_memory/': agentPart2Sidebar,
      '/agent-learning/chapter_planning/': agentPart2Sidebar,
      '/agent-learning/chapter_rag/': agentPart2Sidebar,
      '/agent-learning/chapter_context_engineering/': agentPart2Sidebar,
      '/agent-learning/chapter_harness/': agentPart2Sidebar,
      '/agent-learning/chapter_skill/': agentPart2Sidebar,
      '/agent-learning/chapter_agentic_rl/': agentPart2Sidebar,
      '/agent-learning/chapter_self_evolving/': agentPart2Sidebar,
      '/agent-learning/part3': agentPart3Sidebar,
      '/agent-learning/chapter_langchain/': agentPart3Sidebar,
      '/agent-learning/chapter_langgraph/': agentPart3Sidebar,
      '/agent-learning/chapter_openclaw/': agentPart3Sidebar,
      '/agent-learning/chapter_hermes/': agentPart3Sidebar,
      '/agent-learning/chapter_claude_code/': agentPart3Sidebar,
      '/agent-learning/chapter_deepseek_harness/': agentPart3Sidebar,
      '/agent-learning/part4': agentPart4Sidebar,
      '/agent-learning/chapter_18_multi_agent/': agentPart4Sidebar,
      '/agent-learning/chapter_19_protocol/': agentPart4Sidebar,
      '/agent-learning/part5': agentPart5Sidebar,
      '/agent-learning/chapter_20_evaluation/': agentPart5Sidebar,
      '/agent-learning/chapter_21_security/': agentPart5Sidebar,
      '/agent-learning/chapter_22_deployment/': agentPart5Sidebar,
      '/agent-learning/part6': agentPart6Sidebar,
      '/agent-learning/chapter_23_coding_agent/': agentPart6Sidebar,
      '/agent-learning/chapter_24_data_agent/': agentPart6Sidebar,
      '/agent-learning/chapter_25_multimodal/': agentPart6Sidebar,
      '/agent-learning/chapter_setup/': agentPart6Sidebar,
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/G0-000/agent-book' }],

    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索',
            buttonAriaLabel: '搜索',
          },
          modal: {
            noResultsText: '没有找到相关结果',
            resetButtonTitle: '清除查询',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭',
            },
          },
        },
      },
    },

    outline: {
      label: '本页目录',
      level: [2, 3],
    },

    docFooter: {
      prev: '上一篇',
      next: '下一篇',
    },

    lastUpdated: {
      text: '最后更新',
    },

    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',

    footer: {
      message: '笔记参考 Github 多个项目以及学习后并修改，本站仅供学习交流',
      copyright: 'Copyright © Yo · 笔记整理',
    },
  },

  markdown: {
    // 课件中大量出现 <class '...'>、<YOUR_API_KEY>、<h1> 等文本，
    // 关闭原始 HTML 解析，避免被 Vue 当成未闭合标签导致构建失败
    html: false,
    lineNumbers: true,
    image: {
      lazyLoading: true,
    },
    config(md) {
      // doc-dev 里程碑架构图：```archify M0 代码块 → 内嵌自包含 HTML 交互图
      const defaultFence = md.renderer.rules.fence!.bind(md.renderer.rules)
      md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const parts = tokens[idx].info.trim().split(/\s+/)
        if (parts[0] === 'archify') {
          const name = parts[1] || 'M0'
          return `<div class="vp-diagram-embed"><iframe src="/agent-book/agent-flow/doc-dev/01-里程碑/diagrams/${name}.html" title="${name} 架构图（Archify）" loading="lazy"></iframe></div>`
        }
        return defaultFence(tokens, idx, options, env, self)
      }
      // agent_learning 笔记正文/内联代码中大量使用 {{...}}（Vue 模板插值语法），
      // 直接编译会报 "Did not expect a type annotation"。构建时把渲染结果中的
      // 花括号转成 HTML 实体，浏览器显示不变且不触发 Vue 解析
      const render = md.render.bind(md)
      md.render = (src: string, env?: any) =>
        render(src, env)
          .replace(/{{/g, '&#123;&#123;')
          .replace(/}}/g, '&#125;&#125;')
    },
  },

  vite: {
    define: {
      __COMMIT_SHA__: JSON.stringify((process.env.GITHUB_SHA || 'dev').slice(0, 7)),
    },
    server: {
      fs: {
        allow: ['.'],
      },
    },
  },
})
