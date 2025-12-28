import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLoadingStore = defineStore('loading', () => {
  // Loading 状态 - 默认为 true，确保应用启动时就显示
  const isLoading = ref(true)
  
  // Loading 文本
  const title = ref('正在初始化')
  const subtitle = ref('正在加载编辑器组件...')
  
  // 显示 loading
  const showLoading = (options?: { title?: string; subtitle?: string }) => {
    isLoading.value = true
    if (options?.title) {
      title.value = options.title
    }
    if (options?.subtitle) {
      subtitle.value = options.subtitle
    }
  }
  
  // 隐藏 loading
  const hideLoading = () => {
    isLoading.value = false
  }
  
  // 重置文本
  const resetText = () => {
    title.value = '正在加载'
    subtitle.value = '请稍候...'
  }
  
  return {
    isLoading,
    title,
    subtitle,
    showLoading,
    hideLoading,
    resetText
  }
})