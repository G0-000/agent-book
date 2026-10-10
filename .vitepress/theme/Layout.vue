<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { useRouter } from 'vitepress'
import { NProgress } from 'nprogress-v2'
import 'nprogress-v2/dist/index.css'
import './style.css'
import HomeFeatures from './components/HomeFeatures.vue'

NProgress.configure({ showSpinner: false })
import { inBrowser } from 'vitepress'

// 构建期由 vite define 注入，本地构建显示 dev
declare const __COMMIT_SHA__: string
console.log('[agent-book] commit:', __COMMIT_SHA__)

const router = useRouter()
// SSR 下 window 不存在，只在浏览器端注册
if (inBrowser) {
  router.onBeforeRouteChange = to => {
    NProgress.start()
  }

  router.onAfterRouteChange = () => {
    NProgress.done()
  }
}

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #home-features>
      <HomeFeatures />
    </template>
  </Layout>
</template>
