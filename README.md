# 🚀 LangExtract Web

基于大语言模型的智能文本信息提取平台，使用 Next.js + Vercel 技术栈开发。

## ✨ 核心功能

- **智能信息提取** - 使用大语言模型从非结构化文本中提取结构化信息
- **精确定位** - 每个提取实体都有原文位置信息，支持字符级别定位
- **关系抽取** - 通过属性建立实体间关系，支持复杂信息结构
- **交互可视化** - 实时动画展示提取结果，支持交互式浏览
- **多模型支持** - 支持 Gemini、OpenAI 等多种语言模型
- **示例驱动** - 通过 Few-shot Learning 提高提取准确性
- **长文档处理** - 智能分块处理，支持任意长度文档
- **多轮提取** - 通过多次提取提高召回率和完整性

## 🏗️ 技术架构

### 前端技术栈
- **Next.js 15** - React 全栈框架
- **TypeScript** - 类型安全的开发体验
- **Tailwind CSS** - 原子化 CSS 框架
- **Radix UI** - 高质量的 React 组件库
- **Lucide React** - 美观的图标库

### 核心模块
- **数据类型** (`/lib/types.ts`) - 完整的 TypeScript 类型定义
- **工具函数** (`/lib/utils.ts`) - 通用工具和验证函数
- **API 路由** (`/app/api/extract/route.ts`) - 提取服务 Mock 实现
- **表单组件** (`/components/features/extraction-form.tsx`) - 智能提取表单
- **可视化组件** (`/components/features/extraction-visualizer.tsx`) - 交互式结果展示

### 数据流
1. 用户输入文本、提取指令和示例数据
2. 前端验证并发送请求到 `/api/extract`
3. 后端调用 LLM API 进行信息提取
4. 返回包含位置信息的结构化提取结果
5. 前端进行交互式可视化展示

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm/yarn/pnpm

### 安装依赖

```bash
cd idp/langextract-web
npm install
```

### 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
npm start
```

## 📝 使用指南

### 1. 信息提取

1. **输入文本** - 在文本框中输入需要处理的内容
2. **编写指令** - 描述需要提取的信息类型和要求
3. **提供示例** - 至少添加一个示例，展示期望的提取结果
4. **配置 API** - 输入 Gemini 或其他模型的 API 密钥
5. **开始提取** - 点击按钮开始处理

### 2. 结果展示

- **实时动画** - 自动播放提取结果，支持播放控制
- **交互浏览** - 点击进度条跳转到特定实体
- **属性展示** - 查看每个实体的详细属性信息
- **统计分析** - 查看提取统计和类别分布
- **导出结果** - 下载 JSON 格式的完整结果

### 3. 历史管理

- **任务历史** - 查看所有提取任务记录
- **快速加载** - 点击历史记录快速加载结果
- **状态跟踪** - 实时显示任务处理状态

## 🎯 示例用法

### 新闻信息提取

**输入文本：**
```
北京时间2024年1月15日，特斯拉公司发布第四季度财报。CEO埃隆·马斯克在电话会议中宣布，公司全年营收达到967亿美元，同比增长19%。
```

**提取指令：**
```
从商业新闻中提取关键信息：
- 公司名称和人物
- 时间和地点  
- 财务数据和产品信息

要求：使用原文精确文本，为每个实体提供相关属性。
```

**期望结果：**
- 公司: 特斯拉公司 (行业: 汽车, 类型: 上市公司)
- 人物: 埃隆·马斯克 (职位: CEO, 公司: 特斯拉公司)
- 时间: 2024年1月15日 (类型: 财报发布日期)
- 营收: 967亿美元 (货币: 美元, 期间: 全年)

## 🚀 部署到 Vercel

### 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/langextract-web&env=GEMINI_API_KEY,DEFAULT_MODEL_PROVIDER&envDescription=API%20keys%20for%20LLM%20services&envLink=https://github.com/your-repo/langextract-web/blob/main/DEPLOYMENT.md)

### 环境变量配置

在 Vercel 项目设置中配置以下环境变量：

#### 必需的环境变量
- `GEMINI_API_KEY` - 您的 Gemini API 密钥
- `DEFAULT_MODEL_PROVIDER` - 默认提供商（`gemini` 或 `openai`）

#### 可选的环境变量
- `OPENAI_API_KEY` - OpenAI API 密钥（如需支持 OpenAI 模型）
- `DEBUG` - 调试模式（`true` 或 `false`）
- `MAX_CONCURRENT_REQUESTS` - 最大并发请求数（默认：10）
- `REQUEST_TIMEOUT` - 请求超时时间，毫秒（默认：30000）

### 手动部署

1. **连接 GitHub** - 将代码推送到 GitHub 仓库
2. **导入项目** - 在 Vercel 中导入 GitHub 项目
3. **配置环境变量** - 设置上述必需的环境变量
4. **自动部署** - Vercel 自动构建和部署

详细部署说明请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)。

## 📄 许可证

本项目基于 [Apache License 2.0](LICENSE) 开源协议。

## 🙏 致谢

- [LangExtract](https://github.com/google/langextract) - 原始 Python 库
- [Next.js](https://nextjs.org) - React 全栈框架
- [Tailwind CSS](https://tailwindcss.com) - CSS 框架
- [Radix UI](https://radix-ui.com) - 组件库
- [Vercel](https://vercel.com) - 部署平台

---

**开发者:** 基于 Google LangExtract 项目的 Web 版本实现  
**技术栈:** Next.js + TypeScript + Tailwind CSS + Vercel  
**版本:** 1.0.0
