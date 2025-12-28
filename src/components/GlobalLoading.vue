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

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 动画效果 */
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