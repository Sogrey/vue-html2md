import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLoadingStore = defineStore('loading', () => {
  // Loading 状态 - 默认为 true，确保应用启动时就显示
  const isLoading = ref(true)
  
  // Loading 文本
  const title = ref('正在初始化')
  const subtitle = ref('正在加载编辑器组件...')
  
  // 进度条相关
  const progress = ref(0)
  const statusText = ref('准备中...')
  
  // 显示 loading
  const showLoading = (options?: { 
    title?: string; 
    subtitle?: string;
    progress?: number;
    statusText?: string;
  }) => {
    isLoading.value = true
    if (options?.title) {
      title.value = options.title
    }
    if (options?.subtitle) {
      subtitle.value = options.subtitle
    }
    if (options?.progress !== undefined) {
      progress.value = Math.min(100, Math.max(0, options.progress))
    }
    if (options?.statusText) {
      statusText.value = options.statusText
    }
  }
  
  // 隐藏 loading
  const hideLoading = () => {
    isLoading.value = false
  }
  
  // 更新进度
  const updateProgress = (value: number, status?: string) => {
    progress.value = Math.min(100, Math.max(0, value))
    if (status) {
      statusText.value = status
    }
  }
  
  // 重置所有状态
  const reset = () => {
    isLoading.value = true
    title.value = '正在初始化'
    subtitle.value = '正在加载编辑器组件...'
    progress.value = 0
    statusText.value = '准备中...'
  }
  
  // 完成进度
  const complete = () => {
    progress.value = 100
    statusText.value = '完成！'
    setTimeout(() => {
      hideLoading()
    }, 500)
  }
  
  return {
    isLoading,
    title,
    subtitle,
    progress,
    statusText,
    showLoading,
    hideLoading,
    updateProgress,
    reset,
    complete
  }
})