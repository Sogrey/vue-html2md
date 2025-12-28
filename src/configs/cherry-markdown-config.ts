import * as echarts from 'echarts'

// 声明全局变量类型
declare global {
  interface Window {
    katex?: any
    MathJax?: any
  }
}

const cherryMarkdownConfig = {
  id: 'markdown-container',
  externals: {
    echarts: echarts,
    katex: window.katex,
    MathJax: window.MathJax,
  },
  isPreviewOnly: false,
  engine: {
    global: {
      htmlAttrWhiteList: 'part|slot',
      flowSessionContext: false,
    },
    syntax: {
      link: {
        attrRender: (text: string, href: string) => {
          return ''
        },
      },
      image: {
        videoWrapper: (link: string, type: string, defaultWrapper: string) => {
          console.log(type)
          return defaultWrapper
        },
      },
      autoLink: {
        target: '',
        rel: '',
        enableShortLink: true,
        shortLinkLength: 20,
        attrRender: (text: string, href: string) => {
          return ''
        },
      },
      codeBlock: {
        theme: 'twilight',
        lineNumber: true,
        expandCode: false,
        copyCode: true,
        editCode: false,
        changeLang: true,
        wrapperRender: (lang: string, code: string, html: string) => {
          return `<div class="custom-codeblock-wrapper language-${lang}" data-tips="可以自定义代码块外层容器">${html}</div>`
        },
        customBtns: [],
        customRenderer: {},
      },
      table: {
        enableChart: false, // 禁用图表功能，避免 echarts 依赖问题
        autoAlign: true,
      },
      fontEmphasis: {
        allowWhitespace: false,
      },
      strikethrough: {
        needWhitespace: false,
      },
      mathBlock: {
        engine: 'katex', // 使用 katex 作为数学公式引擎
      },
      inlineMath: {
        engine: 'katex',
      },
      emoji: {
        useUnicode: true,
        customResourceURL: 'https://github.githubassets.com/images/icons/emoji/unicode/${code}.png?v8',
        upperCase: false,
      },
      htmlBlock: {
        removeTrailingNewline: false,
      },
      panel: {
        enableJustify: true,
        enablePanel: true,
      },
      footNote: {
        refNumber: {
          appendClass: 'ref-number',
          render: (refNum: string, refTitle: string) => `[${refNum}]`,
          clickRefNumberCallback: (event: Event, refNum: string, refTitle: string, content: string) => {
            // 可以在这里添加点击回调逻辑
          },
        },
        refList: {
          appendClass: 'ref-list',
          title: {
            appendClass: 'ref-list-title',
            render: () => '',
          },
          listItem: {
            appendClass: 'ref-list-item',
            render: (refNum: string, refTitle: string, content: string, refNumberLinkRender: Function) => {
              return `${refNumberLinkRender(refNum, refTitle)}${content}`
            },
          },
        },
        bubbleCard: {
          appendClass: 'bubble-card',
          render: (refNum: string, refTitle: string, content: string) => {
            return `
              <div class="cherry-ref-bubble-card__title">${refNum}. ${refTitle}</div>
              <div class="cherry-ref-bubble-card__content">${content}</div>
              <div class="cherry-ref-bubble-card__foot"></div>
            `
          },
        },
      },
      header: true,
      list: true,
      mermaid: false,
    },
    customSyntax: {},
  },
  multipleFileSelection: {
    video: true,
    audio: false,
    image: true,
    word: false,
    pdf: true,
    file: true,
  },
  toolbars: {
    toolbar: [
      'bold',
      'italic',
      'underline',
      'strikethrough',
      '|',
      'header',
      'list',
      'ordered-list',
      'checklist',
      '|',
      'code',
      'code-block',
      '|',
      'link',
      'image',
      'table',
      '|',
      'undo',
      'redo',
      'clean',
      '|',
      'togglePreview',
      'fullscreen',
    ],
    toolbarRight: ['fullScreen', '|', 'export', 'changeLocale', 'wordCount'],
    bubble: false,
    float: false,
    sidebar: ['mobilePreview', 'copy', 'theme'],
    toc: {
      defaultModel: 'full',
    },
    customMenu: {},
    shortcutKeySettings: {
      isReplace: false,
      shortcutKeyMap: {
        'Alt-Digit1': {
          hookName: 'header',
          aliasName: '标题',
        },
        'Control-Shift-KeyX': {
          hookName: 'bold',
          aliasName: '加粗',
        },
      },
    },
    config: {
      mapTable: {
        sourceUrl: [
          'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json',
          './assets/data/china.json',
        ],
      },
    },
  },
  drawioIframeUrl: './drawio_demo.html',
  previewer: {
    floatWhenClosePreviewer: false,
    enablePreviewerBubble: false,
  },
  keydown: [],
  callback: {
    onClickPreview: (event: Event) => {
      console.log('onClickPreview', event)
    },
    afterAsyncRender: (md: string, html: string) => {
      console.log('afterAsyncRender', md, html)
    },
    urlProcessor(url: string, srcType: string) {
      console.log('url-processor', url, srcType)
      return url
    },
  },
  editor: {
    autoSave2Textarea: false,
    defaultModel: 'edit&preview',
    showFullWidthMark: true,
    showSuggestList: true,
    maxUrlLength: 200,
    codemirror: {
      placeholder: '输入文本或「/」开始编辑',
    },
  },
  autoScrollByHashAfterInit: true,
  themeSettings: {
    mainTheme: 'default',
    codeBlockTheme: 'github',
  },
}

export default cherryMarkdownConfig
