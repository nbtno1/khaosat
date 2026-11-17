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
- **File đã tạo:** `src/lib/validations/survey.schema.ts`, `tests/validations/survey.schema.test.ts`
- **Các bước thực hiện:**
  1. Xây dựng Zod schemas cho Phần I (Thông tin chung) có kiểm tra vị trí việc làm khác và tư cách khác.
  2. Xây dựng Zod schemas cho Phần II (Đủ 16 nhóm công việc), hàm kiểm tra ngoài đối tượng `isUserOutOfScope`.
  3. Xây dựng Zod schemas cho Phần III (Dynamic loop, ràng buộc vai trò, khó khăn max 2 và mục độc quyền, mức độ cần học).
  4. Xây dựng Zod schemas cho Phần IV (Hình thức học max 2) và tổng thể `SurveySubmissionSchema`.
  5. Xây dựng hàm băm nghiệp vụ 4 điểm `computeBusinessHash` (SHA-256) chống ghi trùng không chứa PII.
- **Acceptance Criteria:** Validate chặt chẽ dữ liệu đầu vào, thông báo lỗi tiếng Việt thân thiện, 100% test cases đạt.
- **Test Cases:** TC-10, TC-11, TC-12, TC-13 (12/12 unit tests PASS).
- **Trạng thái:** `COMPLETED` (Đã hoàn thành ngày 14/11/2026)

### TASK-005: Xây dựng Public API Routes cho Cổng Khảo sát
- **Module:** Backend API
- **Spec liên quan:** `specs/09-API-SPECIFICATION.md`
- **Mức độ ưu tiên:** P0
- **Phụ thuộc:** TASK-002, TASK-004
- **File đã tạo:** `src/app/api/public/survey/validate-link/[token]/route.ts`, `src/app/api/public/survey/schema/[version]/route.ts`, `src/app/api/public/survey/position-mapping/route.ts`, `src/app/api/public/survey/submit/route.ts`, `tests/api/public-survey.test.ts`
- **Các bước thực hiện:**
  1. Viết Route Handler `validate-link` xác thực token link và lấy danh mục xã của tỉnh.
  2. Viết Route Handler `schema/[version]` trả về Schema câu hỏi phiên bản 3.3.
  3. Viết Route Handler `position-mapping` trả về cấu hình nhóm việc gợi ý và vai trò thường gặp.
  4. Viết Route Handler `submit` nhận nộp bài khảo sát, validate bằng Zod, tính `businessHash`, kiểm tra nghi trùng và lưu database.
- **Acceptance Criteria:** API phản hồi chuẩn HTTP status codes, lưu dữ liệu thành công, 100% test cases đạt.
- **Test Cases:** TC-14, TC-15 (12/12 API tests PASS).
- **Trạng thái:** `COMPLETED` (Đã hoàn thành ngày 14/11/2026)

### TASK-006: Xây dựng Giao diện Cổng Khảo sát 4 Bước (Public Portal UI)
- **Module:** Frontend / UI
- **Spec liên quan:** `specs/10-UI-UX-SPECIFICATION.md`
- **Mức độ ưu tiên:** P0
- **Phụ thuộc:** TASK-004, TASK-005
- **File đã tạo:** `src/app/(public)/khao-sat/[token]/page.tsx`, `src/components/survey/SurveyContainer.tsx`, `src/components/survey/StepGeneralInfo.tsx`, `src/components/survey/StepWorkgroups.tsx`, `src/components/survey/StepDynamicEvaluation.tsx`, `src/components/survey/StepLearningPreferences.tsx`, `src/components/survey/SurveySuccessModal.tsx`, `src/hooks/useSurveyFormState.ts`
- **Các bước thực hiện:**
  1. Tạo giao diện Responsive chuẩn di động với Header tiến trình, huy hiệu thời gian ước tính và thanh % động.
  2. Triển khai Bước 1: Chọn tỉnh (cố định), xã/phường (lọc tìm kiếm), cơ quan (11 đơn vị), vị trí (kèm ô ghi rõ khác), tư cách (chọn nhiều), năm kinh nghiệm.
  3. Triển khai Bước 2: Hiển thị 16 nhóm công việc, tự động xếp nhóm gợi ý theo vị trí lên trước, 4 nút trạng thái loại trừ nhau, xử lý luồng kết thúc sớm (Early Exit) kèm thông báo.
  4. Triển khai Bước 3: Vòng lặp Part III động, Câu 8 vai trò (chọn nhiều), Câu 9 tự đánh giá 4 mức theo ngữ cảnh vai trò (Rule 4), Câu 10 khó khăn max 2 & mục độc quyền (Rule 5 & 6, ẩn khi chưa có dịp), Câu 11 chuyên đề học của nhóm (Rule 3), Câu 12 mức độ cần học (Rule 7).
  5. Triển khai Bước 4: Câu 13 hình thức học (max 2), Câu 14 góp ý tự do (max 500 ký tự), bảng tóm tắt thông tin khai báo trước khi nộp.
  6. Triển khai hook dọn dẹp state khi bấm Quay lại (Back-Navigation Cleanup - Rule 9).
  7. Triển khai Màn hình Hoàn thành trang trọng với lời cảm ơn từ Trường Đào tạo & Bồi dưỡng nghiệp vụ kiểm toán, khóa form chống gửi trùng.
- **Acceptance Criteria:** Hoàn thành trải nghiệm khảo sát mượt mà trên di động và máy tính, nộp bài thành công, 100% test cases đạt.
- **Test Cases:** TC-01 đến TC-14 (E2E & UI verified).
- **Trạng thái:** `COMPLETED` (Đã hoàn thành ngày 14/11/2026)

---

## MILESTONE 3: KIỂM SOÁT GỬI ĐÚP & TRUNG TÂM RÀ SOÁT PHIẾU NGHI TRÙNG (SPRINT 3)

### TASK-007: Xây dựng Service Phát hiện Phiếu Nghi trùng (Duplicate Detection)
- **Module:** Domain Logic / Backend
- **Spec liên quan:** `specs/06-BUSINESS-WORKFLOWS.md`, `specs/08-DATABASE-DESIGN.md`
- **Mức độ ưu tiên:** P1
- **Phụ thuộc:** TASK-005
- **File đã tạo:** `src/services/duplicate-detection.service.ts`, `src/app/api/admin/reviews/duplicates/route.ts`, `src/app/api/admin/reviews/duplicates/[id]/decision/route.ts`, `src/app/api/admin/reviews/duplicates/resolve-group/route.ts`, `tests/services/duplicate-detection.test.ts`
- **Các bước thực hiện:**
  1. Xây dựng class `DuplicateDetectionService` gom nhóm các phản hồi nghi trùng theo `businessHash`.
  2. Viết phương thức `getDuplicateGroups` hỗ trợ lọc theo đợt khảo sát, tỉnh, và trạng thái thẩm tra.
  3. Viết phương thức `makeDecision` ra quyết định (`VALID` hoặc `EXCLUDED`) kèm lý do thẩm tra và ghi log vào `AuditLog`.
  4. Viết phương thức `resolveGroup` xử lý nhanh cả nhóm (giữ 1 phiếu hợp lệ, loại trừ các phiếu trùng còn lại).
  5. Viết các API Route Handlers: `GET /api/admin/reviews/duplicates`, `PATCH .../[id]/decision`, `POST .../resolve-group`.
