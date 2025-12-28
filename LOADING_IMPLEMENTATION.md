# Vue 3 全局 Loading 组件实现指南

## 概述

本文档总结了在 Vue 3 项目中实现优雅全局 Loading 组件的完整方案，包括状态管理、组件设计和集成方法。

## 🎯 实现效果

- **应用初始化**：首次访问时显示初始化 loading
- **操作反馈**：异步操作过程中显示进度 loading
- **优雅动画**：现代化设计和平滑过渡效果
- **状态管理**：统一的全局状态控制

## 📁 文件结构

```
src/
├── components/
│   └── GlobalLoading.vue     # 全局 Loading 组件
├── stores/
│   └── loading.ts          # Loading 状态管理
└── App.vue                # 主应用组件
```

## 🔧 核心实现

### 1. 状态管理 (Pinia Store)

```typescript
// src/stores/loading.ts
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
```

### 2. Loading 组件设计

```vue
<!-- src/components/GlobalLoading.vue -->
<template>
  <Transition name="loading-fade">
    <div v-if="loadingStore.isLoading" class="global-loading">
      <div class="loading-backdrop">
        <div class="loading-content">
          <div class="loading-spinner">
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
          </div>
          <div class="loading-text">
            <span class="loading-title">{{ loadingStore.title }}</span>
            <span class="loading-subtitle">{{ loadingStore.subtitle }}</span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useLoadingStore } from '@/stores/loading'
const loadingStore = useLoadingStore()
</script>

<style scoped>
/* 核心样式 */
.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-backdrop {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0d1117 0%, #161b22 50%, #21262d 100%);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

/* 旋转动画 */
.loading-spinner {
  position: relative;
  width: 80px;
  height: 80px;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-radius: 50%;
  animation: spin 2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.spinner-ring:nth-child(1) {
  border-top-color: #58a6ff;
  animation-delay: -0.45s;
}

.spinner-ring:nth-child(2) {
  border-right-color: #388bfd;
  animation-delay: -0.3s;
}

.spinner-ring:nth-child(3) {
  border-bottom-color: #1f6feb;
  animation-delay: -0.15s;
}

.spinner-ring:nth-child(4) {
  border-left-color: #0969da;
}

/* 文字样式 */
.loading-text {
  text-align: center;
  color: #c9d1d9;
}

.loading-title {
  display: block;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #58a6ff, #388bfd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.loading-subtitle {
  display: block;
  font-size: 0.875rem;
  color: #8b949e;
  opacity: 0.8;
}

/* 动画关键帧 */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 过渡动画 */
.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: all 0.3s ease;
}

.loading-fade-enter-from {
  opacity: 0;
  backdrop-filter: blur(0px);
}

.loading-fade-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px);
}

.loading-fade-enter-from .loading-content {
  transform: scale(0.8);
  opacity: 0;
}

.loading-fade-leave-to .loading-content {
  transform: scale(1.1);
  opacity: 0;
}

.loading-fade-enter-to .loading-content,
.loading-fade-leave-from .loading-content {
  transform: scale(1);
  opacity: 1;
  transition: all 0.3s ease;
}
</style>
```

### 3. 应用集成

```vue
<!-- src/App.vue -->
<script setup lang="ts">
import { RouterView, onMounted, ref } from 'vue-router'
import { onMounted, ref } from 'vue'
import { useLoadingStore } from '@/stores/loading'
import GlobalLoading from '@/components/GlobalLoading.vue'

const loadingStore = useLoadingStore()
const isAppReady = ref(false)

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
```

### 4. 在业务组件中使用

```vue
<script setup lang="ts">
import { useLoadingStore } from '@/stores/loading'

const loadingStore = useLoadingStore()

// 异步操作中使用
const handleAsyncOperation = async () => {
  // 显示 loading
  loadingStore.showLoading({
    title: '正在处理',
    subtitle: '请稍候...'
  })
  
  try {
    // 执行异步操作
    await fetchData()
    
    // 更新状态
    loadingStore.showLoading({
      title: '即将完成',
      subtitle: '正在更新数据...'
    })
    
    // 完成后隐藏
    loadingStore.hideLoading()
    
  } catch (error) {
    loadingStore.hideLoading()
    console.error(error)
  }
}
</script>
```

