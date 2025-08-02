# 部署 iPrompt 到 Cloudflare Pages

本文档说明如何将 iPrompt 部署到 Cloudflare Pages。

## 前提条件

- Cloudflare 账号
- GitHub 仓库（推荐）或直接上传构建文件

## 方法一：通过 GitHub 集成（推荐）

1. **登录 Cloudflare Dashboard**
   - 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - 进入 "Workers & Pages" 部分

2. **创建新项目**
   - 点击 "Create application"
   - 选择 "Pages"
   - 点击 "Connect to Git"

3. **连接 GitHub 仓库**
   - 授权 Cloudflare 访问你的 GitHub
   - 选择 iPrompt 仓库
   - 点击 "Begin setup"

4. **配置构建设置**
   - **项目名称**: iprompt（或你喜欢的名称）
   - **生产分支**: main
   - **构建设置**:
     - 构建命令: `npm run build:web`
     - 构建输出目录: `dist`
     - 根目录: `/`
   - **环境变量**:
     - NODE_VERSION: `18`

5. **部署**
   - 点击 "Save and Deploy"
   - 等待构建完成
   - 访问提供的 `.pages.dev` URL

## 方法二：直接上传

1. **本地构建**
   ```bash
   npm install
   npm run build:web
   ```

2. **上传到 Cloudflare Pages**
   - 在 Cloudflare Dashboard 创建新的 Pages 项目
   - 选择 "Upload assets"
   - 上传 `dist` 目录中的所有文件

## 自定义域名

1. 在项目设置中点击 "Custom domains"
2. 添加你的域名
3. 按照指示配置 DNS 记录

## 环境变量

如果需要配置环境变量：
1. 进入项目设置
2. 点击 "Environment variables"
3. 添加所需的变量

## 部署后验证

1. **检查多语言支持**
   - 访问应用并切换语言
   - 确保翻译文件正确加载

2. **测试本地存储**
   - 创建一些提示词
   - 刷新页面确认数据持久化

3. **验证路由**
   - 直接访问子路径
   - 确保 SPA 路由正常工作

## 故障排除

### 构建失败
- 检查 Node.js 版本是否正确设置
- 确保所有依赖都在 `package.json` 中声明

### 404 错误
- 确认 `_redirects` 文件存在于 `public` 目录
- 检查构建输出是否包含该文件

### 静态资源加载失败
- 检查 `vite.config.ts` 中的 `base` 配置
- 确保使用相对路径

## 性能优化

1. **启用自动压缩**
   - Cloudflare 默认启用 Brotli 压缩

2. **配置缓存**
   - 静态资源已在 `wrangler.toml` 中配置长期缓存

3. **使用 Cloudflare CDN**
   - 自动通过 Cloudflare 的全球网络分发

## 更新部署

- 推送到 GitHub 主分支会自动触发重新部署
- 或在 Cloudflare Dashboard 手动触发部署