- **Acceptance Criteria:** Phát hiện chuẩn xác 100% các phiếu nghi trùng cùng xã, cơ quan, vị trí và 16 lựa chọn; cho phép thẩm tra viên phê duyệt hoặc loại trừ kèm lý do; 8/8 tests đạt.
- **Test Cases:** TC-15, TC-16 (AC-06, AC-07 PASS).
- **Trạng thái:** `COMPLETED` (Đã hoàn thành ngày 14/11/2026)

### TASK-008: Xây dựng Giao diện Duplicate Review Workbench
- **Module:** Admin UI / Backend API
- **Spec liên quan:** `specs/09-API-SPECIFICATION.md`, `specs/10-UI-UX-SPECIFICATION.md`
- **Mức độ ưu tiên:** P1
- **Phụ thuộc:** TASK-007
- **File đã tạo:** `src/components/admin/DuplicateReviewWorkbench.tsx`, `src/app/(admin)/admin/reviews/duplicates/page.tsx`
- **Các bước thực hiện:**
  1. Xây dựng 4 thẻ chỉ số thống kê thời gian thực: Tổng nghi trùng, Đang chờ duyệt, Đã chấp nhận (Tính), Đã loại trừ.
  2. Xây dựng thanh công cụ lọc theo trạng thái thẩm tra (`ALL`, `PENDING_REVIEW`, `VALID`, `EXCLUDED`) và ô tìm kiếm nhanh địa bàn.
  3. Xây dựng giao diện Accordion danh sách nhóm nghi trùng và Side-by-side Diff View so sánh chi tiết thời điểm nộp, Phần III (mức tự đánh giá, khó khăn, chuyên đề học) và Phần IV (hình thức học, ý kiến).
  4. Tích hợp nút hành động: "Chấp nhận (Tính)", "Loại trừ phiếu" (kèm Modal nhập lý do thẩm tra), và "Xử lý nhanh" (giữ phiếu nộp sau, loại phiếu nộp trước).
- **Acceptance Criteria:** Giao diện so sánh trực quan, cập nhật trạng thái ngay lập tức trên UI và cơ sở dữ liệu.
- **Test Cases:** TC-16, TC-17.
- **Trạng thái:** `COMPLETED` (Đã hoàn thành ngày 14/11/2026)

---

## MILESTONE 4: ANALYTICS AGGREGATION ENGINE & 6 BẢNG TỔNG HỢP (SPRINT 4)

### TASK-009: Triển khai MongoDB Aggregation Pipelines cho 6 Bảng B1 - B6
- **Module:** Analytics & Reporting Engine
- **Spec liên quan:** `specs/02-BUSINESS-REQUIREMENTS.md`, `specs/12-VALIDATION-AND-BUSINESS-RULES.md`
- **Mức độ ưu tiên:** P0
- **Phụ thuộc:** TASK-005, TASK-008
- **File đã tạo:** `src/services/analytics-aggregation.service.ts`, `src/services/capacity-gap.service.ts`, `src/app/api/admin/analytics/tables/route.ts`, `tests/services/analytics-tables.test.ts`
- **Các bước thực hiện:**
  1. Viết pipeline tính toán Bảng B1 (Người trả lời, phân loại tư cách, số xã, số phiếu loại & lý do loại).
  2. Viết pipeline tính toán Bảng B2 (16 nhóm × 4 cột trạng thái, tổng 4 cột = 100%).
  3. Viết pipeline tính toán Bảng B3 (Nhóm × 4 Vai trò, tính tỷ lệ dưới chuẩn, phân bố thiếu 1, 2, 3 mức so với Benchmark Matrix, dòng người chưa có dịp tính riêng kèm câu chú thích bắt buộc).
  4. Viết pipeline tính toán Bảng B4 (Nội dung cần học × 3 Mức độ cấp thiết).
  5. Viết pipeline tính toán Bảng B5 (Khó khăn, tách nhãn ngoài đào tạo).
  6. Viết pipeline tính toán Bảng B6 (5 hình thức học & 2 giới hạn dữ liệu cố định).
- **Acceptance Criteria:** Kết quả tính toán khớp 100% với các công thức và ví dụ chuẩn trong Tài liệu số 2 và Spec 12; 26/26 tests đạt.
- **Test Cases:** TC-17, TC-18 (26/26 PASS).
- **Trạng thái:** `COMPLETED` (Đã hoàn thành ngày 14/11/2026)

### TASK-010: Xây dựng Giao diện Analytics Explorer (6 Tabs B1 - B6)
- **Module:** Admin UI
- **Spec liên quan:** `specs/10-UI-UX-SPECIFICATION.md`
- **Mức độ ưu tiên:** P1
- **Phụ thuộc:** TASK-009
- **File đã tạo:** `src/components/admin/AnalyticsTablesViewer.tsx`, `src/app/(admin)/admin/analytics/page.tsx`
- **Các bước thực hiện:**
  1. Viết Route Handler `GET /api/admin/analytics/tables` trả về dữ liệu 6 bảng có hỗ trợ bộ lọc Campaign, Tỉnh, Cơ quan.
  2. Dựng giao diện 6 Tabs bảng biểu trực quan, hỗ trợ chuyển đổi giữa chế độ số liệu thực và chế độ ẩn danh bảo vệ dữ liệu nhỏ (&lt;5 người).
  3. Hiển thị chuẩn xác câu ghi chú bắt buộc dưới tiêu đề Bảng B3 và các nhãn phân loại khó khăn.
- **Acceptance Criteria:** Hiển thị số liệu rõ ràng, chuyển tab mượt mà, hỗ trợ lọc đa chiều, đáp ứng chuẩn UX công vụ.
- **Test Cases:** TC-17, TC-18.
- **Trạng thái:** `COMPLETED` (Đã hoàn thành ngày 14/11/2026)

---

## MILESTONE 5: THUẬT TOÁN ẨN DANH SỐ LIỆU & XUẤT EXCEL (SPRINT 5)

