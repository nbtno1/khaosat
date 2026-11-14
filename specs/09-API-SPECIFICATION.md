# 09. API SPECIFICATION — ĐẶC TẢ API (OPENAPI 3.0)

Tài liệu đặc tả toàn bộ hệ thống REST API xây dựng trên Next.js Route Handlers (`app/api/...`).

---

## 1. TIÊU CHUẨN VÀ NGUYÊN TẮC THIẾT KẾ API
- **Định dạng dữ liệu:** JSON UTF-8.
- **Xác thực:**
  - Public APIs: Sử dụng `SurveyLink Token` trong route params hoặc query.
  - Admin APIs: Sử dụng HTTP-Only Cookie chứa JWT Session của `Auth.js`.
- **Cấu trúc phản hồi chuẩn (Standard Response Envelope):**
  - Thành công: `{ "success": true, "data": { ... }, "meta": { ... } }`
  - Lỗi: `{ "success": false, "error": { "code": "STRING_CODE", "message": "Mô tả lỗi tiếng Việt", "details": [ ... ] } }`
- **Mã lỗi HTTP tiêu chuẩn:**
  - `200 OK`: Xử lý thành công.
  - `201 Created`: Tạo mới tài nguyên thành công.
  - `400 Bad Request`: Tham số không hợp lệ.
  - `401 Unauthorized`: Chưa đăng nhập hoặc token hết hạn.
  - `403 Forbidden`: Không có quyền truy cập tài nguyên này.
  - `404 Not Found`: Không tìm thấy tài nguyên.
  - `422 Unprocessable Entity`: Dữ liệu gửi lên sai định dạng Zod schema.
  - `429 Too Many Requests`: Vượt quá giới hạn Rate Limiting.
  - `500 Internal Server Error`: Lỗi máy chủ nội bộ.

---

## 2. PHÂN HỆ KHẢO SÁT CÔNG KHAI (PUBLIC SURVEY APIS)

### 2.1. `GET /api/public/survey/validate-link/:token`
- **Mục tiêu:** Xác thực đường dẫn/mã QR của người dùng và tải thông tin địa bàn tỉnh.
- **Quyền hạn:** Công khai (Rate limit: 60 req/min).
- **Path Parameters:**
  - `token` (string, required): Mã token của tỉnh trong đợt khảo sát.
