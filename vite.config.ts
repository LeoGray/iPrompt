import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isTauri = mode === 'tauri'
  const isWeb = mode === 'web' || !isTauri
  
  // Read version from version.json
  const versionData = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'version.json'), 'utf-8'))
  const appVersion = versionData.version

  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: isWeb ? ['@tauri-apps/api'] : []
    },
    base: isTauri ? './' : '/',
    server: {
      port: parseInt(env.VITE_PORT) || 13000,
      host: true,
      strictPort: true,
      hmr: {
        port: 15173
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@app': path.resolve(__dirname, './src/app'),
      }
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html')
        },
        external: isTauri ? [
          '@tauri-apps/api',
          '@tauri-apps/api/tauri',
          '@tauri-apps/api/dialog',
          '@tauri-apps/api/fs'
        ] : [],
        output: {
          globals: isTauri ? {
            '@tauri-apps/api': 'window.__TAURI__',
            '@tauri-apps/api/tauri': 'window.__TAURI__.tauri',
            '@tauri-apps/api/dialog': 'window.__TAURI__.dialog',
            '@tauri-apps/api/fs': 'window.__TAURI__.fs'
          } : {}
        }
      }
    },
    define: {
      'import.meta.env.PLATFORM': JSON.stringify(isWeb ? 'web' : 'tauri'),
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion)
    }
  }
})