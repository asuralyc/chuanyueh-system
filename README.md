# 川岳員工及會員管理系統

這是一個用於管理川岳分店、員工及會員的管理系統，旨在提供一個統一的平台來進行權限控制和跨分店的會員服務。

---

## 在全新的 Mac 上從零到一的完整安裝指引

本指南將引導您在一台全新的 macOS 電腦上，從零開始，直到成功在本機（localhost）執行本專案的完整步驟。

### 步驟一：安裝 Homebrew (macOS 的套件管理工具)

Homebrew 能讓您輕鬆地安裝後續需要的軟體。打開您的終端機（Terminal），貼上並執行以下指令：

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
*（此為 Homebrew 官方安裝指令，它會引導您完成安裝）*

### 步驟二：透過 Homebrew 安裝核心開發工具

安裝完 Homebrew 後，用它來安裝 Git、Node.js 和 MySQL。

```bash
# 1. 安裝版本控制工具 Git
brew install git

# 2. 安裝後端執行環境 Node.js
brew install node@18

# 3. 安裝資料庫 MySQL
brew install mysql
```

### 步驟三：啟動 MySQL 服務

安裝完 MySQL 後，需要啟動它，讓它在背景執行。

```bash
brew services start mysql
```

### 步驟四：下載專案程式碼

從 GitHub 下載您的專案到電腦上。

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
    *（因為您是使用 Homebrew 的預設設定安裝 MySQL，`root` 使用者沒有密碼，所以此時應該不需要修改 `.env` 檔案）*

3.  **建立資料庫與資料表**
    這個指令會自動在您剛啟動的 MySQL 中建立專案所需的資料庫和所有資料表。
    ```bash
    npx prisma migrate dev
    ```

### 步驟六：設定前端

1.  **進入前端專案目錄並安裝依賴套件**
    ```bash
    cd ../store-management-client
    npm install
    ```

### 步驟七：執行網站！

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

打開您的 Chrome 或任何瀏覽器，輸入網址 `http://localhost:5173`。

您應該就能看到您網站的登入頁面了。恭喜！

---

## 其他資訊

### 規劃中／部署用技術

以下技術雖然已包含在專案的設計或設定檔中，但在上述的基礎開發流程中並**不會**使用到。

- **快取**: Redis (用於生產環境的效能優化)
- **容器化**: Docker + Docker Compose (用於提供一致的開發環境或生產環境部署)
- **持續整合／持續部署 (CI/CD)**: GitHub Actions

### 貢獻指南

我們歡迎任何形式的貢獻！請遵循 [Conventional Commits](https://www.conventionalcommits.org/) 規範。

### 授權

本專案採用 [MIT](LICENSE.txt) 授權。
