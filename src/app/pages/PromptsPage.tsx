import { useState } from 'react'
import { Plus, Search, Edit2, Trash2, Copy, Clock, History } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { usePromptStore } from '../store/promptStore'
import { FullScreenEditor } from '../components/FullScreenEditor'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { useToast } from '../components/ui/use-toast'

export function PromptsPage() {
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create')
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null)
  const { toast } = useToast()
  const { t } = useTranslation()
  
  const searchQuery = usePromptStore((state) => state.searchQuery)
  const setSearchQuery = usePromptStore((state) => state.setSearchQuery)
  const getFilteredPrompts = usePromptStore((state) => state.getFilteredPrompts)
  const deletePrompt = usePromptStore((state) => state.deletePrompt)
  const isHydrated = usePromptStore((state) => state.isHydrated)
  
  const prompts = isHydrated ? getFilteredPrompts() : []
  
  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
    toast({
      title: t('messages.copySuccess'),
      description: t('messages.copyDescription'),
    })
  }
  
  const handleDelete = (id: string) => {
    if (window.confirm(t('prompts.deleteConfirm'))) {
      deletePrompt(id)
      toast({
        title: t('messages.deleteSuccess'),
        description: t('messages.deleteDescription'),
      })
    }
  }

  const selectedCategory = usePromptStore((state) => state.selectedCategory)
  
  const handleCreate = () => {
    setEditorMode('create')
    setEditingPromptId(null)
    setEditorOpen(true)
  }
  
  const handleEdit = (promptId: string) => {
    setEditorMode('edit')
    setEditingPromptId(promptId)
    setEditorOpen(true)
  }
  
  return (
    <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              {selectedCategory ? selectedCategory : t('layout.allPrompts')}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t('layout.promptCount', { count: prompts.length })}
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            {t('editor.newPrompt')}
          </Button>
        </div>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          type="text"
          placeholder={t('prompts.searchPlaceholder')}
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-auto">
        {!isHydrated ? (
          <div className="bg-card rounded-lg border p-6">
            <p className="text-center text-muted-foreground">
              {t('common.loading')}
            </p>
          </div>
        ) : prompts.length === 0 ? (
          <div className="bg-card rounded-lg border p-6">
            <p className="text-center text-muted-foreground">
              {searchQuery ? t('prompts.noResults') : t('prompts.emptyState')}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {prompts.map((prompt) => (
              <div key={prompt.id} className="bg-card rounded-lg border p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{prompt.title}</h3>
                    {prompt.category && (
                      <span className="text-sm text-muted-foreground">{t('prompts.category')}: {prompt.category}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(prompt.content)}
                      title={t('common.copy')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(prompt.id)}
                      title={t('common.edit')}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(prompt.id)}
                      title={t('common.delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-3">
                  {prompt.content}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    {prompt.tags && prompt.tags.length > 0 && (
                      <div className="flex gap-1">
                        {prompt.tags.map((tag, index) => (
                          <span key={index} className="bg-secondary px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    {prompt.versions && prompt.versions.length > 0 && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <History className="w-3 h-3" />
                        <span>{t('prompts.versionCount', { count: prompt.versions.length })}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(prompt.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <FullScreenEditor
        promptId={editingPromptId}
        isOpen={editorOpen}
        onClose={() => {
          setEditorOpen(false)
          setEditingPromptId(null)
        }}
        mode={editorMode}
      />
    </div>
  )
}