import { IStorageService, StorageData, StorageUsageInfo } from './types'
import { WebStorage } from './webStorage'
import { TauriStorage } from './tauriStorage'

class StorageManager {
  private storage: IStorageService

  constructor() {
    // Choose storage based on platform
    if (window.__TAURI__) {
      console.log('Using Tauri file system storage')
      this.storage = new TauriStorage()
      // Try to migrate data from localStorage to file system
      this.migrateFromLocalStorage()
    } else {
      console.log('Using Web localStorage storage')
      this.storage = new WebStorage()
    }
  }

  // Migrate data from localStorage to file system (one-time operation)
  private async migrateFromLocalStorage() {
    try {
      // Check if we already have data in file system
      const existingData = await this.storage.load()
      if (existingData && existingData.prompts.length > 0) {
        // Already have data, no need to migrate
        return
      }

      // Check if we have data in localStorage
      const localStorageData = localStorage.getItem('prompt-storage')
      if (!localStorageData) {
        // No data to migrate
        return
      }

      console.log('Migrating data from localStorage to file system...')
      const parsedData = JSON.parse(localStorageData)
      
      // Save to file system
      await this.storage.save(parsedData)
      
      // Remove from localStorage after successful migration
      localStorage.removeItem('prompt-storage')
      console.log('Data migration completed successfully')
    } catch (error) {
      console.error('Failed to migrate data:', error)
      // Don't throw - continue with file system storage
    }
  }

  async load(): Promise<StorageData | null> {
    return this.storage.load()
  }

  async save(data: StorageData): Promise<void> {
    return this.storage.save(data)
  }

  async exportData(): Promise<Blob> {
    return this.storage.exportData()
  }

  async importData(file: File): Promise<StorageData> {
    return this.storage.importData(file)
  }

  async createBackup(): Promise<void> {
    if (this.storage.createBackup) {
      return this.storage.createBackup()
    }
    throw new Error('Backup not supported on this platform')
  }

  async getStorageUsage(): Promise<StorageUsageInfo> {
    return this.storage.getStorageUsage()
  }

  // Helper method to download blob (for web export)
  downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Helper method to export with proper filename
  async exportToFile() {
    const blob = await this.exportData()
    const filename = `iprompt-export-${new Date().toISOString().split('T')[0]}.json`
    
    // On web, trigger download
    if (!window.__TAURI__) {
      this.downloadBlob(blob, filename)
    }
    // On Tauri, file is already saved by exportData()
  }
}

// Export singleton instance
export const storageManager = new StorageManager()