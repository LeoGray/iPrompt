import { useState, useEffect } from 'react'
import { usePromptStore } from '../store/promptStore'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { useToast } from './ui/use-toast'
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
  }, [isOpen, showVersions])
  
  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: '错误',
        description: '标题和内容不能为空',
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
        title: '成功',
        description: 'Prompt 已更新',
      })
    } else {
      addPrompt(promptData)
      toast({
        title: '成功',
        description: 'Prompt 已创建',
      })
    }
    
    onClose()
  }
  
  const handleRestoreVersion = (versionContent: string) => {
    setContent(versionContent)
    setShowVersions(false)
    toast({
      title: '已恢复',
      description: '已恢复到选中的版本，请保存以应用更改',
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
            title="关闭 (Esc)"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-semibold">
            {mode === 'create' ? '创建新 Prompt' : '编辑 Prompt'}
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
              编辑
            </Button>
            <Button
              variant={viewMode === 'split' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('split')}
              className="rounded-none border-x"
            >
              <FileText className="w-4 h-4 mr-1" />
              分屏
            </Button>
            <Button
              variant={viewMode === 'preview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('preview')}
              className="rounded-l-none"
            >
              <Eye className="w-4 h-4 mr-1" />
              预览
            </Button>
          </div>
          {mode === 'edit' && prompt?.versions && prompt.versions.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowVersions(!showVersions)}
            >
              <History className="w-4 h-4 mr-2" />
              历史版本 ({prompt.versions.length})
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => onClose()}
          >
            取消
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            保存 (⌘S)
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
                placeholder="输入 Prompt 标题"
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
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                      <SelectItem value="add-new">+ 添加新分类</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="输入新分类名称"
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
                      确定
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <Input
                  id="tags"
                  placeholder="标签（用逗号分隔）"
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
                        <SelectValue placeholder="标题" />
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
                      title="粗体 (Ctrl+B)"
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown('*', '*')}
                      title="斜体 (Ctrl+I)"
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown('~~', '~~')}
                      title="删除线"
                    >
                      <Strikethrough className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown('`', '`')}
                      title="行内代码"
                    >
                      <Code className="h-4 w-4" />
                    </Button>
                    
                    <div className="w-px h-6 bg-border mx-1" />
                    
                    {/* 列表组 */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown('\n- ', '')}
                      title="无序列表"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown('\n1. ', '')}
                      title="有序列表"
                    >
                      <ListOrdered className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown('\n- [ ] ', '')}
                      title="任务列表"
                    >
                      <CheckSquare className="h-4 w-4" />
                    </Button>
                    
                    <div className="w-px h-6 bg-border mx-1" />
                    
                    {/* 块级元素组 */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown('\n> ', '')}
                      title="引用"
                    >
                      <Quote className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown('\n```\n', '\n```\n')}
                      title="代码块"
                    >
                      <FileCode className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown('\n---\n', '')}
                      title="分割线"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    
                    <div className="w-px h-6 bg-border mx-1" />
                    
                    {/* 插入组 */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown('[', '](url)')}
                      title="链接"
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
                    placeholder="输入 Prompt 内容（支持 Markdown 格式）..."
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
                        title="代码块"
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
                        title="引用"
                      >
                        <Quote className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => insertMarkdown('[', '](url)')}
                        title="链接"
                      >
                        <Link className="h-4 w-4" />
                      </Button>
                    </div>
                    <Textarea
                      id="content"
                      placeholder="输入 Prompt 内容（支持 Markdown 格式）..."
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
                        {content || '*暂无内容*'}
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
              <span>版本历史</span>
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
                  <span className="text-sm font-medium">当前版本</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(prompt.updatedAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap line-clamp-3">{prompt.content}</p>
              </div>
              
              {prompt.versions.map((version, index) => (
                <div key={version.id} className="p-3 border rounded-lg hover:bg-muted/30">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium">版本 {prompt.versions!.length - index}</span>
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
                        恢复
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