# CHANGELOG — LỊCH SỬ THAY ĐỔI HỆ THỐNG

Toàn bộ các thay đổi về đặc tả kỹ thuật, kiến trúc và mã nguồn của dự án được ghi nhận tại đây theo định dạng chuẩn [Keep a Changelog](https://keepachangelog.com/).

---

## [1.6.0-milestone-6] — 2026-11-14

### Đã hoàn thành (Milestone 6 — Dashboard Quản trị, RBAC & Theo dõi Tiến độ)
- **TASK-013 (Xác thực An toàn & Phân quyền RBAC 5 Nhóm Tài khoản):**
  - Xây dựng module xác thực an toàn `src/lib/auth.ts` sử dụng JWT HMAC SHA-256 lưu trong HTTP-Only Secure cookie kết hợp bcrypt password hashing.
  - Triển khai ma trận phân quyền `hasPermission` theo Spec 05, kiểm soát truy cập nghiêm ngặt đối với 5 vai trò: `TECHNICAL_ADMIN`, `CONTENT_ADMIN`, `REVIEWER`, `PROGRESS_MONITOR`, `LOCAL_COORDINATOR` (bảo vệ tuyệt đối Zero-PII, cấm địa phương xem dữ liệu thô và bảng nội bộ).
  - Xây dựng 3 endpoint API xác thực: `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`.
  - Thiết kế trang Đăng nhập `/login` chuẩn thương hiệu Kiểm toán nhà nước và Admin Layout `/admin` với thanh điều hướng động.
- **TASK-014 (Dashboard Tiến độ & Quản lý Đợt Khảo sát / 34 Mã QR):**
  - Xây dựng `ProgressMonitoringService` (`src/services/progress-monitoring.service.ts`) theo dõi chỉ số toàn quốc và 34 tỉnh.
  - Tích hợp biểu đồ Recharts diện tích tiến độ theo ngày (Daily Timeline AreaChart) và biểu đồ cột Top địa phương.
  - Xây dựng Dashboard Quản trị tại `/admin/dashboard` với 4 thẻ KPI và bảng 34 tỉnh chi tiết kèm tìm kiếm/lọc.
  - Xây dựng trang Quản lý Đợt Khảo sát & 34 Mã QR tại `/admin/campaigns` hiển thị thẻ QR trực quan cho từng tỉnh.
  - Xây dựng Route Handler `/api/admin/campaigns/qr-zip` tự động đóng gói file ZIP chứa đủ 34 mã QR PNG độ phân giải cao kèm file hướng dẫn sử dụng (ADR-008).
  - Viết 5/5 test groups PASS (`tests/services/auth-and-dashboard.test.ts`), bao phủ TC-13, TC-14, TC-22.

---

## [1.5.0-milestone-5] — 2026-11-14

### Đã hoàn thành (Milestone 5 — Thuật toán Ẩn danh Số liệu & Xuất Báo cáo ExcelJS)
- **TASK-011 (Statistical Disclosure Limitation Engine):**
  - Xây dựng `StatisticalDisclosureService` (`src/services/statistical-disclosure.service.ts`) theo đúng chuẩn Phần IV Tài liệu số 2 và Spec 11/Spec 12.
  - Triển khai Primary Suppression: chuyển đổi các ô có giá trị đếm $1 \le n < 5$ thành `"dưới 5 - không công bố"`, giữ nguyên $0$ và các giá trị $\ge 5$.
  - Triển khai Row Suppression: làm mờ toàn bộ dòng nếu mẫu số $N < 5$ (được áp dụng triệt để cho Bảng B2 và Bảng B3).
  - Triển khai Secondary Suppression: tự động tìm và làm mờ ô nhỏ nhất khác 0 kế tiếp khi trong một hàng/cột có Tổng chỉ có duy nhất 1 ô bị làm mờ sơ cấp, triệt tiêu hoàn toàn nguy cơ suy đoán danh tính.
  - Hỗ trợ phương thức `suppressAll` áp dụng đồng bộ cho cả 6 bảng B1 - B6.
- **TASK-012 (ExcelJS Multi-Sheet Export Service & API):**
  - Xây dựng `ExcelExportService` (`src/services/excel-export.service.ts`) tạo workbook 6 worksheet (`B1_NguoiTraLoi`, `B2_NhomCongViec`, `B3_KhoangThieuHut`, `B4_NoiDungCanHoc`, `B5_KhoKho`, `B6_HinhThucHoc`) chuẩn format kiểm toán nhà nước.
  - Áp dụng banner tiêu đề trang trọng (Navy `#1E3A8A`, chữ in hoa, in đậm, auto-fit cột, border xám, định dạng số nguyên `#,##0` và tỷ lệ `0.0%`).
  - Hỗ trợ 2 chế độ xuất: `INTERNAL` (số liệu thực tế đầy đủ) và `LOCAL_CONFIDENTIAL` (áp dụng toàn diện bộ quy tắc ẩn danh số liệu nhỏ < 5).
  - Xây dựng Route Handler `GET /api/admin/export/excel` stream trực tiếp binary file `.xlsx` về trình duyệt.
  - Tích hợp 2 nút xuất báo cáo 1-click (Bản Nội bộ và Bản Địa phương) trên giao diện Analytics Explorer.
  - Viết 5/5 test groups PASS (`tests/services/suppression-and-excel.test.ts`), bao phủ TC-19, TC-20, TC-21, TC-23.

---

## [1.4.0-milestone-4] — 2026-11-14

### Đã hoàn thành (Milestone 4 — Analytics Aggregation Engine & 6 Bảng Tổng hợp)
- **TASK-009 (Analytics Aggregation Service & Pipelines):**
  - Xây dựng `AnalyticsAggregationService` (`src/services/analytics-aggregation.service.ts`) tính toán trọn bộ 6 bảng B1 đến B6 theo đúng mẫu số và quy cách Phần IV Tài liệu số 2 và Spec 02/Spec 12.
  - Xây dựng `CapacityGapService` (`src/services/capacity-gap.service.ts`) nạp 64 mức chuẩn Benchmark Matrix, tính toán khoảng cách chênh lệch ($\Delta = \text{Req} - \text{Self}$) và phân bổ chi tiết mức thiếu hụt (thiếu 1 mức, 2 mức, 3 mức).
  - Viết 26/26 unit tests PASS (`tests/services/analytics-tables.test.ts`).
- **TASK-010 (Giao diện Analytics Tables Explorer):**
  - Xây dựng API Route Handler `GET /api/admin/analytics/tables` hỗ trợ lọc theo đợt, tỉnh, cơ quan.
  - Xây dựng giao diện `AnalyticsTablesViewer` tại `/admin/analytics` với 6 tab bảng biểu, hỗ trợ xem số liệu thực hoặc bật chế độ ẩn danh bảo vệ dữ liệu nhỏ (&lt;5 người).
  - Đảm bảo in đúng câu ghi chú bắt buộc dưới tiêu đề Bảng B3: *"khoảng thiếu hụt theo tự đánh giá - không đồng nhất với năng lực thực tế đã được kiểm chứng"*.

---

## [1.3.0-milestone-3] — 2026-11-14

### Đã hoàn thành (Milestone 3 — Kiểm soát Gửi đúp & Trung tâm Rà soát Nghi trùng)
- **TASK-007 (Duplicate Detection Service & APIs):**
  - Xây dựng `DuplicateDetectionService` (`src/services/duplicate-detection.service.ts`) gom nhóm phiếu nghi trùng theo `businessHash` SHA-256.
  - Xây dựng 3 endpoint API phục vụ thẩm tra:
    - `GET /api/admin/reviews/duplicates`: Truy vấn nhóm nghi trùng và chỉ số thống kê tổng quan.
    - `PATCH /api/admin/reviews/duplicates/[id]/decision`: Cập nhật trạng thái phiếu (`VALID` hoặc `EXCLUDED`) kèm lý do thẩm tra.
    - `POST /api/admin/reviews/duplicates/resolve-group`: Giải quyết nhanh cả nhóm (giữ phiếu nộp sau, loại các phiếu nộp trước).
  - Tích hợp ghi nhật ký hệ thống `AuditLog` lưu vết mọi quyết định thẩm tra.
  - Viết 8/8 unit & integration tests PASS (`tests/services/duplicate-detection.test.ts`), bao phủ AC-06 và AC-07.
- **TASK-008 (Giao diện Trung tâm Rà soát Nghi trùng - Workbench):**
  - Xây dựng giao diện `DuplicateReviewWorkbench` tại `/admin/reviews/duplicates`.
  - Hiển thị 4 thẻ chỉ số thời gian thực: Tổng nghi trùng, Đang chờ duyệt, Đã chấp nhận, Đã loại bỏ.
  - Cung cấp bộ lọc trạng thái và tìm kiếm nhanh theo địa bàn.
  - Cung cấp Accordion và Side-by-side Diff View so sánh song song giữa các phiếu trong cùng nhóm trùng (thời điểm nộp, phần III, phần IV).
  - Tích hợp nút xử lý nhanh 1-click và modal xác nhận loại trừ phiếu kèm nhập lý do.

---

## [1.2.0-milestone-2] — 2026-11-14

### Đã hoàn thành (Milestone 2 — Cổng Khảo sát & Dynamic Survey Engine - Cốt lõi MVP)
- **TASK-004 (Zod Validation Schemas & Business Hash):**
  - Xây dựng Zod schemas cho toàn bộ 4 phần của bài khảo sát (`src/lib/validations/survey.schema.ts`).
  - Viết 12/12 unit tests PASS (`tests/validations/survey.schema.test.ts`), xác minh TC-10 (kết thúc sớm ngoài đối tượng), TC-11 (khó khăn max 2 & lựa chọn độc quyền), TC-12 (mức độ cần học), TC-13 (hình thức học max 2).
  - Triển khai hàm băm nghiệp vụ 4 điểm `computeBusinessHash` (SHA-256) chuẩn ADR-005: `communeCode + agencyCode + positionCode + sorted16Statuses`.
- **TASK-005 (Public Route Handlers API):**
  - Xây dựng 4 Route Handlers: `/api/public/survey/validate-link/[token]`, `/schema/[version]`, `/position-mapping`, `/submit`.
  - Hỗ trợ fallback offline và pilot catalog khi chạy thử nghiệm hoặc trong giai đoạn chuyển đổi.
  - Viết 12/12 API integration tests PASS (`tests/api/public-survey.test.ts`).
- **TASK-006 (Giao diện Cổng Khảo sát 4 Bước - Mobile First):**
  - Xây dựng hook quản lý state form `useSurveyFormState` với cơ chế dọn dẹp state tự động khi bấm Quay lại (Rule 9).
  - Triển khai giao diện responsive chuẩn di động tại `/khao-sat/[token]` với Header tiến trình, huy hiệu thời gian ước tính, 16 thẻ nhóm công việc tự động xếp nhóm gợi ý theo vị trí lên trước (Rule 1).
  - Triển khai vòng lặp Part III động, render các mức tự đánh giá theo ngữ cảnh vai trò (Rule 4), chip chọn khó khăn max 2 & độc quyền (Rule 5 & 6, ẩn khi chưa có dịp), danh mục chuyên đề học riêng biệt của từng nhóm (Rule 3) và mức độ cần học (Rule 7).
  - Xử lý mượt mà luồng kết thúc sớm (Rule 8) khi người trả lời ngoài đối tượng.
  - Hoàn thiện Màn hình Nộp thành công trang trọng (`SurveySuccessModal`), khóa form chống gửi trùng.

---

## [1.1.0-milestone-1] — 2026-11-14

### Đã hoàn thành (Milestone 1 — Thiết lập Dự án & Database Schemas v3.3)
- **TASK-001 (Core Project Setup):**
  - Khởi tạo thành công dự án Next.js 15.0.3, React 19, TypeScript strict mode, Tailwind CSS v3.4.16.
  - Cài đặt đầy đủ các thư viện phụ thuộc: `mongoose`, `zod`, `react-hook-form`, `lucide-react`, `exceljs`, `adm-zip`, `qrcode`, `bcryptjs`, `recharts`, `tsx`.
  - Cấu hình Next.js App Router, layout, globals.css và utility `cn` helper.
  - Kiểm thử `npm run build` và `npm run typecheck` đạt 100%.
- **TASK-002 (MongoDB Connection & Mongoose Models):**
  - Xây dựng module kết nối MongoDB `src/lib/db.ts` hỗ trợ caching connection và connection pooling.
  - Xây dựng 8 Mongoose Models với schema và index chuẩn: `User`, `Campaign`, `SurveyLink`, `SurveySchemaConfig`, `BenchmarkMatrix`, `PositionWorkgroupsMapping`, `SurveyResponse`, `AuditLog`.
  - Tối ưu hóa các chỉ mục duy nhất (unique indexes), loại bỏ cảnh báo trùng lặp index.
- **TASK-003 (Seed Data & Migration Scripts):**
  - Trích xuất 16 nhóm công việc và 87 chuyên đề học từ tài liệu chuẩn vào `src/data/seed-schema-3.3.json`.
  - Trích xuất ma trận 64 mức yêu cầu benchmark từ Thuyết minh Phần II.B vào `src/data/seed-benchmark-matrix.json`.
  - Cấu hình 40 vị trí việc làm thuộc 11 cơ quan vào `src/data/seed-position-mappings.json`.
  - Xây dựng danh mục 34 tỉnh và template nạp 3.321 xã theo Quyết định ADR-007.
  - Viết `scripts/seed.ts` và `scripts/import-communes.ts`, tự động sinh mã QR Base64 cấp tỉnh và tạo tài khoản quản trị mặc định.

---

## [1.0.0-spec] — 2026-11-14

### Đã hoàn thành (Added)
- **Hoàn thành Giai đoạn 1 (Đọc và Phân tích Tài liệu):**
  - Đọc đệ quy và phân tích toàn diện 20 tài liệu DOCX trong thư mục `./docs/`.
  - Đối chiếu mã băm MD5 phát hiện file `Phieu số 09_Giam đốc_Phó GĐ Trung tâm (1).docx` trùng lặp 100% với file gốc `Phieu số 09_Giam đốc_Phó GĐ Trung tâm.docx`.
  - Phân tích chi tiết 4 Phần, 14 câu hỏi chuẩn của Bộ phiếu khảo sát phiên bản 3.3.
  - Phân tích 16 nhóm công việc (N01 - N16), 4 vai trò công tác, thang 4 mức tự đánh giá, 6 khó khăn và 5 hình thức học.
  - Trích xuất toàn bộ bảng ma trận 65 mức yêu cầu chuẩn (Benchmark Matrix) từ Thuyết minh nghiệp vụ.
  - Phân tích 12 quy tắc hiển thị và luồng logic rẽ nhánh động (Dynamic Branching & Early Exit).
  - Phân tích quy trình quản trị đợt khảo sát, quản lý liên kết/mã QR theo tỉnh, quy chế phân quyền 5 nhóm tài khoản.
  - Chuẩn hóa thuật toán kiểm soát tiết lộ thống kê (Statistical Disclosure Limitation) với ngưỡng dưới 5 người (Primary, Row & Secondary Suppression).
  - Chi tiết hóa quy cách và công thức toán học tính toán 6 Bảng tổng hợp (B1 đến B6).
  - Xác lập danh mục 23 Ca kiểm thử chuẩn (TC-01 đến TC-23) theo yêu cầu phối hợp giữa Trường và Cục Tin học.
- **Hoàn thành Giai đoạn 2 (Xây dựng Bộ Spec Hoàn chỉnh):**
  - Thiết lập Workspace Rule duy trì ngữ cảnh dài hạn: `.agents/rules/project.md`.
  - Thiết lập trọn bộ 22 tài liệu đặc tả kỹ thuật trong `./specs/`:
    - `00-PROJECT-OVERVIEW.md`
    - `01-DOCUMENT-INVENTORY.md`
    - `02-BUSINESS-REQUIREMENTS.md`
    - `03-FUNCTIONAL-REQUIREMENTS.md`
    - `04-NON-FUNCTIONAL-REQUIREMENTS.md`
    - `05-USER-ROLES-AND-USE-CASES.md`
    - `06-BUSINESS-WORKFLOWS.md`
    - `07-SYSTEM-ARCHITECTURE.md`
    - `08-DATABASE-DESIGN.md`
    - `09-API-SPECIFICATION.md`
    - `10-UI-UX-SPECIFICATION.md`
    - `11-SECURITY-SPECIFICATION.md`
    - `12-VALIDATION-AND-BUSINESS-RULES.md`
    - `13-TEST-STRATEGY.md`
    - `14-ACCEPTANCE-CRITERIA.md`
    - `15-DEVELOPMENT-ROADMAP.md`
    - `16-DEPLOYMENT-SPECIFICATION.md`
    - `REQUIREMENTS-TRACEABILITY.md`
    - `ASSUMPTIONS-AND-OPEN-QUESTIONS.md`
    - `DECISIONS.md`
    - `TASKS.md`
    - `PROGRESS.md`
    - `CHANGELOG.md`
- **Quyết định Tuân thủ:** Dừng toàn bộ hoạt động lập trình ứng dụng (`src/`) để chờ phê duyệt chính thức từ người dùng/lãnh đạo theo đúng nguyên tắc Spec-Driven Development (SDD).
