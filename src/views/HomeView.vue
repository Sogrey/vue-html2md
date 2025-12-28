<template>
  <div class="html2md-container">
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <div class="logo-icon">📝</div>
          <h1 class="logo-text">HTML2MD</h1>
        </div>
        <p class="subtitle">将网页内容转换为精美 Markdown 文档</p>
      </div>
    </header>

    <main class="main-content">
      <section class="input-section">
        <div class="input-tabs">
          <button :class="['tab-btn', { active: activeTab === 'url' }]" @click="activeTab = 'url'">
            <span class="tab-icon">🌐</span>
            URL 转换
          </button>
          <button
            :class="['tab-btn', { active: activeTab === 'html' }]"
            @click="activeTab = 'html'"
          >
            <span class="tab-icon">📄</span>
            HTML 代码
          </button>
        </div>

        <div class="input-area">
          <!-- URL 输入 -->
          <div v-if="activeTab === 'url'" class="url-input-wrapper">
            <div class="input-group">
              <input
                v-model="urlInput"
                type="url"
                placeholder="输入网页 URL，例如：https://example.com"
                class="url-input"
                @keypress.enter="handleUrlConvert"
              />
              <button
                :disabled="!urlInput.trim() || isConverting"
                @click="handleUrlConvert"
                class="convert-btn primary"
              >
                <span v-if="isConverting" class="loading-spinner"></span>
                {{ isConverting ? '抓取中...' : '转换' }}
              </button>
            </div>
            <div class="options">
              <label class="checkbox-label">
                <input v-model="extractMainContent" type="checkbox" />
                仅提取正文内容
              </label>
            </div>
          </div>

          <!-- HTML 输入 -->
          <div v-if="activeTab === 'html'" class="html-input-wrapper">
            <div class="html-header">
              <span class="label">HTML 代码：</span>
              <button @click="insertExample" class="example-btn">插入示例</button>
            </div>
            <textarea
              v-model="htmlInput"
              placeholder="粘贴 HTML 代码..."
              class="html-textarea"
              rows="8"
            ></textarea>
            <div class="html-actions">
              <button
                :disabled="!htmlInput.trim() || isConverting"
                @click="handleHtmlConvert"
                class="convert-btn primary"
              >
                <span v-if="isConverting" class="loading-spinner"></span>
                {{ isConverting ? '转换中...' : '转换为 Markdown' }}
              </button>
              <button @click="clearHtml" class="clear-btn">清空</button>
            </div>
          </div>
        </div>
      </section>

      <section class="editor-section">
        <div class="editor-header">
          <h2>Markdown 输出</h2>
          <div class="editor-actions">
            <button @click="copyToClipboard" class="action-btn">
              <span class="icon">📋</span>
              复制
            </button>
            <button @click="downloadMarkdown" class="action-btn">
              <span class="icon">💾</span>
              下载
            </button>
            <button @click="clearOutput" class="action-btn danger">
              <span class="icon">🗑️</span>
              清空
            </button>
          </div>
        </div>
        <CherryMarkdown
          :value="markdownOutput"
          @change="handleMarkdownChange"
        />
      </section>

      <!-- Toast 通知 -->
      <div v-if="toast.show" :class="['toast', toast.type]">
        {{ toast.message }}
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import TurndownService from 'turndown'
import axios from 'axios'
import { useLoadingStore } from '@/stores/loading'
import CherryMarkdown from '@/components/CherryMarkdown.vue'

interface Toast {
  show: boolean
  message: string
  type: 'success' | 'error' | 'info'
}