- **Response 200:**
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "campaignId": "673628fa9c1d8f0012a45b70",
    "campaignTitle": "Khảo sát nhu cầu đào tạo tài chính tài sản công cấp xã 2026",
    "schemaVersion": "3.3",
    "provinceCode": "01",
    "provinceName": "Thành phố Hà Nội",
    "communes": [
      { "code": "00001", "name": "Phường Phúc Xá" },
      { "code": "00015", "name": "Xã Ba Vì" }
    ],
    "isPilot": false,
    "status": "ACTIVE"
  }
}
```
- **Response 404:** `{ "success": false, "error": { "code": "LINK_NOT_FOUND", "message": "Đường dẫn khảo sát không tồn tại hoặc đã hết hạn." } }`

---

### 2.2. `GET /api/public/survey/schema/:version`
- **Mục tiêu:** Tải toàn bộ cấu hình 16 nhóm công việc, 4 vai trò, thang 4 mức, danh mục khó khăn và hình thức học.
- **Path Parameters:**
  - `version` (string, default: `"3.3"`).
- **Response 200:**
```json
{
  "success": true,
  "data": {
    "version": "3.3",
    "workgroups": [
      {
        "id": "N01",
        "order": 1,
        "title": "Trách nhiệm, kiểm soát nội bộ, công khai, làm việc với thanh tra, kiểm toán",
        "description": "Bảng phân công, điểm kiểm soát trong phần việc; hồ sơ công khai...",
        "learningTopics": [
          { "topicId": "N01_T01", "topicTitle": "Trách nhiệm, thẩm quyền theo vị trí" },
          { "topicId": "N01_T02", "topicTitle": "Kiểm soát nội bộ trong phần việc" }
        ]
      }
    ],
    "roles": [
      {
        "roleId": "DIRECT",
        "title": "Trực tiếp thực hiện",
        "description": "Lập chứng từ, sổ, danh sách, bảng theo dõi...",
        "levelDescriptions": {
          "1": "Chưa tự làm được; cần người khác làm cùng hoặc hướng dẫn từng bước",
          "2": "Tự làm được phần việc, nhưng còn cần người khác hỗ trợ chuyên môn...",
          "3": "Tự lập, tự xem lại kết quả và xử lý được các trường hợp thường gặp...",
          "4": "Xử lý được trường hợp phức tạp, chưa có hướng dẫn cụ thể..."
        }
      }
    ],
    "difficulties": [
      { "id": "KIEN_THUC", "title": "Kiến thức - Chưa nắm vững quy định, nguyên tắc" },
      { "id": "KHONG_KHO_KHAN", "title": "Không gặp khó khăn đáng kể", "isExclusive": true }
    ],
    "learningFormats": [
      { "id": "TAP_TRUNG", "title": "Lớp tập trung ngắn ngày" },
      { "id": "TRUC_TUYEN", "title": "Học trực tuyến" }
    ]
  }
}
```

---

### 2.3. `GET /api/public/survey/position-mapping`
- **Mục tiêu:** Lấy bảng tra cứu nhóm công việc gợi ý theo từng cơ quan và vị trí.
- **Query Parameters:** `agencyCode` (string), `positionCode` (string).
- **Response 200:**
```json
{
  "success": true,
  "data": {
    "agencyCode": "UBND_LEADERSHIP",
    "positionCode": "CHAIRMAN",
    "suggestedWorkgroupIds": ["N01", "N02", "N04", "N05", "N07", "N09", "N10", "N13", "N14"],
    "commonRoleId": "APPROVAL",
    "estimatedMinutes": 17
  }
}
```

---

### 2.4. `POST /api/public/survey/submit`
- **Mục tiêu:** Nhận và ghi nhận toàn bộ kết quả khảo sát từ người dùng.
- **Quyền hạn:** Công khai (Rate limit: 10 req/min per IP).
- **Request Body:** Đối tượng `SurveySubmissionInput` (được validate qua Zod).
- **Xử lý phía Server:**
  1. Validate ràng buộc toàn vẹn theo 12 quy tắc hiển thị logic.
  2. Tính toán mã băm SHA-256 `businessHash`.
  3. Kiểm tra trùng khớp: Nếu tìm thấy bản ghi có cùng `businessHash` trong cùng đợt → gắn cờ `isSuspectedDuplicate = true`.
  4. Lưu bản ghi vào collection `survey_responses`.
  5. Tăng biến đếm `totalSubmissions` của `survey_links`.
- **Response 200:**
```json
{
  "success": true,
  "data": {
    "submissionId": "67362a1b9c1d8f0012a45b81",
    "message": "Đã gửi thành công. Trân trọng cảm ơn anh/chị đã dành thời gian trả lời phiếu.",
    "submittedAt": "2026-11-14T17:42:00.000Z"
  }
}
```
- **Response 422:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Dữ liệu khảo sát không hợp lệ.",
    "details": [
      { "path": "part2.workgroupStatuses", "message": "Chưa hoàn thành chọn trạng thái cho đủ 16 nhóm công việc." }
    ]
  }
}
```

---

## 3. PHÂN HỆ QUẢN TRỊ VÀ PHÂN TÍCH (ADMIN APIS)

### 3.1. `GET /api/admin/campaigns`
- **Mục tiêu:** Lấy danh sách các đợt khảo sát.
- **Quyền hạn:** `TECHNICAL_ADMIN`, `CONTENT_ADMIN`, `REVIEWER`, `PROGRESS_MONITOR`.
- **Query Parameters:** `status` (optional), `page` (number), `limit` (number).

