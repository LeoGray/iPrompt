import { useEffect, useState } from 'react'
import { platformAPI } from '../api/platform'
import { getEnvironment } from '../utils/environment'

export function PlatformInfo() {
  const [platform, setPlatform] = useState<string>('')
  const [version, setVersion] = useState<string>('')
  const environment = getEnvironment()

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
  }, [])

  return (
    <div className="text-xs text-muted-foreground">
      <span>环境: {environment}</span>
      {platform && <span> | 平台: {platform}</span>}
      {version && <span> | 版本: {version}</span>}
    </div>
  )
}