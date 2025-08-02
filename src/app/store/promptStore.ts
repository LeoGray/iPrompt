import { create } from 'zustand'
import { customPersist } from './persistMiddleware'

export interface Prompt {
  id: string
  title: string
  content: string
  category?: string
  tags?: string[]
  createdAt: Date
  updatedAt: Date
  versions?: PromptVersion[]
}

export interface PromptVersion {
  id: string
  content: string
  createdAt: Date
}

interface PromptStore {
  prompts: Prompt[]
  searchQuery: string
  selectedCategory: string | null
  isHydrated: boolean
  
  // Actions
  addPrompt: (prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => void
  updatePrompt: (id: string, prompt: Partial<Prompt>) => void
  deletePrompt: (id: string) => void
  setSearchQuery: (query: string) => void
  setSelectedCategory: (category: string | null) => void
  setIsHydrated: (hydrated: boolean) => void
  
  // Getters
  getFilteredPrompts: () => Prompt[]
  getPromptById: (id: string) => Prompt | undefined
}

export const usePromptStore = create<PromptStore>()(
  customPersist(
    (set, get) => ({
      prompts: [],
      searchQuery: '',
      selectedCategory: null,
      isHydrated: false,
      
      addPrompt: (promptData) => {
        const newPrompt: Prompt = {
          ...promptData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
          versions: []
        }
        set((state) => ({
          prompts: [...state.prompts, newPrompt]
        }))
      },
      
      updatePrompt: (id, promptData) => {
        set((state) => ({
          prompts: state.prompts.map((prompt) => {
            if (prompt.id === id) {
              const oldContent = prompt.content
              const updatedPrompt = {
                ...prompt,
                ...promptData,
                updatedAt: new Date()
              }
              
              // Add version if content changed
              if (oldContent !== promptData.content && promptData.content) {
                const newVersion = {
                  id: crypto.randomUUID(),
                  content: oldContent,
                  createdAt: prompt.updatedAt
                }
                
                updatedPrompt.versions = [
                  ...(prompt.versions || []),
                  newVersion
                ]
              }
              
              return updatedPrompt
            }
            return prompt
          })
        }))
      },
      
      deletePrompt: (id) => {
        set((state) => ({
          prompts: state.prompts.filter((prompt) => prompt.id !== id)
        }))
      },
      
      setSearchQuery: (query) => {
        set({ searchQuery: query })
      },
      
      setSelectedCategory: (category) => {
        set({ selectedCategory: category })
      },
      
      setIsHydrated: (hydrated) => {
        set({ isHydrated: hydrated })
      },
      
      getFilteredPrompts: () => {
        const { prompts, searchQuery, selectedCategory } = get()
        
        return prompts.filter((prompt) => {
          const matchesSearch = searchQuery === '' || 
            prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            prompt.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            prompt.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
          
          const matchesCategory = !selectedCategory || 
            (selectedCategory === '未分类' && !prompt.category) ||
            prompt.category === selectedCategory
          
          return matchesSearch && matchesCategory
        })
      },
      
      getPromptById: (id) => {
        return get().prompts.find((prompt) => prompt.id === id)
      }
    }),
    {
      name: 'prompt-storage',
    }
  )
)