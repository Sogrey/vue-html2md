<template>
  <div id="markdown-container"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import 'cherry-markdown/dist/cherry-markdown.css'
import Cherry from 'cherry-markdown'
import cherryMarkdownConfig from '@/configs/cherry-markdown-config'

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
    // 创建配置对象，基于配置文件并动态设置属性
    const config = {
      id: 'markdown-container',
      value: props.value || '',
      
      // 外部依赖配置
      externals: cherryMarkdownConfig.externals,
      
      // 核心配置
      config: {
        // 编辑器配置
        editor: {
          ...cherryMarkdownConfig.editor,
          height: props.height,
        },
        
        // 预览器配置
        previewer: {
          ...cherryMarkdownConfig.previewer,
          theme: props.theme,
          codeBlockTheme: props.theme === 'dark' ? 'one-dark' : 'github',
        },
        
        // 工具栏配置
        toolbars: cherryMarkdownConfig.toolbars,
        
        // 引擎配置
        engine: cherryMarkdownConfig.engine,
        
        // 主题配置
        themeSettings: {
          ...cherryMarkdownConfig.themeSettings,
          mainTheme: props.theme === 'dark' ? 'dark' : 'default',
          codeBlockTheme: props.theme === 'dark' ? 'one-dark' : 'github',
        },
        
        // 其他配置
        isPreviewOnly: cherryMarkdownConfig.isPreviewOnly,
        multipleFileSelection: cherryMarkdownConfig.multipleFileSelection,
        drawioIframeUrl: cherryMarkdownConfig.drawioIframeUrl,
        keydown: cherryMarkdownConfig.keydown,
        autoScrollByHashAfterInit: cherryMarkdownConfig.autoScrollByHashAfterInit,
        
        // 回调函数
        callback: {
          ...cherryMarkdownConfig.callback,
          afterChange: (markdown: string) => {
            try {
              emit('change', markdown)
            } catch (e) {
              console.warn('Callback error:', e)
            }
          },
        },
      },
    }

    cherry = new Cherry(config)
    console.log('Cherry Markdown initialized successfully')
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
  height: v-bind('props.height');
  border: 1px solid #30363d;
  border-radius: 6px;
  overflow: hidden;
  background: #0d1117;
}

/* 浅色主题 */
#markdown-container[data-theme='light'] {
  background: #fff;
  border-color: #e1e4e8;
}

/* 确保 Cherry Markdown 的工具栏样式适配暗色主题 */
#markdown-container .cherry-toolbar {
  background: #161b22;
  border-bottom: 1px solid #30363d;
}

#markdown-container[data-theme='light'] .cherry-toolbar {
  background: #f6f8fa;
  border-bottom-color: #e1e4e8;
}

/* 编辑器区域样式 */
#markdown-container .cherry-editor .CodeMirror {
  background: #0d1117;
  color: #c9d1d9;
}

#markdown-container[data-theme='light'] .cherry-editor .CodeMirror {
  background: #fff;
  color: #24292f;
}

/* 预览区域样式 */
#markdown-container .cherry-preview {
  background: #0d1117;
  color: #c9d1d9;
}

#markdown-container[data-theme='light'] .cherry-preview {
  background: #fff;
  color: #24292f;
}

/* 代码块样式 */
#markdown-container .cherry-preview pre {
  background: #161b22;
  border-color: #30363d;
}

#markdown-container[data-theme='light'] .cherry-preview pre {
  background: #f6f8fa;
  border-color: #d1d9e0;
}
</style>
