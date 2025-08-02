import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from './ui/button'
import { useToast } from './ui/use-toast'
import { storageManager } from '../services/storage'
import { PromptVersion } from '../store/promptStore'

export function SyncFromWeb() {
  useTranslation()
  const { toast } = useToast()
  const [isSyncing, setIsSyncing] = useState(false)
  
  // 只在 Tauri 环境中显示
  if (!window.__TAURI__) {
    return null
  }
  
  const handleSync = async () => {
    try {
      setIsSyncing(true)
      
      // 从 localStorage 读取 Web 数据
      const webData = localStorage.getItem('prompt-storage')
      if (!webData) {
        toast({
          title: '没有找到 Web 数据',
          description: '请先在 Web 版本中创建一些 Prompt',
          variant: 'destructive'
        })
        return
      }
      
      const parsedData = JSON.parse(webData)
      const dataToSync = (parsedData.state && typeof parsedData.state === 'object' && 'prompts' in parsedData.state) 
        ? parsedData.state
        : parsedData
      
      // 获取当前客户端数据
      const currentData = await storageManager.load()
      
      // 合并数据（保留版本历史）
      const mergedPrompts = [...(currentData?.prompts || [])]
      
      // 添加或更新 Web 数据中的 prompts
      dataToSync.prompts?.forEach((webPrompt: unknown) => {
        const prompt = webPrompt as { 
          id: string; 
          title: string; 
          content: string; 
          category?: string; 
          tags?: string[]; 
          createdAt: Date; 
          updatedAt: Date; 
          versions?: unknown[] 
        }
        const existingIndex = mergedPrompts.findIndex(p => p.id === prompt.id)
        if (existingIndex >= 0) {
          // 更新现有 prompt，保留版本历史
          mergedPrompts[existingIndex] = {
            ...prompt,
            versions: (prompt.versions || []) as PromptVersion[]
          }
        } else {
          // 添加新 prompt
          mergedPrompts.push({
            ...prompt,
            versions: (prompt.versions || []) as PromptVersion[]
          })
        }
      })
      
      // 保存合并后的数据
      await storageManager.save({
        version: '1.0.0',
        prompts: mergedPrompts,
        categories: [...new Set([
          ...(currentData?.categories || []),
          ...(dataToSync.categories || [])
        ])],
        lastModified: new Date().toISOString()
      })
      
      // 重新加载 store
      window.location.reload()
      
      toast({
        title: '同步成功',
        description: `已同步 ${dataToSync.prompts?.length || 0} 个 Prompt`
      })
    } catch (error) {
      console.error('Sync error:', error)
      toast({
        title: '同步失败',
        description: '请查看控制台了解详情',
        variant: 'destructive'
      })
    } finally {
      setIsSyncing(false)
    }
  }
  
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleSync}
        disabled={isSyncing}
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
        从 Web 同步数据
      </Button>
    </div>
  )
}