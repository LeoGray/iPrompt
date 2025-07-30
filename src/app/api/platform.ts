// Platform API interface
export interface IPlatformAPI {
  getPlatform(): Promise<string>
  getVersion(): Promise<string>
  storage: {
    get: (key: string) => Promise<any>
    set: (key: string, value: any) => Promise<void>
    delete: (key: string) => Promise<void>
    clear: () => Promise<void>
  }
}

// Tauri implementation (unused in web mode)
/*
class TauriAPI implements IPlatformAPI {
  async getPlatform(): Promise<string> {
    // In web mode, Tauri API is not available
    return 'tauri'
  }

  async getVersion(): Promise<string> {
    // In web mode, return default version
    return '0.1.0'
  }

  storage = {
    get: async (key: string): Promise<any> => {
      // Fallback to localStorage in web mode
      const value = localStorage.getItem(`tauri_${key}`)
      return value ? JSON.parse(value) : null
    },
    set: async (key: string, value: any): Promise<void> => {
      localStorage.setItem(`tauri_${key}`, JSON.stringify(value))
    },
    delete: async (key: string): Promise<void> => {
      localStorage.removeItem(`tauri_${key}`)
    },
    clear: async (): Promise<void> => {
      // Clear only tauri-prefixed keys
      const keys = Object.keys(localStorage).filter(k => k.startsWith('tauri_'))
      keys.forEach(key => localStorage.removeItem(key))
    }
  }
}
*/

// Dynamic Platform API - checks platform at runtime
class DynamicPlatformAPI implements IPlatformAPI {
  async getPlatform(): Promise<string> {
    // Check platform dynamically each time it's called
    if (window.__TAURI__) {
      return 'tauri'
    }
    return 'web'
  }

  async getVersion(): Promise<string> {
    // @ts-ignore - Vite env types
    return import.meta.env.VITE_APP_VERSION || '0.1.0'
  }

  storage = {
    get: async (key: string): Promise<any> => {
      const value = localStorage.getItem(key)
      return value ? JSON.parse(value) : null
    },
    set: async (key: string, value: any): Promise<void> => {
      localStorage.setItem(key, JSON.stringify(value))
    },
    delete: async (key: string): Promise<void> => {
      localStorage.removeItem(key)
    },
    clear: async (): Promise<void> => {
      localStorage.clear()
    }
  }
}

// Export singleton instance that checks platform dynamically
export const platformAPI = new DynamicPlatformAPI()