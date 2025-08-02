import { IStorageService, StorageData, StorageUsageInfo } from './types'

const STORAGE_LIMIT = 5 * 1024 * 1024 // 5MB 限制

// Tauri storage implementation using file system
export class TauriStorage implements IStorageService {
  // private fileName = 'iprompt-data.json'

  async load(): Promise<StorageData | null> {
    try {
      // Use window.__TAURI__ directly instead of import
      if (!window.__TAURI__) {
        throw new Error('Tauri API not available')
      }
      
      const dataString = await window.__TAURI__.invoke('read_data_file') as string
      if (!dataString) {
        return null
      }

      const data = JSON.parse(dataString) as StorageData
      
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

      return data
    } catch (error) {
      console.error('Failed to load data from file:', error)
      return null
    }
  }

  async save(data: StorageData): Promise<void> {
    try {
      if (!window.__TAURI__) {
        throw new Error('Tauri API not available')
      }
      
      // Update last modified time
      data.lastModified = new Date().toISOString()

      // Convert dates to ISO strings for storage
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
      await window.__TAURI__.invoke('write_data_file', { data: jsonString })
    } catch (error) {
      console.error('Failed to save data to file:', error)
      throw error
    }
  }

  async exportData(): Promise<Blob> {
    try {
      if (!window.__TAURI__) {
        throw new Error('Tauri API not available')
      }
      
      const data = await this.load()
      if (!data) {
        throw new Error('No data to export')
      }

      const jsonString = JSON.stringify(data, null, 2)
      
      // Show save dialog
      const filePath = await window.__TAURI__.dialog.save({
        defaultPath: `iprompt-export-${new Date().toISOString().split('T')[0]}.json`,
        filters: [{
          name: 'JSON',
          extensions: ['json']
        }]
      })

      if (filePath) {
        await window.__TAURI__.fs.writeTextFile(filePath, jsonString)
      }

      return new Blob([jsonString], { type: 'application/json' })
    } catch (error) {
      console.error('Failed to export data:', error)
      throw error
    }
  }

  async importData(_file: File): Promise<StorageData> {
    try {
      if (!window.__TAURI__) {
        throw new Error('Tauri API not available')
      }

      // Show open dialog
      const selected = await window.__TAURI__.dialog.open({
        multiple: false,
        filters: [{
          name: 'JSON',
          extensions: ['json']
        }]
      })

      if (!selected || Array.isArray(selected)) {
        throw new Error('No file selected')
      }

      const content = await window.__TAURI__.fs.readTextFile(selected)
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
      if (!window.__TAURI__) {
        throw new Error('Tauri API not available')
      }
      
      await window.__TAURI__.invoke('create_backup')
    } catch (error) {
      console.error('Failed to create backup:', error)
      throw error
    }
  }

  async getStorageUsage(): Promise<StorageUsageInfo> {
    try {
      const data = await this.load()
      
      // 计算数据大小
      const dataSize = data 
        ? new Blob([JSON.stringify(data)]).size 
        : 0
      
      // 返回使用情况
      return {
        used: dataSize,
        limit: STORAGE_LIMIT,
        percentage: Math.round((dataSize / STORAGE_LIMIT) * 100)
      }
    } catch (error) {
      console.error('Error calculating storage usage:', error)
      return {
        used: 0,
        limit: STORAGE_LIMIT,
        percentage: 0
      }
    }
  }
}