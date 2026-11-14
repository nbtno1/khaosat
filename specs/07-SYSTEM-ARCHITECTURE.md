# 07. SYSTEM ARCHITECTURE — THIẾT KẾ KIẾN TRÚC HỆ THỐNG

## 1. SƠ ĐỒ TỔNG THỂ KIẾN TRÚC (HIGH-LEVEL SYSTEM ARCHITECTURE)

Hệ thống được thiết kế theo mô hình phân tầng hiện đại (Clean Layered Architecture) trên nền tảng Next.js Fullstack Framework.

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT / PRESENTATION LAYER                           │
│                                                                                 │
│   ┌───────────────────────────────┐     ┌───────────────────────────────────┐   │
│   │   PUBLIC SURVEY PORTAL        │     │     ADMIN MANAGEMENT PORTAL       │   │
│   │   (Responsive Mobile/Desktop) │     │     (Desktop Dashboard)           │   │
│   │   - QR / Link Landing         │     │     - Auth & RBAC Guard           │   │
│   │   - Step 1: Info (Part I)     │     │     - Campaign & Link Manager     │   │
│   │   - Step 2: Groups (Part II)  │     │     - Progress Tracking (Recharts)│   │
│   │   - Step 3: Dynamic Loop (III)│     │     - Duplicate Review Center     │   │
│   │   - Step 4: Formats & Submit  │     │     - Analytics & 6 Tables Engine │   │
│   │   (React 19, RHF + Zod, UI)   │     │     - Excel Export (ExcelJS)      │   │
│   └───────────────┬───────────────┘     └─────────────────┬─────────────────┘   │
└───────────────────┼───────────────────────────────────────┼─────────────────────┘
                    │ HTTPS / TLS 1.3                       │ Secure Cookie JWT
                    ▼                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    API GATEWAY & NEXT.JS ROUTE HANDLERS                         │
