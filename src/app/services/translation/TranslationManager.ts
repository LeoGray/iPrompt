import { 
  TranslationProvider, 
  TranslationSettings,
  TranslationHistory
} from '../../types/translation'
import { LiteLLMTranslationProvider } from './LiteLLMProvider'
import { v4 as uuidv4 } from 'uuid'

export class TranslationManager {
  private providers: Map<string, TranslationProvider> = new Map()
  private settings: TranslationSettings
  
  constructor(settings?: TranslationSettings) {
    this.settings = settings || {
      enabled: false,
      provider: null,
      configs: {},
      defaultTargetLanguages: ['en', 'zh'],
      cacheEnabled: true,
      cacheExpiry: 24, // hours
      history: []
    }
    
    // 注册默认的 provider
    this.registerProvider(new LiteLLMTranslationProvider())
  }
  
  registerProvider(provider: TranslationProvider) {
    this.providers.set(provider.id, provider)
  }
  
  getProviders(): TranslationProvider[] {
    return Array.from(this.providers.values())
  }
  
  getProvider(id: string): TranslationProvider | null {
    return this.providers.get(id) || null
  }
  
  getCurrentProvider(): TranslationProvider | null {
    if (!this.settings.provider) return null
    return this.getProvider(this.settings.provider)
  }
  
  setCurrentProvider(providerId: string) {
    if (this.providers.has(providerId)) {
      this.settings.provider = providerId
    }
  }
  
  getSettings(): TranslationSettings {
    return this.settings
  }
  
  updateSettings(settings: Partial<TranslationSettings>) {
    this.settings = { ...this.settings, ...settings }
  }
  
  async translate(text: string, targetLang: string): Promise<string> {
    const provider = this.getCurrentProvider()
    if (!provider) {
      throw new Error('No translation provider selected')
    }
    
    const config = this.settings.configs[provider.id]
    if (!config) {
      throw new Error('Translation provider not configured')
    }
    
    // 检查缓存
    if (this.settings.cacheEnabled) {
      const cached = this.getCachedTranslation(text, targetLang, provider.id)
      if (cached) {
        return cached
      }
    }
    
    // 执行翻译
    const translatedText = await provider.translate(text, targetLang, config)
    
    // 记录历史
    const history: TranslationHistory = {
      id: uuidv4(),
      timestamp: new Date(),
      provider: provider.id,
      sourceText: text,
      targetLang,
      translatedText,
      tokenUsed: this.estimateTokens(text + translatedText)
    }
    
    this.settings.history.unshift(history)
    
    // 限制历史记录数量
    if (this.settings.history.length > 100) {
      this.settings.history = this.settings.history.slice(0, 100)
    }
    
    return translatedText
  }
  
  async translateBatch(
    text: string, 
    targetLangs: string[]
  ): Promise<Record<string, string>> {
    const results: Record<string, string> = {}
    
    // 并发翻译
    const promises = targetLangs.map(async (lang) => {
      try {
        results[lang] = await this.translate(text, lang)
      } catch (error) {
        console.error(`Failed to translate to ${lang}:`, error)
        results[lang] = ''
      }
    })
    
    await Promise.all(promises)
    return results
  }
  
  private getCachedTranslation(
    text: string, 
    targetLang: string, 
    providerId: string
  ): string | null {
    const now = Date.now()
    const expiryMs = this.settings.cacheExpiry * 60 * 60 * 1000
    
    const cached = this.settings.history.find(h => 
      h.sourceText === text &&
      h.targetLang === targetLang &&
      h.provider === providerId &&
      (now - new Date(h.timestamp).getTime()) < expiryMs
    )
    
    return cached ? cached.translatedText : null
  }
  
  private estimateTokens(text: string): number {
    // 简单的 token 估算：平均每 4 个字符一个 token
    return Math.ceil(text.length / 4)
  }
  
  getHistory(limit?: number): TranslationHistory[] {
    return limit ? this.settings.history.slice(0, limit) : this.settings.history
  }
  
  clearHistory() {
    this.settings.history = []
  }
  
  getStatistics() {
    const stats = {
      totalTranslations: this.settings.history.length,
      totalTokens: 0,
      totalCost: 0,
      byProvider: {} as Record<string, { count: number; tokens: number; cost: number }>,
      byLanguage: {} as Record<string, number>
    }
    
    this.settings.history.forEach(h => {
      stats.totalTokens += h.tokenUsed || 0
      stats.totalCost += h.cost || 0
      
      // 按 provider 统计
      if (!stats.byProvider[h.provider]) {
        stats.byProvider[h.provider] = { count: 0, tokens: 0, cost: 0 }
      }
      stats.byProvider[h.provider].count++
      stats.byProvider[h.provider].tokens += h.tokenUsed || 0
      stats.byProvider[h.provider].cost += h.cost || 0
      
      // 按语言统计
      stats.byLanguage[h.targetLang] = (stats.byLanguage[h.targetLang] || 0) + 1
    })
    
    return stats
  }
}