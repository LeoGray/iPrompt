/* eslint-disable @typescript-eslint/no-explicit-any */
import { StateCreator, StoreMutatorIdentifier } from 'zustand'
import { storageManager, StorageData, DEFAULT_STORAGE_DATA } from '../services/storage'
import { Prompt } from './promptStore'

export interface PersistOptions<T> {
  name: string
  serialize?: (state: T) => StorageData
  deserialize?: (storage: StorageData) => Partial<T>
  onRehydrateStorage?: (state: T) => ((state?: T, error?: Error) => void) | void
}

type PersistImpl = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  storeInitializer: StateCreator<T, Mps, Mcs, T>,
  options: PersistOptions<T>
) => StateCreator<T, Mps, Mcs, T>



// 类型安全的日期解析函数
function parseDateSafely(dateString: unknown): Date {
  if (typeof dateString === 'string') {
    const date = new Date(dateString)
    if (!isNaN(date.getTime())) {
      return date
    }
  }
  return new Date() // 默认返回当前时间
}

export const customPersist: PersistImpl = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  config: StateCreator<T, Mps, Mcs, T>,
  options: PersistOptions<T>
) => (set: any, get: any, api: any) => {
  let isHydrated = false
  let lastSaveTime = Date.now()
  const SAVE_THROTTLE = 1000 // Save at most once per second

  // Default serializer with proper types
  const serialize = options.serialize || ((state: T) => {
    // Type assertion based on known structure
    const stateWithPrompts = state as T & { prompts?: Array<Prompt> }
    const prompts = stateWithPrompts.prompts || []
    const categories = Array.from(new Set(
      prompts
        .map((p: Prompt) => p.category)
        .filter((category): category is string => Boolean(category))
    ))
    
    return {
      ...DEFAULT_STORAGE_DATA,
      prompts: prompts as Prompt[],
      categories,
      lastModified: new Date().toISOString()
    }
  })

  // Default deserializer with proper types
  const deserialize = options.deserialize || ((storage: StorageData) => {
    // Convert date strings back to Date objects with type safety
    interface StoredPrompt {
      createdAt: unknown
      updatedAt: unknown
      versions?: Array<{ createdAt: unknown }>
      translations?: Record<string, { translatedAt: unknown }>
    }
    
    const prompts = (storage.prompts || []).map((prompt: unknown) => {
      const storedPrompt = prompt as StoredPrompt
      return {
        ...storedPrompt,
        createdAt: parseDateSafely(storedPrompt.createdAt),
        updatedAt: parseDateSafely(storedPrompt.updatedAt),
        versions: storedPrompt.versions?.map(v => ({
          ...v,
          createdAt: parseDateSafely(v.createdAt)
        })) || [],
        translations: storedPrompt.translations ? Object.fromEntries(
          Object.entries(storedPrompt.translations).map(([lang, trans]) => [
            lang,
            {
              ...trans,
              translatedAt: parseDateSafely(trans.translatedAt)
            }
          ])
        ) : undefined
      }
    })
    
    return {
      prompts
    } as unknown as Partial<T>
  })

  // Save function with throttling
  const saveState = async () => {
    const now = Date.now()
    if (now - lastSaveTime < SAVE_THROTTLE) {
      return
    }
    lastSaveTime = now

    try {
      const state = get()
      const data = serialize(state)
      await storageManager.save(data)
    } catch (error) {
      console.error('Failed to persist state:', error)
    }
  }

  // Load initial state
  const hydrate = async () => {
    const onRehydrateStorage = options.onRehydrateStorage?.(get())

    try {
      const data = await storageManager.load()
      if (data) {
        const state = deserialize(data)
        set({
          ...state,
          isHydrated: true
        } as T)
      } else {
        // No data, but still mark as hydrated
        set({ isHydrated: true } as T)
      }
      
      isHydrated = true
      onRehydrateStorage?.(get(), undefined)
    } catch (error) {
      console.error('Failed to hydrate state:', error)
      // Even on error, mark as hydrated to show UI
      set({ isHydrated: true } as T)
      onRehydrateStorage?.(undefined, error as Error)
    }
  }

  // Create store
  const store = config(
    ((partial: any, replace?: any) => {
      set(partial, replace)
      // Auto-save on state change
      if (isHydrated) {
        saveState()
      }
    }) as any,
    get,
    api
  )

  // Hydrate on creation
  hydrate()

  return store
}