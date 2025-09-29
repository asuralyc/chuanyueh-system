# 川岳員工及會員管理系統 - 技術架構說明書

## 1. 系統概述

### 1.1 系統目標
建立一個川岳員工及會員管理系統，支援分店經理、員工、會員的統一管理，實現權限控制和跨分店會員服務。

### 1.2 核心功能
- 分店管理（分店資訊、員工配置）
- 員工管理（帳號、權限、排班）
- 會員管理（跨分店會員檔案、服務紀錄）
- 權限控制（RBAC 角色權限管理）
- 審計日誌（重要操作記錄）

## 2. 技術棧選型

### 2.1 前端
- **Framework**: Vue.js 3 + TypeScript
- **狀態管理**: Pinia
- **UI Framework**: Element Plus / Ant Design Vue
- **建置工具**: Vite
- **HTTP Client**: Axios

### 2.2 後端
- **Runtime**: Node.js 18+
- **Framework**: NestJS + TypeScript
- **ORM**: Prisma
- **認證**: @nestjs/passport + JWT
- **驗證**: class-validator + class-transformer
- **文件**: @nestjs/swagger

### 2.3 資料庫
- **主資料庫**: MySQL 8.0+
- **快取**: Redis 6+
- **連線池**: Prisma 內建連線池

### 2.4 部署與維運
- **容器化**: Docker + Docker Compose
- **程序管理**: PM2 (單機) / Kubernetes (叢集)
- **反向代理**: Nginx
- **CI/CD**: GitHub Actions
- **監控**: PM2 Monitor / Prometheus + Grafana

## 3. 系統架構設計

### 3.1 整體架構圖

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端 (Vue.js)  │    │  後端 (NestJS)   │    │  資料庫 (MySQL)  │
│                 │────│                 │────│                 │
│ - 管理後台      │    │ - REST API      │    │ - 業務資料      │
│ - 權限控制      │    │ - JWT 認證      │    │ - 使用者資料    │
│ - 業務功能      │    │ - RBAC 權限     │    │ - 審計日誌      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                       ┌─────────────────┐
                       │   快取 (Redis)   │
                       │                 │
                       │ - Session       │
                       │ - 業務快取      │
                       └─────────────────┘
