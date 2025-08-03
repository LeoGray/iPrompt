import { useTranslation } from 'react-i18next'
import { Copy, Languages } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator
} from './ui/dropdown-menu'
import { Button } from './ui/button'
import { useToast } from './ui/use-toast'
import { SUPPORTED_LANGUAGES } from '../types/translation'
import { Prompt } from '../store/promptStore'

interface CopyMenuProps {
  prompt: Prompt
}

export function CopyMenu({ prompt }: CopyMenuProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  
  const handleCopy = (content: string, title?: string, language?: string) => {
    // 可以选择复制格式：仅内容、标题+内容
    const textToCopy = title ? `${title}\n\n${content}` : content
    
    navigator.clipboard.writeText(textToCopy)
    
    const langLabel = language 
      ? SUPPORTED_LANGUAGES.find(l => l.value === language)?.label 
      : t('translation.original')
    
    toast({
      title: t('messages.copySuccess'),
      description: `${t('messages.copyDescription')} (${langLabel})`
    })
  }
  
  const availableTranslations = prompt.translations 
    ? Object.entries(prompt.translations)
    : []
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title={t('common.copy')}
        >
          <Copy className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {/* 原文复制选项 */}
        <DropdownMenuItem onClick={() => handleCopy(prompt.content)}>
          <Copy className="w-4 h-4 mr-2" />
          {t('common.copy')} ({t('translation.original')})
        </DropdownMenuItem>
        
        {availableTranslations.length > 0 && (
          <>
            <DropdownMenuSeparator />
            
            {/* 快速复制已翻译版本 */}
            {availableTranslations.slice(0, 2).map(([lang, translation]) => (
              <DropdownMenuItem 
                key={lang}
                onClick={() => handleCopy(translation.content, translation.title, lang)}
              >
                <Copy className="w-4 h-4 mr-2" />
                {t('common.copy')} ({SUPPORTED_LANGUAGES.find(l => l.value === lang)?.label})
              </DropdownMenuItem>
            ))}
            
            {/* 更多语言选项 */}
            {availableTranslations.length > 2 && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Languages className="w-4 h-4 mr-2" />
                  {t('translation.moreLanguages')}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {availableTranslations.slice(2).map(([lang, translation]) => (
                    <DropdownMenuItem 
                      key={lang}
                      onClick={() => handleCopy(translation.content, translation.title, lang)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      {SUPPORTED_LANGUAGES.find(l => l.value === lang)?.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            )}
          </>
        )}
        
        <DropdownMenuSeparator />
        
        {/* 复制选项 */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Copy className="w-4 h-4 mr-2" />
            {t('common.copyOptions')}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => handleCopy(prompt.content, prompt.title)}>
              {t('common.copyWithTitle')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCopy(prompt.content)}>
              {t('common.copyContentOnly')}
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}