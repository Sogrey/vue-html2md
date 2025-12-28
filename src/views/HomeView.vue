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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #333;
}

.header {
  text-align: center;
  padding: 2.5rem 2rem 1.5rem;
  color: white;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
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

.logo-icon {
  font-size: 2.2rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.logo-text {
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(45deg, #fff, #e0e7ff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
  font-weight: 300;
}

.main-content {
  width: 100%;
  margin: 0 auto;
  padding: 1.5rem 3rem;
}

.input-section {
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  margin: 0 auto 2rem auto;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 100%;
  max-width: none;
}

.input-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #f0f0f0;
}

.tab-btn {
  padding: 1rem 1.5rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  color: #666;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab-btn:hover {
  color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.tab-btn.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.tab-icon {
  font-size: 1.2rem;
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
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.url-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.convert-btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.convert-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.convert-btn.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.convert-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
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

.options {
  display: flex;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: #666;
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
  color: #333;
}

.example-btn {
  padding: 0.5rem 1rem;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.example-btn:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.html-textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 200px;
}

.html-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.html-actions {
  display: flex;
  gap: 1rem;
}

.clear-btn {
  padding: 0.75rem 1.5rem;
  border: 2px solid #e0e0e0;
  background: white;
  color: #666;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-btn:hover {
  border-color: #f44336;
  color: #f44336;
}

.editor-section {
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 100%;
  max-width: none;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.editor-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.editor-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.75rem 1rem;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.action-btn:hover {
  background: #f5f5f5;
  border-color: #667eea;
  color: #667eea;
}

.action-btn.danger:hover {
  border-color: #f44336;
  color: #f44336;
  background: #fff5f5;
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
  padding: 1.5rem 3rem;
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
