import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TranslationSettings } from '../types/translation'
import { storageManager } from '../services/storage'

interface TranslationStore {
  settings: TranslationSettings
  isLoading: boolean
  
  // Actions
  updateSettings: (settings: Partial<TranslationSettings>) => Promise<void>
  loadSettings: () => Promise<void>
}

const defaultSettings: TranslationSettings = {
  enabled: false,
  provider: null,
  configs: {},
  defaultTargetLanguages: ['en', 'zh'],
  cacheEnabled: true,
  cacheExpiry: 24,
  history: []
}

export const useTranslationStore = create<TranslationStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      isLoading: false,
      
      updateSettings: async (newSettings) => {
        const updatedSettings = { ...get().settings, ...newSettings }
        set({ settings: updatedSettings })
        
        // 同步到存储
        try {
          const storageData = await storageManager.load()
          if (storageData) {
            storageData.translationSettings = updatedSettings
            await storageManager.save(storageData)
          }
        } catch (error) {
          console.error('Failed to save translation settings:', error)
        }
      },
      
      loadSettings: async () => {
        set({ isLoading: true })
        try {
          const storageData = await storageManager.load()
          if (storageData?.translationSettings) {
            set({ settings: storageData.translationSettings })
          }
        } catch (error) {
          console.error('Failed to load translation settings:', error)
        } finally {
          set({ isLoading: false })
        }
      }
    }),
    {
      name: 'translation-settings',
      partialize: (state) => ({ settings: state.settings })
    }
  )
)