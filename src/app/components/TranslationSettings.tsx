import { useState, useEffect } from 'react'
import { Bot, Eye, EyeOff, TestTube, RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Switch } from './ui/switch'
import { Textarea } from './ui/textarea'
import { useToast } from './ui/use-toast'
import { TranslationManager } from '../services/translation/TranslationManager'
import { TranslationSettings as TranslationSettingsType, ConfigField } from '../types/translation'

interface TranslationSettingsProps {
  settings: TranslationSettingsType
  onSettingsChange: (settings: TranslationSettingsType) => void
}

export function TranslationSettings({ settings, onSettingsChange }: TranslationSettingsProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [showApiKey, setShowApiKey] = useState(false)
  const [testing, setTesting] = useState(false)
  const [manager] = useState(() => new TranslationManager(settings))
  
  const currentProvider = settings.provider || 'litellm'
  const currentConfig = settings.configs[currentProvider] || {
    provider: 'openai/gpt-3.5-turbo'
  }
  const provider = manager.getProvider('litellm')
  
  useEffect(() => {
    manager.updateSettings(settings)
  }, [settings, manager])
  
  const handleConfigChange = (key: string, value: string) => {
    onSettingsChange({
      ...settings,
      configs: {
        ...settings.configs,
        [currentProvider]: {
          ...currentConfig,
          [key]: value
        }
      }
    })
  }
  
  const handleToggleEnabled = (enabled: boolean) => {
    const newSettings = {
      ...settings,
      enabled
    }
    
    // 如果启用翻译且没有设置 provider，设置默认值
    if (enabled && !settings.provider) {
      newSettings.provider = 'litellm'
      // 确保有默认的配置
      if (!newSettings.configs['litellm']) {
        newSettings.configs['litellm'] = {
          provider: 'openai/gpt-3.5-turbo'
        }
      }
    }
    
    onSettingsChange(newSettings)
  }
  
  const handleTestConnection = async () => {
    if (!provider || !currentProvider) {
      toast({
        title: t('translation.selectProvider'),
        variant: 'destructive'
      })
      return
    }
    
    setTesting(true)
    try {
      const isValid = await provider.validateConfig(currentConfig)
      if (!isValid) {
        throw new Error(t('translation.invalidConfig'))
      }
      
      // 尝试翻译一个简单的测试文本
      const testText = 'Hello, world!'
      const result = await provider.translate(testText, 'zh', currentConfig)
      
      toast({
        title: t('translation.testSuccess'),
        description: `"${testText}" → "${result}"`
      })
    } catch (error) {
      toast({
        title: t('translation.testFailed'),
        description: error instanceof Error ? error.message : t('messages.unknownError'),
        variant: 'destructive'
      })
    } finally {
      setTesting(false)
    }
  }
  
  const handleReset = () => {
    // 重置配置到默认状态
    onSettingsChange({
      enabled: false,
      provider: null,
      configs: {},
      defaultTargetLanguages: ['en', 'zh'],
      cacheEnabled: true,
      cacheExpiry: 24,
      history: []
    })
    
    toast({
      title: t('translation.resetSuccess'),
      description: t('translation.resetDescription')
    })
  }
  
  const renderConfigField = (field: ConfigField) => {
    const value = currentConfig[field.key] || field.defaultValue || ''
    
    switch (field.type) {
      case 'select':
        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>{field.label}</Label>
            <Select
              value={value}
              onValueChange={(value) => handleConfigChange(field.key, value)}
            >
              <SelectTrigger id={field.key}>
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
        
      case 'password':
        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>{field.label}</Label>
            <div className="relative">
              <Input
                id={field.key}
                type={showApiKey ? 'text' : 'password'}
                value={value}
                onChange={(e) => handleConfigChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                required={field.required}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )
        
      case 'textarea':
        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>{field.label}</Label>
            <Textarea
              id={field.key}
              value={value}
              onChange={(e) => handleConfigChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              rows={3}
            />
          </div>
        )
        
      default:
        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>{field.label}</Label>
            <Input
              id={field.key}
              type="text"
              value={value}
              onChange={(e) => handleConfigChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
            />
          </div>
        )
    }
  }
  
  // 根据选择的 provider 显示不同的配置字段
  const shouldShowField = (field: ConfigField) => {
    const selectedProvider = currentConfig.provider || field.defaultValue
    if (field.key === 'customModel') {
      return selectedProvider === 'custom'
    }
    if (field.key === 'baseUrl') {
      return selectedProvider === 'custom' || selectedProvider?.includes('ollama')
    }
    return true
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4" />
          <h3 className="text-sm font-medium">{t('translation.aiTranslate')}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={settings.enabled}
            onCheckedChange={handleToggleEnabled}
          />
          <Button
            onClick={handleReset}
            size="sm"
            variant="ghost"
            title={t('translation.reset')}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {settings.enabled && (
        <div className="space-y-4 pl-6">
          {/* Provider 选择必须显示，即使没有 provider */}
          {provider && (
            <div className="space-y-4">
              {provider.configSchema
                .filter(shouldShowField)
                .map(renderConfigField)}
            </div>
          )}
          
          <div className="flex gap-2">
            <Button
              onClick={handleTestConnection}
              disabled={!currentConfig.provider || !currentConfig.apiKey || testing}
              size="sm"
              variant="outline"
            >
              <TestTube className="h-4 w-4 mr-2" />
              {testing ? t('translation.testing') : t('translation.testConnection')}
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p>{t('translation.cacheEnabled')}: {settings.cacheEnabled ? t('common.yes') : t('common.no')}</p>
            <p>{t('translation.historyCount')}: {settings.history.length}</p>
          </div>
        </div>
      )}
    </div>
  )
}