## 🎨 设计要点

### 1. 视觉设计
- **毛玻璃背景**：`backdrop-filter: blur(10px)`
- **渐变背景**：多层颜色渐变增加层次感
- **多彩旋转环**：不同颜色和延迟创造动感
- **文字渐变**：`-webkit-background-clip: text`

### 2. 动画效果
- **旋转动画**：`@keyframes spin` 360度旋转
- **错开延迟**：每个环有不同的 `animation-delay`
- **过渡效果**：缩放 + 透明度的进入/退出动画

### 3. 交互体验
- **状态文字**：清晰的操作进度提示
- **层级管理**：`z-index: 9999` 确保最顶层
- **响应式**：适配各种屏幕尺寸

## 🚀 快速集成步骤

### 1. 安装依赖
```bash
pnpm add pinia
```

### 2. 复制文件
- 复制 `GlobalLoading.vue` 到 `src/components/`
- 复制 `loading.ts` 到 `src/stores/`

### 3. 注册 Pinia
```typescript
// src/main.ts
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
```

### 4. 修改 App.vue
```vue
<script setup lang="ts">
import { useLoadingStore } from '@/stores/loading'
import GlobalLoading from '@/components/GlobalLoading.vue'

const loadingStore = useLoadingStore()
// 设置初始 loading 状态...
</script>

<template>
  <GlobalLoading />
  <RouterView v-if="isAppReady" />
</template>
```

## 🔧 自定义配置

### 1. 修改颜色主题
```css
.loading-backdrop {
  background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
}

.spinner-ring:nth-child(1) {
  border-top-color: #your-accent-color-1;
}
```

### 2. 调整动画速度
```css
.spinner-ring {
  animation: spin 2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}
```

### 3. 修改初始状态
```typescript
// src/stores/loading.ts
const title = ref('你的初始标题')
const subtitle = ref('你的初始副标题')
```

## 📋 最佳实践

### 1. 状态管理
- ✅ 使用 Pinia 统一管理状态
- ✅ 默认 `isLoading = true` 确保启动时显示
- ✅ 提供灵活的文字配置

### 2. 性能优化
- ✅ 使用 CSS 动画而非 JavaScript
- ✅ 合理的 z-index 管理
- ✅ 条件渲染避免不必要的渲染

### 3. 用户体验
- ✅ 清晰的状态提示
- ✅ 平滑的过渡动画
- ✅ 优雅的错误处理

## 🎯 应用场景

1. **应用初始化**：首次加载时的欢迎动画
2. **数据请求**：API 调用过程中的等待提示
3. **文件上传**：大文件上传的进度反馈
4. **页面切换**：路由切换时的过渡效果
5. **复杂计算**：耗时操作的用户提示

## 🔍 调试技巧

### 1. 状态检查
```javascript
// 在浏览器控制台
import { useLoadingStore } from '@/stores/loading'
const store = useLoadingStore()
console.log(store.isLoading, store.title, store.subtitle)
```

### 2. 手动控制
```javascript
// 控制台手动控制
store.showLoading({ title: '测试', subtitle: '手动显示' })
store.hideLoading()
```

## 📱 响应式适配

```css
/* 移动端优化 */
@media (max-width: 768px) {
  .loading-spinner {
    width: 60px;
    height: 60px;
  }
  
  .loading-title {
    font-size: 1.2rem;
  }
  
  .loading-subtitle {
    font-size: 0.75rem;
  }
}
```

## 🎉 完成效果

实现了专业级的全局 Loading 体验：
- 立即显示的初始化 loading
- 优雅的多环旋转动画
- 清晰的操作状态提示
- 平滑的进入/退出过渡
- 统一的状态管理方案

这套方案可以快速集成到任何 Vue 3 项目中，提供一致且专业的用户体验。