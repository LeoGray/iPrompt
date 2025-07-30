import { useEffect } from 'react'
import { usePromptStore } from '../store/promptStore'

export function WelcomePrompts() {
  const prompts = usePromptStore((state) => state.prompts)
  const addPrompt = usePromptStore((state) => state.addPrompt)
  
  useEffect(() => {
    // 如果没有任何 Prompt，添加一些示例
    if (prompts.length === 0) {
      const samplePrompts = [
        {
          title: '代码审查助手',
          content: '请作为一名资深开发者，帮我审查以下代码。请关注：\n1. 代码质量和可读性\n2. 潜在的bug和安全问题\n3. 性能优化建议\n4. 最佳实践建议\n\n代码：\n[在此粘贴代码]',
          category: '开发',
          tags: ['代码审查', '开发工具', 'Code Review']
        },
        {
          title: '中英文翻译专家',
          content: '请作为一名专业的中英文翻译专家。我会提供中文或英文内容，请你：\n1. 准确翻译内容\n2. 保持原文的语气和风格\n3. 对于专业术语提供多种翻译选择\n4. 必要时提供文化背景说明\n\n需要翻译的内容：\n[在此输入内容]',
          category: '翻译',
          tags: ['翻译', '中英文', 'Translation']
        },
        {
          title: '周报生成器',
          content: '请根据我提供的工作内容，帮我生成一份专业的周报。格式要求：\n1. 本周完成的工作（按重要性排序）\n2. 遇到的问题及解决方案\n3. 下周工作计划\n4. 需要的支持或资源\n\n本周工作内容：\n[在此列出本周工作]',
          category: '写作',
          tags: ['周报', '工作总结', 'Report']
        }
      ]
      
      samplePrompts.forEach(prompt => addPrompt(prompt))
    }
  }, [])
  
  return null
}