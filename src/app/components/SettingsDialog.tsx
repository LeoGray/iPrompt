import { useState } from 'react'
import { Settings, Download, Upload, Save } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Button } from './ui/button'
import { storageManager } from '../services/storage'
import { usePromptStore } from '../store/promptStore'
import { useToast } from './ui/use-toast'

export function SettingsDialog() {
  const [open, setOpen] = useState(false)
  const [importing, setImporting] = useState(false)
  const { toast } = useToast()
  const prompts = usePromptStore((state) => state.prompts)

  const handleExport = async () => {
    try {
      await storageManager.exportToFile()
      toast({
        title: '导出成功',
        description: `已导出 ${prompts.length} 条 Prompt`,
      })
    } catch (error) {
      toast({
        title: '导出失败',
        description: error instanceof Error ? error.message : '未知错误',
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
        title: '导入成功',
        description: `已导入 ${data.prompts.length} 条 Prompt`,
      })
    } catch (error) {
      toast({
        title: '导入失败',
        description: error instanceof Error ? error.message : '未知错误',
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
        title: '备份成功',
        description: '数据已备份到应用目录',
      })
    } catch (error) {
      // Backup might not be supported on web
      toast({
        title: '备份失败',
        description: '当前平台不支持自动备份，请使用导出功能',
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
          <DialogTitle>设置</DialogTitle>
          <DialogDescription>
            管理您的 Prompt 数据
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">数据管理</h3>
            <div className="space-y-2">
              <Button
                onClick={handleExport}
                className="w-full justify-start"
                variant="outline"
              >
                <Download className="mr-2 h-4 w-4" />
                导出数据
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
                  {importing ? '导入中...' : '导入数据'}
                </Button>
              </div>

              {window.__TAURI__ && (
                <Button
                  onClick={handleBackup}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Save className="mr-2 h-4 w-4" />
                  创建备份
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">统计信息</h3>
            <div className="text-sm text-muted-foreground">
              <p>Prompt 总数: {prompts.length}</p>
              <p>分类数: {new Set(prompts.map(p => p.category).filter(Boolean)).size}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}