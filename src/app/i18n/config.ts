import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpApi from 'i18next-http-backend'

i18n
  .use(HttpApi) // 加载翻译文件
  .use(LanguageDetector) // 自动检测用户语言
  .use(initReactI18next) // 初始化 react-i18next
  .init({
    // 不设置 lng，让 LanguageDetector 自动检测
    fallbackLng: 'en',
    
    // 支持的语言
    supportedLngs: ['zh', 'en', 'ja'],
    
    // 调试模式（开发环境开启）
    debug: import.meta.env.DEV,
    
    // 插值选项
    interpolation: {
      escapeValue: false, // React 已经自动转义
    },
    
    // 后端选项
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
    
    // 检测选项
    detection: {
      // 检测顺序：先检查 localStorage，再检查浏览器语言
      order: ['localStorage', 'navigator', 'htmlTag'],
      
      // 缓存用户选择
      caches: ['localStorage'],
      
      // 从 localStorage 查找的键名
      lookupLocalStorage: 'i18nextLng',
      
      // 转换检测到的语言
      convertDetectedLanguage: (lng: string) => {
        const langCode = lng.toLowerCase()
        if (langCode.startsWith('zh')) return 'zh'
        if (langCode.startsWith('ja')) return 'ja'
        if (langCode.startsWith('en')) return 'en'
        return 'en'
      }
    },
    
    // React 选项
    react: {
      useSuspense: false, // 关闭 Suspense 以便更好地处理加载状态
    },
  })

export default i18n