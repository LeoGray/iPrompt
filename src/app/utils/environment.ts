export function getEnvironment() {
  if (window.__TAURI__) {
    return 'tauri'
  }
  return 'web'
}

export function isDesktopApp() {
  return window.__TAURI__
}

export function isWebApp() {
  return !isDesktopApp()
}