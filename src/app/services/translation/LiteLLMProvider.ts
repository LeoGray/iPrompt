import { 
  TranslationProvider, 
  ConfigField, 
  SUPPORTED_PROVIDERS 
} from '../../types/translation'

export class LiteLLMTranslationProvider implements TranslationProvider {
  id = 'litellm'
  name = 'AI 翻译服务'
  type: 'ai' = 'ai'
  icon = '🤖'
  requiresAuth = true
  supportedLanguages = ['en', 'zh', 'ja', 'es', 'fr', 'de', 'ko', 'ru', 'pt', 'it']
  
  configSchema: ConfigField[] = [
    {
      key: 'provider',
      label: '选择 AI 服务商',
      type: 'select',
      required: true,
      options: SUPPORTED_PROVIDERS,
      defaultValue: 'openai/gpt-3.5-turbo'
    },
    {
      key: 'apiKey',
      label: 'API Key',
      type: 'password',
      required: true,
      placeholder: '输入对应服务的 API Key'
    },
    {
      key: 'baseUrl',
      label: 'API 地址（可选）',
      type: 'text',
      required: false,
      placeholder: '自定义 API 端点，如本地服务器'
    },
    {
      key: 'customModel',
      label: '自定义模型名',
      type: 'text',
      required: false,
      placeholder: '当选择自定义时填写'
    },
    {
      key: 'customPrompt',
      label: '自定义翻译提示词（可选）',
      type: 'textarea',
      required: false,
      placeholder: '使用 {text} 和 {targetLang} 作为变量',
      defaultValue: ''
    }
  ]
  
  async validateConfig(config: any): Promise<boolean> {
    if (!config.provider || !config.apiKey) {
      return false
    }
    
    if (config.provider === 'custom' && !config.customModel) {
      return false
    }
    
    return true
  }
  
  async translate(
    text: string, 
    targetLang: string, 
    config: any
  ): Promise<string> {
    try {
      const model = config.provider === 'custom' ? config.customModel : config.provider
      
      // 根据不同的 provider 调用不同的 API
      if (model.startsWith('openai/')) {
        return this.translateWithOpenAI(text, targetLang, config, model)
      } else if (model.startsWith('anthropic/')) {
        return this.translateWithAnthropic(text, targetLang, config, model)
      } else if (model.startsWith('gemini/')) {
        return this.translateWithGemini(text, targetLang, config, model)
      } else {
        // 默认使用 OpenAI 兼容的 API
        return this.translateWithOpenAI(text, targetLang, config, model)
      }
      
    } catch (error: any) {
      console.error('Translation error:', error)
      throw new Error(`翻译失败: ${error.message || '未知错误'}`)
    }
  }
  
  private async translateWithOpenAI(
    text: string,
    targetLang: string,
    config: any,
    model: string
  ): Promise<string> {
    const baseUrl = config.baseUrl || 'https://api.openai.com/v1'
    const modelName = model.replace('openai/', '')
    
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: 'system',
            content: config.customPrompt || this.getDefaultPrompt(targetLang)
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: Math.min(text.length * 3, 4096)
      })
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }))
      throw new Error(error.error?.message || `API 错误: ${response.status}`)
    }
    
    const data = await response.json()
    return data.choices[0].message.content.trim()
  }
  
  private async translateWithAnthropic(
    text: string,
    targetLang: string,
    config: any,
    model: string
  ): Promise<string> {
    const baseUrl = config.baseUrl || 'https://api.anthropic.com/v1'
    const modelName = model.replace('anthropic/', '')
    
    const response = await fetch(`${baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: modelName,
        max_tokens: Math.min(text.length * 3, 4096),
        messages: [
          {
            role: 'user',
            content: `${config.customPrompt || this.getDefaultPrompt(targetLang)}\n\nText to translate:\n${text}`
          }
        ]
      })
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }))
      throw new Error(error.error?.message || `API 错误: ${response.status}`)
    }
    
    const data = await response.json()
    return data.content[0].text.trim()
  }
  
  private async translateWithGemini(
    text: string,
    targetLang: string,
    config: any,
    model: string
  ): Promise<string> {
    const modelName = model.replace('gemini/', '')
    const baseUrl = config.baseUrl || `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`
    
    const response = await fetch(`${baseUrl}?key=${config.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${config.customPrompt || this.getDefaultPrompt(targetLang)}\n\nText to translate:\n${text}`
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: Math.min(text.length * 3, 4096)
        }
      })
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }))
      throw new Error(error.error?.message || `API 错误: ${response.status}`)
    }
    
    const data = await response.json()
    return data.candidates[0].content.parts[0].text.trim()
  }
  
  private getDefaultPrompt(targetLang: string): string {
    const langMap: Record<string, string> = {
      'en': 'English',
      'zh': 'Chinese',
      'ja': 'Japanese',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'ko': 'Korean',
      'ru': 'Russian',
      'pt': 'Portuguese',
      'it': 'Italian'
    }
    
    const targetLangName = langMap[targetLang] || targetLang
    
    return `You are a professional translator specializing in technical content and AI prompts. 
Your task is to translate the following text to ${targetLangName}. 

Important instructions:
1. Maintain the original formatting, including line breaks, markdown, and code blocks
2. Preserve technical terms and prompt structure
3. Ensure the translation sounds natural in the target language
4. Keep any placeholders, variables, or template syntax unchanged
5. Only return the translated text without any explanations or notes

The text to translate is:`
  }
}