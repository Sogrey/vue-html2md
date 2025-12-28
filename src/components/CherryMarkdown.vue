<template>
  <div id="markdown-container" class="cherry-editor-container"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import 'cherry-markdown/dist/cherry-markdown.css'
import Cherry from 'cherry-markdown'

// 声明全局变量类型
declare global {
  interface Window {
    echarts?: any
    katex?: any
    MathJax?: any
  }
}

interface Props {
  value?: string
  height?: string
  theme?: string
}

interface Emits {
  (e: 'change', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  value: '',
  height: '500px',
  theme: 'dark',
})

const emit = defineEmits<Emits>()

let cherry: Cherry | null = null

const initCherry = () => {
  try {
    // 检查 KaTeX 是否加载
    if (!window.katex) {
      console.warn('KaTeX not loaded, math formulas may not render correctly')
    }

    // 创建本地配置（优先级最高）
    const localConfig: any = {
      // 编辑器配置 - 本地优先
      editor: {
        // 不设置固定高度，让编辑器自然展开
        defaultModel: 'edit&preview',
        showSuggestList: true,
        codemirror: {
          placeholder: '输入文本或「/」开始编辑',
        },
      },

      // 主题配置 - 本地优先
      themeSettings: {
        mainTheme: props.theme === 'dark' ? 'dark' : 'default',
        codeBlockTheme: props.theme === 'dark' ? 'one-dark' : 'github',
      },

      // 数学公式配置 - 本地优先
      engine: {
        syntax: {
          mathBlock: {
            engine: 'katex',
          },
          inlineMath: {
            engine: 'katex',
          },
        },
      },

      // 外部依赖配置 - 本地优先
      externals: {
        echarts: window.echarts,
        katex: window.katex,
        MathJax: window.MathJax,
      },
    }

    // 最终配置对象
    const config: any = {
      id: 'markdown-container',
      value: props.value || '# 欢迎使用 Cherry Markdown\n\n在这里输入 Markdown 文本',
      ...localConfig,

      // 回调函数 - 总是使用本地定义的
      callback: {
        afterChange: (markdown: string) => {
          try {
            emit('change', markdown)
          } catch (e) {
            console.warn('Callback error:', e)
          }
        },
      },
    }

    cherry = new Cherry(config as any)
    console.log('Cherry Markdown initialized successfully')

    // 在初始化后动态设置选中样式
    setTimeout(() => {
      const editorElement = document.querySelector('#markdown-container .cherry-editor')
      if (editorElement) {
        const style = document.createElement('style')
        style.textContent = `
          #markdown-container .CodeMirror-selected {
            background-color: rgba(56, 139, 253, 0.6) !important;
            background: rgba(56, 139, 253, 0.6) !important;
          }
          #markdown-container ::selection {
            background-color: rgba(56, 139, 253, 0.6) !important;
            background: rgba(56, 139, 253, 0.6) !important;
          }
          #markdown-container *::selection {
            background-color: rgba(56, 139, 253, 0.6) !important;
            background: rgba(56, 139, 253, 0.6) !important;
          }
        `
        editorElement.appendChild(style)
      }
    }, 100)
  } catch (error) {
    console.error('Failed to initialize Cherry Markdown:', error)
  }
}

// 监听 value 变化
watch(
  () => props.value,
  (newValue) => {
    if (cherry && newValue !== cherry.getMarkdown()) {
      cherry.setMarkdown(newValue, true)
    }
  },
)

// 监听主题变化
watch(
  () => props.theme,
  (newTheme) => {
    if (cherry) {
      cherry.setTheme(newTheme)
    }
  },
)

onMounted(() => {
  initCherry()
})

onUnmounted(() => {
  if (cherry) {
    cherry.destroy()
  }
})
</script>

<style scoped>
/* 自定义 Cherry Markdown 样式 */
#markdown-container {
  width: 100%;
  min-height: v-bind('props.height');
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px;
  overflow: hidden;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(10px);
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 0 0 1px rgba(59, 130, 246, 0.2);
}

/* 浅色主题 */
#markdown-container[data-theme='light'] {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(59, 130, 246, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

/* 确保 Cherry Markdown 的工具栏样式适配暗色主题 */
#markdown-container .cherry-toolbar {
  background: rgba(15, 23, 42, 0.9);
  border-bottom: 1px solid rgba(59, 130, 246, 0.3);
  backdrop-filter: blur(10px);
}

#markdown-container[data-theme='light'] .cherry-toolbar {
  background: rgba(255, 255, 255, 0.95);
  border-bottom-color: rgba(59, 130, 246, 0.2);
}

/* 编辑器区域样式 */
#markdown-container .cherry-editor .CodeMirror {
  background: rgba(15, 23, 42, 0.7);
  color: #e2e8f0;
  border: 1px solid rgba(59, 130, 246, 0.1);
}

/* 选中文字样式 - 针对 CodeMirror 的具体类名 */
#markdown-container .CodeMirror .CodeMirror-selected {
  background: rgba(56, 139, 253, 0.4) !important;
}

#markdown-container .cm-s-default .CodeMirror-selected {
  background: rgba(56, 139, 253, 0.4) !important;
}

#markdown-container .CodeMirror-wrap .CodeMirror-selected {
  background: rgba(56, 139, 253, 0.4) !important;
}