### 3.2. `POST /api/admin/campaigns`
- **Mục tiêu:** Tạo mới một đợt khảo sát kèm sinh link/QR tự động cho danh sách tỉnh tham gia.
- **Quyền hạn:** `TECHNICAL_ADMIN`, `CONTENT_ADMIN`.
- **Request Body:**
```json
{
  "code": "DOT-1-2026",
  "title": "Khảo sát nhu cầu đào tạo tài chính tài sản công Đợt 1 năm 2026",
  "schemaVersion": "3.3",
  "startDate": "2026-12-01T00:00:00Z",
  "endDate": "2026-12-21T23:59:59Z",
  "participatingProvinces": [
    { "provinceCode": "01", "provinceName": "Hà Nội", "targetRespondents": 500 },
    { "provinceCode": "79", "provinceName": "TP Hồ Chí Minh", "targetRespondents": 600 }
  ]
}
```

### 3.3. `PATCH /api/admin/campaigns/:id/status`
- **Mục tiêu:** Đóng, mở hoặc lưu trữ đợt khảo sát.
- **Quyền hạn:** `TECHNICAL_ADMIN`, `CONTENT_ADMIN`.
- **Request Body:** `{ "status": "CLOSED" }`

---

### 3.4. `GET /api/admin/reviews/duplicates`
- **Mục tiêu:** Lấy danh sách các nhóm phiếu bị nghi trùng để rà soát.
- **Quyền hạn:** `REVIEWER`, `CONTENT_ADMIN`.
- **Query Parameters:** `campaignId` (string, required), `provinceCode` (optional), `status` (enum: `PENDING_REVIEW`, `VALID`, `EXCLUDED`).
- **Response 200:** Trả về danh sách các nhóm phiếu nghi trùng (mỗi nhóm gồm các phiếu có cùng `businessHash`).

### 3.5. `PATCH /api/admin/reviews/duplicates/:id/decision`
- **Mục tiêu:** Ra quyết định phê duyệt (Tính) hoặc Loại trừ phiếu nghi trùng.
- **Quyền hạn:** `REVIEWER`.
- **Request Body:**
```json
{
  "decision": "EXCLUDED",
  "reason": "Cán bộ nộp lại phiếu do nhầm lẫn ở lần nộp đầu tiên lúc 08:30"
}
```

---

### 3.6. `GET /api/admin/analytics/tables`
- **Mục tiêu:** Lấy số liệu tính toán của 6 Bảng tổng hợp B1 - B6.
- **Quyền hạn:** Tất cả vai trò quản trị (Hệ thống tự động kiểm tra: nếu là `LOCAL_COORDINATOR` thì bắt buộc `isSuppressed = true` và chỉ được truy vấn `provinceCode` của địa phương mình).
- **Query Parameters:**
  - `campaignId` (string, required).
  - `provinceCode` (string, optional - bỏ trống để lấy toàn quốc).
  - `agencyCode` (string, optional - lọc theo cơ quan).
  - `isSuppressed` (boolean, default: `true`).
- **Response 200:**
```json
{
  "success": true,
  "data": {
    "version": "3.3",
    "isSuppressedApplied": true,
    "b1": { "rows": [ ... ], "total": { ... } },
    "b2": { "rows": [ ... ] },
    "b3": { "rows": [ ... ], "subLabel": "khoảng thiếu hụt theo tự đánh giá - không đồng nhất với năng lực thực tế đã được kiểm chứng" },
    "b4": { "rows": [ ... ] },
    "b5": { "rows": [ ... ] },
    "b6": { "rows": [ ... ] }
  }
}
```

---

### 3.7. `GET /api/admin/export/excel`
- **Mục tiêu:** Xuất và tải file Excel báo cáo tổng hợp chuẩn.
- **Quyền hạn:** `TECHNICAL_ADMIN`, `CONTENT_ADMIN`, `REVIEWER`, `LOCAL_COORDINATOR`.
- **Query Parameters:**
  - `campaignId` (string, required).
  - `provinceCode` (string, optional).
  - `mode` (string, enum: `INTERNAL` [Đầy đủ số liệu] hoặc `LOCAL_CONFIDENTIAL` [Đã áp dụng ẩn danh < 5 người]).
- **Response Headers:**
  - `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
  - `Content-Disposition: attachment; filename="Bao_Cao_Tong_Hop_Khao_Sat_3.3_HaNoi.xlsx"`
