/* eslint-disable @typescript-eslint/no-explicit-any */
import { StateCreator, StoreMutatorIdentifier } from 'zustand'
import { storageManager, StorageData, DEFAULT_STORAGE_DATA } from '../services/storage'

// type PersistListener<T> = (state: T) => void

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

  // Default serializer
  const serialize = options.serialize || ((state: any) => {
    const stateWithPrompts = state as any & { prompts?: Array<{ category?: string }> }
    const prompts = stateWithPrompts.prompts || []
    const categories = Array.from(new Set(
      prompts.map((p: { category?: string }) => p.category).filter(Boolean)
    )) as string[]
    
    
    return {
      ...DEFAULT_STORAGE_DATA,
      prompts,
      categories,
      lastModified: new Date().toISOString()
    }
  })

  // Default deserializer
  const deserialize = options.deserialize || ((storage: StorageData) => {
    // Convert date strings back to Date objects
    const prompts = (storage.prompts || []).map((prompt: any) => ({
      ...prompt,
      createdAt: new Date(prompt.createdAt),
      updatedAt: new Date(prompt.updatedAt),
      versions: prompt.versions?.map((v: any) => ({
        ...v,
        createdAt: new Date(v.createdAt)
      })) || []
    }))
    
    return {
      prompts
    } as any
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
        } as any)
      } else {
        // No data, but still mark as hydrated
        set({ isHydrated: true } as any)
      }
      
      isHydrated = true
      onRehydrateStorage?.(get(), undefined)
    } catch (error) {
      console.error('Failed to hydrate state:', error)
      // Even on error, mark as hydrated to show UI
      set({ isHydrated: true } as any)
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