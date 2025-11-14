FROM node:18-alpine

WORKDIR /app

# 設定所有環境變數（直接寫死在 Dockerfile）
ENV DATABASE_URL="mysql://root:dHZeVch59amf3762UC0Ny1MugEGFJ48A@sjc1.clusters.zeabur.com:26244/zeabur"
ENV NODE_ENV=production
ENV PORT=8080
ENV JWT_SECRET=chuanyueh-secret-key-2025-prod
ENV JWT_EXPIRES_IN=24h

# 複製 package 檔案和 prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# 安裝所有依賴（包含 devDependencies，因為建置需要）
# 使用 --include=dev 確保安裝 devDependencies
RUN npm install --include=dev

# 複製源碼
COPY . .

# 複製並設定啟動腳本權限
COPY start.sh .
RUN chmod +x start.sh

# 在刪除 devDependencies 之前，完成所有建置工作
RUN npx prisma generate && \
    npm run build && \
    npx tsc prisma/seed.ts --outDir prisma --skipLibCheck --esModuleInterop --downlevelIteration --target ES2017 --moduleResolution node --resolveJsonModule --module commonjs

# 清理：只保留生產環境依賴和 Prisma CLI
RUN npm prune --production && npm install prisma @prisma/client

EXPOSE 8080

# 使用啟動腳本
CMD ["./start.sh"]