```

### 3.2 後端模組架構

```
src/
├── app.module.ts              # 主模組
├── main.ts                   # 應用程式入口
├── config/                   # 配置管理
│   ├── database.config.ts
│   ├── jwt.config.ts
│   └── redis.config.ts
├── common/                   # 共用模組
│   ├── decorators/          # 自訂裝飾器
│   ├── filters/             # 異常過濾器
│   ├── guards/              # 守衛 (認證/授權)
│   ├── interceptors/        # 攔截器
│   └── pipes/               # 管道 (驗證/轉換)
├── modules/
│   ├── auth/                # 認證模組
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/      # Passport 策略
│   │   └── dto/
│   ├── users/               # 使用者模組
│   ├── branches/            # 分店模組
│   ├── employees/           # 員工模組
│   ├── members/             # 會員模組
│   ├── roles/               # 角色權限模組
│   └── audit/               # 審計日誌模組
├── prisma/                  # Prisma 相關
│   ├── schema.prisma        # 資料模型定義
│   ├── migrations/          # 資料庫遷移
│   └── seed.ts              # 初始資料
└── types/                   # TypeScript 型別定義
```

## 4. 資料庫設計

### 4.1 核心資料表

```sql
-- 分店表
CREATE TABLE branches (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 使用者表 (系統登入帳號)
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  last_login_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 角色表
CREATE TABLE roles (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  permissions JSON, -- 權限清單
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 使用者角色關聯表
CREATE TABLE user_roles (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  role_id VARCHAR(36) NOT NULL,
  branch_id VARCHAR(36) NULL, -- 分店綁定，NULL 表示全域角色
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (role_id) REFERENCES roles(id),
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  UNIQUE KEY unique_user_role_branch (user_id, role_id, branch_id)
);

-- 員工表
CREATE TABLE employees (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) UNIQUE NOT NULL,
  branch_id VARCHAR(36) NOT NULL,
  employee_number VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(50) NOT NULL,
  title VARCHAR(50),
  phone VARCHAR(20),
  hire_date DATE NULL,
  status ENUM('active', 'inactive', 'resigned') DEFAULT 'active',
  resignation_date DATE NULL,
  resignation_reason TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- 會員表
CREATE TABLE members (
  id VARCHAR(36) PRIMARY KEY,
  member_number VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(50) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  home_branch_id VARCHAR(36) NOT NULL, -- 註冊分店
  birth_date DATE,
  gender ENUM('male', 'female', 'other'),
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (home_branch_id) REFERENCES branches(id),
  INDEX idx_phone (phone),
  INDEX idx_email (email),
  INDEX idx_member_number (member_number)
);

-- 服務記錄表 (會員跨分店服務記錄)
CREATE TABLE service_records (
  id VARCHAR(36) PRIMARY KEY,
  member_id VARCHAR(36) NOT NULL,
  branch_id VARCHAR(36) NOT NULL,
  employee_id VARCHAR(36) NOT NULL,
  service_type VARCHAR(50) NOT NULL,
  service_description TEXT,
  amount DECIMAL(10,2),
  service_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id),
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- 審計日誌表
CREATE TABLE audit_logs (
  id VARCHAR(36) PRIMARY KEY,
  actor_user_id VARCHAR(36) NOT NULL,
  action VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, LOGIN 等
  entity VARCHAR(50) NOT NULL, -- 操作的實體類型
  entity_id VARCHAR(36), -- 操作的實體 ID
  old_values JSON, -- 修改前的值
  new_values JSON, -- 修改後的值
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (actor_user_id) REFERENCES users(id),
  INDEX idx_actor_user (actor_user_id),
  INDEX idx_entity (entity, entity_id),
  INDEX idx_created_at (created_at)
);
```

### 4.2 初始角色數據

```sql
-- 預設角色
INSERT INTO roles (id, code, name, description, permissions) VALUES
('role-admin', 'SUPER_ADMIN', '系統管理員', '系統最高權限', '["*"]'),
('role-branch-mgr', 'BRANCH_MANAGER', '分店經理', '管理單一分店', '["branch.read", "branch.update", "employee.manage", "member.read", "member.write", "service.manage"]'),
('role-employee', 'EMPLOYEE', '一般員工', '基本操作權限', '["member.read", "member.write", "service.create"]');
```

## 5. API 設計規範

### 5.1 RESTful API 設計原則

- **統一的 URL 結構**: `/api/v1/{resource}`
- **HTTP 狀態碼**: 標準化回應狀態
- **統一回應格式**: JSON 格式回應
- **分頁機制**: 統一的分頁參數
- **錯誤處理**: 結構化錯誤回應

### 5.2 API 回應格式

```typescript
// 成功回應
{
  "success": true,
  "data": any,
  "message": string,
  "timestamp": string
}

// 錯誤回應
{
  "success": false,
  "error": {
    "code": string,
    "message": string,
    "details": any
  },
  "timestamp": string
}

// 分頁回應
{
  "success": true,
  "data": {
    "items": any[],
    "pagination": {
      "page": number,
      "limit": number,
      "total": number,
      "totalPages": number
    }
  }
}
```

### 5.3 主要 API 端點

```
認證相關
POST   /api/v1/auth/login           # 登入
POST   /api/v1/auth/logout          # 登出
POST   /api/v1/auth/refresh         # 刷新 Token
GET    /api/v1/auth/profile         # 取得個人資料

分店管理
GET    /api/v1/branches             # 取得分店列表
POST   /api/v1/branches             # 建立分店
GET    /api/v1/branches/:id         # 取得分店詳情
PUT    /api/v1/branches/:id         # 更新分店
DELETE /api/v1/branches/:id         # 刪除分店

員工管理
GET    /api/v1/employees            # 取得員工列表
POST   /api/v1/employees            # 建立員工
GET    /api/v1/employees/:id        # 取得員工詳情
PUT    /api/v1/employees/:id        # 更新員工
DELETE /api/v1/employees/:id        # 刪除員工

會員管理
GET    /api/v1/members              # 取得會員列表
POST   /api/v1/members              # 建立會員
GET    /api/v1/members/:id          # 取得會員詳情
PUT    /api/v1/members/:id          # 更新會員
GET    /api/v1/members/:id/services # 取得會員服務記錄

服務記錄
GET    /api/v1/services             # 取得服務記錄
POST   /api/v1/services             # 建立服務記錄
```

## 6. 權限控制設計

### 6.1 RBAC 模型

```
使用者 (User) ← 多對多 → 角色 (Role) ← 多對多 → 權限 (Permission)
     ↓                      ↓
   員工檔案                分店範圍限制
```

### 6.2 權限控制實現

```typescript
// JWT Payload 結構
interface JwtPayload {
  sub: string;        // user ID
  email: string;
  roles: Array<{
    code: string;     // 角色代碼
    branchId?: string; // 分店限制
    permissions: string[]; // 權限清單
  }>;
  iat: number;
  exp: number;
}

// 權限檢查裝飾器
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('BRANCH_MANAGER')
@Permissions('employee.manage')
@BranchScope() // 限制只能操作自己分店的資料
async getEmployees(@Request() req) {
  // 實作內容
}
```

### 6.3 權限等級定義

```typescript
const PERMISSIONS = {
  // 分店權限
  'branch.read': '查看分店資訊',
  'branch.write': '修改分店資訊',
  'branch.manage': '管理分店 (包含建立/刪除)',
  
  // 員工權限
  'employee.read': '查看員工資料',
  'employee.write': '修改員工資料',
  'employee.manage': '管理員工 (包含建立/刪除)',
  
  // 會員權限
  'member.read': '查看會員資料',
  'member.write': '修改會員資料',
  'member.manage': '管理會員 (包含建立/停用)',
  
  // 服務權限
  'service.create': '建立服務記錄',
  'service.read': '查看服務記錄',
  'service.manage': '管理服務記錄',
  
  // 系統權限
  'audit.read': '查看審計日誌',
  'system.manage': '系統管理',
};
```

## 7. 安全性設計

### 7.1 認證與授權

- **JWT Token**: 無狀態認證，支援分散式部署
- **Token 過期機制**: Access Token (30分鐘) + Refresh Token (7天)
- **密碼加密**: bcrypt 雜湊演算法
- **API 限流**: Rate Limiting 防止濫用

### 7.2 資料安全

- **SQL 注入防護**: Prisma ORM 自動防護
- **XSS 防護**: 輸入驗證和輸出編碼
- **CSRF 防護**: SameSite Cookie 和 CSRF Token
- **敏感資料加密**: 個人資訊欄位加密存儲

### 7.3 網路安全

```typescript
// Helmet 安全頭設定
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS 設定
app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

## 8. 效能優化策略

### 8.1 資料庫優化

```sql
-- 關鍵索引
CREATE INDEX idx_employees_branch_status ON employees(branch_id, status);
CREATE INDEX idx_members_phone ON members(phone);
CREATE INDEX idx_service_records_member_date ON service_records(member_id, service_date);
CREATE INDEX idx_audit_logs_actor_date ON audit_logs(actor_user_id, created_at);

-- 複合索引
CREATE INDEX idx_user_roles_lookup ON user_roles(user_id, role_id, branch_id);
```

### 8.2 快取策略

```typescript
// Redis 快取配置
@Injectable()
export class CacheService {
  // 使用者權限快取 (5分鐘)
  async getUserPermissions(userId: string) {
    return this.cacheManager.get(`user:${userId}:permissions`);
  }
  
  // 分店資訊快取 (30分鐘)
  async getBranchInfo(branchId: string) {
    return this.cacheManager.get(`branch:${branchId}`);
  }
  
  // 會員基本資料快取 (10分鐘)
  async getMemberProfile(memberId: string) {
    return this.cacheManager.get(`member:${memberId}:profile`);
  }
}
```

### 8.3 API 效能

- **分頁查詢**: 預設每頁 20 筆，最大 100 筆
- **欄位選擇**: 只回傳需要的欄位
- **批量操作**: 支援批量建立和更新
- **非同步處理**: 重型操作使用佇列處理

## 9. 部署與維運

### 9.1 Docker 容器化

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

### 9.2 Docker Compose 設定

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mysql://user:pass@mysql:3306/dbname
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mysql
      - redis

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpass
      MYSQL_DATABASE: store_management
      MYSQL_USER: appuser
      MYSQL_PASSWORD: apppass
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app

volumes:
  mysql_data:
  redis_data:
```

### 9.3 CI/CD 流程

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run test:e2e

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and push Docker image
        run: |
          docker build -t myapp:latest .
          docker push myregistry/myapp:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server
        run: |
          ssh user@server 'docker pull myregistry/myapp:latest'
          ssh user@server 'docker-compose up -d'
```

## 10. 監控與日誌

### 10.1 應用程式監控

```typescript
// 健康檢查端點
@Controller('health')
export class HealthController {
  @Get()
  async check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: await this.checkDatabase(),
      redis: await this.checkRedis(),
      memory: process.memoryUsage(),
    };
  }
}

// 效能監控
import { Logger } from '@nestjs/common';

@Injectable()
export class PerformanceInterceptor {
  private readonly logger = new Logger(PerformanceInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    return next
      .handle()
      .pipe(
        tap(() => {
          const duration = Date.now() - start;
          if (duration > 1000) { // 超過 1 秒記錄警告
            this.logger.warn(`Slow request: ${duration}ms`);
          }
        }),
      );
  }
}
```

### 10.2 日誌管理

```typescript
// Winston Logger 設定
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

const logger = WinstonModule.createLogger({
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  ],
});
```

## 11. 測試策略

### 11.1 測試金字塔

```
       /\
      /  \
     / E2E \     <- 少量端到端測試
    /______\
   /        \
  / 整合測試  \   <- 適量整合測試
 /__________\
/            \
/   單元測試   \  <- 大量單元測試
/______________\
```

### 11.2 測試配置

```typescript
// 單元測試範例
describe('AuthService', () => {
  let service: AuthService;
  
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AuthService, UserService],
    }).compile();
    
    service = module.get<AuthService>(AuthService);
  });

  it('should validate user credentials', async () => {
    const result = await service.validateUser('test@test.com', 'password');
    expect(result).toBeDefined();
  });
});

// E2E 測試範例
describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/auth/login (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@test.com', password: 'password' })
      .expect(200)
      .expect((res) => {
        expect(res.body.access_token).toBeDefined();
      });
  });
});
```

## 12. 開發環境設定

### 12.1 必要軟體

- Node.js 18+
- npm 或 yarn
- Docker & Docker Compose
- MySQL 8.0+
- Redis 6+
- Git

### 12.2 專案初始化步驟

```bash
# 1. 建立專案
npx @nestjs/cli new store-management-api
cd store-management-api

# 2. 安裝必要套件
npm install @nestjs/passport @nestjs/jwt passport passport-jwt
npm install @prisma/client prisma
npm install class-validator class-transformer
npm install @nestjs/swagger swagger-ui-express
npm install bcrypt jsonwebtoken
npm install --save-dev @types/bcrypt @types/jsonwebtoken

# 3. 初始化 Prisma
npx prisma init

# 4. 設定環境變數
cp .env.example .env

# 5. 建立資料庫
npx prisma migrate dev --name init

# 6. 啟動開發服務
npm run start:dev
```

### 12.3 開發工具配置

```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  },
  "eslint.validate": [
    "javascript",
    "typescript"
  ]
}

// .prettierrc
{
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "semi": true,
  "printWidth": 100
}
```

## 13. 版本控制與協作

### 13.1 Git 工作流程

- **主分支**: `main` (生產環境)
- **開發分支**: `develop` (開發環境)
- **功能分支**: `feature/功能名稱`
- **修復分支**: `hotfix/問題描述`

### 13.2 Commit 訊息規範

```
類型(範圍): 簡短描述

詳細說明 (可選)

相關 Issue (可選)
```

類型:
- `feat`: 新功能
- `fix`: 修復 bug
- `docs`: 文件更新
- `style`: 程式碼格式調整
- `refactor`: 重構程式碼
- `test`: 測試相關
- `chore`: 建置或工具相關

## 14. 未來擴展規劃

### 14.1 短期目標 (1-3個月)
- [ ] 完成核心功能開發
- [ ] 單元測試覆蓋率達到 80%
- [ ] 部署到測試環境
- [ ] 效能調優

### 14.2 中期目標 (3-6個月)
- [ ] 增加報表功能
- [ ] 行動端 API 支援
- [ ] 微服務架構規劃
- [ ] 多租戶支援

### 14.3 長期目標 (6個月以上)
- [ ] 資料分析和 BI
- [ ] AI 智能推薦
- [ ] 多語系支援
- [ ] 雲原生架構遷移

---

## 附錄

### A. 環境變數配置範例

```bash
# .env
NODE_ENV=development
PORT=3000

# 資料庫配置
DATABASE_URL="mysql://username:password@localhost:3306/store_management"

# JWT 配置
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="30m"
REFRESH_TOKEN_EXPIRES_IN="7d"

# Redis 配置
REDIS_URL="redis://localhost:6379"

# 應用程式配置
FRONTEND_URL="http://localhost:8080"
API_PREFIX="api/v1"

# 日誌配置
LOG_LEVEL="info"
LOG_DIR="./logs"
```

### B. 效能指標目標

| 指標項目 | 目標值 | 備註 |
|---------|--------|------|
| API 回應時間 | < 200ms | 95% 請求 |
| 資料庫查詢時間 | < 100ms | 單次查詢 |
| 記憶體使用率 | < 70% | 正常運行時 |
| CPU 使用率 | < 60% | 正常運行時 |
| 可用性 | 99.5% | 月度統計 |

### C. 相關資源連結

- [NestJS 官方文件](https://nestjs.com/)
- [Prisma 官方文件](https://www.prisma.io/docs/)
- [Vue.js 官方文件](https://vuejs.org/)
- [MySQL 官方文件](https://dev.mysql.com/doc/)
- [Docker 官方文件](https://docs.docker.com/)

---

**文件版本**: v1.0  
**最後更新**: 2025-