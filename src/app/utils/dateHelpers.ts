/**
 * 类型安全的日期处理工具
 */

/**
 * 安全地解析日期字符串
 * @param dateInput - 可能是字符串、Date对象或其他类型
 * @returns 有效的Date对象，如果无法解析则返回当前时间
 */
export function parseDateSafely(dateInput: unknown): Date {
  // 如果已经是Date对象，直接返回
  if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
    return dateInput
  }
  
  // 如果是字符串，尝试解析
  if (typeof dateInput === 'string') {
    const date = new Date(dateInput)
    if (!isNaN(date.getTime())) {
      return date
    }
  }
  
  // 如果是数字（时间戳），尝试解析
  if (typeof dateInput === 'number') {
    const date = new Date(dateInput)
    if (!isNaN(date.getTime())) {
      return date
    }
  }
  
  // 默认返回当前时间
  console.warn('Failed to parse date:', dateInput)
  return new Date()
}

/**
 * 将Date对象转换为ISO字符串
 * @param date - Date对象
 * @returns ISO格式的字符串
 */
export function dateToISOString(date: Date): string {
  try {
    return date.toISOString()
  } catch (error) {
    console.error('Failed to convert date to ISO string:', error)
    return new Date().toISOString()
  }
}

/**
 * 格式化日期为本地字符串
 * @param date - Date对象或字符串
 * @param locale - 语言环境，默认为系统语言
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | string, locale?: string): string {
  const dateObj = typeof date === 'string' ? parseDateSafely(date) : date
  
  try {
    return dateObj.toLocaleDateString(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch (error) {
    console.error('Failed to format date:', error)
    return dateObj.toISOString().split('T')[0]
  }
}

/**
 * 格式化日期时间为本地字符串
 * @param date - Date对象或字符串
 * @param locale - 语言环境，默认为系统语言
 * @returns 格式化后的日期时间字符串
 */
export function formatDateTime(date: Date | string, locale?: string): string {
  const dateObj = typeof date === 'string' ? parseDateSafely(date) : date
  
  try {
    return dateObj.toLocaleString(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('Failed to format datetime:', error)
    return dateObj.toISOString()
  }
}

/**
 * 获取相对时间描述（如"5分钟前"）
 * @param date - Date对象或字符串
 * @param locale - 语言环境，默认为系统语言
 * @returns 相对时间描述
 */
export function getRelativeTime(date: Date | string, locale: string = 'zh-CN'): string {
  const dateObj = typeof date === 'string' ? parseDateSafely(date) : date
  const now = new Date()
  const diffMs = now.getTime() - dateObj.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (locale.startsWith('zh')) {
    if (diffSeconds < 60) return '刚刚'
    if (diffMinutes < 60) return `${diffMinutes}分钟前`
    if (diffHours < 24) return `${diffHours}小时前`
    if (diffDays < 30) return `${diffDays}天前`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`
    return `${Math.floor(diffDays / 365)}年前`
  } else {
    if (diffSeconds < 60) return 'just now'
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`
    return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`
  }
}

/**
 * 验证日期是否有效
 * @param date - 要验证的日期
 * @returns 是否是有效日期
 */
export function isValidDate(date: unknown): date is Date {
  return date instanceof Date && !isNaN(date.getTime())
}