### TASK-011: Triển khai Thuật toán Kiểm soát Tiết lộ Thống kê (Suppression Engine)
- **Module:** Security & Privacy / Domain Logic
- **Spec liên quan:** `specs/11-SECURITY-SPECIFICATION.md`, `specs/12-VALIDATION-AND-BUSINESS-RULES.md`
- **Mức độ ưu tiên:** P0
- **Phụ thuộc:** TASK-009
- **File đã tạo:** `src/services/statistical-disclosure.service.ts`, `tests/services/suppression-and-excel.test.ts`
- **Các bước thực hiện:**
  1. Viết hàm Primary Suppression `maskCell`: chuyển đổi các ô đếm $1 \le n < 5$ thành `"dưới 5 - không công bố"`, giữ nguyên $0$ và $\ge 5$.
  2. Viết hàm Row Suppression: ẩn cả dòng nếu mẫu số $N \in [1, 4]$ (áp dụng cho Bảng B2 và B3).
  3. Viết hàm Secondary Suppression `applySecondarySuppression`: tự động tìm và ẩn ô nhỏ nhất kế tiếp khác 0 trong hàng/cột có Tổng khi chỉ có 1 ô bị ẩn sơ cấp.
  4. Viết hàm `suppressAll` áp dụng đồng bộ cho cả 6 bảng B1 - B6.
- **Acceptance Criteria:** Bảo đảm 100% dữ liệu xuất ra cho địa phương không thể bị suy đoán danh tính; 100% test cases đạt.
- **Test Cases:** TC-19, TC-20, TC-21 (PASS).
- **Trạng thái:** `COMPLETED` (Đã hoàn thành ngày 14/11/2026)

### TASK-012: Xây dựng Pipeline Xuất Báo cáo Excel Đa sheet (ExcelJS Export)
- **Module:** Export Pipeline
- **Spec liên quan:** `specs/09-API-SPECIFICATION.md`, `specs/02-BUSINESS-REQUIREMENTS.md`
- **Mức độ ưu tiên:** P0
- **Phụ thuộc:** TASK-009, TASK-011
- **File đã tạo:** `src/services/excel-export.service.ts`, `src/app/api/admin/export/excel/route.ts`, `src/components/admin/AnalyticsTablesViewer.tsx`
- **Các bước thực hiện:**
  1. Sử dụng thư viện `exceljs` xây dựng class `ExcelExportService`.
  2. Xây dựng generator tạo 6 sheets tương ứng B1 - B6 chuẩn định dạng kiểm toán nhà nước.
  3. Định dạng banner tiêu đề trang trọng, border, font chữ tiếng Việt, in đậm, auto-fit cột.
  4. Hỗ trợ 2 chế độ: `INTERNAL` (số liệu thực đầy đủ) và `LOCAL_CONFIDENTIAL` (ẩn số liệu nhỏ < 5).
  5. Tạo Route Handler `GET /api/admin/export/excel` stream binary file `.xlsx` về trình duyệt.
  6. Tích hợp nút xuất Excel trực tiếp trên giao diện Analytics Explorer.
- **Acceptance Criteria:** Tải file Excel chuẩn xác, mở được trên MS Excel và Google Sheets không bị lỗi font; 100% test cases đạt.
- **Test Cases:** TC-23 (PASS).
- **Trạng thái:** `COMPLETED` (Đã hoàn thành ngày 14/11/2026)

---

## MILESTONE 6: DASHBOARD QUẢN TRỊ, RBAC & THEO DÕI TIẾN ĐỘ (SPRINT 6)

### TASK-013: Triển khai Xác thực Auth.js v5 & Phân quyền RBAC 5 Nhóm Tài khoản
- **Module:** Authentication & Security
- **Spec liên quan:** `specs/05-USER-ROLES-AND-USE-CASES.md`, `specs/07-SYSTEM-ARCHITECTURE.md`, `specs/11-SECURITY-SPECIFICATION.md`
- **Mức độ ưu tiên:** P0
- **Phụ thuộc:** TASK-002
- **File đã tạo:** `src/lib/auth.ts`, `src/app/api/auth/login/route.ts`, `src/app/api/auth/logout/route.ts`, `src/app/api/auth/me/route.ts`, `src/app/(auth)/login/page.tsx`, `src/app/(admin)/layout.tsx`, `tests/services/auth-and-dashboard.test.ts`
- **Các bước thực hiện:**
  1. Xây dựng module xác thực an toàn `src/lib/auth.ts` sử dụng JWT HMAC SHA-256 lưu trong HTTP-Only cookie và bcrypt hashing.
  2. Triển khai đầy đủ ma trận phân quyền RBAC `hasPermission` cho 5 nhóm tài khoản: `TECHNICAL_ADMIN`, `CONTENT_ADMIN`, `REVIEWER`, `PROGRESS_MONITOR`, `LOCAL_COORDINATOR`.
  3. Xây dựng 3 endpoint API: `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`.
  4. Thiết kế giao diện Đăng nhập trang trọng, bảo mật tại `/login` với nút chọn nhanh tài khoản kiểm thử.
  5. Xây dựng Admin Layout với thanh điều hướng theo phân quyền động và menu tài khoản.
- **Acceptance Criteria:** Đăng nhập an toàn, chặn đúng quyền ở cả Client và Server API, bảo vệ nghiêm ngặt Zero-PII và dữ liệu nội bộ đối với Đầu mối địa phương; 100% test cases đạt.
- **Test Cases:** TC-22 (PASS).
- **Trạng thái:** `COMPLETED` (Đã hoàn thành ngày 14/11/2026)

### TASK-014: Xây dựng Dashboard Theo dõi Tiến độ & Quản lý Đợt Khảo sát
- **Module:** Admin UI / Analytics
- **Spec liên quan:** `specs/10-UI-UX-SPECIFICATION.md`, `specs/06-BUSINESS-WORKFLOWS.md`
- **Mức độ ưu tiên:** P1
- **Phụ thuộc:** TASK-013
- **File đã tạo:** `src/services/progress-monitoring.service.ts`, `src/app/api/admin/progress/route.ts`, `src/app/api/admin/campaigns/qr-zip/route.ts`, `src/components/admin/ProgressCharts.tsx`, `src/app/(admin)/admin/dashboard/page.tsx`, `src/app/(admin)/admin/campaigns/page.tsx`
- **Các bước thực hiện:**
  1. Xây dựng `ProgressMonitoringService` tổng hợp số phiếu, tỷ lệ hoàn thành theo chỉ tiêu và tiến độ 34 tỉnh.
  2. Xây dựng các biểu đồ Recharts thời gian thực: Biểu đồ diện tích số phiếu nộp theo ngày (Daily Timeline) và Biểu đồ cột Top địa phương.
  3. Thiết kế trang Dashboard tại `/admin/dashboard` với 4 thẻ chỉ số KPI và bảng tiến độ 34 tỉnh/thành phố chi tiết kèm tìm kiếm/lọc.
  4. Thiết kế trang Quản lý Đợt Khảo sát & 34 Mã QR tại `/admin/campaigns` hiển thị thẻ QR trực quan, sao chép link và tải PNG từng tỉnh.
  5. Xây dựng Route Handler `/api/admin/campaigns/qr-zip` tự động đóng gói file ZIP chứa đủ 34 mã QR PNG độ phân giải cao kèm file hướng dẫn sử dụng (ADR-008).
