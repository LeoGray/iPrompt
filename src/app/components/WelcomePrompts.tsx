import { useEffect } from 'react'
import { usePromptStore } from '../store/promptStore'
import { useTranslation } from 'react-i18next'

export function WelcomePrompts() {
  const prompts = usePromptStore((state) => state.prompts)
  const addPrompt = usePromptStore((state) => state.addPrompt)
  const { t, ready } = useTranslation()
  
  useEffect(() => {
    // 只有当 i18n 准备好且没有任何 Prompt 时，才添加示例
    if (!ready || prompts.length > 0) return
    
    const samplePrompts = [
        {
          title: t('samplePrompts.codeReview.title'),
          content: t('samplePrompts.codeReview.content'),
          category: t('samplePrompts.codeReview.category'),
          tags: Array.isArray(t('samplePrompts.codeReview.tags', { returnObjects: true })) 
            ? t('samplePrompts.codeReview.tags', { returnObjects: true }) as string[]
            : []
        },
        {
          title: t('samplePrompts.translator.title'),
          content: t('samplePrompts.translator.content'),
          category: t('samplePrompts.translator.category'),
          tags: Array.isArray(t('samplePrompts.translator.tags', { returnObjects: true }))
            ? t('samplePrompts.translator.tags', { returnObjects: true }) as string[]
            : []
        },
        {
          title: t('samplePrompts.weeklyReport.title'),
          content: t('samplePrompts.weeklyReport.content'),
          category: t('samplePrompts.weeklyReport.category'),
          tags: Array.isArray(t('samplePrompts.weeklyReport.tags', { returnObjects: true }))
            ? t('samplePrompts.weeklyReport.tags', { returnObjects: true }) as string[]
            : []
        }
      ]
      
      samplePrompts.forEach(prompt => addPrompt(prompt))
  }, [prompts.length, addPrompt, t, ready])
  
  return null
}