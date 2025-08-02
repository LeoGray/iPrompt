# iPrompt - 跨平台 Prompt 管理系统

[![CI](https://github.com/LeoGray/iprompt/actions/workflows/ci.yml/badge.svg)](https://github.com/LeoGray/iprompt/actions/workflows/ci.yml)
[![Build and Release](https://github.com/LeoGray/iprompt/actions/workflows/build.yml/badge.svg)](https://github.com/LeoGray/iprompt/actions/workflows/build.yml)

一个支持 Tauri 桌面端和 Web 端的跨平台 Prompt 管理系统，使用 Docker 进行开发和部署。

## 🚀 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FLeoGray%2FiPrompt&project-name=iprompt&repository-name=iprompt&demo-title=iPrompt&demo-description=A%20cross-platform%20prompt%20management%20system&demo-url=https%3A%2F%2Fiprompt.vercel.app)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/LeoGray/iPrompt)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/deploy?template=https%3A%2F%2Fgithub.com%2FLeoGray%2FiPrompt&envs=NODE_ENV&NODE_ENVDesc=Production%20environment&NODE_ENVDefault=production)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/LeoGray/iPrompt)
[![Deploy to DigitalOcean](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/LeoGray/iPrompt/tree/main)
[![Run on Replit](https://replit.com/badge/github/LeoGray/iPrompt)](https://replit.com/new/github/LeoGray/iPrompt)

## 特性

- 🖥️ **跨平台支持**: 同时支持 Web 浏览器和桌面应用（Windows/macOS/Linux）
- 🐳 **Docker 化开发**: 完整的 Docker 开发环境，避免环境配置问题
- 🔄 **版本管理**: 自动追踪 Prompt 的历史版本和变更
- 🌐 **中英文翻译**: 内置翻译功能，支持中英文互译
- 🔍 **智能搜索**: 快速查找和过滤 Prompt
- 📝 **Monaco 编辑器**: 使用 VS Code 同款编辑器，支持语法高亮

## 技术栈

- **前端**: React 18 + TypeScript + Vite
- **UI 框架**: Shadcn/ui + Tailwind CSS
- **状态管理**: Zustand
- **桌面端**: Tauri 2 + Rust
- **数据存储**: localStorage (Web) / 文件系统 (桌面端)
- **开发环境**: Docker + Docker Compose

## 快速开始

### 在线部署

支持多个平台的一键部署：

- **Vercel** - 推荐用于静态网站托管，全球 CDN，自动 HTTPS
- **Netlify** - 另一个优秀的静态网站托管平台
- **Railway** - 支持 Docker 部署，适合需要后端服务的场景
- **Render** - 免费套餐支持静态网站和 Docker 部署
- **DigitalOcean App Platform** - 专业的云平台，支持完整的应用部署
- **Replit** - 在线 IDE，可以直接编辑和运行代码

点击上方对应的部署按钮即可开始。

### 使用 Docker 开发（推荐）

1. 确保已安装 Docker 和 Docker Compose

2. 克隆项目并启动开发环境：
```bash
git clone https://github.com/LeoGray/iprompt.git
cd iprompt
docker-compose up -d
```

3. 访问应用：
   - Web 版本: http://localhost:13000
   - API 健康检查: http://localhost:18080/health

### 本地开发

1. 安装依赖：
```bash
npm install
```

2. 启动开发服务器：
```bash
# Web 版本
npm run dev:web

# Tauri 版本
npm run dev:tauri
```

## 端口配置

所有端口都在默认端口基础上开头加 1，避免与常见服务冲突：

| 服务 | 默认端口 | 实际端口 |
|------|---------|----------|
| Web 前端 | 3000 | 13000 |
| API 后端 | 8080 | 18080 |
| Vite HMR | 5173 | 15173 |
| Tauri Dev | 1420 | 11420 |

## 项目结构

```
├── src/
│   ├── src-tauri/     # Tauri Rust 后端代码
│   ├── app/           # React 应用代码（共享）
│   └── api/           # API 后端代码
├── docker/            # Docker 配置文件
├── public/            # 静态资源
├── docs/              # 文档
│   ├── en/           # 英文文档
│   └── zh/           # 中文文档
└── docker-compose.yml # Docker Compose 配置
```

## 构建和部署

### 构建 Web 版本
```bash
npm run build:web
```

### 构建 Tauri 版本
```bash
npm run build:tauri
```

### Docker 生产部署
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 存储方式说明

### Web 版本 (localStorage)
- **存储位置**: 浏览器本地存储
- **容量限制**: 5-10MB（取决于浏览器）
- **数据持久性**: 清除浏览器数据时会丢失
- **适用场景**: 轻量级使用，快速访问

### 桌面版本 (文件系统)
- **存储位置**: 
  - macOS: `~/Library/Application Support/iPrompt/iprompt-data.json`
  - Windows: `%APPDATA%/iPrompt/iprompt-data.json`
  - Linux: `~/.local/share/iPrompt/iprompt-data.json`
- **容量限制**: 仅受磁盘空间限制
- **数据持久性**: 数据保存在本地文件，更加安全
- **特色功能**:
  - 自动备份功能
  - 数据导入/导出更方便
  - 首次启动时自动从 localStorage 迁移数据

### 数据迁移
- 桌面版首次启动时会自动检测并迁移 Web 版的数据
- 迁移后会清除 localStorage 中的旧数据
- 所有版本都支持手动导入/导出 JSON 文件

## 开发指南

- 使用 TypeScript 进行类型安全开发
- 遵循 React Hooks 最佳实践
- 使用 Zustand 进行状态管理
- 通过服务层抽象实现跨平台兼容

## 相关文档

- [部署到 Cloudflare](cloudflare-deployment.md)
- [存储调试指南](storage-debug.md)

## License

AGPLv3

## Star History

<a href="https://www.star-history.com/#LeoGray/iPrompt&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=LeoGray/iPrompt&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=LeoGray/iPrompt&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=LeoGray/iPrompt&type=Date" />
 </picture>
</a>