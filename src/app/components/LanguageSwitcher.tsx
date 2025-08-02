import { Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation()

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select value={i18n.language} onValueChange={(lng) => i18n.changeLanguage(lng)}>
        <SelectTrigger className="h-8 w-[110px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="zh">{t('settings.languages.zh')}</SelectItem>
          <SelectItem value="en">{t('settings.languages.en')}</SelectItem>
          <SelectItem value="ja">{t('settings.languages.ja')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}