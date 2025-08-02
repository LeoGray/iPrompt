module.exports = {
  // 输入文件
  input: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/**/scripts/**',
    '!**/node_modules/**',
  ],
  
  // 输出目录
  output: './public/locales/$LOCALE/$NAMESPACE.json',
  
  // 默认值
  defaultValue: (locale, namespace, key) => {
    // 如果是中文，返回 key 作为默认值
    if (locale === 'zh') {
      return key
    }
    return ''
  },
  
  // 语言
  locales: ['zh', 'en', 'ja'],
  
  // 默认命名空间
  defaultNamespace: 'translation',
  
  // 保持原有翻译
  keepRemoved: false,
  
  // 排序键
  sort: true,
  
  // 使用键作为默认值
  useKeysAsDefaultValue: false,
  
  // 详细日志
  verbose: true,
  
  // 失败时退出
  failOnWarnings: false,
}