│                                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │   MIDDLEWARE PIPELINE                                                   │   │
│   │   - CORS / Security Headers (CSP, HSTS, X-Frame-Options)                │   │
│   │   - Rate Limiter (Token Bucket / IP Tracker)                            │   │
│   │   - Auth.js Session Guard (JWT Verification & RBAC Claim Checker)       │   │
│   └────────────────────────────────────┬────────────────────────────────────┘   │
│                                        ▼                                        │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │   ROUTE HANDLERS (REST APIs)                                            │   │
│   │   /api/auth/*          /api/public/survey/*     /api/admin/campaigns/*  │   │
│   │   /api/admin/reviews/* /api/admin/analytics/*   /api/admin/export/*     │   │
│   └────────────────────────────────────┬────────────────────────────────────┘   │
└────────────────────────────────────────┼────────────────────────────────────────┘
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           SERVICE / DOMAIN LOGIC LAYER                          │
│                                                                                 │
│   ┌────────────────────────────┐    ┌───────────────────────────────────────┐   │
│   │ SurveyEngineService        │    │ DuplicateDetectionService             │   │
│   │ - Position mapping loader  │    │ - 4-point matcher                     │   │
│   │ - Dynamic question resolver│    │ - Flagging & audit trail              │   │
│   │ - State cleanup on back    │    └───────────────────────────────────────┘   │
│   └────────────────────────────┘    ┌───────────────────────────────────────┐   │
│   ┌────────────────────────────┐    │ StatisticalDisclosureService          │   │
│   │ AnalyticsAggregationEngine │    │ - Primary Suppression (<5)            │   │
│   │ - B1 to B6 Generators      │    │ - Row & Secondary Suppression         │   │
│   │ - Capacity Gap Calculator  │    └───────────────────────────────────────┘   │
│   └────────────────────────────┘    ┌───────────────────────────────────────┐   │
│   ┌────────────────────────────┐    │ ExcelReportExportService              │   │
│   │ CampaignManagerService     │    │ - Multi-sheet ExcelJS Generator       │   │
│   └────────────────────────────┘    └───────────────────────────────────────┘   │
└────────────────────────────────────────┼────────────────────────────────────────┘
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      DATA ACCESS LAYER (MONGOOSE ODM)                           │
│                                                                                 │
│   ┌──────────────┐ ┌──────────────┐ ┌────────────────┐ ┌────────────────────┐   │
│   │ User         │ │ Campaign     │ │ SurveyLink     │ │ SurveySchemaConfig │   │
│   └──────────────┘ └──────────────┘ └────────────────┘ └────────────────────┘   │
│   ┌──────────────┐ ┌──────────────┐ ┌────────────────┐ ┌────────────────────┐   │
│   │ SurveyResponse││ BenchmarkMatrix│ AuditLog       │ │ SystemSetting      │   │
│   └──────────────┘ └──────────────┘ └────────────────┘ └────────────────────┘   │
└────────────────────────────────────────┼────────────────────────────────────────┘
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        PERSISTENCE LAYER (MONGODB 7.0+)                         │
│                                                                                 │
│   - Document Storage with Schema Validation                                     │
│   - Compound Indexes on (campaignId, provinceCode, communeCode)                 │
│   - Text Indexes for Search / Sharding Ready for Large Scale                    │
│   - Automated Daily Backups / Replica Set High Availability                     │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. THIẾT KẾ PHÂN TẦNG CHI TIẾT (LAYERED DESIGN)

### 2.1. Tầng Presentation (Frontend)
- **Kiến trúc Next.js App Router:**
  - `app/(public)/khao-sat/[token]/page.tsx`: Cổng làm khảo sát độc lập, tối ưu hóa kích thước bundle, không chứa bất kỳ logic quản trị nào.
  - `app/(admin)/admin/layout.tsx`: Giao diện Dashboard quản trị có bảo vệ RBAC, thanh điều hướng bên trái (Sidebar), thanh breadcrumb và profile header.
- **Quản lý Form State & Validation:**
  - Sử dụng `React Hook Form` kết hợp `zodResolver` để kiểm soát trạng thái form phức tạp mà không gây re-render toàn trang.
  - Tách form thành các sub-components độc lập: `StepGeneralInfo`, `StepWorkgroupsSelection`, `StepDynamicEvaluation`, `StepLearningPreferences`.
  - Bộ nhớ đệm tạm thời (Client-side Session Storage): Lưu tiến trình đang điền để nếu người dùng vô tình reload trang hoặc rớt mạng 4G, form tự động phục hồi state.

### 2.2. Tầng Backend & Route Handlers (API Layer)
- Sử dụng Next.js Route Handlers (`app/api/.../route.ts`) hoạt động chuẩn RESTful.
- Mọi request đều đi qua Middleware xác thực (Authentication), kiểm tra phân quyền (RBAC Authorization) và kiểm tra Rate Limiting.
- Dữ liệu Request Body được validate tự động qua Zod Schema trước khi chạm tới tầng Service. Nếu sai định dạng, trả về lỗi HTTP 422 chuẩn hóa kèm danh sách chi tiết các trường bị lỗi.

### 2.3. Tầng Service & Domain Logic (Business Layer)
Các dịch vụ nghiệp vụ độc lập (Stateless Services), dễ dàng kiểm thử bằng Unit Test:
1. `SurveyEngineService`: Xử lý phân luồng câu hỏi, lọc danh mục nhóm công việc theo chức danh, dọn dẹp câu trả lời khi quay lại.
2. `DuplicateDetectionService`: Tính toán mã băm nghiệp vụ (Business Hash) để phát hiện và cảnh báo các phản hồi nghi trùng.
3. `AnalyticsAggregationEngine`: Triển khai các toán tử gom cụm MongoDB (Aggregation Pipelines) để tính toán 6 Bảng B1 - B6 với tốc độ cao.
4. `StatisticalDisclosureService`: Thực thi thuật toán kiểm soát tiết lộ thống kê (Primary & Secondary Suppression Threshold = 5).
5. `ExcelReportExportService`: Xử lý dựng tài liệu Excel bằng luồng (Streaming ExcelJS) để tiết kiệm bộ nhớ RAM máy chủ.

### 2.4. Tầng Lưu trữ & Cơ sở dữ liệu (Database Layer)
- Sử dụng MongoDB với ODM Mongoose.
- Tận dụng cấu trúc dữ liệu JSON BSON linh hoạt để lưu trữ biểu mẫu khảo sát động mà vẫn bảo đảm tính toàn vẹn thông qua Mongoose Schemas.
- Thiết lập các chỉ mục (Indexes) phức hợp đảm bảo tốc độ truy vấn tổng hợp luôn đạt dưới 200ms ngay cả khi có hàng chục nghìn lượt nộp.

---

## 3. CƠ CHẾ BẢO MẬT VÀ PHÂN QUYỀN KIẾN TRÚC
1. **Kiểm tra phân quyền đa tầng (Defense in Depth):**
   - *Tầng 1 (Client UI):* Ẩn/hiển thị component theo Role của người dùng.
   - *Tầng 2 (Next.js Middleware):* Chặn request ngay tại rìa (Edge/Middleware) nếu user truy cập route không có quyền.
   - *Tầng 3 (Route Handler Service):* Kiểm tra quyền sở hữu dữ liệu (ví dụ: Đầu mối địa phương chỉ được request báo cáo của tỉnh mình, nếu truyền tỉnh khác sẽ trả về HTTP 403 Forbidden).
2. **Nguyên tắc "Zero PII Exposure":**
   - Public Survey API không có bất kỳ endpoint nào để query danh sách câu trả lời của người khác.
   - Session của người làm bài khảo sát là hoàn toàn ẩn danh, chỉ định danh phiên làm việc qua SurveyLink Token của địa phương.
