import { IStorageService, StorageData, StorageUsageInfo, DEFAULT_STORAGE_DATA } from './types'
import { Prompt, PromptVersion } from '../../store/promptStore'

const DB_NAME = 'iPromptDB'
const DB_VERSION = 1
const STORE_NAME = 'prompts'
const STORAGE_LIMIT = 5 * 1024 * 1024 // 5MB 限制
const BATCH_SIZE = 10 // 批处理大小
const BATCH_DELAY = 100 // 批处理延迟（毫秒）

export class WebStorageOptimized implements IStorageService {
  private db: IDBDatabase | null = null
  private writeQueue: (() => Promise<void>)[] = []
  private isProcessingQueue = false
  private batchTimeout: NodeJS.Timeout | null = null
  private static instance: WebStorageOptimized | null = null

  constructor() {
    // 如果已有实例，清理旧实例
    if (WebStorageOptimized.instance) {
      WebStorageOptimized.instance.destroy()
    }
    WebStorageOptimized.instance = this
    this.initDB()
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME)
        }
      }
    })
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.initDB()
    }
    if (!this.db) {
      throw new Error('Failed to initialize IndexedDB')
    }
    return this.db
  }

  async load(): Promise<StorageData | null> {
    try {
      const db = await this.ensureDB()
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly')
        const store = transaction.objectStore(STORE_NAME)
        const request = store.get('data')

        request.onsuccess = () => {
          const data = request.result
          if (data) {
            // Parse dates back from ISO strings
            type StoredPrompt = Omit<Prompt, 'createdAt' | 'updatedAt' | 'versions'> & {
              createdAt: string
              updatedAt: string
              versions?: Array<Omit<PromptVersion, 'createdAt'> & { createdAt: string }>
            }
            
            data.prompts = data.prompts.map((prompt: StoredPrompt) => ({
              ...prompt,
              createdAt: new Date(prompt.createdAt),
              updatedAt: new Date(prompt.updatedAt),
              versions: prompt.versions?.map(v => ({
                ...v,
                createdAt: new Date(v.createdAt)
              })) || []
            }))
            resolve(data)
          } else {
            resolve(null)
          }
        }

        request.onerror = () => {
          console.error('Failed to load data from IndexedDB:', request.error)
          reject(request.error)
        }
      })
    } catch (error) {
      console.error('Error loading from IndexedDB:', error)
      // Fallback to localStorage if IndexedDB fails
      return this.loadFromLocalStorage()
    }
  }

  private async loadFromLocalStorage(): Promise<StorageData | null> {
    const localData = localStorage.getItem('prompt-storage')
    if (localData) {
      try {
        const parsed = JSON.parse(localData)
        return this.migrateFromLocalStorage(parsed)
      } catch (e) {
        console.error('Failed to parse localStorage data:', e)
      }
    }
    return null
  }

  async save(data: StorageData): Promise<void> {
    // 添加到写入队列
    this.writeQueue.push(() => this.performSave(data))
    
    // 如果没有正在处理，启动批处理
    if (!this.isProcessingQueue) {
      this.scheduleBatchProcess()
    }
    
    // 注意：由于批处理的存在，这里不会立即返回写入结果
    // 这是一个权衡：提高性能但牺牲了即时反馈
  }

  private scheduleBatchProcess(): void {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout)
    }
    
    this.batchTimeout = setTimeout(() => {
      this.processBatchQueue()
    }, BATCH_DELAY)
  }

  private async processBatchQueue(): Promise<void> {
    if (this.isProcessingQueue || this.writeQueue.length === 0) {
      return
    }
    
    this.isProcessingQueue = true
    
    try {
      // 批量处理队列中的写入操作
      const batch = this.writeQueue.splice(0, BATCH_SIZE)
      
      // 只执行最后一个写入操作（因为是完整替换）
      if (batch.length > 0) {
        await batch[batch.length - 1]()
      }
      
      // 如果还有剩余项，继续处理
      if (this.writeQueue.length > 0) {
        this.scheduleBatchProcess()
      }
    } finally {
      this.isProcessingQueue = false
    }
  }

  private async performSave(data: StorageData): Promise<void> {
    try {
      const db = await this.ensureDB()
      
      // Update last modified time
      data.lastModified = new Date().toISOString()

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite')
        const store = transaction.objectStore(STORE_NAME)
        
        // Convert dates to ISO strings for storage
        const storageData = {
          ...data,
          prompts: data.prompts.map(prompt => ({
            ...prompt,
            createdAt: prompt.createdAt.toISOString(),
            updatedAt: prompt.updatedAt.toISOString(),
            versions: prompt.versions?.map(v => ({
              ...v,
              createdAt: v.createdAt.toISOString()
            })) || []
          }))
        }
        
        const request = store.put(storageData, 'data')

        request.onsuccess = () => {
          resolve()
        }

        request.onerror = () => {
          console.error('Failed to save data to IndexedDB:', request.error)
          reject(request.error)
        }
      })
    } catch (error) {
      console.error('Error saving to IndexedDB:', error)
      throw error
    }
  }

  async exportData(): Promise<Blob> {
    const data = await this.load()
    if (!data) {
      throw new Error('No data to export')
    }

    const jsonString = JSON.stringify(data, null, 2)
    return new Blob([jsonString], { type: 'application/json' })
  }

  async importData(file: File): Promise<StorageData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = async (e) => {
        try {
          const text = e.target?.result as string
          const data = JSON.parse(text) as StorageData
          
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
          resolve(data)
        } catch (error) {
          reject(new Error('Failed to parse import file: ' + error))
        }
      }

      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }

      reader.readAsText(file)
    })
  }

  // Helper method to migrate from old localStorage format
  private migrateFromLocalStorage(oldData: Record<string, unknown>): StorageData {
    // Handle old zustand persist format
    const data = (oldData.state && typeof oldData.state === 'object' && 'prompts' in oldData.state) 
      ? oldData.state as Record<string, unknown>
      : oldData

    const prompts = Array.isArray(data.prompts) ? data.prompts : []

    return {
      version: DEFAULT_STORAGE_DATA.version,
      prompts: prompts as Prompt[],
      categories: Array.from(new Set(
        prompts.map((p: unknown) => {
          if (typeof p === 'object' && p !== null && 'category' in p && typeof p.category === 'string') {
            return p.category
          }
          return null
        }).filter(Boolean) as string[]
      )),
      lastModified: new Date().toISOString()
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

  // 清理方法
  destroy(): void {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout)
      this.batchTimeout = null
    }
    this.writeQueue = []
    this.isProcessingQueue = false
    if (this.db) {
      this.db.close()
      this.db = null
    }
    // 清除静态实例引用
    if (WebStorageOptimized.instance === this) {
      WebStorageOptimized.instance = null
    }
  }
}