import { History } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Prompt } from '../store/promptStore'

interface VersionPreviewTooltipProps {
  prompt: Prompt
  children?: React.ReactNode
}

export function VersionPreviewTooltip({ prompt, children }: VersionPreviewTooltipProps) {
  const { t } = useTranslation()
  
  if (!prompt.versions || prompt.versions.length === 0) {
    return <>{children}</>
  }
  
  // 暂时只显示版本数量，不使用悬停提示
  return (
    <div className="flex items-center gap-1 text-muted-foreground">
      <History className="w-3 h-3" />
      <span>{t('prompts.versionCount', { count: prompt.versions.length })}</span>
    </div>
  )
}