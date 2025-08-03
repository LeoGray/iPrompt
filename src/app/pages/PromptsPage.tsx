import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePromptStore } from '../store/promptStore'
import { FullScreenEditor } from '../components/FullScreenEditor'
import { VersionHistoryDialog } from '../components/VersionHistoryDialog'
import { PromptHeader } from '../components/PromptHeader'
import { PromptSearch } from '../components/PromptSearch'
import { PromptList } from '../components/PromptList'
import { useToast } from '../components/ui/use-toast'

export function PromptsPage() {
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create')
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null)
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [historyPromptId, setHistoryPromptId] = useState<string | null>(null)
  const { toast } = useToast()
  const { t } = useTranslation()
  
  // Store state
  const searchQuery = usePromptStore((state) => state.searchQuery)
  const setSearchQuery = usePromptStore((state) => state.setSearchQuery)
  const getFilteredPrompts = usePromptStore((state) => state.getFilteredPrompts)
  const deletePrompt = usePromptStore((state) => state.deletePrompt)
  const updatePrompt = usePromptStore((state) => state.updatePrompt)
  const getPromptById = usePromptStore((state) => state.getPromptById)
  const selectedCategory = usePromptStore((state) => state.selectedCategory)
  const isHydrated = usePromptStore((state) => state.isHydrated)
  
  const prompts = isHydrated ? getFilteredPrompts() : []
  
  // Handlers
  const handleTranslateInBrowser = (content: string) => {
    const encodedText = encodeURIComponent(content)
    const googleTranslateUrl = `https://translate.google.com/?text=${encodedText}`
    window.open(googleTranslateUrl, '_blank')
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
  
  const handleViewHistory = (promptId: string) => {
    setHistoryPromptId(promptId)
    setHistoryDialogOpen(true)
  }
  
  const handleRestoreVersion = (version: { content: string }) => {
    if (historyPromptId) {
      updatePrompt(historyPromptId, { content: version.content })
      toast({
        title: t('messages.restoreSuccess'),
        description: t('messages.restoreDescription'),
      })
    }
  }
  
  return (
    <div className="h-full flex flex-col">
      <PromptHeader
        title={selectedCategory || t('layout.allPrompts')}
        promptCount={prompts.length}
        onCreate={handleCreate}
      />
      
      <PromptSearch
        value={searchQuery}
        onChange={setSearchQuery}
      />
      
      <div className="flex-1 overflow-auto">
        <PromptList
          prompts={prompts}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewHistory={handleViewHistory}
          onTranslate={handleTranslateInBrowser}
        />
      </div>
      
      {/* Modals */}
      <FullScreenEditor
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        mode={editorMode}
        promptId={editingPromptId}
      />
      
      {historyPromptId && (
        <VersionHistoryDialog
          prompt={getPromptById(historyPromptId) || null}
          isOpen={historyDialogOpen}
          onClose={() => setHistoryDialogOpen(false)}
          onRestore={handleRestoreVersion}
        />
      )}
    </div>
  )
}