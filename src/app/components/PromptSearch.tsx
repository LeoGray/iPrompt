import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Input } from './ui/input'

interface PromptSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function PromptSearch({ value, onChange, placeholder }: PromptSearchProps) {
  const { t } = useTranslation()

  return (
    <div className="relative mb-6">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder || t('prompts.searchPlaceholder')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
    </div>
  )
}