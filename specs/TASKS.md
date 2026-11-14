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

## MILESTONE 8 / MỞ RỘNG: PHÂN HỆ HƯỚNG DẪN SỬ DỤNG PHẦN MỀM (USER GUIDE MODULE)

### TASK-017: Xây dựng Phân hệ Hướng dẫn Sử dụng Phần mềm Toàn diện
- **Module:** Documentation / UI / User Experience
- **Spec liên quan:** `specs/10-UI-UX-SPECIFICATION.md`, `specs/05-USER-ROLES-AND-USE-CASES.md`, `specs/06-BUSINESS-WORKFLOWS.md`
- **Mức độ ưu tiên:** P1
- **Phụ thuộc:** TASK-014, TASK-016
- **File đã tạo:** `src/app/(admin)/admin/guide/page.tsx`, `src/components/survey/SurveyGuideModal.tsx`, `src/components/survey/SurveyContainer.tsx`, `src/app/(admin)/layout.tsx`, `tests/e2e/guide-module.test.ts`
- **Các bước thực hiện:**
  1. Xây dựng trang Cẩm nang Vận hành Hệ thống tại `/admin/guide` hỗ trợ chuyển đổi giữa 2 phân hệ đối tượng: Cán bộ Quản trị & Thẩm tra viên vs. Cán bộ Khảo sát Cấp xã.
  2. Tích hợp đầy đủ 5 chuyên đề nghiệp vụ quản trị: (1) Phân quyền 5 nhóm tài khoản; (2) Điều phối đợt & Tải 34 mã QR ZIP; (3) Thẩm tra phiếu nghi trùng trên workbench; (4) Khai thác 6 bảng tổng hợp & tính khoảng thiếu hụt Gap; (5) Thuật toán ẩn danh số liệu nhỏ <5 người & xuất file Excel 6 sheet.
  3. Xây dựng component `SurveyGuideModal` và nút "Hướng dẫn làm bài" trực tiếp trên Header bài khảo sát công khai `/khao-sat/[token]` giúp cán bộ cấp xã tra cứu tức thì 4 bước làm bài, các quy tắc nghiệp vụ quan trọng và câu hỏi thường gặp (FAQ) mà không mất dữ liệu form đang điền.
  4. Tích hợp chức năng in ấn / xuất PDF (`window.print()`) và tìm kiếm nhanh nội dung trong tài liệu hướng dẫn.
  5. Bổ sung mục "Hướng dẫn sử dụng" vào thanh điều hướng Admin Layout.
- **Acceptance Criteria:** Giao diện hướng dẫn trực quan, rõ ràng, phân loại đối tượng chính xác, hỗ trợ cán bộ cấp xã thao tác nhanh trên di động; 100% test cases đạt.
- **Test Cases:** Task 17 Guide Module Tests (PASS).
- **Trạng thái:** `COMPLETED` (Đã hoàn thành ngày 14/11/2026)
