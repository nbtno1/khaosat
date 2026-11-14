# CHANGELOG — LỊCH SỬ THAY ĐỔI HỆ THỐNG

Toàn bộ các thay đổi về đặc tả kỹ thuật, kiến trúc và mã nguồn của dự án được ghi nhận tại đây theo định dạng chuẩn [Keep a Changelog](https://keepachangelog.com/).

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
