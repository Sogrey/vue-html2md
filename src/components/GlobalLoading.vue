<template>
  <Transition name="loading-fade">
    <div v-if="loadingStore.isLoading" class="global-loading">
      <div class="loading-backdrop">
        <div class="loading-content">
          <!-- Logo 区域 -->
          <div class="loading-logo">
            <div class="logo-container">
              <div class="logo-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 2L2 7V17L12 22L22 17V7L12 2Z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M12 22V12"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M22 7L12 12L2 7"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <div class="logo-glow"></div>
            </div>
          </div>

          <!-- 标题区域 -->
          <div class="loading-text">
            <h1 class="loading-title">HTML to Markdown</h1>
            <p class="loading-subtitle">{{ loadingStore.subtitle }}</p>
          </div>

          <!-- 进度条区域 -->
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${loadingStore.progress}%` }">
                <div class="progress-glow"></div>
              </div>
            </div>
            <div class="progress-text">
              <span class="progress-percentage"
                >{{ Number(loadingStore.progress).toFixed(2) }}%</span
              >
              <span class="progress-status">{{ loadingStore.statusText }}</span>
            </div>
          </div>

          <!-- 科技装饰元素 -->
          <div class="tech-decoration">
            <div class="tech-line line-1"></div>
            <div class="tech-line line-2"></div>
            <div class="tech-line line-3"></div>
            <div class="tech-dots">
              <div class="dot" v-for="i in 8" :key="i"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useLoadingStore } from '@/stores/loading'

const loadingStore = useLoadingStore()

// 模拟进度更新
let progressInterval: number

onMounted(() => {
  // 初始化进度
  if (loadingStore.progress === 0) {
    progressInterval = setInterval(() => {
      if (loadingStore.progress < 90) {
        loadingStore.progress += Math.random() * 10
        if (loadingStore.progress > 90) loadingStore.progress = 90

        // 更新状态文本
        if (loadingStore.progress < 30) {
          loadingStore.statusText = '初始化组件...'
        } else if (loadingStore.progress < 60) {
          loadingStore.statusText = '加载编辑器...'
        } else if (loadingStore.progress < 80) {
          loadingStore.statusText = '配置解析器...'
        } else {
          loadingStore.statusText = '准备就绪...'
        }
      } else {
        clearInterval(progressInterval)
      }
    }, 300)
  }
})

onUnmounted(() => {
  if (progressInterval) {
    clearInterval(progressInterval)
  }
})
</script>

<style scoped>
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
  background: radial-gradient(ellipse at center, #0a0e27 0%, #020617 50%, #000000 100%);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.loading-backdrop::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 80%, rgba(88, 166, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(56, 139, 253, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(31, 111, 235, 0.05) 0%, transparent 50%);
  animation: backgroundPulse 8s ease-in-out infinite;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
  position: relative;
  z-index: 1;
  max-width: 400px;
  width: 100%;
  padding: 0 2rem;
}

/* Logo 样式 */
.loading-logo {
  position: relative;
}

.logo-container {
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon {
  width: 60px;
  height: 60px;
  color: #58a6ff;
  position: relative;
  z-index: 2;
  animation: logoFloat 3s ease-in-out infinite;
  filter: drop-shadow(0 0 20px rgba(88, 166, 255, 0.5));
}

.logo-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(88, 166, 255, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  animation: glowPulse 2s ease-in-out infinite;
}

/* 文本样式 */
.loading-text {
  text-align: center;
  color: #e2e8f0;
}

.loading-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
  text-shadow: 0 0 40px rgba(96, 165, 250, 0.3);
}

.loading-subtitle {
  font-size: 1rem;
  color: #94a3b8;
  font-weight: 400;
  opacity: 0.9;
}

/* 进度条样式 */
.progress-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(30, 41, 59, 0.8);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
  border: 1px solid rgba(96, 165, 250, 0.2);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 50%, #93c5fd 100%);
  border-radius: 3px;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.progress-fill::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: progressShimmer 2s infinite;
}

.progress-glow {
  position: absolute;
  top: 0;
  right: 0;
  width: 20px;
  height: 100%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%);
  filter: blur(2px);
}

.progress-text {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: #94a3b8;
}

.progress-percentage {
  font-weight: 600;
  color: #60a5fa;
  font-family: 'Courier New', monospace;
}

.progress-status {
  font-size: 0.8rem;
  opacity: 0.8;
}

/* 科技装饰元素 */
.tech-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.tech-line {
  position: absolute;
  background: linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.3), transparent);
  height: 1px;
}

.line-1 {
  top: 20%;
  left: 10%;
  right: 10%;
  animation: scanLine 3s linear infinite;
}

.line-2 {
  top: 50%;
  left: 5%;
  right: 5%;
  animation: scanLine 3s linear infinite 1s;
}

.line-3 {
  top: 80%;
  left: 15%;
  right: 15%;
  animation: scanLine 3s linear infinite 2s;
}

.tech-dots {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 2rem;
  opacity: 0.3;
}

.dot {
  width: 4px;
  height: 4px;
  background: #60a5fa;
  border-radius: 50%;
  animation: dotPulse 2s ease-in-out infinite;
}

.dot:nth-child(2) {
  animation-delay: 0.25s;
}
.dot:nth-child(3) {
  animation-delay: 0.5s;
}
.dot:nth-child(4) {
  animation-delay: 0.75s;
}
.dot:nth-child(5) {
  animation-delay: 1s;
}
.dot:nth-child(6) {
  animation-delay: 1.25s;
}
.dot:nth-child(7) {
  animation-delay: 1.5s;
}
.dot:nth-child(8) {
  animation-delay: 1.75s;
}

/* 动画 */
@keyframes backgroundPulse {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

@keyframes logoFloat {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes glowPulse {
  0%,
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.6;
  }
}

@keyframes progressShimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

@keyframes scanLine {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
}

@keyframes dotPulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.8;
  }
}

/* 页面转场动画 */
.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
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
  transform: translateY(20px) scale(0.95);
  opacity: 0;
}

.loading-fade-leave-to .loading-content {
  transform: translateY(-20px) scale(1.05);
  opacity: 0;
}

.loading-fade-enter-to .loading-content,
.loading-fade-leave-from .loading-content {
  transform: translateY(0) scale(1);
  opacity: 1;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 响应式设计 */
@media (max-width: 640px) {
  .loading-content {
    gap: 2rem;
    padding: 0 1rem;
  }

  .loading-title {
    font-size: 1.5rem;
  }

  .loading-subtitle {
    font-size: 0.875rem;
  }

  .logo-container {
    width: 60px;
    height: 60px;
  }

  .logo-icon {
    width: 45px;
    height: 45px;
  }

  .tech-dots {
    gap: 1rem;
  }
}
</style>
