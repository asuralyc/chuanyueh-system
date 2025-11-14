#!/bin/sh

# 使用 Dockerfile 中已設定的環境變數
# DATABASE_URL, NODE_ENV, PORT, JWT_SECRET, JWT_EXPIRES_IN
# 已經在 Dockerfile 的 ENV 指令中設定好了

echo "Starting application..."
echo "DATABASE_URL is set: ${DATABASE_URL:0:30}..."

# 等待資料庫準備好（最多等待 30 秒）
echo "Waiting for database to be ready..."
MAX_RETRIES=30
RETRY_COUNT=0

until npx prisma db push --accept-data-loss --skip-generate > /dev/null 2>&1 || [ $RETRY_COUNT -eq $MAX_RETRIES ]; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo "Database not ready yet... retry $RETRY_COUNT/$MAX_RETRIES"
  sleep 1
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "ERROR: Database connection timeout after $MAX_RETRIES seconds"
  echo "Please check:"
  echo "1. MySQL service is running in Zeabur"
  echo "2. DATABASE_URL is correct"
  echo "3. Network connectivity"
  exit 1
fi

echo "Database is ready!"

# 執行資料庫同步
echo "Syncing database schema..."

# 先嘗試 migrate deploy（適用於已有 migration history 的情況）
npx prisma migrate deploy 2>/dev/null

if [ $? -ne 0 ]; then
  echo "Migrate deploy failed, trying db push instead..."
  # 如果 migrate 失敗，使用 db push（會同步 schema 但不記錄 migration）
  npx prisma db push --accept-data-loss --skip-generate

  if [ $? -ne 0 ]; then
    echo "ERROR: Database sync failed"
    exit 1
  fi
fi

echo "Database schema synced successfully!"

# 執行 seed（初始化測試資料）
echo "Seeding database with initial data..."
node prisma/seed.js || echo "Seed failed or already seeded, continuing..."

# 啟動應用
echo "Starting NestJS application..."
node dist/main
