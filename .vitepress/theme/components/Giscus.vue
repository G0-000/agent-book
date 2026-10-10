<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()
const containerRef = ref<HTMLElement>()

// 与 giscus 的 pathname 映射等价，但解码为可读形式作为 Discussion 标题
function getTerm(): string {
  const raw = window.location.pathname.replace(/\.\w+$/, '').replace(/^\/+/, '')
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

function renderGiscus() {
  if (!containerRef.value) return
  const script = document.createElement('script')
  script.src = 'https://giscus.app/client.js'
  script.async = true
  script.crossOrigin = 'anonymous'
  // 启用评论区时，将下方 data-repo / data-repo-id / data-category-id
  // 改为自己仓库的值（https://giscus.app 按引导配置后复制）
  script.setAttribute('data-repo', 'G0-000/agent-book')
  script.setAttribute('data-repo-id', 'REPLACE_WITH_YOUR_REPO_ID')
  script.setAttribute('data-category', 'Announcements')
  script.setAttribute('data-category-id', 'REPLACE_WITH_YOUR_CATEGORY_ID')
  // specific + strict：标题为解码后的可读路径；strict 按正文 SHA-1 精确定位
  script.setAttribute('data-mapping', 'specific')
  script.setAttribute('data-term', getTerm())
  script.setAttribute('data-strict', '1')
  script.setAttribute('data-reactions-enabled', '1')
  script.setAttribute('data-emit-metadata', '0')
  script.setAttribute('data-input-position', 'top')
  script.setAttribute('data-theme', 'preferred_color_scheme')
  script.setAttribute('data-lang', 'zh-CN')
  containerRef.value.appendChild(script)
}

onMounted(renderGiscus)

watch(
  () => route.path,
  () => {
    if (containerRef.value) {
      containerRef.value.innerHTML = ''
      renderGiscus()
    }
  },
)
</script>

<template>
  <div ref="containerRef" class="giscus" />
</template>
