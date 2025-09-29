# 川岳員工及會員管理系統

這是一個用於管理川岳分店、員工及會員的管理系統，旨在提供一個統一的平台來進行權限控制和跨分店的會員服務。

## 主要功能

- **分店管理**: 管理分店基本資訊與員工配置。
- **員工管理**: 員工帳號、權限、排班等管理功能。
- **會員管理**: 跨分店的會員檔案與服務紀錄。
- **權限控制**: 基於角色的權限管理 (RBAC)。
- **審計日誌**: 追蹤所有重要的系統操作。

## 技術棧

### 前端
- **框架**: Vue.js 3 + TypeScript
- **狀態管理**: Pinia
- **UI 框架**: Element Plus / Ant Design Vue
- **建置工具**: Vite
- **HTTP 客戶端**: Axios

### 後端
- **框架**: NestJS + TypeScript
- **ORM**: Prisma
- **資料庫**: MySQL 8.0+
- **快取**: Redis 6+
- **認證**: JWT (JSON Web Tokens)

### 部署
- **容器化**: Docker + Docker Compose
- **CI/CD**: GitHub Actions

## 如何開始

### 必要條件

請確保您的開發環境已安裝以下軟體：

- Node.js 18+
- npm 或 yarn
- Docker & Docker Compose
- MySQL 8.0+
- Redis 6+
- Git

### 安裝與設定

1.  **Clone 專案**
    ```bash
    git clone https://github.com/asuralyc/chuanyueh-system.git
    cd chuanyueh-system
    ```

2.  **安裝後端依賴**
    ```bash
    cd store-management-api
    npm install
    ```

3.  **設定後端環境變數**
    複製 `.env.example` 為 `.env`，並根據您的本地環境修改資料庫、Redis 等設定。
    ```bash
    cp .env.example .env
    ```

4.  **啟動資料庫與 Redis**
    您可以使用 Docker Compose 快速啟動所需的服務：
    ```bash
    docker-compose up -d mysql redis
    ```

5.  **執行資料庫遷移**
    這將會根據 `prisma/schema.prisma` 的定義建立資料庫結構。
    ```bash
    npx prisma migrate dev --name init
    ```

6.  **安裝前端依賴**
    ```bash
    cd ../store-management-client
    npm install
    ```

## 如何執行

### 啟動後端開發伺服器

```bash
# 位於 store-management-api 目錄
npm run start:dev
```
後端服務將會啟動在 `http://localhost:3000`。

### 啟動前端開發伺服器

```bash
# 位於 store-management-client 目錄
npm run dev
```
前端應用程式將會啟動在 `http://localhost:5173` (或 Vite 指定的其他埠號)。

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

請遵循 [Conventional Commits](https://www.conventionalcommits.org/) 規範，格式如下：

```
<類型>[可選的作用域]: <描述>

[可選的正文]

[可選的頁腳]
```

**類型** 必須是以下之一：
- `feat`: 新功能
- `fix`: 修復 bug
- `docs`: 文件更新
- `style`: 程式碼格式調整
- `refactor`: 重構程式碼
- `test`: 測試相關
- `chore`: 建置或工具相關

## 授權

本專案採用 [MIT](LICENSE.txt) 授權。
