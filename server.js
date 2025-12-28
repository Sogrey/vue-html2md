import express from 'express'
import { Readability } from '@mozilla/readability'
import { JSDOM } from 'jsdom'
import cors from 'cors'
import axios from 'axios'

const app = express()
const PORT = 3001

// 中间件
app.use(cors())
app.use(express.json())

// URL抓取代理接口
app.get('/api/fetch', async (req, res) => {
  try {
    const { url, extractMain = 'true' } = req.query
    
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' })
    }
    
    // 验证URL格式
    try {
      new URL(url)
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' })
    }
    
    // 设置请求头，模拟浏览器
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    }
    
    // 获取网页内容
    const response = await axios.get(url, {
      headers,
      timeout: 10000,
      maxRedirects: 5
    })
    
    let html = response.data
    
    // 如果需要提取正文内容
    if (extractMain === 'true') {
      const dom = new JSDOM(html, { url })
      const reader = new Readability(dom.window.document)
      const article = reader.parse()
      
      if (article) {
        html = article.content
      }
    }
    
    res.json({ 
      success: true, 
      html,
      url: response.url,
      title: extractMain === 'true' ? 
        (new JSDOM(html).window.document.title || '') : ''
    })
    
  } catch (error) {
    console.error('Fetch error:', error)
    
    let errorMessage = 'Failed to fetch URL'
    
    if (error.response) {
      errorMessage = `HTTP ${error.response.status}: ${error.response.statusText}`
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout'
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'DNS resolution failed'
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: error.message 
    })
  }
})

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🔗 Fetch API: http://localhost:${PORT}/api/fetch?url=<URL>`)
})