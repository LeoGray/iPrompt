#!/usr/bin/env node

import fs from 'fs/promises'
import path from 'path'
import axios from 'axios'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

const DEEPL_API_KEY = process.env.DEEPL_API_KEY
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate'

// 支持的目标语言
const TARGET_LANGUAGES = {
  en: 'EN-US', // 英语（美式）
  ja: 'JA'     // 日语
}

// 源语言
const SOURCE_LANGUAGE = 'ZH'

if (!DEEPL_API_KEY) {
  console.error('错误：未找到 DEEPL_API_KEY 环境变量')
  console.error('请在 .env 文件中设置 DEEPL_API_KEY')
  console.error('获取免费 API Key：https://www.deepl.com/pro-api')
  process.exit(1)
}

/**
 * 递归遍历对象并提取所有文本值
 */
function extractTexts(obj, prefix = '') {
  const texts = []
  
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = prefix ? `${prefix}.${key}` : key
    
    if (typeof value === 'string') {
      texts.push({ path: currentPath, text: value })
    } else if (typeof value === 'object' && value !== null) {
      texts.push(...extractTexts(value, currentPath))
    }
  }
  
  return texts
}

/**
 * 根据路径设置对象的值
 */
function setByPath(obj, path, value) {
  const keys = path.split('.')
  let current = obj
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!current[key]) {
      current[key] = {}
    }
    current = current[key]
  }
  
  current[keys[keys.length - 1]] = value
}

/**
 * 批量翻译文本
 */
async function translateBatch(texts, targetLang) {
  try {
    const response = await axios.post(DEEPL_API_URL, null, {
      params: {
        auth_key: DEEPL_API_KEY,
        text: texts,
        source_lang: SOURCE_LANGUAGE,
        target_lang: targetLang,
        preserve_formatting: 1
      },
      paramsSerializer: params => {
        // DeepL API 需要多个 text 参数
        const searchParams = new URLSearchParams()
        searchParams.append('auth_key', params.auth_key)
        searchParams.append('source_lang', params.source_lang)
        searchParams.append('target_lang', params.target_lang)
        searchParams.append('preserve_formatting', params.preserve_formatting)
        params.text.forEach(text => searchParams.append('text', text))
        return searchParams.toString()
      }
    })
    
    return response.data.translations.map(t => t.text)
  } catch (error) {
    console.error('翻译错误：', error.response?.data || error.message)
    throw error
  }
}

/**
 * 翻译单个语言文件
 */
async function translateLanguage(sourcePath, targetPath, targetLang) {
  console.log(`\n正在翻译到 ${targetLang}...`)
  
  try {
    // 读取源文件
    const sourceContent = await fs.readFile(sourcePath, 'utf-8')
    const sourceJson = JSON.parse(sourceContent)
    
    // 读取现有的目标文件（如果存在）
    let targetJson = {}
    try {
      const targetContent = await fs.readFile(targetPath, 'utf-8')
      targetJson = JSON.parse(targetContent)
    } catch (err) {
      // 文件不存在或为空，使用空对象
    }
    
    // 提取需要翻译的文本
    const allTexts = extractTexts(sourceJson)
    const textsToTranslate = []
    
    for (const { path, text } of allTexts) {
      // 检查是否已经有翻译
      const keys = path.split('.')
      let current = targetJson
      let hasTranslation = true
      
      for (const key of keys) {
        if (!current || !current[key]) {
          hasTranslation = false
          break
        }
        current = current[key]
      }
      
      if (!hasTranslation || current === '') {
        textsToTranslate.push({ path, text })
      }
    }
    
    if (textsToTranslate.length === 0) {
      console.log(`${targetLang} 已经是最新的，无需翻译`)
      return
    }
    
    console.log(`需要翻译 ${textsToTranslate.length} 个文本`)
    
    // 批量翻译（DeepL 支持一次最多 50 个文本）
    const batchSize = 50
    for (let i = 0; i < textsToTranslate.length; i += batchSize) {
      const batch = textsToTranslate.slice(i, i + batchSize)
      const texts = batch.map(item => item.text)
      
      console.log(`翻译进度：${i + 1}-${Math.min(i + batchSize, textsToTranslate.length)}/${textsToTranslate.length}`)
      
      const translations = await translateBatch(texts, TARGET_LANGUAGES[targetLang])
      
      // 将翻译结果写入目标对象
      for (let j = 0; j < batch.length; j++) {
        setByPath(targetJson, batch[j].path, translations[j])
      }
      
      // 避免 API 速率限制
      if (i + batchSize < textsToTranslate.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    // 保存翻译结果
    await fs.writeFile(targetPath, JSON.stringify(targetJson, null, 2), 'utf-8')
    console.log(`✓ ${targetLang} 翻译完成`)
    
  } catch (error) {
    console.error(`✗ ${targetLang} 翻译失败：`, error.message)
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('开始自动翻译...')
  console.log(`使用 DeepL API (Free)`)
  
  const localesDir = path.join(process.cwd(), 'public', 'locales')
  const sourcePath = path.join(localesDir, 'zh', 'translation.json')
  
  // 检查源文件是否存在
  try {
    await fs.access(sourcePath)
  } catch (error) {
    console.error('错误：源文件不存在：', sourcePath)
    process.exit(1)
  }
  
  // 翻译到各个目标语言
  for (const [lang, deeplLang] of Object.entries(TARGET_LANGUAGES)) {
    const targetPath = path.join(localesDir, lang, 'translation.json')
    await translateLanguage(sourcePath, targetPath, lang)
  }
  
  console.log('\n翻译完成！')
  console.log('提示：请检查翻译结果，特别是专业术语是否准确')
}

// 运行主函数
main().catch(console.error)