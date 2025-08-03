import { useState, useEffect } from 'react'
import { Settings, Download, Upload, Save, HardDrive, Database, Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Button } from './ui/button'
import { Progress } from './ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { storageManager } from '../services/storage'
import { usePromptStore } from '../store/promptStore'
import { useTranslationStore } from '../store/translationStore'
import { useToast } from './ui/use-toast'
import { formatBytes } from '../utils/formatters'
import type { StorageUsageInfo } from '../services/storage/types'
import { cn } from '@/lib/utils'
import { PlatformInfo } from './PlatformInfo'
import { SyncFromWeb } from './SyncFromWeb'
import { TranslationSettings } from './TranslationSettings'

export function SettingsDialog() {
  const [open, setOpen] = useState(false)
  const [importing, setImporting] = useState(false)
  const [storageInfo, setStorageInfo] = useState<StorageUsageInfo | null>(null)
  const [loadingStorage, setLoadingStorage] = useState(false)
  const { toast } = useToast()
  const { t, i18n } = useTranslation()
  const prompts = usePromptStore((state) => state.prompts)
  const { settings: translationSettings, updateSettings, loadSettings } = useTranslationStore()

  useEffect(() => {
    if (open) {
      loadStorageInfo()
      loadSettings()
    }
  }, [open, prompts, loadSettings])

  const loadStorageInfo = async () => {
    setLoadingStorage(true)
    try {
      const usage = await storageManager.getStorageUsage()
      setStorageInfo(usage)
    } catch (error) {
      console.error('Failed to load storage info:', error)
    } finally {
      setLoadingStorage(false)
    }
  }

  const handleExport = async () => {
    try {
      await storageManager.exportToFile()
      toast({
        title: t('messages.exportSuccess'),
        description: t('messages.exportDescription', { count: prompts.length }),
      })
    } catch (error) {
      toast({
        title: t('messages.exportError'),
        description: error instanceof Error ? error.message : t('messages.unknownError'),
        variant: 'destructive',
      })
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    try {
      const data = await storageManager.importData(file)
      
      // Reload the page to refresh the store with new data
      window.location.reload()
      
      toast({
        title: t('messages.importSuccess'),
        description: t('messages.importDescription', { count: data.prompts.length }),
      })
    } catch (error) {
      toast({
        title: t('messages.importError'),
        description: error instanceof Error ? error.message : t('messages.unknownError'),
        variant: 'destructive',
      })
    } finally {
      setImporting(false)
      // Reset file input
      event.target.value = ''
    }
  }

  const handleBackup = async () => {
    try {
      await storageManager.createBackup()
      toast({
        title: t('messages.backupSuccess'),
        description: t('messages.backupDescription'),
      })
    } catch (error) {
      // Backup might not be supported on web
      toast({
        title: t('messages.backupError'),
        description: t('messages.backupNotSupported'),
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{t('settings.title')}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="general" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">
              <Database className="h-4 w-4 mr-2" />
              {t('settings.general')}
            </TabsTrigger>
            <TabsTrigger value="translation">
              <Languages className="h-4 w-4 mr-2" />
              {t('settings.translation')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">{t('settings.dataManagement')}</h3>
            <div className="space-y-2">
              <Button
                onClick={handleExport}
                className="w-full justify-start"
                variant="outline"
              >
                <Download className="mr-2 h-4 w-4" />
                {t('settings.exportData')}
              </Button>
              
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  disabled={importing}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  disabled={importing}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {importing ? t('settings.importing') : t('settings.importData')}
                </Button>
              </div>

              {window.__TAURI__ && (
                <>
                  <Button
                    onClick={handleBackup}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {t('settings.createBackup')}
                  </Button>
                  <SyncFromWeb />
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">{t('settings.statistics')}</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>{t('settings.promptTotal')}: {prompts.length}</p>
              <p>{t('settings.categoryTotal')}: {new Set(prompts.map(p => p.category).filter(Boolean)).size}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              {t('settings.storageUsage')}
            </h3>
            {loadingStorage ? (
              <p className="text-sm text-muted-foreground">{t('settings.storageCalculating')}</p>
            ) : storageInfo ? (
              <div className="space-y-2">
                {storageInfo.limit ? (
                  // Web 端显示限制和进度条
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {t('settings.storageInfo', {
                          used: formatBytes(storageInfo.used, i18n.language),
                          total: formatBytes(storageInfo.limit, i18n.language)
                        })}
                      </span>
                      <span className={cn(
                        "font-medium",
                        storageInfo.percentage && storageInfo.percentage > 80 ? "text-destructive" : "text-muted-foreground"
                      )}>
                        {t('settings.storagePercentage', { percentage: storageInfo.percentage })}
                      </span>
                    </div>
                    <Progress value={storageInfo.percentage || 0} className="h-2" />
                  </>
                ) : (
                  // 客户端只显示使用量
                  <div className="text-sm text-muted-foreground">
                    {t('settings.storageUsed', {
                      used: formatBytes(storageInfo.used, i18n.language)
                    })}
                  </div>
                )}
              </div>
            ) : null}
          </div>
          
            <div className="border-t pt-4 mt-2">
              <PlatformInfo />
            </div>
          </TabsContent>
          
          <TabsContent value="translation" className="space-y-4">
            <TranslationSettings 
              settings={translationSettings}
              onSettingsChange={updateSettings}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}