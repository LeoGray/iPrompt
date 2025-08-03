import { Clock, History, Globe, MoreVertical } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Prompt } from '../store/promptStore'
import { CopyMenu } from './CopyMenu'
import { Button } from './ui/button'
import { formatDateTime } from '../utils/dateHelpers'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

interface PromptListProps {
  prompts: Prompt[]
  onEdit: (promptId: string) => void
  onDelete: (promptId: string) => void
  onViewHistory: (promptId: string) => void
  onTranslate: (content: string) => void
}

export function PromptList({
  prompts,
  onEdit,
  onDelete,
  onViewHistory,
  onTranslate
}: PromptListProps) {
  const { t } = useTranslation()

  if (prompts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t('prompts.noPrompts')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {prompts.map((prompt) => (
        <div
          key={prompt.id}
          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">{prompt.title}</h3>
              <p className="text-muted-foreground mb-3 whitespace-pre-wrap">
                {prompt.content}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDateTime(prompt.updatedAt)}
                </span>
                {prompt.versions && prompt.versions.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewHistory(prompt.id)}
                    className="flex items-center gap-1 px-2"
                  >
                    <History className="w-3 h-3" />
                    {t('versions.count', { count: prompt.versions.length })}
                  </Button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CopyMenu prompt={prompt} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(prompt.id)}>
                    {t('common.edit')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onTranslate(prompt.content)}>
                    <Globe className="w-4 h-4 mr-2" />
                    {t('prompts.translateInBrowser')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(prompt.id)}
                    className="text-destructive"
                  >
                    {t('common.delete')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}