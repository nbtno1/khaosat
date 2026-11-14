#!/bin/bash
# ==============================================================================
# KỊCH BẢN SAO LƯU DỮ LIỆU TỰ ĐỘNG CHO HỆ THỐNG KHẢO SÁT KIỂM TOÁN NHÀ NƯỚC
# Tuân thủ Quyết định về An toàn thông tin và Sao lưu dữ liệu định kỳ
# ==============================================================================

set -e

BACKUP_DIR="/var/backups/khaosat"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_PATH="${BACKUP_DIR}/khaosat_backup_${TIMESTAMP}"
MONGO_URI="${MONGODB_URI:-mongodb://localhost:27017/khaosat}"
RETENTION_DAYS=30

mkdir -p "${BACKUP_DIR}"

echo "=== [1/3] Bắt đầu sao lưu cơ sở dữ liệu MongoDB (${TIMESTAMP}) ==="
mongodump --uri="${MONGO_URI}" --out="${BACKUP_PATH}" --gzip

echo "=== [2/3] Nén file sao lưu (.tar.gz) ==="
tar -czf "${BACKUP_PATH}.tar.gz" -C "${BACKUP_DIR}" "khaosat_backup_${TIMESTAMP}"
rm -rf "${BACKUP_PATH}"

echo "=== [3/3] Xóa các bản sao lưu cũ quá ${RETENTION_DAYS} ngày ==="
find "${BACKUP_DIR}" -name "khaosat_backup_*.tar.gz" -type f -mtime +${RETENTION_DAYS} -delete

echo "✅ HOÀN TẤT SAO LƯU: ${BACKUP_PATH}.tar.gz"
