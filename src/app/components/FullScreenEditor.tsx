import { useState, useEffect, useCallback } from 'react'
import { usePromptStore } from '../store/promptStore'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { useToast } from './ui/use-toast'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { 
  X, 
  Save, 
  History, 
  RotateCcw, 
  ChevronLeft,
  Eye,
  Edit,
  FileText,
  Bold,
  Italic,
  Link,
  List,
  ListOrdered,
  Code,
  Quote,
  Strikethrough,
  Image,
  Table,
  CheckSquare,
  Minus,
  FileCode
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

interface FullScreenEditorProps {
  promptId: string | null
  isOpen: boolean
  onClose: () => void
  mode: 'create' | 'edit'
}

export function FullScreenEditor({ promptId, isOpen, onClose, mode }: FullScreenEditorProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [showVersions, setShowVersions] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('edit')
  
  const prompts = usePromptStore((state) => state.prompts)
  const getPromptById = usePromptStore((state) => state.getPromptById)
  const updatePrompt = usePromptStore((state) => state.updatePrompt)
  const addPrompt = usePromptStore((state) => state.addPrompt)
  const { toast } = useToast()
  const { t } = useTranslation()
  
  const prompt = promptId && mode === 'edit' ? getPromptById(promptId) : null
  
  // 获取现有分类
  const categories = prompts
    .map(p => p.category)
    .filter((cat): cat is string => !!cat)
    .filter((cat, index, self) => self.indexOf(cat) === index)
    .sort()
  
  useEffect(() => {
    if (prompt && mode === 'edit') {
      setTitle(prompt.title)
      setContent(prompt.content)
      setCategory(prompt.category || '')
      setTags(prompt.tags?.join(', ') || '')
    } else if (mode === 'create') {
      setTitle('')
      setContent('')
      setCategory('')
      setTags('')
    }
  }, [prompt, mode])
  
  const handleSave = useCallback(() => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: t('messages.error'),
        description: !title.trim() ? t('messages.titleRequired') : t('messages.contentRequired'),
        variant: 'destructive',
      })
      return
    }
    
    const promptData = {
      title,
      content,
      category: category || undefined,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
    }
    
    if (mode === 'edit' && promptId) {
      updatePrompt(promptId, promptData)
      toast({
        title: t('messages.saveSuccess'),
        description: t('messages.saveDescription'),
      })
    } else {
      addPrompt(promptData)
      toast({
        title: t('messages.saveSuccess'),
        description: t('messages.saveDescription'),
      })
    }
    
    onClose()
  }, [title, content, category, tags, mode, promptId, updatePrompt, addPrompt, toast, t, onClose])
  
  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !showVersions) {
        onClose()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, showVersions, onClose, handleSave])
  
  const handleRestoreVersion = (versionContent: string) => {
    setContent(versionContent)
    setShowVersions(false)
    toast({
      title: t('editor.restore'),
      description: t('messages.restoreDescription'),
    })
  }
  
  const handleCategoryChange = (value: string) => {
    if (value === 'add-new') {
      setIsAddingCategory(true)
      setCategory('')
    } else {
      setCategory(value)
      setIsAddingCategory(false)
    }
  }
  
  const insertMarkdown = (before: string, after: string) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement
    if (!textarea) return
    
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end)
    
    setContent(newText)
    
    // 重新设置光标位置
    setTimeout(() => {
      textarea.focus()
      if (selectedText) {
        textarea.setSelectionRange(start + before.length, end + before.length)
      } else {
        textarea.setSelectionRange(start + before.length, start + before.length)
      }
    }, 0)
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* 顶部工具栏 */}
      <div className="h-16 border-b flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            title={t('editor.shortcuts.escape')}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-semibold">
            {mode === 'create' ? t('editor.newPrompt') : t('editor.editPrompt')}
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border">
            <Button
              variant={viewMode === 'edit' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('edit')}
              className="rounded-r-none"
            >
              <Edit className="w-4 h-4 mr-1" />
              {t('editor.edit')}
            </Button>
            <Button
              variant={viewMode === 'split' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('split')}
              className="rounded-none border-x"
            >
              <FileText className="w-4 h-4 mr-1" />
              {t('editor.split')}
            </Button>
            <Button
              variant={viewMode === 'preview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('preview')}
              className="rounded-l-none"
            >
              <Eye className="w-4 h-4 mr-1" />
              {t('editor.preview')}
            </Button>
          </div>
          {mode === 'edit' && prompt?.versions && prompt.versions.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowVersions(!showVersions)}
            >
              <History className="w-4 h-4 mr-2" />
              {t('editor.history')} ({prompt.versions.length})
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => onClose()}
          >
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            {t('editor.shortcuts.save')}
          </Button>
        </div>
      </div>
      
      {/* 主编辑区域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧编辑区 */}
        <div className={`flex-1 flex flex-col ${showVersions ? 'border-r' : ''}`}>
          <div className="p-6 flex flex-col h-full">
            {/* 标题 */}
            <div className="mb-4">
              <Input
                id="title"
                placeholder={t('editor.promptTitle')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl font-semibold border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            
            {/* 分类和标签 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-1">
                {!isAddingCategory ? (
                  <Select value={category} onValueChange={handleCategoryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('editor.selectCategory')} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                      <SelectItem value="add-new">+ {t('editor.addNewCategory')}</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder={t('editor.newCategoryPlaceholder')}
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newCategory.trim()) {
                          setCategory(newCategory.trim())
                          setIsAddingCategory(false)
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        if (newCategory.trim()) {
                          setCategory(newCategory.trim())
                          setIsAddingCategory(false)
                        }
                      }}
                    >
                      {t('common.confirm')}
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <Input
                  id="tags"
                  placeholder={t('editor.tags')}
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
            </div>
            
            {/* 内容编辑区 */}
            <div className="flex-1 flex flex-col">
              {viewMode === 'edit' && (
                <>
                  <div className="flex items-center gap-1 p-2 border-b flex-wrap">
                    {/* 标题组 */}
                    <Select onValueChange={(value) => insertMarkdown('\n' + value + ' ', '')}>
                      <SelectTrigger className="w-24 h-8">
                        <SelectValue placeholder={t('editor.toolbar.heading')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="#">H1</SelectItem>
                        <SelectItem value="##">H2</SelectItem>
                        <SelectItem value="###">H3</SelectItem>
                        <SelectItem value="####">H4</SelectItem>
                        <SelectItem value="#####">H5</SelectItem>
                        <SelectItem value="######">H6</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="w-px h-6 bg-border mx-1" />
                    
                    {/* 文本格式组 */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown('**', '**')}
                      title={t('editor.toolbar.bold')}
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown('*', '*')}
                      title={t('editor.toolbar.italic')}
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown('~~', '~~')}
                      title={t('editor.toolbar.strikethrough')}
                    >
                      <Strikethrough className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown('`', '`')}
                      title={t('editor.toolbar.code')}
                    >
                      <Code className="h-4 w-4" />
                    </Button>
                    
                    <div className="w-px h-6 bg-border mx-1" />
                    
                    {/* 列表组 */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown('\n- ', '')}
                      title={t('editor.toolbar.list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown('\n1. ', '')}
                      title={t('editor.toolbar.orderedList')}
                    >
                      <ListOrdered className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown('\n- [ ] ', '')}
                      title={t('editor.toolbar.task')}
                    >
                      <CheckSquare className="h-4 w-4" />
                    </Button>
                    
                    <div className="w-px h-6 bg-border mx-1" />
                    
                    {/* 块级元素组 */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown('\n> ', '')}
                      title={t('editor.toolbar.quote')}
                    >
                      <Quote className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown('\n```\n', '\n```\n')}
                      title={t('editor.toolbar.codeBlock')}
                    >
                      <FileCode className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown('\n---\n', '')}
                      title={t('editor.toolbar.horizontalRule')}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    
                    <div className="w-px h-6 bg-border mx-1" />
                    
                    {/* 插入组 */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown('[', '](url)')}
                      title={t('editor.toolbar.link')}
                    >
                      <Link className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown('![alt text](', ')')}
                      title="图片"
                    >
                      <Image className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown('\n| 列1 | 列2 | 列3 |\n|---|---|---|\n| ', ' | | |\n')}
                      title="表格"
                    >
                      <Table className="h-4 w-4" />
                    </Button>
                  </div>
                  <Textarea
                    id="content"
                    placeholder={t('editor.promptContent') + '...'}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="flex-1 resize-none font-mono text-base leading-relaxed p-4 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <div className="flex justify-end p-2 text-xs text-muted-foreground border-t">
                    <span>{content.length} 字符</span>
                  </div>
                </>
              )}
              
              {viewMode === 'preview' && (
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {content || '*暂无内容*'}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
              
              {viewMode === 'split' && (
                <div className="flex-1 flex">
                  <div className="flex-1 flex flex-col border-r">
                    <div className="flex items-center gap-1 p-2 border-b overflow-x-auto">
                      {/* 标题 */}
                      <Select onValueChange={(value) => insertMarkdown('\n' + value + ' ', '')}>
                        <SelectTrigger className="w-20 h-8">
                          <SelectValue placeholder="H1-6" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="#">H1</SelectItem>
                          <SelectItem value="##">H2</SelectItem>
                          <SelectItem value="###">H3</SelectItem>
                          <SelectItem value="####">H4</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <div className="w-px h-6 bg-border mx-1" />
                      
                      {/* 常用格式 */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => insertMarkdown('**', '**')}
                        title="粗体"
                      >
                        <Bold className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => insertMarkdown('*', '*')}
                        title="斜体"
                      >
                        <Italic className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => insertMarkdown('`', '`')}
                        title="代码"
                      >
                        <Code className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => insertMarkdown('\n```\n', '\n```\n')}
                        title={t('editor.toolbar.codeBlock')}
                      >
                        <FileCode className="h-4 w-4" />
                      </Button>
                      
                      <div className="w-px h-6 bg-border mx-1" />
                      
                      {/* 列表和引用 */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => insertMarkdown('\n- ', '')}
                        title="列表"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => insertMarkdown('\n> ', '')}
                        title={t('editor.toolbar.quote')}
                      >
                        <Quote className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => insertMarkdown('[', '](url)')}
                        title={t('editor.toolbar.link')}
                      >
                        <Link className="h-4 w-4" />
                      </Button>
                    </div>
                    <Textarea
                      id="content"
                      placeholder={t('editor.promptContent') + '...'}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="flex-1 resize-none font-mono text-base leading-relaxed p-4 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <div className="flex justify-end p-2 text-xs text-muted-foreground border-t">
                      <span>{content.length} 字符</span>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="prose prose-neutral dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {content || `*${t('common.noData')}*`}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* 右侧版本历史 */}
        {showVersions && prompt?.versions && (
          <div className="w-80 p-4 overflow-y-auto bg-muted/10">
            <h3 className="text-base font-semibold mb-3 flex items-center justify-between">
              <span>{t('editor.history')}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowVersions(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </h3>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg bg-muted/50">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium">{t('editor.currentVersion')}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(prompt.updatedAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap line-clamp-3">{prompt.content}</p>
              </div>
              
              {prompt.versions.map((version, index) => (
                <div key={version.id} className="p-3 border rounded-lg hover:bg-muted/30">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium">{t('common.version')} {prompt.versions!.length - index}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(version.createdAt).toLocaleString()}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRestoreVersion(version.content)}
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        {t('editor.restore')}
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm whitespace-pre-wrap line-clamp-3">{version.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}