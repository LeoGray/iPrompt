import { useEffect, useState } from 'react'
import { platformAPI } from '../api/platform'
import { getEnvironment } from '../utils/environment'
import { useTranslation } from 'react-i18next'

export function PlatformInfo() {
  const [platform, setPlatform] = useState<string>('')
  const [version, setVersion] = useState<string>('')
  const environment = getEnvironment()
  const { t } = useTranslation()

  useEffect(() => {
    // Debug logs
    console.log('PlatformInfo - window.__TAURI__:', window.__TAURI__)
    console.log('PlatformInfo - environment:', environment)
    
    // Fetch platform information
    platformAPI.getPlatform().then(p => {
      console.log('PlatformInfo - platform result:', p)
      setPlatform(p)
    })
    platformAPI.getVersion().then(setVersion)
  }, [environment])

  return (
    <div className="text-xs text-muted-foreground">
      <span>{t('platform.environment')}: {environment === 'web' ? t('platform.web') : t('platform.desktop')}</span>
      {platform && <span> | {t('platform.platform')}: {platform}</span>}
      {version && <span> | {t('common.version')}: {version}</span>}
    </div>
  )
}