# AI Image Analysis - 智能图像分析工具

## Concept & Vision
一款强大的AI图像分析工具，融合极简主义与未来科技感。以纯白为底色配合深邃的黑色元素，营造专业、精确的视觉体验。界面设计灵感来自天文观测台——深邃、专注、探索未知。每一张图像都是通往知识的大门。

## Design Language

### Aesthetic Direction
天文观测台主题 (Observatory Theme)
- 主背景：纯净的近白色 (`#fafafa`)
- 次级背景：柔和的灰色 (`#f5f5f5`)
- 卡片背景：纯白 (`#ffffff`)
- 主色调：深空黑 (`#171717`)
- 辅助色：科技蓝 (`#2563eb`)
- 强调色：星云紫 (`#7c3aed`)
- 边框：浅灰 (`#e5e5e5`)

### Typography
- 主字体：DM Sans (Google Fonts)
- 标题：700 weight
- 正文：400 weight, leading-relaxed
- 标签：小字号，大写字母

### Spatial System
- 基础单位：8px
- 卡片圆角：12px
- 面板间距：24px
- 内边距：20px - 32px

### Motion Philosophy
- 入场动画：淡入 + 微缩放
- 图片上传：优雅的边框动画
- 分析过程：脉冲加载效果
- 结果展示：从下方滑入
- 悬停效果：微妙的阴影变化

## Layout & Structure

### 整体布局
```
┌──────────────────────────────────────────────────────┐
│  Header (Logo + 标题)                                │
├──────────────────────────────────────────────────────┤
│                                                       │
│  ┌─────────────────┐  ┌────────────────────────────┐ │
│  │                 │  │                            │ │
│  │  Image Upload   │  │  Analysis Results         │ │
│  │  Zone           │  │  - Description            │ │
│  │                 │  │  - Tags                   │ │
│  │  (拖拽/点击)     │  │  - Details                │ │
│  │                 │  │  - OCR Text               │ │
│  └─────────────────┘  └────────────────────────────┘ │
│                                                       │
├──────────────────────────────────────────────────────┤
│  Analysis History (可选)                             │
└──────────────────────────────────────────────────────┘
```

### 响应式策略
- 桌面端：双栏布局，图片+结果
- 平板端：堆叠布局
- 移动端：全宽卡片

## Features & Interactions

### 核心功能
1. **图像上传**
   - 拖拽上传
   - 点击选择
   - 粘贴剪贴板图片
   - 支持多种格式（JPG、PNG、GIF、WebP）

2. **智能分析**
   - 图像描述生成
   - 物体检测识别
   - 文字识别（OCR）
   - 颜色分析
   - 图像质量评估

3. **分析结果**
   - 结构化展示
   - 可复制内容
   - 导出报告
   - 分享功能

### 交互细节
- **拖拽上传**：拖入时边框高亮
- **粘贴图片**：Ctrl/Cmd + V
- **分析过程**：进度指示器
- **结果展示**：分类卡片

### 边界情况
- 无图片：提示上传
- 分析失败：错误信息
- 大图片：自动压缩提示
- 不支持的格式：友好提示

## Component Inventory

### UploadZone
- 拖拽区域
- 预览缩略图
- 文件信息
- 重新上传按钮

### AnalysisCard
- 标题图标
- 内容区域
- 操作按钮（复制）

### TagList
- 标签胶囊
- 颜色编码
- 点击复制

### ImagePreview
- 响应式图片
- 加载状态
- 错误状态

## Technical Approach

### 前端技术
- 纯 HTML5 + CSS3 + Vanilla JavaScript
- CSS Grid + Flexbox 布局
- CSS 变量管理主题
- FileReader API 处理图片

### AI 集成
- 预留 OpenAI Vision API 接口
- 支持 GPT-4 Vision 分析
- 兼容多模态模型

### 数据结构
```javascript
// 分析结果
{
  id: string,
  imageData: string (base64),
  description: string,
  tags: string[],
  details: {
    format: string,
    size: { width, height },
    fileSize: number
  },
  ocrText: string,
  colors: string[],
  timestamp: number
}

// 分析选项
{
  analyzeDescription: boolean,
  detectObjects: boolean,
  extractText: boolean,
  analyzeColors: boolean
}
```

### API 配置
```javascript
{
  apiEndpoint: 'https://api.openai.com/v1/chat/completions',
  model: 'gpt-4o' // 支持视觉的模型
}
```

### 简化实现说明
本项目提供完整的UI和分析框架。由于视觉AI API通常需要付费订阅，项目预留了完整的接口，配置API Key后即可使用高级分析功能。
