# syntax=docker/dockerfile:1
# Zeabur: 請使用此自定義 Dockerfile，不要使用自動生成的
FROM node:22-alpine AS builder

WORKDIR /app

# 設定前端環境變數（直接寫死在 Dockerfile）
ENV VITE_API_BASE_URL="https://store-api.zeabur.app/api/v1"

# 複製 package 檔案
COPY package*.json ./

# 安裝依賴
RUN npm install

# 複製源碼（但排除 .env 檔案）
COPY . .

# 刪除所有 .env 檔案，確保使用 ENV 設定的環境變數
RUN rm -f .env .env.local .env.*.local .env.production .env.development

# 建置前端應用
RUN echo "Building with VITE_API_BASE_URL=$VITE_API_BASE_URL" && \
    echo "Verifying no .env files exist:" && \
    (ls -la .env* 2>&1 || echo "Good! No .env files found.") && \
    npm run build

# 驗證建置產物中是否包含正確的 API URL
RUN echo "Checking if API URL is correctly embedded..." && \
    grep -r "store-api.zeabur.app" /app/dist/ || echo "WARNING: API URL not found in build output!"

# 生產階段 - 使用 nginx 提供靜態檔案服務
FROM nginx:alpine

# 複製建置產物
COPY --from=builder /app/dist /usr/share/nginx/html

# 配置 nginx 支援 Vue Router（SPA 路由）
RUN echo 'server {' > /etc/nginx/conf.d/default.conf && \
    echo '    listen 8080;' >> /etc/nginx/conf.d/default.conf && \
    echo '    server_name localhost;' >> /etc/nginx/conf.d/default.conf && \
    echo '    root /usr/share/nginx/html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    index index.html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    ' >> /etc/nginx/conf.d/default.conf && \
    echo '    # Vue Router SPA 支援' >> /etc/nginx/conf.d/default.conf && \
    echo '    location / {' >> /etc/nginx/conf.d/default.conf && \
    echo '        try_files $uri $uri/ /index.html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    }' >> /etc/nginx/conf.d/default.conf && \
    echo '    ' >> /etc/nginx/conf.d/default.conf && \
    echo '    # Gzip 壓縮' >> /etc/nginx/conf.d/default.conf && \
    echo '    gzip on;' >> /etc/nginx/conf.d/default.conf && \
    echo '    gzip_vary on;' >> /etc/nginx/conf.d/default.conf && \
    echo '    gzip_min_length 1024;' >> /etc/nginx/conf.d/default.conf && \
    echo '    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;' >> /etc/nginx/conf.d/default.conf && \
    echo '}' >> /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