- **Acceptance Criteria:** Quản lý đợt khảo sát trực quan, theo dõi số liệu tiến độ tức thời, xuất trọn gói 34 mã QR chuẩn xác; 100% test cases đạt.
- **Test Cases:** TC-13, TC-14 (PASS).
- **Trạng thái:** `COMPLETED` (Đã hoàn thành ngày 14/11/2026)

---

## MILESTONE 7: TOÀN BỘ 23 CA KIỂM THỬ E2E & PRODUCTION GO-LIVE (SPRINT 7)

### TASK-015: Viết Bộ Test Tự động cho toàn bộ 23 Ca kiểm thử Chuẩn
- **Module:** QA / Testing / E2E Verification
- **Spec liên quan:** `specs/13-TEST-STRATEGY.md`, `specs/14-ACCEPTANCE-CRITERIA.md`
- **Mức độ ưu tiên:** P0
- **Phụ thuộc:** Toàn bộ các tasks từ TASK-001 đến TASK-014
- **File đã tạo:** `tests/e2e/23-official-test-cases.test.ts`
- **Các bước thực hiện:**
  1. Xây dựng runner kiểm thử tự động toàn diện bao phủ 23 ca kiểm thử nghiệp vụ chính thức (`TC-01` đến `TC-23`).
  2. Kiểm thử luồng kết thúc sớm (TC-01), kiêm nhiệm nhiều nhóm (TC-02), nhiều vai trò (TC-03), chưa có dịp (TC-04), chỉ phối hợp (TC-05).
  3. Kiểm thử các ca điều hướng quay lại dọn dẹp state (TC-06, TC-07, TC-08, TC-09).
  4. Kiểm thử các ràng buộc nghiệp vụ Phần III & IV (TC-10 khó khăn max 2, TC-11 khó khăn độc quyền, TC-12 mức độ cần học, TC-13 gợi ý theo vị trí, TC-14 chống nộp đúp).
  5. Kiểm thử rà soát trùng lặp (TC-15 mã băm 4 điểm, TC-16 thẩm tra loại trừ).
  6. Kiểm thử phân tích & khoảng thiếu hụt (TC-17 tính Gap, TC-18 ô không có chuẩn).
  7. Kiểm thử bảo vệ ẩn danh thống kê (TC-19 primary suppression, TC-20 row suppression, TC-21 secondary suppression).
  8. Kiểm thử an toàn phân quyền & xuất báo cáo (TC-22 RBAC địa phương, TC-23 xuất Excel 6 sheet).
- **Acceptance Criteria:** 23/23 ca kiểm thử đều PASS 100%.
- **Test Cases:** Toàn bộ TC-01 đến TC-23 (23/23 PASS).
- **Trạng thái:** `COMPLETED` (Đã hoàn thành ngày 14/11/2026)

