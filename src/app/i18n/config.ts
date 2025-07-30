import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpApi from 'i18next-http-backend'

i18n
  .use(HttpApi) // 加载翻译文件
  .use(LanguageDetector) // 自动检测用户语言
  .use(initReactI18next) // 初始化 react-i18next
  .init({
    // 默认语言
    lng: 'zh',
    fallbackLng: 'zh',
    
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
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    
    // React 选项
    react: {
      useSuspense: false, // 关闭 Suspense 以便更好地处理加载状态
    },
  })

export default i18n