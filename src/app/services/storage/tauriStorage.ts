import { IStorageService, StorageData, StorageUsageInfo } from './types'

// Dynamic imports for Tauri APIs
let tauriInvoke: ((cmd: string, args?: Record<string, unknown>) => Promise<unknown>) | null = null
let tauriDialog: { save: (options?: unknown) => Promise<string | null>; open: (options?: unknown) => Promise<string | string[] | null> } | null = null
let tauriFs: { writeTextFile: (path: string, content: string) => Promise<void>; readTextFile: (path: string) => Promise<string> } | null = null

// Initialize Tauri APIs
async function initTauriAPIs() {
  if (!tauriInvoke) {
    try {
      const { invoke } = await import('@tauri-apps/api/core')
      tauriInvoke = invoke
    } catch (e) {
      console.error('Failed to import Tauri core API:', e)
    }
  }
  
  if (!tauriDialog) {
    try {
      const dialog = await import('@tauri-apps/plugin-dialog')
      tauriDialog = dialog
    } catch (e) {
      console.error('Failed to import Tauri dialog API:', e)
    }
  }
  
  if (!tauriFs) {
    try {
      const fs = await import('@tauri-apps/plugin-fs')
      tauriFs = fs
    } catch (e) {
      console.error('Failed to import Tauri fs API:', e)
    }
  }
}

// Tauri storage implementation using file system
export class TauriStorage implements IStorageService {
  // private fileName = 'iprompt-data.json'

  async load(): Promise<StorageData | null> {
    try {
      await initTauriAPIs()
      
      if (!tauriInvoke) {
        throw new Error('Tauri API not available')
      }
      
      const dataString = await tauriInvoke('read_data_file') as string
      if (!dataString) {
        return null
      }

      const data = JSON.parse(dataString) as StorageData
      

      return data
    } catch (error) {
      console.error('Failed to load data from file:', error)
      return null
    }
  }

  async save(data: StorageData): Promise<void> {
    try {
      await initTauriAPIs()
      
      if (!tauriInvoke) {
        throw new Error('Tauri API not available')
      }
      
      // Update last modified time
      data.lastModified = new Date().toISOString()

      
      // 确保日期都是字符串格式
      const storageData = {
        ...data,
        prompts: data.prompts.map(prompt => ({
          ...prompt,
          createdAt: typeof prompt.createdAt === 'string' ? prompt.createdAt : prompt.createdAt.toISOString(),
          updatedAt: typeof prompt.updatedAt === 'string' ? prompt.updatedAt : prompt.updatedAt.toISOString(),
          versions: prompt.versions?.map(v => ({
            ...v,
            createdAt: typeof v.createdAt === 'string' ? v.createdAt : v.createdAt.toISOString()
          })) || []
        }))
      }

      const jsonString = JSON.stringify(storageData, null, 2)
      await tauriInvoke('write_data_file', { data: jsonString })
    } catch (error) {
      console.error('Failed to save data to file:', error)
      throw error
    }
  }

  async exportData(): Promise<Blob> {
    try {
      await initTauriAPIs()
      
      if (!tauriDialog || !tauriFs) {
        throw new Error('Tauri API not available')
      }
      
      const data = await this.load()
      if (!data) {
        throw new Error('No data to export')
      }

      const jsonString = JSON.stringify(data, null, 2)
      
      // Show save dialog
      const filePath = await tauriDialog.save({
        defaultPath: `iprompt-export-${new Date().toISOString().split('T')[0]}.json`,
        filters: [{
          name: 'JSON',
          extensions: ['json']
        }]
      })

      if (filePath) {
        await tauriFs.writeTextFile(filePath, jsonString)
      }

      return new Blob([jsonString], { type: 'application/json' })
    } catch (error) {
      console.error('Failed to export data:', error)
      throw error
    }
  }

  async importData(_file: File): Promise<StorageData> {
    try {
      await initTauriAPIs()
      
      if (!tauriDialog || !tauriFs) {
        throw new Error('Tauri API not available')
      }

      // Show open dialog
      const selected = await tauriDialog.open({
        multiple: false,
        filters: [{
          name: 'JSON',
          extensions: ['json']
        }]
      })

      if (!selected || Array.isArray(selected)) {
        throw new Error('No file selected')
      }

      const content = await tauriFs.readTextFile(selected)
      const data = JSON.parse(content) as StorageData

      // Validate data structure
      if (!data.version || !Array.isArray(data.prompts)) {
        throw new Error('Invalid data format')
      }

      // Convert date strings back to Date objects
      data.prompts = data.prompts.map(prompt => ({
        ...prompt,
        createdAt: new Date(prompt.createdAt),
        updatedAt: new Date(prompt.updatedAt),
        versions: prompt.versions?.map(v => ({
          ...v,
          createdAt: new Date(v.createdAt)
        })) || []
      }))

      // Save imported data
      await this.save(data)
      return data
    } catch (error) {
      console.error('Failed to import data:', error)
      throw error
    }
  }

  async createBackup(): Promise<void> {
    try {
      await initTauriAPIs()
      
      if (!tauriInvoke) {
        throw new Error('Tauri API not available')
      }
      
      await tauriInvoke('create_backup')
    } catch (error) {
      console.error('Failed to create backup:', error)
      throw error
    }
  }

  async getStorageUsage(): Promise<StorageUsageInfo> {
    try {
      await initTauriAPIs()
      
      if (!tauriInvoke) {
        throw new Error('Tauri API not available')
      }
      
      // 获取实际文件大小
      const fileSize = await tauriInvoke('get_data_file_size') as number
      
      // 客户端不显示限制和百分比
      return {
        used: fileSize
        // 不设置 limit 和 percentage
      }
    } catch (error) {
      console.error('Error calculating storage usage:', error)
      return {
        used: 0
      }
    }
  }
}