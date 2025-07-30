import { ReactNode, useMemo } from 'react'
import { usePromptStore } from '../store/promptStore'
import { Hash, Folder } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PlatformInfo } from './PlatformInfo'
import { SettingsDialog } from './SettingsDialog'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { t } = useTranslation()
  const prompts = usePromptStore((state) => state.prompts)
  const selectedCategory = usePromptStore((state) => state.selectedCategory)
  const setSelectedCategory = usePromptStore((state) => state.setSelectedCategory)
  
  // 获取所有分类
  const categories = useMemo(() => {
    const categorySet = new Set<string>()
    prompts.forEach(prompt => {
      if (prompt.category) {
        categorySet.add(prompt.category)
      }
    })
    return Array.from(categorySet).sort()
  }, [prompts])
  
  // 计算每个分类的数量
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    prompts.forEach(prompt => {
      const category = prompt.category || '未分类'
      counts[category] = (counts[category] || 0) + 1
    })
    return counts
  }, [prompts])

  return (
    <div className="flex h-screen bg-background">
      <nav className="flex flex-col w-64 bg-card border-r">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-primary mb-1">{t('layout.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('layout.subtitle')}</p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 space-y-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
                selectedCategory === null
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4" />
                <span>{t('layout.allPrompts')}</span>
              </div>
              <span className="text-xs">{prompts.length}</span>
            </button>
            
            {categories.length > 0 && (
              <>
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t('layout.categories')}
                </div>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
                      selectedCategory === category
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Folder className="w-4 h-4" />
                      <span>{category}</span>
                    </div>
                    <span className="text-xs">{categoryCounts[category] || 0}</span>
                  </button>
                ))}
              </>
            )}
            
            {categoryCounts['未分类'] > 0 && (
              <button
                onClick={() => setSelectedCategory('未分类')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
                  selectedCategory === '未分类'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4 opacity-50" />
                  <span className="opacity-75">{t('layout.uncategorized')}</span>
                </div>
                <span className="text-xs">{categoryCounts['未分类']}</span>
              </button>
            )}
          </div>
        </div>
        
        <div className="p-3 border-t space-y-2">
          <div className="flex items-center justify-between">
            <PlatformInfo />
            <SettingsDialog />
          </div>
        </div>
      </nav>
      
      <main className="flex-1 overflow-auto">
        <div className="h-full p-6">
          {children}
        </div>
      </main>
    </div>
  )
}