/* 通用选中样式 */
#markdown-container .CodeMirror ::selection {
  background: rgba(56, 139, 253, 0.4) !important;
}

#markdown-container .CodeMirror ::-moz-selection {
  background: rgba(56, 139, 253, 0.4) !important;
}

#markdown-container .CodeMirror *::selection {
  background: rgba(56, 139, 253, 0.4) !important;
}

#markdown-container .CodeMirror *::-moz-selection {
  background: rgba(56, 139, 253, 0.4) !important;
}

/* 光标样式 */
#markdown-container .CodeMirror .CodeMirror-cursor {
  border-left: 2px solid #58a6ff;
}

#markdown-container[data-theme='light'] .cherry-editor .CodeMirror {
  background: rgba(255, 255, 255, 0.9);
  color: #1e293b;
  border-color: rgba(59, 130, 246, 0.1);
}

#markdown-container[data-theme='light'] .CodeMirror .CodeMirror-selected {
  background: rgba(3, 102, 214, 0.3) !important;
}

#markdown-container[data-theme='light'] .cm-s-default .CodeMirror-selected {
  background: rgba(3, 102, 214, 0.3) !important;
}

#markdown-container[data-theme='light'] .CodeMirror-wrap .CodeMirror-selected {
  background: rgba(3, 102, 214, 0.3) !important;
}

#markdown-container[data-theme='light'] .CodeMirror ::selection {
  background: rgba(3, 102, 214, 0.3) !important;
}

#markdown-container[data-theme='light'] .CodeMirror ::-moz-selection {
  background: rgba(3, 102, 214, 0.3) !important;
}

#markdown-container[data-theme='light'] .CodeMirror *::selection {
  background: rgba(3, 102, 214, 0.3) !important;
}

#markdown-container[data-theme='light'] .CodeMirror *::-moz-selection {
  background: rgba(3, 102, 214, 0.3) !important;
}

/* 预览区域样式 */
#markdown-container .cherry-preview {
  background: rgba(15, 23, 42, 0.7);
  color: #e2e8f0;
  border: 1px solid rgba(59, 130, 246, 0.1);
}

#markdown-container[data-theme='light'] .cherry-preview {
  background: rgba(255, 255, 255, 0.9);
  color: #1e293b;
  border-color: rgba(59, 130, 246, 0.1);
}

/* 代码块样式 */
#markdown-container .cherry-preview pre {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

#markdown-container[data-theme='light'] .cherry-preview pre {
  background: rgba(246, 248, 250, 0.9);
  border-color: rgba(59, 130, 246, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* KaTeX 数学公式样式 */
#markdown-container .cherry-preview .katex {
  font-size: 1.1em;
}

#markdown-container .cherry-preview .katex-display {
  margin: 1em 0;
  text-align: center;
}

#markdown-container[data-theme='light'] .cherry-preview .katex {
  color: #24292f;
}

#markdown-container .cherry-preview .katex {
  color: #c9d1d9;
}

/* 调试样式 - 让所有可能的选中类都显示背景 */
#markdown-container *::selection {
  background: rgba(56, 139, 253, 0.6) !important;
}

#markdown-container *::-moz-selection {
  background: rgba(56, 139, 253, 0.6) !important;
}

/* 强制选中样式 - 最高优先级，覆盖所有可能的类 */
#markdown-container .CodeMirror-selected,
#markdown-container .CodeMirror .CodeMirror-selected,
#markdown-container .cm-s-default .CodeMirror-selected,
#markdown-container .CodeMirror-wrap .CodeMirror-selected,
#markdown-container .cherry-editor .CodeMirror-selected,
#markdown-container .cherry-editor .CodeMirror .CodeMirror-selected {
  background-color: rgba(56, 139, 253, 0.6) !important;
  background: rgba(56, 139, 253, 0.6) !important;
}

/* 选中时的文本前景色调整 */
#markdown-container .CodeMirror .CodeMirror-selectedtext {
  color: white !important;
  background-color: rgba(56, 139, 253, 0.6) !important;
}

/* 轻色主题强制选中样式 */
#markdown-container[data-theme='light'] *::selection {
  background: rgba(3, 102, 214, 0.5) !important;
}

#markdown-container[data-theme='light'] *::-moz-selection {
  background: rgba(3, 102, 214, 0.5) !important;
}

#markdown-container[data-theme='light'] .CodeMirror-selected,
#markdown-container[data-theme='light'] .CodeMirror .CodeMirror-selected,
#markdown-container[data-theme='light'] .cm-s-default .CodeMirror-selected,
#markdown-container[data-theme='light'] .CodeMirror-wrap .CodeMirror-selected,
#markdown-container[data-theme='light'] .cherry-editor .CodeMirror-selected {
  background-color: rgba(3, 102, 214, 0.5) !important;
  background: rgba(3, 102, 214, 0.5) !important;
}

#markdown-container[data-theme='light'] .CodeMirror .CodeMirror-selectedtext {
  color: white !important;
  background-color: rgba(3, 102, 214, 0.5) !important;
}

/* 全局通用选中样式 - 最后的保险 */
*::selection {
  background: rgba(56, 139, 253, 0.6) !important;
}

*::-moz-selection {
  background: rgba(56, 139, 253, 0.6) !important;
}
</style>