const activeTab = ref<'url' | 'html'>('url')
const urlInput = ref('')
const htmlInput = ref('')
const markdownOutput = ref(`# 欢迎使用 HTML2MD

在这里输入 **Markdown** 内容，或者：

1. 🌐 **URL 转换** - 输入网页 URL 自动抓取并转换
2. 📄 **HTML 代码** - 直接粘贴 HTML 代码进行转换

## 📝 Markdown 示例

### 基础语法

**粗体文本** *斜体文本* ~~删除线文本~~

### 列表

- 📝 无序列表项 1
- 📝 无序列表项 2
  - 子列表项
  - 子列表项

1. 📍 有序列表项 1
2. 📍 有序列表项 2

### 代码

\`\`\`javascript
// 示例代码
function hello() {
  console.log("Hello, Markdown!");
}
\`\`\`

### 其他元素

> 💡 引用块：在这里可以放置提示或重要信息

[🔗 链接示例](https://example.com)

![🖼️ 图片](https://via.placeholder.com/600x300/4a5568/ffffff?text=示例图片)

| 列标题1 | 列标题2 | 列标题3 |
|----------|----------|----------|
| 单元格1 | 单元格2 | 单元格3 |
| 单元格4 | 单元格5 | 单元格6 |

---

💡 **提示**：左侧是编辑器，右侧是实时预览。您可以直接编辑上面的内容！`)
const isConverting = ref(false)
const extractMainContent = ref(true)
const toast = ref<Toast>({ show: false, message: '', type: 'info' })
const loadingStore = useLoadingStore()

// 初始化 turndown
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  strongDelimiter: '**',
  emDelimiter: '*',
  linkStyle: 'inlined',
})

// 显示 Toast 通知
const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

// 插入示例 HTML
const insertExample = () => {
  htmlInput.value = `<h1>示例 HTML 内容</h1>
<p>这是一个 <strong>示例段落</strong>，包含了<em>斜体文本</em>和<code>内联代码</code>。</p>
<ul>
  <li>第一项内容</li>
  <li>第二项内容</li>
  <li>第三项内容</li>
</ul>
<table>
  <tr>
    <th>列1</th>
    <th>列2</th>
    <th>列3</th>
  </tr>
  <tr>
    <td>数据1</td>
    <td>数据2</td>
    <td>数据3</td>
  </tr>
</table>
<blockquote>
这是一个引用块，可以用来突出重要信息。
</blockquote>`
}

// URL 转换处理
const handleUrlConvert = async () => {
  if (!urlInput.value.trim()) return

  isConverting.value = true
  
  // 显示全局 loading
  loadingStore.showLoading({
    title: '正在抓取网页',
    subtitle: '正在获取页面内容，请稍候...'
  })
  
  try {
    console.log('开始请求URL:', urlInput.value)
    console.log('请求地址:', 'http://localhost:3001/api/fetch')
    
    // 更新 loading 状态
    loadingStore.showLoading({
      title: '正在转换',
      subtitle: '正在将 HTML 转换为 Markdown...'
    })
    
    const response = await axios.get('http://localhost:3001/api/fetch', {
      params: {
        url: urlInput.value,
        extractMain: extractMainContent.value,
      },
      timeout: 15000,
    })

    console.log('请求成功:', response.data)

    if (response.data.success) {
      // 更新 loading 状态
      loadingStore.showLoading({
        title: '即将完成',
        subtitle: '正在更新编辑器内容...'
      })
      
      const markdown = turndownService.turndown(response.data.html)
      markdownOutput.value = markdown
      
      // 隐藏 loading 并显示成功提示
      loadingStore.hideLoading()
      showToast('URL内容抓取并转换成功！', 'success')

      // 滚动到编辑器区域
      nextTick(() => {
        const editorSection = document.querySelector('.editor-section')
        editorSection?.scrollIntoView({ behavior: 'smooth' })
      })
    } else {
      loadingStore.hideLoading()
      showToast('抓取失败：' + response.data.error, 'error')
    }
  } catch (error) {
    console.error('详细错误信息:', error)
    loadingStore.hideLoading()
    
    let errorMessage = 'URL抓取失败'

    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED') {
        errorMessage = '代理服务未启动，请运行 "pnpm run server" 启动服务'
      } else if (error.response) {
        errorMessage = `服务器错误: ${error.response.data.error || error.response.statusText}`
      } else if (error.request) {
        errorMessage = '网络请求失败，请检查网络连接'
      }
    }

    showToast(errorMessage, 'error')
  } finally {
    isConverting.value = false
  }
}

