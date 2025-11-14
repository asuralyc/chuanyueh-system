# 川岳員工及會員管理系統

這是一個用於管理川岳分店、員工及會員的管理系統，旨在提供一個統一的平台來進行權限控制和跨分店的會員服務。

## 主要功能

- **分店管理**: 管理分店基本資訊與員工配置。
- **員工管理**: 員工帳號、權限、排班等管理功能。
- **會員管理**: 跨分店的會員檔案與服務紀錄。
- **權限控制**: 基於角色的權限管理 (RBAC)。
- **審計日誌**: 追蹤所有重要的系統操作。

## 技術棧

### 核心開發技術棧
為了在本機成功執行此專案，您需要了解以下核心技術：

- **前端**: Vue.js 3 + TypeScript
- **後端**: NestJS + TypeScript
- **資料庫互動**: Prisma ORM
- **資料庫**: MySQL 8.0+

### 規劃中／部署用技術
以下技術雖然已包含在專案的設計或設定檔中，但在基礎開發流程中並**不會**使用到。

- **快取**: Redis (用於生產環境的效能優化)
- **容器化**: Docker + Docker Compose (用於提供一致的開發環境或生產環境部署)
- **持續整合／持續部署 (CI/CD)**: GitHub Actions

---

## 📦 安裝指引

請根據您的作業系統選擇對應的安裝指南：

