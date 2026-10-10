// 构建后生成 sitemap.xml + robots.txt（GitHub Pages 项目站，base=/agent-book/）
// 用法：pnpm docs:build（自动执行），或单独 node scripts/gen-sitemap.mjs
import { readdirSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const DIST = '.vitepress/dist'
const SITE = 'https://G0-000.github.io'
const BASE = '/agent-book'

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name)
    return e.isDirectory() ? walk(p) : [p]
  })
}

// URL 与 config.mts 中的 canonical 保持一致（不带 .html、中文不转义）
const urls = walk(DIST)
  .filter((p) => p.endsWith('.html') && !p.endsWith('404.html'))
  .map((p) => {
    const rel = relative(DIST, p).replace(/\.html$/, '')
    return `  <url><loc>${SITE}${BASE}${rel === 'index' ? '' : '/' + rel}</loc></url>`
  })
  .sort()

writeFileSync(
  join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`,
)

writeFileSync(
  join(DIST, 'robots.txt'),
  `User-agent: *
Allow: /

Sitemap: ${SITE}${BASE}/sitemap.xml
`,
)

console.log(`sitemap.xml: ${urls.length} urls, robots.txt written`)
