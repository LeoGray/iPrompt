import { useState } from 'react'
import { Settings, Download, Upload, Save, Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Button } from './ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { storageManager } from '../services/storage'
import { usePromptStore } from '../store/promptStore'
import { useToast } from './ui/use-toast'

export function SettingsDialog() {
  const [open, setOpen] = useState(false)
  const [importing, setImporting] = useState(false)
  const { toast } = useToast()
  const { t, i18n } = useTranslation()
  const prompts = usePromptStore((state) => state.prompts)

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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('settings.title')}</DialogTitle>
          <DialogDescription>
            {t('settings.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
                <Button
                  onClick={handleBackup}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {t('settings.createBackup')}
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">{t('settings.statistics')}</h3>
            <div className="text-sm text-muted-foreground">
              <p>{t('settings.promptTotal')}: {prompts.length}</p>
              <p>{t('settings.categoryTotal')}: {new Set(prompts.map(p => p.category).filter(Boolean)).size}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">{t('settings.language')}</h3>
            <Select value={i18n.language} onValueChange={(lng) => i18n.changeLanguage(lng)}>
              <SelectTrigger className="w-full">
                <Globe className="mr-2 h-4 w-4" />
                <SelectValue placeholder={t('settings.language')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zh">{t('settings.languages.zh')}</SelectItem>
                <SelectItem value="en">{t('settings.languages.en')}</SelectItem>
                <SelectItem value="ja">{t('settings.languages.ja')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}