// HTML 转换处理
const handleHtmlConvert = () => {
  if (!htmlInput.value.trim()) return

  isConverting.value = true
  
  // 显示全局 loading
  loadingStore.showLoading({
    title: '正在转换',
    subtitle: '正在将 HTML 转换为 Markdown...'
  })
  
  try {
    const markdown = turndownService.turndown(htmlInput.value)
    
    // 更新 loading 状态
    loadingStore.showLoading({
      title: '即将完成',
      subtitle: '正在更新编辑器内容...'
    })
    
    markdownOutput.value = markdown
    loadingStore.hideLoading()
    showToast('转换成功！', 'success')

    // 滚动到编辑器区域
    nextTick(() => {
      const editorSection = document.querySelector('.editor-section')
      editorSection?.scrollIntoView({ behavior: 'smooth' })
    })
  } catch (error) {
    loadingStore.hideLoading()
    showToast('转换失败：' + (error as Error).message, 'error')
  } finally {
    isConverting.value = false
  }
}

// 处理 Markdown 内容变化
const handleMarkdownChange = (value: string) => {
  markdownOutput.value = value
}

// 复制到剪贴板
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(markdownOutput.value)
    showToast('已复制到剪贴板！', 'success')
  } catch (error: any) {
    showToast('复制失败', error)
  }
}

