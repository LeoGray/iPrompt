import { useEffect } from 'react'
import { usePromptStore } from '../store/promptStore'
import { useTranslation } from 'react-i18next'

export function WelcomePrompts() {
  const prompts = usePromptStore((state) => state.prompts)
  const addPrompt = usePromptStore((state) => state.addPrompt)
  const { t } = useTranslation()
  
  useEffect(() => {
    // 如果没有任何 Prompt，添加一些示例
    if (prompts.length === 0) {
      const samplePrompts = [
        {
          title: t('samplePrompts.codeReview.title'),
          content: t('samplePrompts.codeReview.content'),
          category: t('samplePrompts.codeReview.category'),
          tags: t('samplePrompts.codeReview.tags', { returnObjects: true }) as string[]
        },
        {
          title: t('samplePrompts.translator.title'),
          content: t('samplePrompts.translator.content'),
          category: t('samplePrompts.translator.category'),
          tags: t('samplePrompts.translator.tags', { returnObjects: true }) as string[]
        },
        {
          title: t('samplePrompts.weeklyReport.title'),
          content: t('samplePrompts.weeklyReport.content'),
          category: t('samplePrompts.weeklyReport.category'),
          tags: t('samplePrompts.weeklyReport.tags', { returnObjects: true }) as string[]
        }
      ]
      
      samplePrompts.forEach(prompt => addPrompt(prompt))
    }
  }, [prompts.length, addPrompt, t])
  
  return null
}