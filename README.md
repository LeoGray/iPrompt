# iPrompt - Cross-Platform Prompt Management System

[简体中文](docs/zh/README.md) | English

[![CI](https://github.com/LeoGray/iprompt/actions/workflows/ci.yml/badge.svg)](https://github.com/LeoGray/iprompt/actions/workflows/ci.yml)
[![Build and Release](https://github.com/LeoGray/iprompt/actions/workflows/build.yml/badge.svg)](https://github.com/LeoGray/iprompt/actions/workflows/build.yml)

A cross-platform prompt management system with Tauri desktop and web support, featuring Docker-based development and deployment.

## 🚀 Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FLeoGray%2FiPrompt&project-name=iprompt&repository-name=iprompt&demo-title=iPrompt&demo-description=A%20cross-platform%20prompt%20management%20system&demo-url=https%3A%2F%2Fiprompt.vercel.app)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/LeoGray/iPrompt)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/deploy?template=https%3A%2F%2Fgithub.com%2FLeoGray%2FiPrompt&envs=NODE_ENV&NODE_ENVDesc=Production%20environment&NODE_ENVDefault=production)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/LeoGray/iPrompt)

## Features

- 🖥️ **Cross-platform Support**: Works on Web browsers and desktop (Windows/macOS/Linux)
- 🐳 **Dockerized Development**: Complete Docker environment for consistent development
- 🔄 **Version Control**: Automatic tracking of prompt history and changes
- 🌐 **i18n Support**: Built-in internationalization with multiple languages
- 🔍 **Smart Search**: Quick search and filter for prompts
- 📝 **Monaco Editor**: VS Code-like editor with syntax highlighting

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Shadcn/ui + Tailwind CSS
- **State Management**: Zustand
- **Desktop**: Tauri 2 + Rust
- **Storage**: localStorage (Web) / File System (Desktop)
- **Development**: Docker + Docker Compose

## Quick Start

### Online Deployment

Multiple one-click deployment options available:

- **Vercel** - Recommended for static hosting with global CDN and automatic HTTPS
- **Netlify** - Another excellent static hosting platform
- **Railway** - Supports Docker deployment, suitable for backend services
- **Render** - Free tier supports both static sites and Docker deployment

Click the deployment buttons above to get started.

### Docker Development (Recommended)

1. Ensure Docker and Docker Compose are installed

2. Clone and start the development environment:
```bash
git clone https://github.com/LeoGray/iprompt.git
cd iprompt
docker-compose up -d
```

3. Access the application:
   - Web version: http://localhost:13000
   - API health check: http://localhost:18080/health

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
# Web version
npm run dev:web

# Tauri desktop version
npm run dev:tauri
```

## Port Configuration

All ports are configured with a "1" prefix to avoid conflicts with common services:

| Service | Default Port | Actual Port |
|---------|--------------|-------------|
| Web Frontend | 3000 | 13000 |
| API Backend | 8080 | 18080 |
| Vite HMR | 5173 | 15173 |
| Tauri Dev | 1420 | 11420 |

## Project Structure

```
├── src/
│   ├── src-tauri/     # Tauri Rust backend
│   ├── app/           # React application (shared)
│   └── api/           # API backend
├── docker/            # Docker configurations
├── public/            # Static assets
├── docs/              # Documentation
│   ├── en/           # English documentation
│   └── zh/           # Chinese documentation
└── docker-compose.yml # Docker Compose configuration
```

## Build & Deploy

### Build Web Version
```bash
npm run build:web
```

### Build Desktop Version
```bash
npm run build:tauri
```

### Production Deployment with Docker
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Storage

### Web Version (localStorage)
- **Location**: Browser local storage
- **Capacity**: 5-10MB (browser dependent)
- **Persistence**: Lost when clearing browser data
- **Use Case**: Lightweight usage, quick access

### Desktop Version (File System)
- **Location**: 
  - macOS: `~/Library/Application Support/iPrompt/iprompt-data.json`
  - Windows: `%APPDATA%/iPrompt/iprompt-data.json`
  - Linux: `~/.local/share/iPrompt/iprompt-data.json`
- **Capacity**: Limited only by disk space
- **Persistence**: Data saved in local files
- **Features**:
  - Automatic backup
  - Easy import/export
  - Auto-migration from localStorage on first launch

## Documentation

- [中文文档](docs/zh/README.md)
- [Deployment Guide](docs/en/deployment.md)
- [Development Guide](docs/en/development.md)

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