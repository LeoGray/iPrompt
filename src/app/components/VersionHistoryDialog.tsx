import React, { useState } from 'react'
import { History, Clock, RotateCcw, Eye } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prompt, PromptVersion } from '../store/promptStore'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog'
import { Button } from './ui/button'
import { useToast } from './ui/use-toast'

interface VersionHistoryDialogProps {
  prompt: Prompt | null
  isOpen: boolean
  onClose: () => void
  onRestore: (version: PromptVersion) => void
}

export function VersionHistoryDialog({
  prompt,
  isOpen,
  onClose,
  onRestore
}: VersionHistoryDialogProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [selectedVersion, setSelectedVersion] = useState<PromptVersion | null>(null)

  const allVersions = React.useMemo(() => {
    if (!prompt) return []
    return [
      {
        id: 'current',
        content: prompt.content,
        createdAt: prompt.updatedAt
      },
      ...(prompt.versions || []).slice().reverse()
    ]
  }, [prompt])
  
  // 默认选中当前版本
  React.useEffect(() => {
    if (isOpen && !selectedVersion && allVersions.length > 0) {
      setSelectedVersion(allVersions[0] as PromptVersion)
    }
  }, [isOpen, allVersions, selectedVersion])

  if (!prompt || !prompt.versions || prompt.versions.length === 0) {
    return null
  }

  const handleRestore = (version: PromptVersion) => {
    onRestore(version)
    toast({
      title: t('messages.restoreSuccess'),
      description: t('messages.restoreDescription'),
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            {t('editor.history')} - {prompt.title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t('editor.versionHistoryDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Version List */}
          <div className="w-1/3 border-r pr-4 overflow-y-auto">
            <h3 className="text-sm font-medium mb-3">{t('editor.versionList')}</h3>
            <div className="space-y-2">
              {allVersions.map((version, index) => {
                const versionNumber = index === 0 ? t('editor.currentVersion') : `${t('common.version')} ${allVersions.length - index}`
                const isSelected = selectedVersion?.id === version.id
                const isCurrent = version.id === 'current'
                
                return (
                  <div
                    key={version.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    } ${isCurrent ? 'bg-primary/10' : ''}`}
                    onClick={() => setSelectedVersion(version as PromptVersion)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{versionNumber}</span>
                        {isCurrent && (
                          <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                            {t('editor.current')}
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedVersion(version as PromptVersion)
                        }}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                      <Clock className="w-3 h-3" />
                      {new Date(version.createdAt).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {version.content}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Preview */}
          <div className="flex-1 overflow-y-auto">
            <div className="sticky top-0 bg-background pb-3 mb-3 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">{t('editor.preview')}</h3>
                {selectedVersion && selectedVersion.id !== 'current' && (
                  <Button
                    size="sm"
                    onClick={() => handleRestore(selectedVersion as PromptVersion)}
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    {t('editor.restore')}
                  </Button>
                )}
              </div>
            </div>
            
            {selectedVersion ? (
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {selectedVersion.content}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                {t('editor.selectVersionToPreview')}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}