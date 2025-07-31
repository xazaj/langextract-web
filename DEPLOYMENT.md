# 🚀 Vercel 部署指南

本文档详细介绍如何将 LangExtract Web 部署到 Vercel，并配置环境变量。

## 📋 部署前准备

### 1. 获取 API 密钥

**Gemini API 密钥（推荐）**
- 访问：[Google AI Studio](https://aistudio.google.com/app/apikey)
- 注册/登录 Google 账户
- 点击 "Create API Key" 创建密钥
- 复制生成的 API Key

**OpenAI API 密钥（可选）**
- 访问：[OpenAI Platform](https://platform.openai.com/api-keys)
- 注册/登录 OpenAI 账户
- 创建新的 API Key
- 复制生成的 API Key

### 2. 准备代码仓库

```bash
# 如果还没有 Git 仓库，初始化一个
cd langextract-web
git init
git add .
git commit -m "Initial commit: LangExtract Web"

# 推送到 GitHub（替换为您的仓库地址）
git remote add origin https://github.com/your-username/langextract-web.git
git branch -M main
git push -u origin main
```

## 🚀 一键部署

点击下面的按钮直接部署到 Vercel：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/langextract-web&env=GEMINI_API_KEY,DEFAULT_MODEL_PROVIDER&envDescription=API%20keys%20for%20LLM%20services&envLink=https://github.com/your-username/langextract-web/blob/main/DEPLOYMENT.md)

## 📝 手动部署步骤

### 步骤 1: 导入项目到 Vercel

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "New Project"
3. 连接您的 GitHub 账户（如果尚未连接）
4. 选择 `langextract-web` 仓库
5. 点击 "Import"

### 步骤 2: 配置环境变量

在 Vercel 项目设置中添加以下环境变量：

#### 必需的环境变量

| 变量名 | 值 | 说明 |
|--------|----|---------|
| `GEMINI_API_KEY` | `your_gemini_api_key_here` | Gemini API 密钥 |
| `DEFAULT_MODEL_PROVIDER` | `gemini` | 默认模型提供商 |

#### 可选的环境变量

| 变量名 | 值 | 说明 |
|--------|----|---------|
| `OPENAI_API_KEY` | `your_openai_api_key_here` | OpenAI API 密钥（可选） |
| `DEBUG` | `false` | 是否启用调试模式 |
| `MAX_CONCURRENT_REQUESTS` | `10` | 最大并发请求数 |
| `REQUEST_TIMEOUT` | `30000` | 请求超时时间（毫秒） |

### 步骤 3: 部署配置

Vercel 会自动检测到这是一个 Next.js 项目。确认以下设置：

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

### 步骤 4: 部署

1. 确认所有配置正确
2. 点击 "Deploy"
3. 等待构建完成（通常需要 2-5 分钟）
4. 部署成功后，您将获得一个 `.vercel.app` 域名

## ⚙️ 环境变量配置详解

### 在 Vercel Dashboard 中配置

1. 进入您的项目 Dashboard
2. 点击 "Settings" 标签
3. 在左侧菜单选择 "Environment Variables"
4. 点击 "Add" 添加新变量

### 环境变量配置示例

```env
# 基础配置
GEMINI_API_KEY=AIzaSyC...
DEFAULT_MODEL_PROVIDER=gemini

# 可选配置
OPENAI_API_KEY=sk-...
DEBUG=false
MAX_CONCURRENT_REQUESTS=10
REQUEST_TIMEOUT=30000
```

### 不同环境的配置

您可以为不同环境设置不同的变量值：

- **Production**: 生产环境使用的配置
- **Preview**: 预览分支使用的配置
- **Development**: 本地开发使用的配置

## 🔧 部署后配置

### 1. 验证部署

访问您的部署 URL，检查：
- ✅ 页面正常加载
- ✅ 可以打开提取表单
- ✅ API 健康检查端点：`https://your-app.vercel.app/api/extract`

### 2. 测试 API 配置

访问 API 健康检查端点，确认：
```json
{
  "status": "ok",
  "message": "LangExtract API is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": {
    "environment": "production",
    "defaultProvider": "gemini",
    "availableProviders": {
      "gemini": true,
      "openai": false
    },
    "recommendedProvider": "gemini"
  }
}
```

### 3. 自定义域名（可选）

1. 在 Vercel 项目设置中选择 "Domains"
2. 添加您的自定义域名
3. 按照指引配置 DNS 记录
4. 等待 SSL 证书自动配置

## 🔄 更新部署

### 自动部署

Vercel 已配置自动部署：
- 推送到 `main` 分支 → 自动部署到生产环境
- 推送到其他分支 → 创建预览部署

### 手动重新部署

1. 在 Vercel Dashboard 中选择项目
2. 在 "Deployments" 标签中
3. 点击最新部署右侧的 "..." 菜单
4. 选择 "Redeploy"

## 🛠️ 故障排除

### 常见问题

**1. 构建失败**
```
Error: Cannot find module '@/lib/config'
```
**解决方案**: 确保所有文件都已提交到 Git 仓库

**2. API 密钥错误**
```
{
  "success": false,
  "error": "GEMINI API Key 未配置"
}
```
**解决方案**: 检查 Vercel 环境变量配置

**3. 超时错误**
```
Function execution timed out
```
**解决方案**: 检查 `vercel.json` 中的 `maxDuration` 设置

### 调试步骤

1. **检查构建日志**：在 Vercel Dashboard 的 "Functions" 标签查看详细日志
2. **启用调试模式**：设置环境变量 `DEBUG=true`
3. **查看运行时日志**：在 "Functions" 标签中查看实时日志
4. **本地测试**：使用 `vercel dev` 在本地测试生产环境

### 获取帮助

如果遇到问题：
1. 查看 [Vercel 文档](https://vercel.com/docs)
2. 检查项目的 GitHub Issues
3. 联系技术支持

## 📊 监控和分析

### Vercel Analytics

1. 在项目设置中启用 "Analytics"
2. 查看页面性能和用户访问数据

### 自定义监控

可以集成第三方监控服务：
- **Sentry**: 错误监控
- **LogRocket**: 用户会话录制
- **Google Analytics**: 用户行为分析

## 🔒 安全考虑

1. **API 密钥安全**
   - 仅在 Vercel 环境变量中存储 API 密钥
   - 定期轮换 API 密钥
   - 监控 API 使用情况

2. **访问控制**
   - 考虑添加身份验证（如果需要）
   - 设置 API 速率限制
   - 监控异常使用模式

3. **数据隐私**
   - 不在客户端存储敏感数据
   - 确保用户输入的文本不被永久存储
   - 遵守数据保护法规

---

🎉 **恭喜！** 您已成功将 LangExtract Web 部署到 Vercel。

现在用户可以通过 Web 界面使用智能文本信息提取功能，而您可以在 Vercel 控制台中安全地管理 API 密钥。
