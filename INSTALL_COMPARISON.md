# macOS vs Windows 安裝差異對照表

本文件總結 macOS 和 Windows 兩個平台在安裝本專案時的主要差異。

## 📊 快速對照表

| 項目 | macOS | Windows |
|------|-------|---------|
| **套件管理器** | Homebrew | 無（手動下載） |
| **終端機** | Terminal (zsh/bash) | PowerShell / CMD |
| **Git 安裝** | `brew install git` | 下載 Git for Windows 安裝程式 |
| **Node.js 安裝** | `brew install node@18` | 下載 .msi 安裝程式 |
| **MySQL 安裝** | `brew install mysql` | 下載 MySQL Installer for Windows |
| **MySQL root 預設密碼** | **無密碼** | **安裝時必須設定** |
| **MySQL 服務管理** | `brew services start mysql` | Windows 服務管理或 MySQL Workbench |
| **複製檔案指令** | `cp .env.example .env` | `copy .env.example .env` |
| **文字編輯器** | `nano` / `vim` | `notepad` |
| **路徑分隔符號** | `/` (斜線) | `\` (反斜線) |

---

## 🔑 關鍵差異說明

### 1. MySQL 密碼設定

這是兩個平台**最重要的差異**：

#### macOS (Homebrew)
- ✅ MySQL root 用戶**預設沒有密碼**
- ✅ `.env.example` 中的設定可以直接使用：
  ```env
  DATABASE_URL="mysql://root@localhost:3306/store_management"
  ```
- ✅ 可以直接執行：`mysql -uroot`

#### Windows (官方安裝程式)
- ⚠️ 安裝時**必須設定** root 密碼
- ⚠️ 必須修改 `.env` 檔案加入密碼：
  ```env
  DATABASE_URL="mysql://root:您的密碼@localhost:3306/store_management"
  ```
- ⚠️ 連線時需要提供密碼：`mysql -uroot -p`

---

### 2. 環境變數路徑設定

#### macOS
- Homebrew 自動處理 PATH 設定
- 安裝完成後指令立即可用

#### Windows
- 可能需要手動加入 MySQL 到環境變數
- Node.js 安裝程式會自動設定 PATH
- 修改環境變數後需要重新開啟 PowerShell

**如何在 Windows 設定環境變數**：
1. 按 `Win + X` → 選擇「系統」
2. 點擊「進階系統設定」
3. 點擊「環境變數」
4. 在「系統變數」中找到「Path」→「編輯」
5. 新增路徑（例如：`C:\Program Files\MySQL\MySQL Server 8.0\bin`）

---

### 3. 終端機指令差異

| 操作 | macOS (bash) | Windows (PowerShell) |
|------|-------------|---------------------|
| 複製檔案 | `cp .env.example .env` | `copy .env.example .env` |
| 編輯檔案 | `nano .env` | `notepad .env` |
| 列出檔案 | `ls -la` | `dir` 或 `ls`（PowerShell）|
| 切換目錄 | `cd ~/Documents` | `cd C:\Users\使用者\Documents` |
| 查看內容 | `cat file.txt` | `type file.txt` 或 `cat`（PowerShell）|

> **注意**：PowerShell 支援許多 Unix 指令別名（如 `ls`、`cat`），但建議使用原生指令以避免問題。

---

### 4. 服務管理

#### macOS - 使用 Homebrew Services
```bash
# 啟動 MySQL
brew services start mysql

# 停止 MySQL
brew services stop mysql

# 查看所有服務狀態
brew services list
```

#### Windows - 使用 Windows 服務
**方法 1：圖形介面**
1. 按 `Win + R`，輸入 `services.msc`
2. 找到「MySQL80」服務
3. 右鍵選擇「啟動」或「停止」

**方法 2：PowerShell（需管理員權限）**
```powershell
# 啟動 MySQL
Start-Service MySQL80

# 停止 MySQL
Stop-Service MySQL80

# 查看服務狀態
Get-Service MySQL80
```

---

### 5. 權限問題

#### macOS
- 通常不需要管理員權限執行 npm install
- 使用 Homebrew 安裝時可能需要輸入系統密碼

#### Windows
- npm install 可能需要管理員權限
- 建議以系統管理員身分執行 PowerShell
- MySQL 配置需要管理員權限

---

## 🎯 建議與最佳實踐

### 對 macOS 用戶
1. ✅ 使用 Homebrew，讓所有工具保持最新
2. ✅ 保持 `.env` 使用預設設定（無密碼）
3. ✅ 定期執行 `brew update && brew upgrade` 更新工具

### 對 Windows 用戶
1. ⚠️ **務必記住 MySQL root 密碼**
2. ⚠️ 安裝完軟體後記得重新開啟 PowerShell
3. ⚠️ 遇到問題時優先檢查環境變數設定
4. ✅ 建議使用 **PowerShell** 而非 CMD（功能更完整）
5. ✅ 考慮使用 [Windows Terminal](https://aka.ms/terminal) 提升終端機體驗
6. ✅ 開發環境可以設定簡單密碼（如 `root`），但**正式環境必須使用強密碼**

---

## 🐛 常見問題快速參考

### macOS 常見問題
- **Homebrew 安裝失敗**：檢查網路連線，確認 Xcode Command Line Tools 已安裝
- **MySQL 無法啟動**：執行 `brew services restart mysql`
- **Port 被佔用**：使用 `lsof -ti:3001` 查看佔用程式

### Windows 常見問題
- **npm 指令找不到**：重新開啟 PowerShell，確認 Node.js 已安裝
- **MySQL 指令找不到**：檢查環境變數 PATH，加入 MySQL bin 目錄
- **權限錯誤**：以系統管理員身分執行 PowerShell
- **防火牆封鎖**：確認 Windows Defender 允許 Node.js 和 MySQL 通過

---

## 📚 相關資源

- [完整 macOS 安裝指南](README.md#macos-安裝指南)
- [完整 Windows 安裝指南](README.md#windows-安裝指南)
- [專案架構文件](tech_architecture_doc.md)
- [部署指南](README.md#生產環境部署注意事項)
