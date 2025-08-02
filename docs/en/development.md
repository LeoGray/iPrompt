# Development Guide

This guide covers the development workflow and best practices for iPrompt.

## Development Environment Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Docker and Docker Compose (for containerized development)
- Rust (for Tauri development)

### Docker Development (Recommended)

1. **Start Development Environment**
   ```bash
   docker-compose up -d
   ```

2. **View Logs**
   ```bash
   docker-compose logs -f
   ```

3. **Access Services**
   - Web Frontend: http://localhost:13000
   - API Server: http://localhost:18080
   - Hot Module Replacement (HMR) works automatically

### Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Web Development**
   ```bash
   npm run dev:web
   ```

3. **Tauri Desktop Development**
   ```bash
   npm run dev:tauri
   ```

## Architecture Overview

### Storage Abstraction

The application uses a service-based architecture to abstract storage differences between platforms:

```typescript
interface IStorageService {
  load(): Promise<StorageData | null>
  save(data: StorageData): Promise<void>
  clear(): Promise<void>
  exportData(): Promise<Blob>
  importData(file: File): Promise<StorageData>
}
```

- **WebStorage**: Uses localStorage for web version
- **TauriStorage**: Uses file system for desktop version
- **StorageManager**: Handles platform detection and service initialization

### State Management

Zustand is used for global state management with custom persistence:

```typescript
const usePromptStore = create<PromptStore>()(
  customPersist(
    (set, get) => ({
      // State and actions
    }),
    {
      name: 'prompt-storage',
    }
  )
)
```

### Platform Detection

```typescript
const isTauri = !!window.__TAURI__
const platform = isTauri ? 'tauri' : 'web'
```

## Code Style Guide

### TypeScript

- Use strict type checking
- Define interfaces for all data structures
- Avoid `any` type

### React Components

- Use functional components with hooks
- Follow component composition patterns
- Keep components focused and small

### File Organization

```
src/app/
├── components/      # Reusable UI components
│   └── ui/         # Base UI components (shadcn/ui)
├── pages/          # Page components
├── services/       # Platform services
├── store/          # Zustand stores
├── hooks/          # Custom React hooks
└── utils/          # Utility functions
```

## Testing

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Building for Production

### Web Build

```bash
npm run build:web
```

Output: `dist/` directory

### Desktop Build

```bash
npm run build:tauri
```

Output:
- macOS: `.dmg` and `.app` files
- Windows: `.msi` and `.exe` files
- Linux: `.deb`, `.AppImage`, and `.rpm` files

## Debugging

### Web Version

1. Open browser DevTools (F12)
2. Check Console for errors
3. Use React Developer Tools extension
4. Monitor Network tab for API calls

### Desktop Version

1. Run in development mode: `npm run dev:tauri`
2. Open DevTools: 
   - macOS: `Cmd + Option + I`
   - Windows/Linux: `Ctrl + Shift + I`
3. Check Rust console output

### Storage Debugging

```javascript
// Check storage type
console.log('Storage type:', window.__TAURI__ ? 'File System' : 'localStorage')

// View stored data
const data = await window.storageManager.load()
console.log('Stored data:', data)
```

## Common Issues

### Port Conflicts

All ports use a "1" prefix to avoid conflicts:
- Change ports in `vite.config.ts` if needed
- Update Docker Compose configuration

### Build Failures

1. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Clear build cache:
   ```bash
   rm -rf dist/ src-tauri/target/
   ```

### Tauri Build Issues

1. Ensure Rust is up to date:
   ```bash
   rustup update
   ```

2. Install required system dependencies:
   - macOS: Xcode Command Line Tools
   - Linux: See Tauri prerequisites
   - Windows: Visual Studio Build Tools

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

### Commit Message Format

```
type(scope): description

- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Code style
- refactor: Code refactoring
- test: Testing
- chore: Maintenance
```

Example: `feat(editor): add markdown preview`