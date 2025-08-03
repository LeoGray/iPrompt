export interface TranslationProvider {
  id: string
  name: string
  type: 'ai' | 'translation' | 'browser' | 'external'
  icon?: string
  requiresAuth: boolean
  supportedLanguages: string[]
  
  configSchema: ConfigField[]
  
  validateConfig(config: ProviderConfig): Promise<boolean>
  
  translate(
    text: string, 
    targetLang: string, 
    config: ProviderConfig
  ): Promise<string>
}

export interface ConfigField {
  key: string
  label: string
  type: 'text' | 'password' | 'select' | 'textarea'
  required: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  defaultValue?: string
}

export interface TranslationSettings {
  enabled: boolean
  provider: string | null
  configs: Record<string, ProviderConfig>
  defaultTargetLanguages: string[]
  cacheEnabled: boolean
  cacheExpiry: number
  history: TranslationHistory[]
}

export interface ProviderConfig {
  apiKey?: string
  endpoint?: string
  model?: string
  customPrompt?: string
  [key: string]: string | undefined
}

export interface TranslationHistory {
  id: string
  timestamp: Date
  provider: string
  sourceText: string
  targetLang: string
  translatedText: string
  tokenUsed?: number
  cost?: number
}

export const SUPPORTED_PROVIDERS = [
  { value: 'openai/gpt-3.5-turbo', label: 'OpenAI GPT-3.5' },
  { value: 'openai/gpt-4', label: 'OpenAI GPT-4' },
  { value: 'anthropic/claude-3-haiku', label: 'Claude 3 Haiku' },
  { value: 'anthropic/claude-3-sonnet', label: 'Claude 3 Sonnet' },
  { value: 'gemini/gemini-pro', label: 'Google Gemini' },
  { value: 'qwen/qwen-turbo', label: '通义千问 Turbo' },
  { value: 'wenxin/ernie-bot', label: '文心一言' },
  { value: 'zhipu/glm-4', label: '智谱 GLM-4' },
  { value: 'deepseek/deepseek-chat', label: 'DeepSeek' },
  { value: 'ollama/qwen2:7b', label: 'Ollama - Qwen2 7B' },
  { value: 'ollama/llama3:8b', label: 'Ollama - Llama 3 8B' },
  { value: 'custom', label: '自定义模型' }
]

export const SUPPORTED_LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'zh', label: '中文' },
  { value: 'ja', label: '日本語' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'ko', label: '한국어' },
  { value: 'ru', label: 'Русский' },
  { value: 'pt', label: 'Português' },
  { value: 'it', label: 'Italiano' }
]