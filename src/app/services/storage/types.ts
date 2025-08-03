import { Prompt } from '../../store/promptStore'
import { TranslationSettings } from '../../types/translation'

// 存储数据格式
export interface StorageData {
  version: string        // 数据版本，用于未来迁移
  prompts: Prompt[]      // Prompt 数据
  categories: string[]   // 分类列表
  settings?: Record<string, unknown>  // 预留设置项
  translationSettings?: TranslationSettings  // 翻译设置
  lastModified: string   // 最后修改时间 ISO string
}

// 备份信息
export interface BackupInfo {
  id: string
  name: string
  createdAt: string
  size?: number
}

// 存储使用情况
export interface StorageUsageInfo {
  used: number      // 已使用字节数
  limit?: number    // 限制字节数（可选，客户端可能没有限制）
  percentage?: number // 使用百分比（可选，没有限制时不计算）
}

// 存储服务接口
export interface IStorageService {
  // 基础操作
  load(): Promise<StorageData | null>
  save(data: StorageData): Promise<void>
  
  // 导入导出
  exportData(): Promise<Blob>
  importData(file: File): Promise<StorageData>
  
  // 存储使用情况
  getStorageUsage(): Promise<StorageUsageInfo>
  
  // 备份管理（可选）
  createBackup?(): Promise<void>
  listBackups?(): Promise<BackupInfo[]>
  restoreBackup?(backupId: string): Promise<void>
}

// 当前数据版本
export const STORAGE_VERSION = '1.0.0'

// 默认存储数据
export const DEFAULT_STORAGE_DATA: StorageData = {
  version: STORAGE_VERSION,
  prompts: [],
  categories: [],
  lastModified: new Date().toISOString()
}