- **[macOS 安裝指南](#macos-安裝指南)** - 適用於 Mac 用戶
- **[Windows 安裝指南](#windows-安裝指南)** - 適用於 Windows 用戶
- **[平台差異對照表](INSTALL_COMPARISON.md)** - 查看 macOS 與 Windows 的詳細差異

---

## macOS 安裝指南

本指南將引導您在一台全新的 macOS 電腦上，從零開始，直到成功在本機（localhost）執行本專案的完整步驟。

### 步驟一：安裝 Homebrew

Homebrew 能讓您輕鬆地安裝後續需要的軟體。打開您的終端機（Terminal），貼上並執行以下指令：

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 步驟二：安裝核心開發工具

透過 Homebrew 安裝 Git、Node.js 和 MySQL。

```bash
brew install git
brew install node@18
brew install mysql
```

### 步驟三：啟動 MySQL 服務並建立資料庫

1. **啟動 MySQL 服務**
   ```bash
   brew services start mysql
   ```

2. **建立專案資料庫**（如果尚未建立）
   ```bash
   mysql -uroot -e "CREATE DATABASE IF NOT EXISTS store_management;"
   ```

   > **注意**：Homebrew 安裝的 MySQL 預設 root 使用者沒有密碼。如果您的 MySQL 有設定密碼，請使用 `mysql -uroot -p` 並輸入密碼。

### 步驟四：下載專案程式碼

```bash
git clone https://github.com/asuralyc/chuanyueh-system.git
cd chuanyueh-system
```

### 步驟五：設定後端與資料庫

1.  **進入後端專案目錄並安裝依賴套件**
    ```bash
    cd store-management-api
    npm install
    ```

2.  **建立環境設定檔**
    ```bash
    cp .env.example .env
    ```

    > **預設設定說明**：
    > - `.env.example` 已針對 Homebrew MySQL 的預設設定進行配置（root 使用者無密碼）
    > - 如果您的 MySQL root 使用者有設定密碼，請編輯 `.env` 檔案，將 `DATABASE_URL` 修改為：
    >   `DATABASE_URL="mysql://root:你的密碼@localhost:3306/store_management"`

3.  **執行資料庫遷移**
    此指令會自動在 MySQL 中建立專案所需的資料庫和資料表。
    ```bash
    npx prisma migrate dev
    ```

### 步驟六：設定前端

1.  **進入前端專案目錄並安裝依賴套件**
    ```bash
    cd ../store-management-client
    npm install
    ```

### 步驟七：執行網站

現在一切就緒，我們需要開兩個終端機視窗來分別啟動後端和前端。

1.  **啟動後端 (在第一個終端機)**
    ```bash
    # 進入後端目錄
    cd store-management-api
    npm run start:dev
    ```

2.  **啟動前端 (在第二個終端機)**
    ```bash
    # 進入前端目錄
    cd store-management-client
    npm run dev
    ```

### 最終步驟：打開瀏覽器

打開您的瀏覽器，輸入網址 `http://localhost:5173`。

---

## Windows 安裝指南

本指南將引導您在 Windows 電腦上，從零開始安裝所有必要軟體，直到成功在本機執行本專案。

### 步驟一：安裝 Git

1. **下載 Git for Windows**
   - 前往 [https://git-scm.com/download/win](https://git-scm.com/download/win)
   - 下載最新版本的 Git for Windows 安裝程式

2. **執行安裝程式**
   - 執行下載的 `.exe` 檔案
   - 安裝過程中保持預設選項即可
   - 建議勾選「Git Bash Here」選項

3. **驗證安裝**
   - 開啟 PowerShell 或命令提示字元
   - 輸入以下指令確認安裝成功：
     ```powershell
     git --version
     ```

### 步驟二：安裝 Node.js

1. **下載 Node.js**
   - 前往 [https://nodejs.org/](https://nodejs.org/)
   - 下載 **LTS（長期支援）版本**（建議 18.x 或更新版本）

2. **執行安裝程式**
   - 執行下載的 `.msi` 安裝檔
   - 保持所有預設選項
   - 確認勾選「Automatically install the necessary tools」

3. **驗證安裝**
   - 開啟新的 PowerShell 視窗
   - 輸入以下指令：
     ```powershell
     node --version
     npm --version
     ```

### 步驟三：安裝 MySQL

1. **下載 MySQL**
   - 前往 [https://dev.mysql.com/downloads/installer/](https://dev.mysql.com/downloads/installer/)
   - 選擇「Windows (x86, 32-bit), MSI Installer」（較小的 web installer 即可）
   - 點擊「No thanks, just start my download」

2. **執行 MySQL 安裝程式**
   - 執行下載的安裝程式
   - 選擇「Developer Default」安裝類型
   - 等待所有元件下載完成

3. **配置 MySQL Server**

   在「Type and Networking」步驟：
   - 保持預設的 **Port 3306**
   - 確認「Open Windows Firewall port for network access」有勾選

   在「Authentication Method」步驟：
   - 選擇「Use Strong Password Encryption」（推薦）

   在「Accounts and Roles」步驟：
   - **設定 root 密碼**（請記住這個密碼，後續會用到）
   - 建議：開發環境可以設定簡單密碼如 `root`，但**正式環境必須使用強密碼**

   在「Windows Service」步驟：
   - 確認「Configure MySQL Server as a Windows Service」有勾選
   - 勾選「Start the MySQL Server at System Startup」

4. **完成安裝**
   - 點擊「Execute」執行配置
   - 等待所有步驟完成（綠色勾選）
   - 點擊「Finish」

5. **驗證 MySQL 安裝**
   - 開啟 PowerShell（以系統管理員身分執行）
   - 輸入以下指令連線到 MySQL：
     ```powershell
     mysql -uroot -p
     ```
   - 輸入您剛才設定的 root 密碼
   - 如果成功連線，會看到 `mysql>` 提示符
   - 輸入 `exit` 離開

### 步驟四：建立專案資料庫

在 PowerShell 中執行：

```powershell
mysql -uroot -p -e "CREATE DATABASE IF NOT EXISTS store_management;"
```

輸入您的 MySQL root 密碼後，資料庫就會建立完成。

### 步驟五：下載專案程式碼

1. **選擇專案存放位置**
   - 建議在 `C:\Users\您的使用者名稱\Documents\` 建立專案資料夾
   - 開啟 PowerShell，切換到您想要的目錄：
     ```powershell
     cd C:\Users\您的使用者名稱\Documents\
     ```

2. **Clone 專案**
   ```powershell
   git clone https://github.com/asuralyc/chuanyueh-system.git
   cd chuanyueh-system
   ```

### 步驟六：設定後端與資料庫

1. **進入後端專案目錄並安裝依賴套件**
   ```powershell
   cd store-management-api
   npm install
   ```

2. **建立環境設定檔**
   ```powershell
   copy .env.example .env
   ```

3. **編輯 `.env` 檔案**
   - 使用記事本或任何文字編輯器開啟 `.env` 檔案：
     ```powershell
     notepad .env
     ```

   - **重要**：將 `DATABASE_URL` 修改為包含您的 MySQL 密碼：
     ```env
     DATABASE_URL="mysql://root:您的MySQL密碼@localhost:3306/store_management"
     ```

     例如，如果您的密碼是 `root`：
     ```env
     DATABASE_URL="mysql://root:root@localhost:3306/store_management"
     ```

   - 儲存並關閉檔案

4. **執行資料庫遷移**
   ```powershell
   npx prisma migrate dev
   ```

   此指令會自動建立專案所需的資料表結構。

### 步驟七：設定前端

1. **回到專案根目錄並進入前端目錄**
   ```powershell
   cd ..
   cd store-management-client
   npm install
   ```

### 步驟八：執行網站

現在一切就緒，我們需要開啟**兩個 PowerShell 視窗**來分別啟動後端和前端。

1. **啟動後端（第一個 PowerShell 視窗）**
   ```powershell
   cd C:\Users\您的使用者名稱\Documents\chuanyueh-system\store-management-api
   npm run start:dev
   ```

   > 成功啟動後會看到類似以下訊息：
   > ```
   > [Nest] Nest application successfully started
   > ```

2. **啟動前端（開啟新的 PowerShell 視窗）**
   ```powershell
   cd C:\Users\您的使用者名稱\Documents\chuanyueh-system\store-management-client
   npm run dev
   ```

   > 成功啟動後會顯示：
   > ```
   > Local: http://localhost:5173/
   > ```

### 最終步驟：打開瀏覽器

打開您的瀏覽器，輸入網址 `http://localhost:5173`。

---

### Windows 常見問題與解決方法

#### 問題 1：npm install 失敗，出現權限錯誤

**解決方法**：以系統管理員身分執行 PowerShell
- 在開始選單搜尋「PowerShell」
- 右鍵選擇「以系統管理員身分執行」

#### 問題 2：MySQL 指令找不到（mysql is not recognized）

**解決方法**：將 MySQL 加入環境變數
1. 開啟「系統內容」→「進階」→「環境變數」
2. 在「系統變數」中找到「Path」，點擊「編輯」
3. 新增 MySQL 的 bin 目錄路徑，通常是：
   ```
   C:\Program Files\MySQL\MySQL Server 8.0\bin
   ```
4. 重新開啟 PowerShell 視窗

#### 問題 3：Prisma migrate 失敗，連不上資料庫

**可能原因與解決方法**：
- **密碼錯誤**：檢查 `.env` 檔案中的 `DATABASE_URL` 密碼是否正確
- **MySQL 服務未啟動**：
  1. 按 `Win + R` 輸入 `services.msc`
  2. 找到「MySQL80」服務
  3. 確認狀態為「執行中」，如果不是請右鍵「啟動」
- **Port 被佔用**：確認 3306 port 沒有被其他程式使用

#### 問題 4：Port 3001 或 5173 已被使用

**解決方法**：變更應用程式 Port
- **後端**：編輯 `store-management-api/.env`，修改 `PORT=3001` 為其他 port
- **前端**：編輯 `store-management-client/vite.config.ts`，加入 server 設定

---

## 專案結構 (後端)

```
src/
├── app.module.ts              # 主模組
├── main.ts                   # 應用程式入口
├── config/                   # 配置管理
├── common/                   # 共用模組 (守衛, 攔截器等)
├── modules/
│   ├── auth/                # 認證模組
│   ├── users/               # 使用者模組
│   ├── branches/            # 分店模組
│   ├── employees/           # 員工模組
│   ├── members/             # 會員模組
│   ├── roles/               # 角色權限模組
│   └── audit/               # 審計日誌模組
├── prisma/                  # Prisma 相關
└── types/                   # TypeScript 型別定義
```

## 生產環境部署注意事項

⚠️ **重要安全提醒**

本專案的 `.env` 檔案已提交到 Git 作為**開發環境範本**，包含預設的開發用設定值。

**部署到生產環境前，請務必修改以下設定：**

### 後端 (store-management-api/.env)

1. **資料庫連線字串** - 更新為生產環境的資料庫
   ```env
   DATABASE_URL="mysql://生產環境使用者:強密碼@生產環境主機:3306/資料庫名稱"
   ```

2. **JWT Secret** - 使用強隨機密鑰（至少 256 bits）
   ```bash
   # 生成安全的 JWT secret
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
   將生成的密鑰複製到 .env：
   ```env
   JWT_SECRET="生成的隨機密鑰"
   ```

3. **環境變數**
   ```env
   NODE_ENV="production"
   PORT=3001
   ```

### 前端 (store-management-client/.env)

更新 API 基礎 URL 為生產環境的後端地址：
```env
VITE_API_BASE_URL=https://your-production-api.com/api/v1
```

### 建議做法

為了更安全的生產環境部署，建議：

1. 複製 `.env` 為 `.env.production`
2. 在 `.env.production` 中填入生產環境設定
3. `.env.production` 不會被提交到 Git（已在 .gitignore 中排除）
4. 部署時使用環境變數或秘密管理服務

---

## 貢獻指南

我們歡迎任何形式的貢獻！請參考以下的 Git 工作流程與 Commit 訊息規範。

### Git 工作流程

- **主分支**: `main` (生產環境)
- **開發分支**: `develop` (主要開發分支)
- **功能分支**: 從 `develop` 分支出來，命名為 `feature/功能名稱`
- **修復分支**: 從 `develop` 或 `main` 分支出來，命名為 `hotfix/問題描述`

### Commit 訊息規範

請遵循 [Conventional Commits](https://www.conventionalcommits.org/) 規範。

## 授權

本專案採用 [MIT](LICENSE.txt) 授權。