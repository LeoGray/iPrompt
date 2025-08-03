import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { useToast } from './ui/use-toast'
import { useTranslationStore } from '../store/translationStore'
import { TranslationManager } from '../services/translation/TranslationManager'
import { Languages, Loader2, X, AlertTriangle } from 'lucide-react'
import { SUPPORTED_LANGUAGES } from '../types/translation'
import { PromptTranslation } from '../store/promptStore'
import './PromptTranslationTabs.css'

interface PromptTranslationTabsProps {
  title: string
  content: string
  translations?: Record<string, PromptTranslation>
  onTranslationChange: (translations: Record<string, PromptTranslation>) => void
  onTitleChange: (title: string) => void
  onContentChange: (content: string) => void
  viewMode: 'edit' | 'preview' | 'split'
}

export function PromptTranslationTabs({
  title,
  content,
  translations = {},
  onTranslationChange,
  onTitleChange,
  onContentChange,
  viewMode
}: PromptTranslationTabsProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('original')
  const [isTranslating, setIsTranslating] = useState(false)
  const [editedTranslations, setEditedTranslations] = useState<Record<string, PromptTranslation>>(translations)
  const [manager, setManager] = useState<TranslationManager | null>(null)
  
  const { settings } = useTranslationStore()
  
  useEffect(() => {
    if (settings) {
      setManager(new TranslationManager(settings))
    }
  }, [settings])
  
  useEffect(() => {
    setEditedTranslations(translations)
  }, [translations])
  
  const handleTranslate = async (targetLang: string) => {
    if (!manager || !settings.enabled) {
      toast({
        title: t('translation.notConfigured'),
        description: t('translation.configureInSettings'),
        variant: 'destructive'
      })
      return
    }
    
    setIsTranslating(true)
    try {
      // 翻译标题和内容
      const [translatedTitle, translatedContent] = await Promise.all([
        manager.translate(title, targetLang),
        manager.translate(content, targetLang)
      ])
      
      const newTranslation: PromptTranslation = {
        title: translatedTitle,
        content: translatedContent,
        translatedAt: new Date(),
        provider: settings.provider || undefined,
        isOutdated: false
      }
      
      const updatedTranslations = {
        ...editedTranslations,
        [targetLang]: newTranslation
      }
      
      setEditedTranslations(updatedTranslations)
      onTranslationChange(updatedTranslations)
      
      toast({
        title: t('translation.success'),
        description: t('translation.translatedTo', { lang: SUPPORTED_LANGUAGES.find(l => l.value === targetLang)?.label })
      })
    } catch (error) {
      console.error('Translation error:', error)
      toast({
        title: t('translation.failed'),
        description: error instanceof Error ? error.message : t('messages.unknownError'),
        variant: 'destructive'
      })
    } finally {
      setIsTranslating(false)
    }
  }
  
  const handleUpdateTranslation = (lang: string, field: 'title' | 'content', value: string) => {
    const current = editedTranslations[lang] || {
      title: '',
      content: '',
      translatedAt: new Date()
    }
    
    const updated = {
      ...current,
      [field]: value,
      translatedAt: new Date()
    }
    
    const updatedTranslations = {
      ...editedTranslations,
      [lang]: updated
    }
    
    setEditedTranslations(updatedTranslations)
    onTranslationChange(updatedTranslations)
  }
  
  const handleDeleteTranslation = (lang: string) => {
    const { [lang]: _, ...rest } = editedTranslations
    setEditedTranslations(rest)
    onTranslationChange(rest)
    setActiveTab('original')
  }
  
  const availableLanguages = Object.keys(editedTranslations)
  const untranslatedLanguages = SUPPORTED_LANGUAGES.filter(
    lang => lang.value !== 'zh' && !availableLanguages.includes(lang.value)
  )
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
      <div className="flex items-start justify-between gap-4 mb-4">
        <TabsList className="flex-shrink-0">
          <TabsTrigger value="original">{t('translation.original')}</TabsTrigger>
          {availableLanguages.map(lang => (
            <TabsTrigger key={lang} value={lang} className="relative">
              <span className="flex items-center gap-1">
                {editedTranslations[lang]?.isOutdated && (
                  <AlertTriangle className="h-3 w-3 text-yellow-500" />
                )}
                {SUPPORTED_LANGUAGES.find(l => l.value === lang)?.label || lang}
              </span>
              {editedTranslations[lang] && (
                <Badge variant="secondary" className="ml-2 h-5 px-1 text-xs">
                  {editedTranslations[lang].provider || 'manual'}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {untranslatedLanguages.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {untranslatedLanguages.slice(0, 3).map(lang => (
              <Button
                key={lang.value}
                size="sm"
                variant="outline"
                onClick={() => handleTranslate(lang.value)}
                disabled={isTranslating}
                className="h-9"
              >
                {isTranslating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Languages className="h-4 w-4 mr-1" />
                )}
                {t('translation.translateTo', { lang: lang.label })}
              </Button>
            ))}
          </div>
        )}
      </div>
        <TabsContent value="original" className="h-full">
          <div className="h-full flex flex-col">
            <div className="text-sm text-muted-foreground mb-2">
              {t('translation.originalContent')}
            </div>
            {viewMode === 'edit' ? (
              <>
                <Input
                  value={title}
                  onChange={(e) => {
                    const newTitle = e.target.value
                    onTitleChange(newTitle)
                    
                    // 标记翻译为过期
                    if (newTitle !== title && Object.keys(editedTranslations).length > 0) {
                      const updatedTranslations = { ...editedTranslations }
                      Object.keys(updatedTranslations).forEach(lang => {
                        updatedTranslations[lang] = {
                          ...updatedTranslations[lang],
                          isOutdated: true
                        }
                      })
                      setEditedTranslations(updatedTranslations)
                      onTranslationChange(updatedTranslations)
                    }
                  }}
                  className="mb-2"
                  placeholder={t('editor.promptTitle')}
                />
                <Textarea
                  value={content}
                  onChange={(e) => {
                    const newContent = e.target.value
                    onContentChange(newContent)
                    
                    // 标记翻译为过期
                    if (newContent !== content && Object.keys(editedTranslations).length > 0) {
                      const updatedTranslations = { ...editedTranslations }
                      Object.keys(updatedTranslations).forEach(lang => {
                        updatedTranslations[lang] = {
                          ...updatedTranslations[lang],
                          isOutdated: true
                        }
                      })
                      setEditedTranslations(updatedTranslations)
                      onTranslationChange(updatedTranslations)
                    }
                  }}
                  className="flex-1 resize-none"
                  placeholder={t('editor.promptContent')}
                />
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <div className="flex-1 overflow-auto">
                  <div className="prose prose-sm max-w-none">
                    {content}
                  </div>
                </div>
              </>
            )}
          </div>
        </TabsContent>
        
        {availableLanguages.map(lang => (
          <TabsContent key={lang} value={lang} className="h-full">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">
                  {t('translation.translatedContent', { lang: SUPPORTED_LANGUAGES.find(l => l.value === lang)?.label })}
                  {editedTranslations[lang]?.isOutdated && (
                    <span className="ml-2 text-yellow-600 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {t('translation.outdatedWarning')}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={editedTranslations[lang]?.isOutdated ? "default" : "ghost"}
                    onClick={() => handleTranslate(lang)}
                    disabled={isTranslating}
                  >
                    <Languages className="h-4 w-4 mr-1" />
                    {t('translation.retranslate')}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteTranslation(lang)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {viewMode === 'edit' ? (
                <>
                  <Input
                    value={editedTranslations[lang]?.title || ''}
                    onChange={(e) => handleUpdateTranslation(lang, 'title', e.target.value)}
                    className="mb-2"
                    placeholder={t('editor.promptTitle')}
                  />
                  <Textarea
                    value={editedTranslations[lang]?.content || ''}
                    onChange={(e) => handleUpdateTranslation(lang, 'content', e.target.value)}
                    className="flex-1 resize-none"
                    placeholder={t('editor.promptContent')}
                  />
                </>
              ) : (
                <div className="flex-1 overflow-auto">
                  <h3 className="text-lg font-semibold mb-2">{editedTranslations[lang]?.title}</h3>
                  <div className="prose prose-sm max-w-none">
                    {editedTranslations[lang]?.content}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
    </Tabs>
  )
}