// 下载 Markdown 文件
const downloadMarkdown = () => {
  const blob = new Blob([markdownOutput.value], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `converted-${Date.now()}.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  showToast('文件已下载！', 'success')
}

// 清空 HTML 输入
const clearHtml = () => {
  htmlInput.value = ''
}

// 清空输出
const clearOutput = () => {
  markdownOutput.value = '# 开始编辑\n\n在这里输入您的 Markdown 内容...'
}
</script>

<style scoped>
.html2md-container {
  min-height: 100vh;
  background: 
    /* 主背景渐变 */
    linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #0f172a 50%, #334155 75%, #0f172a 100%),
    /* 网格背景 */
    radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 50%, rgba(147, 51, 234, 0.1) 0%, transparent 50%);
  background-size: 100% 100%, 80px 80px, 80px 80px;
  background-position: center, 0 0, 40px 40px;
  background-attachment: fixed;
  color: #e2e8f0;
  position: relative;
  overflow-x: hidden;
}

/* 现代科技网格背景 */
.html2md-container::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    /* 网格线 */
    linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
    /* 光晕效果 */
    radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.05) 0%, transparent 70%);
  background-size: 40px 40px, 40px 40px, 300px 300px, 250px 250px, 400px 400px;
  background-position: 0 0, 0 0, 0 0, 100% 0, 50% 50%;
  background-attachment: fixed;
  animation: gridMove 20s linear infinite, backgroundPulse 8s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

/* 网格动画 */
@keyframes gridMove {
  0% {
    background-position: 0 0, 0 0, 0 0, 100% 0, 50% 50%;
  }
  100% {
    background-position: 40px 40px, 40px 0, 0 0, 100% 0, 50% 50%;
  }
}

.header {
  text-align: center;
  padding: 3rem 2rem 2rem;
  color: #e2e8f0;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(59, 130, 246, 0.3);
  position: relative;
  z-index: 1;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* 头部科技装饰线条 */
.header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 300px;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(59, 130, 246, 0.8) 20%, 
    rgba(147, 51, 234, 0.8) 50%, 
    rgba(236, 72, 153, 0.8) 80%, 
    transparent);
  animation: headerGlow 3s ease-in-out infinite;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 0.8rem;
}

.logo {
  position: relative;
}

.logo-icon {
  font-size: 2.5rem;
  animation: logoFloat 3s ease-in-out infinite;
  filter: drop-shadow(0 0 20px rgba(96, 165, 250, 0.5));
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

.logo-text {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 25%, #ec4899 50%, #3b82f6 75%, #2563eb 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
  text-shadow: 0 0 40px rgba(59, 130, 246, 0.3);
  animation: textGlow 3s ease-in-out infinite alternate, gradientShift 5s linear infinite;
}

@keyframes textGlow {
  0% { filter: brightness(1); }
  100% { filter: brightness(1.2); }
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.subtitle {
  font-size: 1.2rem;
  color: #94a3b8;
  margin: 0;
  font-weight: 400;
  opacity: 0.9;
}

.main-content {
  width: 100%;
  margin: 0 auto;
  padding: 2rem 3rem;
  position: relative;
  z-index: 1;
}

.input-section {
  background: rgba(15, 23, 42, 0.9);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.3),
    0 0 80px rgba(59, 130, 246, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 0 0 1px rgba(59, 130, 246, 0.2);
  margin: 0 auto 2rem auto;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(59, 130, 246, 0.3);
  width: 100%;
  max-width: none;
  position: relative;
  overflow: hidden;
}

/* 科技感边框装饰 */
.input-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.2), transparent),
    linear-gradient(0deg, transparent, rgba(147, 51, 234, 0.2), transparent),
    linear-gradient(90deg, transparent, rgba(236, 72, 153, 0.1), transparent),
    linear-gradient(0deg, transparent, rgba(59, 130, 246, 0.1), transparent);
  background-size: 100% 2px, 2px 100%, 100% 1px, 1px 100%;
  background-position: 0 0, 0 0, 0 100%, 100% 0;
  background-repeat: no-repeat;
  pointer-events: none;
  border-radius: 20px;
  animation: borderGlow 4s ease-in-out infinite;
}

.input-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2.5rem;
  border-bottom: 1px solid rgba(96, 165, 250, 0.2);
  position: relative;
}

.tab-btn {
  padding: 1rem 1.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  color: #64748b;
  border-bottom: 2px solid transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
  overflow: hidden;
}

.tab-btn::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-btn:hover {
  color: #93c5fd;
  background: rgba(96, 165, 250, 0.05);
  transform: translateY(-1px);
}

.tab-btn.active {
  color: #60a5fa;
  border-bottom-color: transparent;
}

.tab-btn.active::before {
  transform: translateX(-50%) scaleX(1);
}

.tab-icon {
  font-size: 1.2rem;
  filter: drop-shadow(0 0 5px rgba(96, 165, 250, 0.3));
}

.url-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-group {
  display: flex;
  gap: 1rem;
}

.url-input {
  flex: 1;
  padding: 1rem 1.5rem;
  border: 1px solid rgba(96, 165, 250, 0.2);
  border-radius: 12px;
  font-size: 1rem;
  background: rgba(13, 17, 23, 0.6);
  color: #e2e8f0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.url-input::placeholder {
  color: #64748b;
}

.url-input:focus {
  outline: none;
  border-color: #60a5fa;
  box-shadow: 
    0 0 0 3px rgba(96, 165, 250, 0.1),
    0 0 20px rgba(96, 165, 250, 0.2);
  background: rgba(13, 17, 23, 0.8);
}

.convert-btn {
  padding: 1rem 2rem;
  border: 1px solid rgba(96, 165, 250, 0.3);
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
  overflow: hidden;
}

.convert-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s;
}

.convert-btn:hover::before {
  left: 100%;
}

.convert-btn.primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.convert-btn.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 
    0 8px 25px rgba(59, 130, 246, 0.4),
    0 0 30px rgba(59, 130, 246, 0.2);
  border-color: rgba(96, 165, 250, 0.5);
}

.convert-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes backgroundPulse {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

@keyframes headerGlow {
  0%,
  100% {
    opacity: 0.6;
    transform: translateX(-50%) scaleX(0.9);
  }
  50% {
    opacity: 1;
    transform: translateX(-50%) scaleX(1);
  }
}

@keyframes borderGlow {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.options {
  display: flex;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: #94a3b8;
  transition: color 0.3s ease;
}

.checkbox-label:hover {
  color: #cbd5e1;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #3b82f6;
  background: rgba(13, 17, 23, 0.6);
  border: 1px solid rgba(96, 165, 250, 0.3);
  border-radius: 4px;
  cursor: pointer;
}

.html-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.html-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  font-weight: 600;
  color: #e2e8f0;
}

.example-btn {
  padding: 0.5rem 1rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(96, 165, 250, 0.3);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #93c5fd;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.example-btn:hover {
  background: rgba(59, 130, 246, 0.2);
  color: #dbeafe;
  border-color: #60a5fa;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.html-textarea {
  width: 100%;
  padding: 1rem 1.5rem;
  border: 1px solid rgba(96, 165, 250, 0.2);
  border-radius: 12px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 200px;
  background: rgba(13, 17, 23, 0.6);
  color: #e2e8f0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.html-textarea::placeholder {
  color: #64748b;
}

.html-textarea:focus {
  outline: none;
  border-color: #60a5fa;
  box-shadow: 
    0 0 0 3px rgba(96, 165, 250, 0.1),
    0 0 20px rgba(96, 165, 250, 0.2);
  background: rgba(13, 17, 23, 0.8);
}

.html-actions {
  display: flex;
  gap: 1rem;
}

.clear-btn {
  padding: 0.75rem 1.5rem;
  border: 1px solid rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.clear-btn:hover {
  border-color: #ef4444;
  color: #fca5a5;
  background: rgba(239, 68, 68, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.editor-section {
  background: rgba(15, 23, 42, 0.9);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.3),
    0 0 80px rgba(59, 130, 246, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 0 0 1px rgba(59, 130, 246, 0.2);
  margin: 0 auto;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(59, 130, 246, 0.3);
  width: 100%;
  max-width: none;
  position: relative;
  overflow: hidden;
}

/* 编辑器科技感边框装饰 */
.editor-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.2), transparent),
    linear-gradient(0deg, transparent, rgba(147, 51, 234, 0.2), transparent),
    linear-gradient(90deg, transparent, rgba(236, 72, 153, 0.1), transparent),
    linear-gradient(0deg, transparent, rgba(59, 130, 246, 0.1), transparent);
  background-size: 100% 2px, 2px 100%, 100% 1px, 1px 100%;
  background-position: 0 0, 0 0, 0 100%, 100% 0;
  background-repeat: no-repeat;
  pointer-events: none;
  border-radius: 20px;
  animation: borderGlow 4s ease-in-out infinite;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
}

.editor-header h2 {
  margin: 0;
  color: #e2e8f0;
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.editor-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.75rem 1rem;
  border: 1px solid rgba(96, 165, 250, 0.2);
  background: rgba(59, 130, 246, 0.1);
  color: #93c5fd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s;
}

.action-btn:hover::before {
  left: 100%;
}

.action-btn:hover {
  background: rgba(59, 130, 246, 0.2);
  border-color: #60a5fa;
  color: #dbeafe;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.action-btn.danger {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
}

.action-btn.danger:hover {
  border-color: #ef4444;
  color: #fca5a5;
  background: rgba(239, 68, 68, 0.2);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.icon {
  font-size: 1rem;
}

.toast {
  position: fixed;
  top: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  color: white;
  z-index: 1000;
  animation: slideIn 0.3s ease;
  max-width: 300px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast.success {
  background: linear-gradient(135deg, #4caf50, #45a049);
}

.toast.error {
  background: linear-gradient(135deg, #f44336, #da190b);
}

.toast.info {
  background: linear-gradient(135deg, #2196f3, #1976d2);
}

/* 默认PC宽屏优先 - 真正的宽屏布局 */
.main-content {
  padding: 2rem 3rem;
  width: 100%;
  min-width: 1200px;
}

.input-section,
.editor-section {
  width: 100%;
  max-width: none;
  margin: 0 auto 2rem auto;
}

/* 大屏幕适配 */
@media (min-width: 1600px) {
  .main-content {
    padding: 2rem 5rem;
  }

  .input-section,
  .editor-section {
    padding: 3rem;
  }
}

/* 中等屏幕适配 */
@media (max-width: 1599px) and (min-width: 1200px) {
  .main-content {
    padding: 1.5rem 2rem;
  }
}

/* 小屏幕适配 - 开始缩小 */
@media (max-width: 1199px) {
  .main-content {
    min-width: auto;
    padding: 1.5rem 2rem;
  }

  .input-section,
  .editor-section {
    padding: 2rem;
  }
}

/* 手机端适配 */
@media (max-width: 768px) {
  .main-content {
    min-width: auto;
    padding: 1rem;
  }
  .header {
    padding: 2rem 1rem 1rem;
  }

  .main-content {
    padding: 1rem;
  }

  .input-section,
  .editor-section {
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .logo {
    flex-direction: column;
    gap: 0.5rem;
  }

  .logo-icon {
    font-size: 2rem;
  }

  .logo-text {
    font-size: 1.8rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .input-group {
    flex-direction: column;
  }

  .html-actions {
    flex-direction: column;
  }

  .editor-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .editor-actions {
    flex-wrap: wrap;
  }

  .tab-btn {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
}
</style>
