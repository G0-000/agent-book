// 扫描各课程 代码/ 目录，生成 Notebook 在线阅读索引页（nbviewer 从 GitHub URL 渲染，零后端）
// 用法：node scripts/gen-notebooks.mjs
import { readdirSync, writeFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const BASE = 'https://github.com/G0-000/agent-book/blob/main'
const HEADER = [
  '无需下载、无需本地环境，点击链接即在浏览器中打开对应 Jupyter Notebook。',
  '代码文件本身在仓库 [`代码/`](https://github.com/G0-000/agent-book/tree/main/代码) 目录下。',
]

const courses = [
  { name: 'langchain', codeDir: 'langchain/代码/langchain1.2_tutorial', title: 'LangChain Notebook 在线阅读' },
  { name: 'langgraph', codeDir: 'langgraph/代码/langgraph', title: 'LangGraph Notebook 在线阅读' },
]

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = join(dir, e.name)
    if (!e.isDirectory()) return [p]
    return e.name === '.ipynb_checkpoints' || e.name === '__pycache__' ? [] : walk(p)
  })
}

for (const { name, codeDir, title } of courses) {
  const notebooks = walk(codeDir)
    .filter(p => p.endsWith('.ipynb'))
    .sort()

  const byChapter = new Map()
  for (const p of notebooks) {
    const chapter = relative(codeDir, p).split(sep)[0]
    if (!byChapter.has(chapter)) byChapter.set(chapter, [])
    byChapter.get(chapter).push(p)
  }

  const lines = [`# ${title}`, '', ...HEADER, '']
  for (const [chapter, files] of byChapter) {
    lines.push(`## ${chapter}`, '', '| Notebook | 在线打开 |', '| --- | --- |')
    for (const p of files) {
      const rel = relative('.', p).split(sep).join('/')
      const enc = rel.split('/').map(encodeURIComponent).join('/')
      lines.push(`| ${p.split(sep).pop()} | [GitHub 打开](${BASE}/${enc}) |`)
    }
    lines.push('')
  }

  writeFileSync(join(name, 'notebooks.md'), lines.join('\n'))
  console.log(`${name}: ${notebooks.length} notebooks -> ${name}/notebooks.md`)
}
