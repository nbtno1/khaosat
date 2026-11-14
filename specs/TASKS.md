# TASKS BACKLOG — DANH SÁCH NHIỆM VỤ TRIỂN KHAI CHI TIẾT

Toàn bộ quá trình phát triển được phân rã thành các nhiệm vụ cụ thể có mã định danh `TASK-xxx`.

---

## MILESTONE 1: KHỞI TẠO DỰ ÁN & MÔ HÌNH DỮ LIỆU CỐT LÕI (SPRINT 1)

### TASK-001: Khởi tạo Project Next.js 15, TypeScript & Tailwind CSS
- **Module:** Hạ tầng kỹ thuật (Core Setup)
- **Spec liên quan:** `specs/07-SYSTEM-ARCHITECTURE.md`
- **Mức độ ưu tiên:** P0 (Khẩn cấp / Bắt buộc)
- **Phụ thuộc:** Không
- **File đã tạo:** `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `src/lib/utils.ts`, `.env.example`, `.env.local`
- **Các bước thực hiện:**
  1. Khởi tạo Next.js 15 với App Router, TypeScript (strict mode), ESLint và Tailwind CSS.
  2. Cài đặt các thư viện phụ thuộc cốt lõi: `mongoose`, `zod`, `react-hook-form`, `@hookform/resolvers`, `lucide-react`, `clsx`, `tailwind-merge`, `recharts`, `exceljs`, `adm-zip`, `qrcode`, `bcryptjs`, `tsx`.
  3. Cấu hình đường dẫn alias `@/*` trỏ về `./src/*`.
  4. Cấu hình `next.config.ts` hỗ trợ standalone build và strict mode.
- **Acceptance Criteria:** `npm run build` và `npm run typecheck` chạy thành công không có lỗi.
- **Test Cases:** TC-Core-01 (Next.js build check - PASS).
- **Trạng thái:** `COMPLETED` (Đã hoàn thành ngày 14/11/2026)

### TASK-002: Thiết lập Kết nối MongoDB & Xây dựng Mongoose Models
- **Module:** Database Layer
- **Spec liên quan:** `specs/08-DATABASE-DESIGN.md`
- **Mức độ ưu tiên:** P0
- **Phụ thuộc:** TASK-001
- **File đã tạo:** `src/lib/db.ts`, `src/models/User.ts`, `src/models/Campaign.ts`, `src/models/SurveyLink.ts`, `src/models/SurveySchemaConfig.ts`, `src/models/BenchmarkMatrix.ts`, `src/models/PositionWorkgroupsMapping.ts`, `src/models/SurveyResponse.ts`, `src/models/AuditLog.ts`, `src/models/index.ts`
- **Các bước thực hiện:**
  1. Viết module kết nối MongoDB `src/lib/db.ts` có cơ chế cache connection cho serverless / dev environment.
  2. Tạo 8 schemas và models Mongoose chuẩn xác theo định nghĩa trong Spec 08.
  3. Định nghĩa các Indexes đơn và Compound Indexes cần thiết, tối ưu hóa tránh trùng lặp index.
- **Acceptance Criteria:** Các model khởi tạo đầy đủ interface TypeScript, kiểm tra static type an toàn 100%.
- **Test Cases:** TC-Core-02 (MongoDB Connection & Schema Typecheck - PASS).
- **Trạng thái:** `COMPLETED` (Đã hoàn thành ngày 14/11/2026)

### TASK-003: Xây dựng Script Nạp Dữ liệu Hạt giống (Seed Data Script v3.3)
- **Module:** Database Layer / Data Migration
- **Spec liên quan:** `specs/08-DATABASE-DESIGN.md`, `specs/01-DOCUMENT-INVENTORY.md`
- **Mức độ ưu tiên:** P0
- **Phụ thuộc:** TASK-002
- **File đã tạo:** `scripts/seed.ts`, `scripts/import-communes.ts`, `src/data/seed-schema-3.3.json`, `src/data/seed-benchmark-matrix.json`, `src/data/seed-position-mappings.json`, `src/data/seed-provinces-pilot.json`, `src/data/communes-catalog.template.json`
- **Các bước thực hiện:**
  1. Trích xuất chính xác 16 nhóm công việc và 87 chuyên đề học từ Tài liệu số 1 vào `seed-schema-3.3.json`.
  2. Nạp ma trận 64 mức yêu cầu từ Thuyết minh Phần II.B vào `seed-benchmark-matrix.json`.
  3. Nạp danh mục 40 vị trí thuộc 11 cơ quan và nhóm việc gợi ý vào `seed-position-mappings.json`.
  4. Khởi tạo danh mục 34 tỉnh thí điểm kèm template danh mục 3.321 xã theo ADR-007.
  5. Viết script TypeScript `scripts/seed.ts` nạp tự động schema 3.3, benchmark matrix, user admin, campaign `DOT-1-2026` và sinh 34 mã QR cấp tỉnh bằng QRCode.
- **Acceptance Criteria:** Chạy `npm run db:seed` và `npm run db:import-communes` nạp và kiểm tra tính toàn vẹn 100% dữ liệu.
- **Test Cases:** TC-Core-03 (Data integrity seed test - PASS).
- **Trạng thái:** `COMPLETED` (Đã hoàn thành ngày 14/11/2026)

---

## MILESTONE 2: CỔNG KHẢO SÁT CÔNG KHAI & DYNAMIC SURVEY ENGINE (SPRINT 2 - CORE MVP)

### TASK-004: Xây dựng Zod Validation Schemas cho Bộ Khảo sát
- **Module:** Validation / Domain Logic
- **Spec liên quan:** `specs/12-VALIDATION-AND-BUSINESS-RULES.md`
- **Mức độ ưu tiên:** P0
- **Phụ thuộc:** TASK-001
- **File dự kiến tạo:** `src/lib/validations/survey.schema.ts`
- **Các bước thực hiện:**
  1. Xây dựng Zod schemas cho Phần I (Thông tin chung).
  2. Xây dựng Zod schemas cho Phần II (Đủ 16 nhóm công việc).
  3. Xây dựng Zod schemas cho Phần III (Dynamic loop, ràng buộc khó khăn max 2 và mục độc quyền).
  4. Xây dựng Zod schemas cho Phần IV và tổng thể `SurveySubmissionSchema`.
- **Acceptance Criteria:** Validate chặt chẽ dữ liệu đầu vào, thông báo lỗi tiếng Việt thân thiện.
- **Test Cases:** TC-10, TC-11, TC-12.
- **Trạng thái:** `PLANNED`

### TASK-005: Xây dựng Public API Routes cho Cổng Khảo sát
- **Module:** Backend API
- **Spec liên quan:** `specs/09-API-SPECIFICATION.md`
- **Mức độ ưu tiên:** P0
- **Phụ thuộc:** TASK-002, TASK-004
- **File dự kiến tạo:** `src/app/api/public/survey/validate-link/[token]/route.ts`, `src/app/api/public/survey/schema/[version]/route.ts`, `src/app/api/public/survey/position-mapping/route.ts`, `src/app/api/public/survey/submit/route.ts`
- **Các bước thực hiện:**
  1. Viết Route Handler xác thực token link và lấy danh mục xã của tỉnh.
  2. Viết Route Handler trả về Schema câu hỏi phiên bản 3.3.
  3. Viết Route Handler nhận submit bài khảo sát, validate bằng Zod, tính `businessHash` và lưu database.
- **Acceptance Criteria:** API phản hồi chuẩn HTTP status codes, lưu dữ liệu thành công.
- **Test Cases:** TC-14, TC-15.
- **Trạng thái:** `PLANNED`

### TASK-006: Xây dựng Giao diện Cổng Khảo sát 4 Bước (Public Portal UI)
- **Module:** Frontend / UI
- **Spec liên quan:** `specs/10-UI-UX-SPECIFICATION.md`
- **Mức độ ưu tiên:** P0
- **Phụ thuộc:** TASK-004, TASK-005
- **File dự kiến tạo:** `src/app/(public)/khao-sat/[token]/page.tsx`, `src/components/survey/SurveyContainer.tsx`, `src/components/survey/StepGeneralInfo.tsx`, `src/components/survey/StepWorkgroups.tsx`, `src/components/survey/StepDynamicEvaluation.tsx`, `src/components/survey/StepLearningPreferences.tsx`, `src/components/survey/SurveySuccessModal.tsx`, `src/hooks/useSurveyFormState.ts`
- **Các bước thực hiện:**
  1. Tạo giao diện Responsive chuẩn di động với Header tiến trình và huy hiệu thời gian ước tính.
  2. Triển khai Bước 1: Chọn tỉnh, xã, cơ quan, vị trí, tư cách, năm kinh nghiệm.
  3. Triển khai Bước 2: Hiển thị 16 nhóm công việc, tự động xếp nhóm gợi ý lên trước, xử lý luồng kết thúc sớm (Early Exit).
  4. Triển khai Bước 3: Vòng lặp Part III động, render các mức tự đánh giá theo ngữ cảnh vai trò, chọn khó khăn và nội dung cần học.
  5. Triển khai Bước 4: Chọn hình thức học (max 2) và góp ý tự do.
  6. Triển khai hook dọn dẹp state khi bấm Quay lại (Back-Navigation Cleanup).
- **Acceptance Criteria:** Hoàn thành trải nghiệm khảo sát mượt mà trên di động và máy tính, nộp bài thành công.
- **Test Cases:** TC-01 đến TC-14.
- **Trạng thái:** `PLANNED`

---

## MILESTONE 3: KIỂM SOÁT GỬI ĐÚP & TRUNG TÂM RÀ SOÁT PHIẾU NGHI TRÙNG (SPRINT 3)

### TASK-007: Xây dựng Service Phát hiện Phiếu Nghi trùng (Duplicate Detection)
- **Module:** Domain Logic / Backend
- **Spec liên quan:** `specs/06-BUSINESS-WORKFLOWS.md`, `specs/08-DATABASE-DESIGN.md`
- **Mức độ ưu tiên:** P1
- **Phụ thuộc:** TASK-005
- **File dự kiến tạo:** `src/services/duplicate-detection.service.ts`
- **Các bước thực hiện:**
  1. Viết hàm tính toán `businessHash` SHA-256 từ `communeCode + agencyCode + positionCode + 16_statuses`.
  2. Tích hợp kiểm tra tự động khi nhận phản hồi mới: nếu trùng mã băm trong cùng đợt → gắn cờ `isSuspectedDuplicate = true`.
- **Acceptance Criteria:** Nhận diện chính xác phiếu nghi trùng mà không cần thông tin PII.
- **Test Cases:** TC-15.
- **Trạng thái:** `PLANNED`

### TASK-008: Xây dựng Giao diện Duplicate Review Workbench
- **Module:** Admin UI / Backend API
- **Spec liên quan:** `specs/09-API-SPECIFICATION.md`, `specs/10-UI-UX-SPECIFICATION.md`
- **Mức độ ưu tiên:** P1
- **Phụ thuộc:** TASK-007
- **File dự kiến tạo:** `src/app/api/admin/reviews/duplicates/route.ts`, `src/app/api/admin/reviews/duplicates/[id]/decision/route.ts`, `src/app/(admin)/admin/reviews/page.tsx`, `src/components/admin/reviews/DuplicateDiffView.tsx`
- **Các bước thực hiện:**
  1. Viết APIs lấy danh sách phiếu nghi trùng theo nhóm và cập nhật quyết định thẩm tra.
  2. Thiết kế giao diện Accordion so sánh song song (Diff View) giữa các phiếu trong nhóm trùng.
  3. Cung cấp hộp thoại phê duyệt Tính (`VALID`) hoặc Loại trừ (`EXCLUDED`) kèm nhập lý do.
- **Acceptance Criteria:** Chuyên viên thao tác rà soát thuận tiện; phiếu loại trừ được loại khỏi kết quả tính toán.
- **Test Cases:** TC-16.
- **Trạng thái:** `PLANNED`

---

## MILESTONE 4: ANALYTICS AGGREGATION ENGINE & 6 BẢNG TỔNG HỢP (SPRINT 4)

### TASK-009: Triển khai MongoDB Aggregation Pipelines cho 6 Bảng B1 - B6
- **Module:** Analytics & Reporting Engine
- **Spec liên quan:** `specs/02-BUSINESS-REQUIREMENTS.md`, `specs/12-VALIDATION-AND-BUSINESS-RULES.md`
- **Mức độ ưu tiên:** P0
- **Phụ thuộc:** TASK-005, TASK-008
- **File dự kiến tạo:** `src/services/analytics-aggregation.service.ts`, `src/services/capacity-gap.service.ts`
- **Các bước thực hiện:**
  1. Viết pipeline tính toán Bảng B1 (Người trả lời, phân loại tư cách, số xã, số phiếu loại).
  2. Viết pipeline tính toán Bảng B2 (16 nhóm × 4 cột trạng thái).
  3. Viết pipeline tính toán Bảng B3 (Nhóm × Vai trò, tính tỷ lệ dưới chuẩn, phân bố thiếu 1, 2, 3 mức so với Benchmark Matrix).
  4. Viết pipeline tính toán Bảng B4 (Nội dung cần học × Mức độ cấp thiết).
  5. Viết pipeline tính toán Bảng B5 (Khó khăn, tách nhãn ngoài đào tạo).
  6. Viết pipeline tính toán Bảng B6 (5 hình thức học & giới hạn dữ liệu).
- **Acceptance Criteria:** Kết quả tính toán khớp 100% với các ví dụ chuẩn trong Tài liệu số 2.
- **Test Cases:** TC-17, TC-18.
- **Trạng thái:** `PLANNED`

### TASK-010: Xây dựng Giao diện Analytics Explorer (6 Tabs B1 - B6)
- **Module:** Admin UI
- **Spec liên quan:** `specs/10-UI-UX-SPECIFICATION.md`
- **Mức độ ưu tiên:** P1
- **Phụ thuộc:** TASK-009
- **File dự kiến tạo:** `src/app/api/admin/analytics/tables/route.ts`, `src/app/(admin)/admin/analytics/page.tsx`, `src/components/admin/analytics/TableB1View.tsx`, `src/components/admin/analytics/TableB2View.tsx`, `src/components/admin/analytics/TableB3View.tsx`, `src/components/admin/analytics/TableB4View.tsx`, `src/components/admin/analytics/TableB5View.tsx`, `src/components/admin/analytics/TableB6View.tsx`
- **Các bước thực hiện:**
  1. Viết Route Handler trả về dữ liệu 6 bảng có hỗ trợ bộ lọc Campaign, Tỉnh, Cơ quan.
  2. Dựng giao diện 6 Tabs bảng biểu trực quan, tích hợp biểu đồ Recharts thể hiện khoảng thiếu hụt năng lực.
- **Acceptance Criteria:** Hiển thị số liệu rõ ràng, chuyển tab mượt mà, hỗ trợ lọc đa chiều.
- **Test Cases:** TC-17.
- **Trạng thái:** `PLANNED`

---

## MILESTONE 5: THUẬT TOÁN ẨN DANH SỐ LIỆU & XUẤT EXCEL (SPRINT 5)

### TASK-011: Triển khai Thuật toán Kiểm soát Tiết lộ Thống kê (Suppression Engine)
- **Module:** Security & Privacy / Domain Logic
- **Spec liên quan:** `specs/11-SECURITY-SPECIFICATION.md`, `specs/12-VALIDATION-AND-BUSINESS-RULES.md`
- **Mức độ ưu tiên:** P0
- **Phụ thuộc:** TASK-009
- **File dự kiến tạo:** `src/services/statistical-disclosure.service.ts`, `src/lib/suppression-engine.ts`
- **Các bước thực hiện:**
  1. Viết hàm Primary Suppression: chuyển đổi các ô đếm $1 \le n \le 4$ thành `"dưới 5 - không công bố"`.
  2. Viết hàm Row Suppression: ẩn cả dòng nếu mẫu số $\in [1, 4]$.
  3. Viết hàm Secondary Suppression: tự động tìm và ẩn ô nhỏ nhất kế tiếp trong hàng/cột có Tổng.
- **Acceptance Criteria:** Bảo đảm 100% dữ liệu xuất ra cho địa phương không thể bị suy đoán danh tính.
- **Test Cases:** TC-19, TC-20, TC-21.
- **Trạng thái:** `PLANNED`

### TASK-012: Xây dựng Pipeline Xuất Báo cáo Excel Đa sheet (ExcelJS Export)
- **Module:** Export Pipeline
- **Spec liên quan:** `specs/09-API-SPECIFICATION.md`, `specs/02-BUSINESS-REQUIREMENTS.md`
- **Mức độ ưu tiên:** P0
- **Phụ thuộc:** TASK-009, TASK-011
- **File dự kiến tạo:** `src/services/excel-export.service.ts`, `src/app/api/admin/export/excel/route.ts`
- **Các bước thực hiện:**
  1. Cài đặt `exceljs`.
  2. Xây dựng template generator tạo 6 sheets tương ứng B1 - B6 (+ sheet dữ liệu gốc cho bản nội bộ).
  3. Định dạng borders, font chữ tiếng Việt, in đậm tiêu đề và số phiên bản 3.3.
  4. Tạo Route Handler stream tải file Excel về trình duyệt.
- **Acceptance Criteria:** Tải file Excel chuẩn xác, mở được trên MS Excel và Google Sheets không bị lỗi font.
- **Test Cases:** TC-23.
- **Trạng thái:** `PLANNED`

---

## MILESTONE 6: DASHBOARD QUẢN TRỊ, RBAC & THEO DÕI TIẾN ĐỘ (SPRINT 6)

### TASK-013: Triển khai Xác thực Auth.js v5 & Phân quyền RBAC 5 Nhóm Tài khoản
- **Module:** Authentication & Security
- **Spec liên quan:** `specs/05-USER-ROLES-AND-USE-CASES.md`, `specs/07-SYSTEM-ARCHITECTURE.md`
- **Mức độ ưu tiên:** P0
- **Phụ thuộc:** TASK-002
- **File dự kiến tạo:** `src/lib/auth.ts`, `src/middleware.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/app/(auth)/login/page.tsx`
- **Các bước thực hiện:**
  1. Cấu hình NextAuth v5 với Credentials Provider, hash mật khẩu bằng `bcrypt`.
  2. Cấu hình session JWT lưu trong HTTP-Only Secure Cookie.
  3. Viết Next.js Middleware chặn truy cập trái quyền theo RBAC matrix.
- **Acceptance Criteria:** Đăng nhập an toàn, chặn đúng quyền ở cả Client và Server API.
- **Test Cases:** TC-22.
- **Trạng thái:** `PLANNED`

### TASK-014: Xây dựng Dashboard Theo dõi Tiến độ & Quản lý Đợt Khảo sát
- **Module:** Admin UI
- **Spec liên quan:** `specs/10-UI-UX-SPECIFICATION.md`
- **Mức độ ưu tiên:** P1
- **Phụ thuộc:** TASK-013
- **File dự kiến tạo:** `src/app/(admin)/admin/dashboard/page.tsx`, `src/app/(admin)/admin/campaigns/page.tsx`, `src/components/admin/ProgressCharts.tsx`, `src/services/campaign-link.service.ts`
- **Các bước thực hiện:**
  1. Thiết kế trang Dashboard tổng quan tiến độ: biểu đồ số phiếu theo ngày, tiến độ theo tỉnh.
  2. Thiết kế trang quản lý đợt khảo sát: tạo chiến dịch, chọn tỉnh, sinh URL và mã QR tự động.
- **Acceptance Criteria:** Quản lý đợt khảo sát trực quan, theo dõi số liệu tiến độ tức thời.
- **Test Cases:** TC-13.
- **Trạng thái:** `PLANNED`

---

## MILESTONE 7: TOÀN BỘ 23 CA KIỂM THỬ E2E & PRODUCTION GO-LIVE (SPRINT 7)

### TASK-015: Viết Bộ Test Tự động Playwright cho 23 Ca kiểm thử
- **Module:** QA / Testing
- **Spec liên quan:** `specs/13-TEST-STRATEGY.md`
- **Mức độ ưu tiên:** P0
- **Phụ thuộc:** Toàn bộ các tasks từ TASK-001 đến TASK-014
- **File dự kiến tạo:** `tests/e2e/23-test-cases.spec.ts`, `playwright.config.ts`
- **Các bước thực hiện:**
  1. Cấu hình Playwright test runner.
  2. Viết kịch bản tự động hóa tuần tự cho toàn bộ 23 test cases (TC-01 đến TC-23).
  3. Chạy kiểm thử trên headless browser và xuất báo cáo kiểm thử HTML.
- **Acceptance Criteria:** 23/23 ca kiểm thử đều PASS 100%.
- **Test Cases:** Toàn bộ TC-01 đến TC-23.
- **Trạng thái:** `PLANNED`

### TASK-016: Đóng gói Docker & Chuẩn bị Môi trường Production
- **Module:** DevOps & Deployment
- **Spec liên quan:** `specs/16-DEPLOYMENT-SPECIFICATION.md`
- **Mức độ ưu tiên:** P1
- **Phụ thuộc:** TASK-015
- **File dự kiến tạo:** `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `scripts/backup.sh`, `src/app/api/health/route.ts`
- **Các bước thực hiện:**
  1. Tạo multi-stage Dockerfile tối ưu.
  2. Viết file docker-compose chuẩn production.
  3. Tạo Route Handler `/api/health` kiểm tra kết nối DB.
  4. Viết tài liệu hướng dẫn vận hành và kịch bản sao lưu dữ liệu tự động.
- **Acceptance Criteria:** Khởi chạy container thành công, endpoint healthcheck trả về UP.
- **Test Cases:** Production deployment verification.
- **Trạng thái:** `PLANNED`
