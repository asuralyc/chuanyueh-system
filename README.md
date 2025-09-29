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

## 在全新的 Mac 上從零到一的完整安裝指引

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

### 步驟三：啟動 MySQL 服務

```bash
brew services start mysql
```

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
    *（Homebrew 預設安裝的 MySQL `root` 使用者沒有密碼，所以此時應該不需要修改 `.env` 檔案）*

3.  **建立資料庫與資料表**
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