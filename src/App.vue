<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted, ref } from 'vue'
import { useLoadingStore } from '@/stores/loading'
import GlobalLoading from '@/components/GlobalLoading.vue'

const loadingStore = useLoadingStore()
const isAppReady = ref(false)

// 立即显示 loading，在应用的最开始
loadingStore.showLoading({
  title: '正在初始化',
  subtitle: '正在加载编辑器组件...'
})

// 应用初始化时显示 loading
onMounted(() => {
  // 延迟隐藏 loading，模拟资源加载
  setTimeout(() => {
    loadingStore.showLoading({
      title: '正在初始化',
      subtitle: '正在配置转换引擎...'
    })
  }, 800)
  
  setTimeout(() => {
    loadingStore.showLoading({
      title: '准备就绪',
      subtitle: '即将进入编辑器...'
    })
  }, 1200)
  
  setTimeout(() => {
    isAppReady.value = true
    loadingStore.hideLoading()
  }, 1500)
})
</script>

<template>
  <GlobalLoading />
  <RouterView v-if="isAppReady" />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  background: #f8f9fa;
}

/* 宽屏优化 */
@media (min-width: 1400px) {
  body {
    font-size: 16px;
  }
}

/* 超宽屏优化 */
@media (min-width: 1920px) {
  body {
    font-size: 17px;
  }
}

#app {
  min-height: 100vh;
}

/* 全局滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
