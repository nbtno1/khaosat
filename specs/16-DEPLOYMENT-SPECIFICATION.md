# 16. DEPLOYMENT SPECIFICATION — ĐẶC TẢ TRIỂN KHAI VÀ VẬN HÀNH

## 1. YÊU CẦU TÀI NGUYÊN HẠ TẦNG (SYSTEM REQUIREMENTS)

### 1.1. Máy chủ Ứng dụng (Next.js Application Server)
- **Hệ điều hành:** Linux (Ubuntu 22.04 LTS / Debian 12 / RHEL 9).
- **CPU:** Tối thiểu 2 vCPU (Khuyến nghị 4 vCPU cho giai đoạn cao điểm nộp phiếu).
- **RAM:** Tối thiểu 4 GB (Khuyến nghị 8 GB để xử lý tác vụ xuất Excel dung lượng lớn mượt mà).
- **Ổ cứng:** 20 GB SSD (NVMe).
- **Node.js Runtime:** Node.js v20.x LTS hoặc Node.js v22.x LTS.

### 1.2. Máy chủ Cơ sở dữ liệu (MongoDB Database Server)
- **Phiên bản:** MongoDB Community / Enterprise 7.0+ hoặc MongoDB Atlas.
- **Cấu hình cụm:** Replica Set tối thiểu 3 nodes (Primary - Secondary - Arbiter) bảo đảm tính sẵn sàng cao (High Availability).
- **RAM:** Tối thiểu 4 GB (cho WiredTiger cache bộ nhớ trong).
- **Ổ cứng:** 50 GB SSD có cơ chế tự động tăng dung lượng và snapshot sao lưu hàng ngày.

---

## 2. BIẾN MÔI TRƯỜNG CẤU HÌNH (ENVIRONMENT VARIABLES)

File cấu hình `.env.production` phải chứa đầy đủ các biến môi trường sau:

```bash
# ==============================================================================
# ỨNG DỤNG & MẠNG
# ==============================================================================
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_APP_URL=https://khaosat.kiemtoannn.gov.vn

# ==============================================================================
# CƠ SỞ DỮ LIỆU MONGODB
# ==============================================================================
# Chuỗi kết nối MongoDB Replica Set với write concern majority
MONGODB_URI=mongodb://dbuser:StrongPassword123@mongo-node1:27017,mongo-node2:27017/khaosat_db?replicaSet=rs0&authSource=admin&w=majority

# ==============================================================================
# XÁC THỰC AUTH.JS (NEXTAUTH V5)
# ==============================================================================
# Khóa bí mật ký JWT Session (tối thiểu 32 ký tự ngẫu nhiên)
AUTH_SECRET=super_secret_generated_random_key_64_characters_long_for_security
AUTH_TRUST_HOST=true
AUTH_URL=https://khaosat.kiemtoannn.gov.vn/api/auth

# ==============================================================================
# BẢO MẬT & RATE LIMITING
# ==============================================================================
RATE_LIMIT_MAX_SUBMISSIONS_PER_MINUTE=10
RATE_LIMIT_MAX_REQUESTS_PER_MINUTE=100

# ==============================================================================
# CẤU HÌNH PHIÊN BẢN NGHIỆP VỤ
# ==============================================================================
DEFAULT_SCHEMA_VERSION=3.3
```

---

## 3. ĐÓNG GÓI CONTAINER DOCKER (MULTI-STAGE DOCKERFILE)

Hệ thống được đóng gói tối ưu bằng Multi-stage Dockerfile giúp giảm thiểu dung lượng image xuống dưới 150 MB và tăng cường bảo mật (chạy bằng tài khoản non-root `nextjs`).

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

---

## 4. QUY TRÌNH SAO LƯU VÀ PHỤC HỒI DỮ LIỆU (BACKUP & RESTORE)

### 4.1. Kịch bản Sao lưu Tự động Hàng ngày (Daily Backup Cronjob)
Chạy vào lúc 01:00 AM hàng ngày trong suốt thời gian mở các đợt khảo sát:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/khaosat"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
TARGET_FILE="$BACKUP_DIR/khaosat_backup_$TIMESTAMP.tar.gz"

mkdir -p "$BACKUP_DIR"

# Thực hiện trích xuất dữ liệu MongoDB dạng nén
mongodump --uri="$MONGODB_URI" --archive | gzip > "$TARGET_FILE"

# Xóa các bản sao lưu cũ hơn 30 ngày để tiết kiệm dung lượng
find "$BACKUP_DIR" -type f -name "khaosat_backup_*.tar.gz" -mtime +30 -exec rm {} \;

echo "Sao lưu hoàn tất: $TARGET_FILE"
```

### 4.2. Quy trình Phục hồi khi có sự cố (Disaster Recovery)
```bash
# 1. Giải nén và phục hồi vào database
gunzip < /var/backups/khaosat/khaosat_backup_YYYYMMDD_HHMMSS.tar.gz | mongorestore --uri="$MONGODB_URI" --archive --drop

# 2. Khởi động lại dịch vụ ứng dụng
docker compose restart app
```

---

## 5. GIÁM SÁT HỆ THỐNG VÀ HEALTHCHECK API
- **Endpoint kiểm tra trạng thái sống:** `GET /api/health`
  - Kiểm tra kết nối MongoDB.
  - Kiểm tra trạng thái bộ nhớ RAM máy chủ.
  - Phản hồi: `{ "status": "UP", "database": "CONNECTED", "timestamp": "2026-11-14T17:42:00.000Z" }`
- **Reverse Proxy:** Khuyến nghị đặt Nginx hoặc Cloudflare phía trước làm Reverse Proxy để terminate SSL, bật nén Gzip/Brotli và bảo vệ chống tấn công DDoS.
