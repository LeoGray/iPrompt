import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from './ui/button'

interface PromptHeaderProps {
  title: string
  promptCount: number
  onCreate: () => void
}

export function PromptHeader({ title, promptCount, onCreate }: PromptHeaderProps) {
  const { t } = useTranslation()

  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('layout.promptCount', { count: promptCount })}
        </p>
      </div>
      <Button onClick={onCreate}>
        <Plus className="w-4 h-4 mr-2" />
        {t('editor.newPrompt')}
      </Button>
    </div>
  )
}