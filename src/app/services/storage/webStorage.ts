import { IStorageService, StorageData, DEFAULT_STORAGE_DATA } from './types'

const DB_NAME = 'iPromptDB'
const DB_VERSION = 1
const STORE_NAME = 'prompts'

export class WebStorage implements IStorageService {
  private db: IDBDatabase | null = null

  constructor() {
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
            data.prompts = data.prompts.map((prompt: any) => ({
              ...prompt,
              createdAt: new Date(prompt.createdAt),
              updatedAt: new Date(prompt.updatedAt),
              versions: prompt.versions?.map((v: any) => ({
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
  }

  async save(data: StorageData): Promise<void> {
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
  private migrateFromLocalStorage(oldData: any): StorageData {
    // Handle old zustand persist format
    if (oldData.state && oldData.state.prompts) {
      oldData = oldData.state
    }

    return {
      version: DEFAULT_STORAGE_DATA.version,
      prompts: oldData.prompts || [],
      categories: Array.from(new Set(
        oldData.prompts?.map((p: any) => p.category).filter(Boolean) || []
      )),
      lastModified: new Date().toISOString()
    }
  }
}