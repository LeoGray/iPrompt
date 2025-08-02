export function formatBytes(bytes: number, locale?: string): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  const value = bytes / Math.pow(k, i)
  const decimals = i === 0 ? 0 : 1
  
  return `${value.toFixed(decimals)} ${sizes[i]}`
}