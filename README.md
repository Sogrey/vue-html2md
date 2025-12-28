# HTML2MD - 网页转Markdown工具

一个现代化的在线工具，将网页URL或HTML片段转换为精美的Markdown文档。

## ✨ 功能特性

- 🌐 **URL抓取转换** - 输入网页URL，自动抓取并转换为Markdown
- 📝 **HTML片段转换** - 粘贴HTML代码，即时转换为Markdown  
- 🎨 **现代化界面** - 渐进式科技风格，美观实用
- ⚡ **实时预览** - 支持编辑、预览、分屏三种模式
- 💾 **便捷导出** - 一键复制到剪贴板或下载为.md文件
- 🔧 **智能提取** - 使用Mozilla Readability算法提取正文内容
- 📱 **响应式设计** - 完美适配移动端和桌面端

## 🛠️ 技术栈

- **前端**: Vue 3 + TypeScript + Vite
- **转换引擎**: turndown.js (HTML → Markdown)
- **编辑器**: 自研Markdown编辑器 (支持编辑/预览/分屏)
- **后端代理**: Node.js + Express + JSDOM + @mozilla/readability
- **样式**: 现代化CSS + 渐变色主题

## 🚀 快速开始

### 环境要求

- Node.js 18+
- pnpm (推荐) 或 npm

### 安装依赖

```bash
pnpm install
```

### 启动开发环境

**方式一：同时启动前端和后端**
```bash
pnpm run dev:full
```

**方式二：分别启动**
```bash
# 终端1: 启动后端代理服务 (端口 3001)
pnpm run server

# 终端2: 启动前端开发服务 (端口 5173)  
pnpm run dev
```

### 构建生产版本

```bash
pnpm run build
```

### 预览生产版本

```bash
pnpm run preview
```

## 📁 项目结构

```
├── src/
│   ├── components/
│   │   └── CherryMarkdown.vue      # Markdown编辑器组件
│   ├── views/
│   │   └── HomeView.vue           # 主页面组件
│   ├── router/                     # 路由配置
│   ├── App.vue                     # 根组件
│   └── main.ts                     # 入口文件
├── server.js                       # 后端代理服务器
├── public/                         # 静态资源
└── docs/                          # 文档
```

## 🔧 API说明

### 后端接口

#### GET `/api/fetch?url=<URL>&extractMain=<boolean>`

抓取网页内容并转换为HTML

**参数:**
- `url` (必填): 要抓取的网页URL
- `extractMain` (可选): 是否仅提取正文内容，默认true

**响应:**
```json
{
  "success": true,
  "html": "<html>...</html>",
  "url": "最终重定向的URL",
  "title": "页面标题"
}
```

#### GET `/health`

健康检查接口

## 🎨 界面设计

- **主题色彩**: 紫色渐变科技风 (#667eea → #764ba2)
- **布局**: PC宽屏优先，响应式适配移动端
- **交互**: 平滑动画过渡 + 悬浮效果
- **组件**: 模块化设计，易于维护

### 响应式设计

- **超宽屏 (≥1920px)**: 最大内容宽度1600px，字体17px
- **宽屏 (≥1600px)**: 内容宽度最大1600px，字体16px  
- **桌面端 (≥1200px)**: 内容宽度最大1400px，字体15px
- **平板端 (≤1024px)**: 适度缩放，保持可读性
- **手机端 (≤768px)**: 垂直布局，优化触屏操作

## 🚀 部署

### Vercel部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

### Docker部署

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [turndown.js](https://github.com/mixmark-io/turndown) - HTML到Markdown转换
- [Cherry Markdown](https://github.com/Tencent/cherry-markdown) - Markdown编辑器灵感
- [Mozilla Readability](https://github.com/mozilla/readability) - 正文内容提取
- [Vue 3](https://vuejs.org/) - 前端框架

---

Made with ❤️ by [Sogrey](https://github.com/sogrey)
