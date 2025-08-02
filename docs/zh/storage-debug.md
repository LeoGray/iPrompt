# iPrompt 存储调试指南

## 在 Debug 模式下查看存储信息

### 1. 打开开发者工具
- **macOS**: `Cmd + Option + I` 或 `Cmd + Option + J`
- **Windows/Linux**: `Ctrl + Shift + I` 或 `F12`

### 2. 在控制台输入以下命令

```javascript
// 查看当前平台
console.log('Platform:', await window.platformAPI?.getPlatform())

// 查看是否在 Tauri 环境
console.log('Is Tauri:', !!window.__TAURI__)

// 查看存储类型
console.log('Storage type:', window.__TAURI__ ? 'File System' : 'localStorage')

// 查看存储管理器信息
console.log('Storage Manager:', window.storageManager)

// 如果在 Tauri 环境，查看文件存储位置
if (window.__TAURI__) {
  console.log('Data file location: ~/Library/Application Support/iPrompt/iprompt-data.json')
  
  // 读取当前存储的数据
  const data = await window.__TAURI__.invoke('read_data_file')
  console.log('Stored data:', data)
  
  // 查看备份列表
  const backups = await window.__TAURI__.invoke('list_backups')
  console.log('Available backups:', backups)
}

// 查看 localStorage（如果有旧数据）
console.log('localStorage data:', localStorage.getItem('prompt-storage'))
```

### 3. 测试存储功能

```javascript
// 创建测试 prompt
const testPrompt = {
  title: 'Test Prompt',
  content: 'This is a test',
  category: 'Test'
}

// 添加测试数据
await window.usePromptStore.getState().addPrompt(testPrompt)
console.log('Test prompt added!')

// 检查是否保存到文件系统
if (window.__TAURI__) {
  const savedData = await window.__TAURI__.invoke('read_data_file')
  console.log('Data saved to file:', savedData)
}
```

## 存储位置

### Web 版本
- 使用 `localStorage`
- 数据存储在浏览器中

### Tauri 版本
- 使用文件系统存储
- **macOS**: `~/Library/Application Support/iPrompt/iprompt-data.json`
- **Windows**: `%APPDATA%/iPrompt/iprompt-data.json`
- **Linux**: `~/.local/share/iPrompt/iprompt-data.json`

## 如何判断当前存储模式

如果你看到：
- `Storage type: File System` - 说明正在使用文件系统存储（Tauri）
- `Storage type: localStorage` - 说明正在使用浏览器存储（Web）

## 启动命令

### Debug 模式（可以打开开发者工具）
```bash
npx tauri dev
```

### Release 模式（不能打开开发者工具）
```bash
npx tauri build
```