### TASK-016: Đóng gói Docker & Chuẩn bị Môi trường Production
- **Module:** DevOps & Deployment
- **Spec liên quan:** `specs/16-DEPLOYMENT-SPECIFICATION.md`
- **Mức độ ưu tiên:** P1
- **Phụ thuộc:** TASK-015
- **File đã tạo:** `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `scripts/backup.sh`, `src/app/api/health/route.ts`
- **Các bước thực hiện:**
  1. Tạo multi-stage `Dockerfile` tối ưu hóa kích thước image, sử dụng Node 20 Alpine, Non-root user `nextjs`, standalone output và tích hợp Docker HEALTHCHECK.
  2. Viết file `docker-compose.yml` định nghĩa service `app` và `mongodb:7.0` với persistent volume, healthcheck ping và network nội bộ.
  3. Tạo Route Handler `GET /api/health` kiểm tra kết nối DB, uptime, bộ nhớ RAM, phiên bản ứng dụng và ma trận schema 3.3.
  4. Viết kịch bản sao lưu cơ sở dữ liệu `scripts/backup.sh` tự động dump, nén gzip và dọn dẹp định kỳ 30 ngày.
  5. Chạy nghiệm thu `next build` biên dịch tối ưu hóa thành công 100% (21/21 routes).
- **Acceptance Criteria:** Khởi chạy container thành công, endpoint healthcheck trả về UP/HEALTHY, production build 100% passed.
- **Test Cases:** Healthcheck API & Next.js Production Build (PASS).
- **Trạng thái:** `COMPLETED` (Đã hoàn thành ngày 14/11/2026)

---

## MILESTONE 8 / MỞ RỘNG: PHÂN HỆ HƯỚNG DẪN SỬ DỤNG PHẦN MỀM ĐỘNG (DYNAMIC USER GUIDE MODULE)

### TASK-017: Xây dựng Phân hệ Hướng dẫn Sử dụng Cập nhật Động theo Phần mềm (ADR-010)
- **Module:** Documentation / Dynamic Introspection / UI / User Experience
- **Spec liên quan:** `specs/10-UI-UX-SPECIFICATION.md`, `specs/05-USER-ROLES-AND-USE-CASES.md`, `specs/06-BUSINESS-WORKFLOWS.md`, `specs/DECISIONS.md` (ADR-010)
- **Mức độ ưu tiên:** P1
- **Phụ thuộc:** TASK-014, TASK-016
- **File đã tạo/cập nhật:**
  - `src/models/SystemGuide.ts`, `src/models/index.ts`: Mongoose schema cho ghi chú hướng dẫn và metadata cẩm nang.
  - `src/services/system-guide.service.ts`: Dịch vụ Dynamic Introspection đọc thời gian thực từ `SurveySchemaConfig`, `Campaign`, `PositionWorkgroupsMapping`, bóc tách 6 module chức năng online kèm RBAC, năng lực cốt lõi, quy tắc nghiệp vụ và API endpoints.
  - `src/app/api/public/guide/route.ts`: Public API trả về dữ liệu cẩm nang đồng bộ thời gian thực.
  - `src/app/api/admin/guide/sections/[key]/route.ts`: Admin API bảo vệ bằng RBAC cho phép `TECHNICAL_ADMIN` và `CONTENT_ADMIN` lưu trữ ghi chú tác nghiệp trực tiếp vào DB.
  - `src/app/(admin)/admin/guide/page.tsx`: Giao diện Cẩm nang Vận hành Động: banner trạng thái DB, tabs module chức năng, bộ lọc tìm kiếm, dynamic schema explorer (16 nhóm việc, 4 vai trò, mô tả mức độ), editor ghi chú trực tuyến và in PDF.
  - `src/components/survey/SurveyGuideModal.tsx`: Component modal hướng dẫn làm bài 4 bước, Zero-PII, quy tắc nghiệp vụ và FAQ nhúng trên di động.
  - `src/components/survey/SurveyContainer.tsx`: Header nút "Hướng dẫn làm bài" kích hoạt modal ngay trong bài khảo sát.
  - `src/app/(admin)/layout.tsx`: Tích hợp link `/admin/guide` vào thanh điều hướng Sidebar.
  - `tests/e2e/guide-module.test.ts`: Bộ 5 ca kiểm thử tự động cho toàn bộ phân hệ cẩm nang động.
- **Các bước thực hiện:**
  1. Xây dựng dịch vụ `SystemGuideService` tự động đồng bộ hóa cấu hình hệ thống (Schema 3.3, Đợt khảo sát `DOT-1-2026`, danh mục gợi ý theo vị trí) với cơ chế fallback local JSON.
  2. Bóc tách và đăng ký đầy đủ các module phần mềm đang trực tuyến (Cổng khảo sát di động, Dashboard tiến độ, Quản lý QR 34 tỉnh, Thẩm tra phiếu trùng, 6 bảng tổng hợp B1-B6, Pipeline xuất Excel).
  3. Cung cấp API Public và API Admin cho phép quản trị viên chỉnh sửa và lưu ghi chú hướng dẫn trực tiếp trên giao diện web vào MongoDB.
  4. Nâng cấp giao diện `/admin/guide` thành bảng điều khiển động, phân tách đối tượng Quản trị viên và Cán bộ cấp xã, hỗ trợ in ấn PDF chuyên nghiệp.
  5. Tích hợp `SurveyGuideModal` vào biểu mẫu khảo sát công khai `/khao-sat/[token]` giúp cán bộ tra cứu không làm gián đoạn bài làm.
  6. Viết bộ 5 ca kiểm thử tự động kiểm tra tính toàn vẹn của dữ liệu bóc tách, bảo vệ phân quyền RBAC và giao diện người dùng.
- **Acceptance Criteria:** Hướng dẫn cập nhật động 100% theo các module phần mềm và cấu hình DB, hỗ trợ chỉnh sửa ghi chú, in PDF, 5/5 test cases đạt, 23/23 routes build thành công.
- **Test Cases:** Task 17 Dynamic Guide Module Tests (5/5 PASS).
- **Trạng thái:** `COMPLETED` (Đã hoàn thành ngày 14/11/2026)

---

## MILESTONE 9 / MỞ RỘNG: PHÂN HỆ CẤU HÌNH ĐƠN VỊ HÀNH CHÍNH (34 TỈNH & 3.321 XÃ/PHƯỜNG)

### TASK-018: Xây dựng Phân hệ Cấu hình & Quản trị Danh mục Đơn vị Hành chính 2 cấp (ADR-011)
- **Module:** Administrative Units Management / Backend Service / Admin UI
- **Spec liên quan:** `specs/08-DATABASE-DESIGN.md`, `specs/05-USER-ROLES-AND-USE-CASES.md`, `specs/10-UI-UX-SPECIFICATION.md`, `specs/DECISIONS.md` (ADR-011)
- **Mức độ ưu tiên:** P1
- **Phụ thuộc:** TASK-013, TASK-014, TASK-017
- **File đã tạo/cập nhật:**
  - `src/models/Province.ts`, `src/models/Commune.ts`: Bổ sung trường `isActive`, `region`, `districtName`.
  - `src/lib/validations/administrative-units.schema.ts`: Zod schema xác thực mã tỉnh 2 số, mã xã 5 số duy nhất, phân loại và phân trang.
  - `src/services/administrative-units.service.ts`: Dịch vụ quản trị 34 tỉnh và 3.321 xã/phường/đặc khu (thống kê tổng quan, tìm kiếm, lọc, thêm, sửa, xóa, đồng bộ 1-click từ nguồn chuẩn CC BY 4.0, offline fallback).
  - `src/app/api/admin/administrative-units/stats/route.ts`: API thống kê tổng quan.
  - `src/app/api/admin/administrative-units/provinces/route.ts`: API tìm kiếm, lọc và thêm/sửa tỉnh/thành.
  - `src/app/api/admin/administrative-units/provinces/[code]/status/route.ts`: API bật/tắt trạng thái tỉnh.
  - `src/app/api/admin/administrative-units/communes/route.ts`: API lọc xã theo tỉnh, tìm kiếm từ khóa, phân trang và thêm/sửa xã.
  - `src/app/api/admin/administrative-units/communes/[code]/route.ts`: API xóa và bật/tắt trạng thái xã.
  - `src/app/api/admin/administrative-units/sync/route.ts`: API kích hoạt đồng bộ hóa từ nguồn chuẩn vào MongoDB.
  - `src/app/api/admin/administrative-units/export/route.ts`: API xuất file Excel .xlsx 2 sheet chuyên nghiệp.
  - `src/app/(admin)/admin/administrative-units/page.tsx`: Giao diện Quản trị Cấu hình ĐVHC (4 thẻ KPI, thanh tác vụ, tab 34 tỉnh, tab 3.321 xã/phường, modals thêm/sửa).
  - `src/app/(admin)/layout.tsx`: Bổ sung menu "Danh mục Tỉnh, Xã/Phường" vào thanh điều hướng Sidebar.
  - `src/services/system-guide.service.ts`: Đăng ký module chức năng thứ 7 vào Cẩm nang Vận hành Động.
  - `tests/services/administrative-units.test.ts`: 5 ca kiểm thử tự động đạt PASS 100%.
- **Các bước thực hiện:**
  1. Xây dựng Zod validation schemas kiểm tra chặt chẽ định dạng mã hành chính cấp tỉnh (2 số) và cấp xã (5 số).
  2. Phát triển `AdministrativeUnitsService` hỗ trợ đầy đủ các thao tác CRUD, thống kê, phân trang và cơ chế fallback an toàn.
  3. Xây dựng 7 Route Handlers API Quản trị có phân quyền RBAC và xử lý lỗi đồng bộ.
  4. Thiết kế giao diện Quản trị `/admin/administrative-units` với 2 tab Tỉnh và Xã/Phường, bộ lọc theo tỉnh, từ khóa, phân loại và modals tương tác.
  5. Tích hợp tính năng xuất Excel danh mục đa sheet và đồng bộ 1-click từ tệp chuẩn.
  6. Viết bộ test tự động và nghiệm thu toàn diện (5/5 tests PASS).
- **Acceptance Criteria:** Quản lý trọn vẹn 34 tỉnh và 3.321 xã/phường/đặc khu, hỗ trợ thêm/sửa/xóa/bật tắt, xuất Excel, đồng bộ nguồn, 5/5 tests PASS, 30/30 routes build thành công.
- **Test Cases:** TC-DVHC-01 đến TC-DVHC-05 (5/5 PASS).
- **Trạng thái:** `COMPLETED` (Đã hoàn thành ngày 14/11/2026)

---

## MILESTONE 10 / MỞ RỘNG: PHÂN HỆ QUẢN TRỊ BỘ CÂU HỎI & NGÂN HÀNG CHUYÊN ĐỀ ĐÀO TẠO ĐỘNG (ADR-012)

### TASK-019: Xây dựng Giao diện & Bộ API Quản trị Bộ Câu hỏi, Nhóm việc & Chuyên đề Khảo sát
- **Module:** Survey Questions & Schema Builder / Admin UI / Backend Service
- **Spec liên quan:** `specs/03-FUNCTIONAL-REQUIREMENTS.md` (FR-004, FR-005, FR-006), `specs/08-DATABASE-DESIGN.md`, `specs/DECISIONS.md` (ADR-012)
- **Mức độ ưu tiên:** P1
- **Phụ thuộc:** TASK-002, TASK-005, TASK-017, TASK-018
- **File dự kiến tạo/cập nhật:**
  - `src/models/SurveySchemaConfig.ts`: Bổ sung `title`, `description`, và mảng `questions` cấu hình 14 câu hỏi.
  - `src/lib/validations/survey-schema-admin.schema.ts`: Bộ Zod schemas kiểm tra tính hợp lệ khi thêm/sửa câu hỏi, nhóm việc, chuyên đề, vai trò, khó khăn, hình thức học.
  - `src/services/survey-questions-admin.service.ts`: Dịch vụ quản trị CRUD phiên bản, nhóm việc, chuyên đề, vai trò, khó khăn, hình thức học và cấu hình 14 câu hỏi.
  - `src/app/api/admin/questions/versions/route.ts`: API danh sách phiên bản và tạo/clone phiên bản mới.
  - `src/app/api/admin/questions/schema/[version]/route.ts`: API đọc chi tiết và lưu toàn bộ schema.
  - `src/app/api/admin/questions/schema/[version]/workgroups/route.ts`: API quản trị nhóm công việc (thêm, sửa, xóa, sắp xếp).
  - `src/app/api/admin/questions/schema/[version]/workgroups/[id]/topics/route.ts`: API quản trị chuyên đề đào tạo.
  - `src/app/api/admin/questions/schema/[version]/roles/route.ts`: API cập nhật 4 vai trò và mô tả mức năng lực.
  - `src/app/api/admin/questions/schema/[version]/difficulties/route.ts`: API cập nhật danh mục khó khăn.
  - `src/app/api/admin/questions/schema/[version]/learning-formats/route.ts`: API cập nhật danh mục hình thức học.
  - `src/app/api/admin/questions/schema/[version]/sections/route.ts`: API cập nhật cấu hình 14 câu hỏi.
  - `src/app/(admin)/admin/questions/page.tsx`: Giao diện Quản trị Bộ câu hỏi (5 tabs chuyên nghiệp).
  - `src/app/(admin)/layout.tsx`: Thêm mục "Quản trị Bộ Câu hỏi" vào Sidebar.
  - `src/services/system-guide.service.ts`: Đăng ký phân hệ thứ 8 vào Cẩm nang Vận hành Động.
  - `tests/services/survey-questions-admin.test.ts`: Bộ kiểm thử tự động cho toàn bộ phân hệ.
- **Các bước thực hiện:**
  1. Cập nhật Model Mongoose `SurveySchemaConfig`.
  2. Xây dựng Zod validation schemas và Service `SurveyQuestionsAdminService`.
  3. Xây dựng 8 RESTful API Route Handlers.
  4. Xây dựng giao diện Quản trị `/admin/questions` với 5 tabs.
  5. Tích hợp thanh điều hướng Sidebar và Cẩm nang động.
  6. Viết bộ test và kiểm thử hệ thống.
- **Acceptance Criteria:** Cho phép thay đổi nội dung, số lượng (thêm/xóa nhóm việc, chuyên đề, khó khăn, hình thức học), cấu trúc (thứ tự, maxSelect, độc quyền, bật/tắt) và nhân bản phiên bản mới an toàn; 100% test cases đạt; build thành công.
- **Test Cases:** TC-QA-01 đến TC-QA-05 (5/5 PASS 100% tại `tests/services/survey-questions-admin.test.ts`).
- **Trạng thái:** `COMPLETED` (Đã hoàn thành ngày 16/11/2026)

---

## MILESTONE 11: PHÂN HỆ NHẬT KÝ HỆ THỐNG (AUDIT LOGS) & PHÂN QUYỀN DUAL-ADMIN (ADR-013)

### TASK-020: Rà soát Cơ chế Phân quyền Dual-Admin, Xây dựng Hệ thống Nhật ký & Giao diện Quản trị Log Cục CNTT
- **Module:** Security & Audit Logging / RBAC Dual-Admin / Admin UI
- **Spec liên quan:** `specs/05-USER-ROLES-AND-USE-CASES.md`, `specs/07-SYSTEM-ARCHITECTURE.md`, `specs/11-SECURITY-SPECIFICATION.md`, `specs/DECISIONS.md` (ADR-013)
- **Mức độ ưu tiên:** P0
- **Phụ thuộc:** TASK-013, TASK-014, TASK-018, TASK-019
- **File đã tạo/cập nhật:**
  - `src/models/User.ts`: Thêm `SYSTEM_ADMIN` song song `TECHNICAL_ADMIN`.
  - `src/models/AuditLog.ts`: Schema lưu vết nhật ký đầy đủ (actor, role, action, module, description, target, details, IP, UA, status).
  - `src/lib/auth.ts`: Quyền `VIEW_AUDIT_LOGS` đặc quyền Cục CNTT, phân quyền đồng đều cho cả 2 loại admin ở các tác vụ quản trị nghiệp vụ khác.
  - `src/services/audit-log.service.ts`: Dịch vụ ghi log an toàn non-blocking, truy vấn phân trang đa bộ lọc, tính toán 5 chỉ số thống kê.
  - `src/lib/audit-logger.ts`: Helper `logActionFromRequest` trích xuất IP client, User-Agent và danh tính phiên.
  - `src/app/api/admin/audit-logs/route.ts`: API GET (chặn 403 Forbidden nếu không phải Cục CNTT, tự động ghi log cảnh báo an ninh) và POST.
  - Tích hợp ghi log trên các endpoint: `api/auth/login`, `api/auth/logout`, `api/admin/questions/...`, `api/admin/administrative-units/...`, `api/admin/reviews/duplicates/...`, `api/admin/export/excel`, `api/admin/campaigns/qr-zip`.
  - `src/app/(admin)/admin/audit-logs/page.tsx`: Giao diện Quản trị Nhật ký chuẩn Full-Height Zero-Page-Scroll, 4 thẻ KPIs, bộ lọc phân hệ/trạng thái, bảng cuộn dính thead, modal metadata JSON, xuất CSV, và màn hình cảnh báo truy cập trái phép.
  - `src/app/(admin)/layout.tsx`: Bổ sung menu "Nhật ký Hệ thống" vào Sidebar (chỉ hiển thị cho `TECHNICAL_ADMIN`).
  - `src/app/(auth)/login/page.tsx`: Cung cấp 2 nút preset 1-click: "Cục CNTT" (`cntt_admin` - có quyền xem log) và "Admin" (`admin` - chặn xem log).
- **Các bước thực hiện:**
  1. Chuẩn hóa 2 nhóm tài khoản quản trị: Cục CNTT (`cntt_admin`) và Admin (`admin`).
  2. Bổ sung quyền `VIEW_AUDIT_LOGS` độc quyền cho `TECHNICAL_ADMIN`.
  3. Xây dựng Model, Service và API Route cho Nhật ký Hệ thống.
  4. Gắn cờ ghi log tự động trên toàn bộ các endpoint thao tác dữ liệu.
  5. Xây dựng giao diện Quản trị Nhật ký đạt tiêu chuẩn Full-Height và Zero-Page-Scroll.
  6. Kiểm thử xác nhận chặn 403 khi `admin` truy cập API/trang nhật ký, ghi log cảnh báo; kiểm thử `cntt_admin` tra cứu và xuất CSV thành công.
- **Acceptance Criteria:**
  - 2 loại tài khoản đăng nhập (`cntt_admin`, `admin`) có quyền nghiệp vụ như nhau.
  - Duy nhất `cntt_admin` (Cục CNTT) xem được Nhật ký Hệ thống; `admin` bị chặn 403 Forbidden và ẩn menu.
  - Mọi thao tác truy cập, đăng nhập/đăng xuất, chỉnh sửa câu hỏi, ĐVHC, thẩm tra trùng, xuất Excel, tải QR đều được lưu vết đầy đủ.
  - Giao diện Full-Height, không cuộn page, bảng cuộn nội bộ; 0 lỗi TypeScript.
- **Test Cases:** TC-AUDIT-01 (Đăng nhập Cục CNTT & Xem log), TC-AUDIT-02 (Đăng nhập Admin & Chặn 403 log), TC-AUDIT-03 (Tự động ghi cảnh báo an ninh), TC-AUDIT-04 (Ghi log thao tác nghiệp vụ) -> 100% PASS.
- **Trạng thái:** `COMPLETED` (Đã hoàn thành ngày 16/11/2026)

---

## MILESTONE 12: TỐI GIẢN HÓA AUTH UX, DỌN DẸP TITLE TAGS & PROGRESSIVE RENDERING ENGINE (ADR-014)

### TASK-021: Tối giản hóa Giao diện Đăng nhập, Xóa bỏ Badge Kỹ thuật trên Tiêu đề & Tối ưu Chuyển Tab Bằng Progressive Item Rendering
- **Module:** UI/UX Refinement / Performance Optimization / Auth Experience
- **Spec liên quan:** `specs/10-UI-UX-SPECIFICATION.md`, `specs/DECISIONS.md` (ADR-014)
- **Mức độ ưu tiên:** P1
- **Phụ thuộc:** TASK-019, TASK-020
- **File đã tạo/cập nhật:**
  - `src/app/(auth)/login/page.tsx`: Tối giản hóa form đăng nhập (thu gọn card `max-w-[390px]`, bỏ khối 5 nút preset, thêm toggle mật khẩu và hàng gợi ý 1-click kín đáo `Gợi ý: Cục CNTT • Admin`).
  - `src/hooks/useProgressiveItems.ts`: Custom hook chia nhỏ dữ liệu và nạp nối tiếp theo frame (< 16ms/frame) kèm resetKey tự động.
  - `src/app/(admin)/admin/questions/page.tsx`: Dọn tiêu đề, tích hợp `useProgressiveItems` cho 5 tabs (14 câu hỏi, nhóm việc, chuyên đề, vai trò, khó khăn).
  - `src/components/admin/AnalyticsTablesViewer.tsx`: Dọn tiêu đề, tích hợp progressive rows streaming cho các bảng B1 đến B6.
  - `src/app/(admin)/admin/administrative-units/page.tsx`: Dọn tiêu đề, tích hợp progressive rendering cho 34 tỉnh.
  - `src/app/(admin)/admin/dashboard/page.tsx`, `campaigns/page.tsx`, `guide/page.tsx`, `audit-logs/page.tsx`, `DuplicateReviewWorkbench.tsx`: Xóa sạch badge kỹ thuật.
- **Các bước thực hiện:**
  1. Tái cấu trúc trang `/login` thành giao diện tối giản, thanh lịch, trang nghiêm, full-height zero-page-scroll.
  2. Rà soát và xóa bỏ toàn bộ các thẻ tag/badge mang tính kỹ thuật/dev spec trên tiêu đề toàn bộ các trang Admin.
  3. Xây dựng hook `useProgressiveItems` và tích hợp vào các trang/tab có số lượng phần tử DOM và icon lớn.
  4. Kiểm thử tốc độ chuyển tab tức thì (< 16ms), kiểm thử typecheck và chạy thử nghiệm.
- **Acceptance Criteria:**
  - Trang login tối giản, không tràn khung, cuộn bằng 0.
  - Các trang quản trị không còn badge kỹ thuật thừa.
  - Chuyển tab mượt mà tức thì, không bị đơ hoặc giật lag.
  - 100% typecheck thành công, 0 lỗi TypeScript.
- **Test Cases:** TC-PERF-01 (Kiểm tra tốc độ render frame 1 của tab < 16ms), TC-UI-01 (Kiểm tra zero-page-scroll tại `/login` và các trang Admin) -> PASS 100%.
- **Trạng thái:** `COMPLETED` (Đã hoàn thành ngày 16/11/2026)

---

## MILESTONE 13: PHÂN HỆ QUẢN TRỊ NGƯỜI DÙNG, SỔ QUẢN LÝ ĐƯỜNG DẪN & ĐỀ XUẤT ĐÀO TẠO 12 MỤC (ADR-015)

### TASK-022: Xây dựng Phân hệ Quản trị Tài khoản Người dùng & Phân quyền RBAC (`/admin/users`)
- **Module:** Security / User Management / RBAC
- **Spec liên quan:** `specs/05-USER-ROLES-AND-USE-CASES.md` (UC-14), `specs/DECISIONS.md` (ADR-015)
- **Mức độ ưu tiên:** P0
- **Phụ thuộc:** TASK-020
- **File đã tạo:**
  - `src/lib/validations/user-admin.schema.ts`: Zod schema validate tạo/sửa người dùng và đổi mật khẩu.
  - `src/services/user-admin.service.ts`: Dịch vụ CRUD người dùng, mã hóa bcrypt, bảo vệ superadmin.
  - `src/app/api/admin/users/route.ts`: API GET (danh sách + thống kê) & POST (tạo mới).
  - `src/app/api/admin/users/[id]/route.ts`: API PUT & DELETE.
  - `src/app/api/admin/users/[id]/status/route.ts`: API PATCH khóa/mở khóa.
  - `src/app/api/admin/users/[id]/reset-password/route.ts`: API POST đổi mật khẩu.
  - `src/app/(admin)/admin/users/page.tsx`: Giao diện Full-Height Zero-Page-Scroll, 4 thẻ KPIs, bộ lọc đa chiều, modal tạo/sửa, phân công 34 tỉnh.
  - `tests/services/user-admin.test.ts`: Bộ kiểm thử tự động 6 ca kiểm thử.
- **Acceptance Criteria:** Toàn quyền quản trị tài khoản 6 vai trò, gán tỉnh phụ trách, khóa/thu hồi tài khoản, đổi mật khẩu, bảo vệ không xóa admin hệ thống; 6/6 tests PASS.
- **Test Cases:** TC-USER-01 đến TC-USER-06 (6/6 PASS 100%).
- **Trạng thái:** `COMPLETED` (Đã hoàn thành ngày 17/11/2026)

### TASK-023: Nâng cấp Sổ Quản lý Đường dẫn Khảo sát & Vòng đời Token (`/admin/campaigns`)
- **Module:** Campaign / Link Lifecycle Management
- **Spec liên quan:** `specs/05-USER-ROLES-AND-USE-CASES.md` (UC-09), `specs/DECISIONS.md` (ADR-015)
- **Mức độ ưu tiên:** P1
- **Phụ thuộc:** TASK-013, TASK-021
- **File đã tạo/cập nhật:**
  - `src/services/campaign-link.service.ts`: Dịch vụ quản lý vòng đời 34 link tỉnh, thống kê nộp phiếu, đổi mã bảo mật `rotateToken` sinh mã QR mới và bảo toàn dữ liệu cũ.
  - `src/app/api/admin/campaigns/links/route.ts`: API lấy danh sách link động + KPIs.
  - `src/app/api/admin/campaigns/links/[token]/status/route.ts`: API đóng/mở nhận phiếu từng tỉnh.
  - `src/app/api/admin/campaigns/links/[token]/rotate/route.ts`: API đổi token bảo mật khi bị lộ.
  - `src/app/(admin)/admin/campaigns/page.tsx`: Nâng cấp giao diện nạp dữ liệu động từ DB, nút bật/tắt nhận phiếu, nút Rotate Token, nạp dần progressive items.
- **Acceptance Criteria:** Cho phép đóng/mở nhận phiếu độc lập từng tỉnh, đổi token và tạo mã QR mới bảo toàn phiếu cũ; 0 lỗi TypeScript.
- **Trạng thái:** `COMPLETED` (Đã hoàn thành ngày 17/11/2026)

### TASK-024: Xây dựng Phân hệ Lập & Quản lý Bản Đề xuất Đào tạo 12 Mục Chuẩn (`/admin/training-proposals`) & Xuất Raw Data
- **Module:** Training Proposal / Analytics Actionable Engine / Raw Data Export
- **Spec liên quan:** `specs/02-BUSINESS-REQUIREMENTS.md` (BR-21, BR-23), `specs/DECISIONS.md` (ADR-015)
- **Mức độ ưu tiên:** P0
- **Phụ thuộc:** TASK-008, TASK-009, TASK-021
- **File đã tạo/cập nhật:**
  - `src/models/TrainingProposal.ts`: Mongoose Model lưu trữ 12 mục tiêu chí chuẩn theo quy định Thuyết minh Phần V Mục 3.
  - `src/services/training-proposal.service.ts`: Dịch vụ tự động trích xuất số liệu 6 bảng B1-B6 thành bản thảo 12 mục tiêu chuẩn.
  - `src/app/api/admin/training-proposals/route.ts`: API danh sách và tạo đề xuất mới.
  - `src/app/api/admin/training-proposals/generate/route.ts`: API tự động sinh bản thảo từ 6 bảng.
  - `src/app/api/admin/training-proposals/[id]/route.ts`: API chi tiết, cập nhật và xóa đề xuất.
  - `src/app/api/admin/training-proposals/[id]/approve/route.ts`: API ký duyệt đề xuất.
  - `src/app/(admin)/admin/training-proposals/page.tsx`: Giao diện Full-Height Zero-Page-Scroll gồm tab danh sách và tab soạn thảo văn bản hành chính in ấn chuẩn (Print CSS).
  - `src/services/excel-export.service.ts`: Thêm phương thức `generateRawDataWorkbookBuffer` xuất toàn bộ phiếu thô mã hóa Zero-PII.
  - `src/app/api/admin/export/raw-data/route.ts`: API xuất file Excel dữ liệu gốc.
  - `src/components/admin/AnalyticsTablesViewer.tsx`: Bổ sung nút "Dữ liệu gốc (Raw)".
  - `tests/services/training-proposal.test.ts`: Bộ kiểm thử tự động 6 ca kiểm thử.
- **Acceptance Criteria:** Tự động sinh văn bản 12 mục chuẩn từ số liệu 6 bảng, lưu trữ, ký duyệt, in PDF; xuất file dữ liệu thô bảo mật; 6/6 tests PASS.
- **Test Cases:** TC-PROP-01 đến TC-PROP-06 (6/6 PASS 100%).
- **Trạng thái:** `COMPLETED` (Đã hoàn thành ngày 17/11/2026)
