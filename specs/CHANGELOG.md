# CHANGELOG — LỊCH SỬ THAY ĐỔI HỆ THỐNG

Toàn bộ các thay đổi về đặc tả kỹ thuật, kiến trúc và mã nguồn của dự án được ghi nhận tại đây theo định dạng chuẩn [Keep a Changelog](https://keepachangelog.com/).

---

## [1.13.0] — 2026-11-16

### Tối Giản Hóa Auth UX, Dọn Dẹp Tiêu Đề Admin & Progressive Item Rendering Engine (ADR-014 & TASK-021)
- **TASK-021 (Tối giản hóa giao diện Đăng nhập, Dọn dẹp Title Tags và Cơ chế Progressive Tab Rendering):**
  - **Tối giản hóa Giao diện Đăng nhập (`src/app/(auth)/login/page.tsx`):**
    - Loại bỏ hoàn toàn khối 5 nút preset thử nghiệm chiếm diện tích lớn.
    - Chuyển sang form đăng nhập đơn giản, tinh tế (`max-w-[390px]`, full-height `overflow-hidden`), tuân thủ chuẩn nhận diện thương hiệu Kiểm toán nhà nước.
    - Trường Tên đăng nhập và Mật khẩu có nút bật/tắt hiển thị mật khẩu (`Eye`/`EyeOff`).
    - Dòng gợi ý đăng nhập một chạm kín đáo (`Gợi ý: Cục CNTT • Admin`) hỗ trợ kiểm thử nhanh mà không gây rối giao diện.
    - Đảm bảo Zero-Page-Scroll: màn hình cố định trong khung nhìn 100vh (`window.scrollY === 0`).
  - **Dọn dẹp Toàn bộ Badge / Tag Kỹ thuật trên Tiêu đề trang Admin:**
    - Lược bỏ các nhãn kỹ thuật (như `TIẾN ĐỘ THỜI GIAN THỰC — BỘ TIÊU CHUẨN 3.3`, `ADR-008`, `Phiên bản 3.3`, `Đặc quyền Cục CNTT`...) trên các trang Quản trị:
      - `src/app/(admin)/admin/dashboard/page.tsx`: Tiêu đề rút gọn “Tổng quan Khảo sát Nhu cầu Đào tạo Cấp Xã/Phường”.
      - `src/app/(admin)/admin/campaigns/page.tsx`: Tiêu đề thanh nhã, không còn badge kỹ thuật.
      - `src/app/(admin)/admin/administrative-units/page.tsx`: Tiêu đề tinh gọn.
      - `src/components/admin/DuplicateReviewWorkbench.tsx`: Tiêu đề chuẩn hóa “Rà soát Phiếu Nghi trùng”.
      - `src/components/admin/AnalyticsTablesViewer.tsx`: Tiêu đề chuẩn hóa “6 Bảng Tổng hợp Kết quả Khảo sát”.
      - `src/app/(admin)/admin/guide/page.tsx`: Bỏ badge kỹ thuật.
      - `src/app/(admin)/admin/audit-logs/page.tsx`: Header chuyên nghiệp, tinh giản.
  - **Cơ chế Progressive Item Rendering Engine (`src/hooks/useProgressiveItems.ts`):**
    - Xây dựng custom hook `useProgressiveItems<T>(items, options)`: Tự động chia nhỏ mảng dữ liệu, render ngay lập tức 3-6 item ban đầu trong frame đầu tiên (< 16ms), sau đó nạp nối tiếp các item còn lại trên từng tick kế tiếp.
    - Hỗ trợ `resetKey: activeTab` giúp tự động reset số lượng hiển thị mỗi khi chuyển tab.
    - Tích hợp thành công tại 3 phân hệ nặng:
      - `src/app/(admin)/admin/questions/page.tsx`: Chuyển tab giữa 14 Câu hỏi, 16 Nhóm việc, 114 Chuyên đề, 4 Ngạch/Chức danh, Danh mục Khó khăn mượt mà tức thì không đơ trình duyệt.
      - `src/components/admin/AnalyticsTablesViewer.tsx`: Chuyển giữa các bảng B1-B6 không giật lag.
      - `src/app/(admin)/admin/administrative-units/page.tsx`: Tải mượt danh mục 34 tỉnh.
  - **Đồng bộ Hướng dẫn Agent & Hỗ trợ Đa Nền tảng (Cross-Device Readiness):**
    - Chuyển đổi toàn bộ liên kết nội bộ trong `AGENTS.md`, `.agents/rules/project.md`, `.agents/skills/resume-project/SKILL.md`, `.agents/workflows/resume-project.md` sang đường dẫn tương đối độc lập nền tảng (loại bỏ tuyệt đối đường dẫn tuyệt đối máy cũ `file:///Users/macbook/...`).
    - Bổ sung Mục 5 trong `AGENTS.md` hướng dẫn chi tiết quy trình clone, cài đặt, cấu hình `.env`, chạy `db:seed`, khởi động dev server, thông tin đăng nhập 2 tài khoản Dual-Admin và các lệnh kiểm thử trên thiết bị mới.
    - Cập nhật `.gitignore` loại trừ `.env` và bảo lưu `.env.example`.

---

## [1.12.0] — 2026-11-16

### Phân hệ Nhật ký Hệ thống (Audit Logs), Phân quyền Dual-Admin & Chuẩn hóa Full-Height Zero-Page-Scroll (ADR-013 & TASK-020)
- **TASK-020 (Rà soát Cơ chế Phân quyền, Xây dựng Hệ thống Nhật ký & Giao diện Quản trị Log):**
  - **Mô hình Phân quyền Dual-Admin Chuẩn hóa:**
    - Cấu hình 2 loại tài khoản quản trị trọng tâm:
      1. **Tài khoản Cục Công nghệ thông tin** (`TECHNICAL_ADMIN` - username: `cntt_admin`, mật khẩu: `Admin@123456`): Đại diện Cục CNTT - Kiểm toán nhà nước, nắm toàn bộ quyền quản trị nghiệp vụ và sở hữu **đặc quyền duy nhất xem và kiểm tra Nhật ký Hệ thống**.
      2. **Tài khoản Quản trị viên Hệ thống** (`SYSTEM_ADMIN` - username: `admin`, mật khẩu: `Admin@123456`): Phục vụ quản trị vận hành khảo sát, có toàn bộ quyền quản trị nghiệp vụ (Dashboard, 14 câu hỏi, ĐVHC 34 tỉnh/3.321 xã, Đợt khảo sát & QR, Thẩm tra nghi trùng, Báo cáo 6 bảng, Cẩm nang), nhưng **hoàn toàn không có quyền xem Nhật ký hệ thống**.
    - Bổ sung quyền `VIEW_AUDIT_LOGS` chỉ cấp riêng cho `TECHNICAL_ADMIN`.
    - Cập nhật trang đăng nhập (`/login`) với 2 nút preset trực quan cho phép 1-click chuyển đổi giữa 2 vai trò kiểm thử.
  - **Công cụ Ghi nhận Nhật ký Tự động (Zero-Impact Audit Logger):**
    - Thiết kế Mongoose model `AuditLog` (`src/models/AuditLog.ts`) với đầy đủ các trường: `userId`, `username`, `userFullName`, `userRole`, `organization`, `action`, `module`, `description`, `targetResource`, `targetId`, `details`, `ipAddress`, `userAgent`, `status` (`SUCCESS`, `FAILED`, `WARNING`), `createdAt` và các compound index tối ưu hóa truy vấn.
    - Xây dựng `AuditLogService` (`src/services/audit-log.service.ts`): Ghi log phi đồng bộ (an toàn tuyệt đối, không gây ảnh hưởng luồng chính), truy vấn lọc phân trang đa tiêu chí, tính toán 5 chỉ số thống kê (Tổng log, Đăng nhập hôm nay, Thao tác thay đổi, Số lỗi, Tỷ lệ thành công).
    - Helper `logActionFromRequest` (`src/lib/audit-logger.ts`): Tự động trích xuất IP client, User-Agent, danh tính session.
    - Tích hợp ghi log trên toàn bộ các endpoint trọng yếu: Đăng nhập/Đăng xuất (`AUTH`), Cập nhật/Nhân bản câu hỏi (`QUESTIONS`), Thay đổi/Đồng bộ ĐVHC (`ADMIN_UNITS`), Thẩm tra/Giải quyết nghi trùng (`DUPLICATES`), Xuất Excel 6 bảng (`ANALYTICS`), Tải gói 34 QR ZIP (`CAMPAIGN`), Cố ý truy cập trái quyền (`SYSTEM/UNAUTHORIZED_LOG_ACCESS`).
  - **Bảo mật Đa tầng & Endpoint API Nhật ký (`/api/admin/audit-logs`):**
    - `GET /api/admin/audit-logs`: Xác thực phiên làm việc; nếu `session.role !== "TECHNICAL_ADMIN"`, trả về ngay `403 Forbidden` đồng thời tự động ghi 1 bản ghi cảnh báo an ninh (`WARNING`).
    - `POST /api/admin/audit-logs`: Cho phép ghi nhận sự kiện client an toàn.
  - **Giao diện Quản trị Nhật ký Hệ thống (`/admin/audit-logs`):**
    - Thiết kế tuân thủ tiêu chuẩn Full-Height & Zero-Page-Scroll (`window.scrollY === 0`).
    - 4 Thẻ KPIs thống kê hoạt động hệ thống.
    - Thanh công cụ tìm kiếm và lọc đa chiều theo Phân hệ và Trạng thái.
    - Bảng nhật ký cuộn độc lập với thanh tiêu đề dính (`sticky thead`), mã màu phân hệ và trạng thái trực quan.
    - Modal tra cứu chi tiết bản ghi kèm định dạng payload metadata JSON.
    - Chức năng xuất toàn bộ danh sách log ra file CSV chuẩn UTF-8.
    - Màn hình từ chối truy cập (Access Denied) thân thiện nếu tài khoản không có quyền truy cập trực tiếp URL.
  - **Chuẩn hóa Giao diện Toàn bộ Cổng Quản trị (Full-Height Zero-Page-Scroll):**
    - Cấu trúc lại `src/app/(admin)/layout.tsx` với `<main className="flex-1 min-h-0 h-full w-full overflow-hidden flex flex-col">`.
    - Cập nhật toàn bộ các trang Admin (`/admin/dashboard`, `/admin/campaigns`, `/admin/reviews/duplicates`, `/admin/analytics`, `/admin/administrative-units`, `/admin/questions`, `/admin/guide`): Header và công cụ cố định (`shrink-0`), vùng dữ liệu cuộn nội bộ (`flex-1 min-h-0 overflow-y-auto`), không phát sinh thanh cuộn trên toàn trang (`page scroll`).

---

## [1.11.0] — 2026-11-16

### Phân hệ Quản trị Bộ Câu hỏi & Ngân hàng Chuyên đề Đào tạo Động (ADR-012 & TASK-019)
- **TASK-019 (Xây dựng Dịch vụ & Giao diện Quản trị Bộ Câu hỏi Khảo sát Động):**
  - Mở rộng model `SurveySchemaConfig` (`src/models/SurveySchemaConfig.ts`) với các trường `title`, `description` và mảng `questions` cấu hình 14 câu hỏi chuẩn (hỗ trợ `id`, `order`, `section`, `title`, `description`, `instruction`, `isRequired`, `maxSelect`, `isExclusiveSupported`), tương thích ngược 100% với phiên bản 3.3.
  - Xây dựng bộ Zod Schema (`src/lib/validations/survey-schema-admin.schema.ts`) kiểm tra nghiêm ngặt tính hợp lệ của câu hỏi, nhóm việc, chuyên đề học, vai trò và phiên bản mới.
  - Xây dựng dịch vụ `SurveyQuestionsAdminService` (`src/services/survey-questions-admin.service.ts`):
    - Quản lý phiên bản (Versioning): Xem tổng quan các phiên bản, nhân bản (clone) phiên bản mới (v3.4, v4.0) bảo vệ tính toàn vẹn dữ liệu cũ theo đặc tả FR-004.
    - Quản trị 14 câu hỏi: Cập nhật tiêu đề, hướng dẫn trả lời, ràng buộc bắt buộc, số lượng chọn tối đa.
    - Quản trị Nhóm công việc: Thêm mới nhóm việc (vượt qua giới hạn 16 nhóm), chỉnh sửa tiêu đề, mô tả, sắp xếp thứ tự và xóa nhóm.
    - Quản trị Chuyên đề đào tạo: Thêm mới, chỉnh sửa, phân loại chuyên đề con thuộc từng nhóm công việc.
    - Quản trị 4 Vai trò & Thang Điểm: Điều chỉnh định nghĩa vai trò và diễn giải chi tiết 4 mức tự đánh giá năng lực.
    - Quản trị Danh mục Khó khăn & Hình thức học: Tùy biến danh mục nguyên nhân (Câu 10) và phương thức đào tạo (Câu 13).
  - Xây dựng 8 RESTful API Route Handlers có bảo vệ RBAC:
    - `GET`, `POST /api/admin/questions/versions`
    - `GET`, `PUT /api/admin/questions/schema/[version]`
    - `POST`, `PUT`, `DELETE /api/admin/questions/schema/[version]/workgroups`
    - `POST`, `PUT`, `DELETE /api/admin/questions/schema/[version]/workgroups/[id]/topics`
    - `PUT /api/admin/questions/schema/[version]/roles`
    - `PUT /api/admin/questions/schema/[version]/difficulties`
    - `PUT /api/admin/questions/schema/[version]/learning-formats`
    - `PUT /api/admin/questions/schema/[version]/sections`
  - Xây dựng Giao diện Quản trị Đa năng tại `/admin/questions`:
    - Header điều khiển: Chọn phiên bản, hiển thị trạng thái duyệt, nút Tạo bản mới (Clone), nút Lưu thay đổi và nút Xem trước biểu mẫu.
    - 5 Tabs chức năng: 14 Câu hỏi & Hướng dẫn, Danh mục Nhóm Công việc, Ngân hàng Chuyên đề Đào tạo, 4 Vai trò & Thang Năng lực, Khó khăn & Hình thức học.
  - Bổ sung menu "Quản trị Bộ Câu hỏi" vào Sidebar Admin (`src/app/(admin)/layout.tsx`) và đăng ký phân hệ thứ 8 vào Cẩm nang Vận hành Động (`src/services/system-guide.service.ts`).
  - Viết bộ test tự động `tests/services/survey-questions-admin.test.ts` đạt 5/5 tests PASS (100%), biên dịch Next.js 32/32 routes thành công 100%.

---

## [1.10.0] — 2026-11-14

### Phân hệ Cấu hình Danh mục Đơn vị Hành chính (Administrative Units Management - 34 Tỉnh & 3.321 Xã/Phường & ADR-011)
- **TASK-018 (Xây dựng Dịch vụ & Giao diện Cấu hình Danh mục Đơn vị Hành chính 2 cấp):**
  - Xây dựng dịch vụ `AdministrativeUnitsService` (`src/services/administrative-units.service.ts`) quản trị toàn diện danh mục 34 tỉnh/thành phố và 3.321 xã/phường/đặc khu (709 Phường, 2.599 Xã, 13 Đặc khu) hiệu lực năm 2026.
  - Cung cấp các thao tác thống kê tổng quan, tìm kiếm, lọc theo loại, lọc theo trạng thái hoạt động; hỗ trợ thêm mới, chỉnh sửa, xóa/tạm dừng tỉnh/xã, tự động tính lại số lượng xã của tỉnh liên quan; cơ chế đồng bộ hóa 1-click từ dữ liệu gốc chuẩn CC BY 4.0 (`real-provinces.json` và `real-communes.json`); tích hợp bộ nhớ đệm offline fallback an toàn khi MongoDB chưa khởi chạy.
  - Xây dựng bộ Zod Schemas (`src/lib/validations/administrative-units.schema.ts`) chuẩn hóa và kiểm tra nghiêm ngặt: mã tỉnh gồm đúng 2 chữ số (giữ số 0 đầu), mã xã gồm đúng 5 chữ số duy nhất toàn quốc.
  - Xây dựng 7 Route Handlers API Quản trị:
    - `GET /api/admin/administrative-units/stats`: Báo cáo thống kê tổng quan 34 tỉnh và 3.321 xã/phường/đặc khu.
    - `GET /api/admin/administrative-units/provinces`: Tìm kiếm, lọc và phân loại danh sách tỉnh.
    - `POST /api/admin/administrative-units/provinces`: Thêm mới hoặc hiệu chỉnh tỉnh/thành (kiểm tra phân quyền RBAC `TECHNICAL_ADMIN`, `CONTENT_ADMIN`).
    - `PATCH /api/admin/administrative-units/provinces/[code]/status`: Bật/tắt trạng thái hoạt động của tỉnh.
    - `GET /api/admin/administrative-units/communes`: Lọc xã theo tỉnh, tìm kiếm từ khóa, phân loại và phân trang.
    - `POST /api/admin/administrative-units/communes`: Thêm mới hoặc hiệu chỉnh xã/phường (kiểm tra phân quyền RBAC).
    - `DELETE /api/admin/administrative-units/communes/[code]`: Xóa xã/phường (kiểm tra phân quyền RBAC).
    - `PATCH /api/admin/administrative-units/communes/[code]`: Bật/tắt trạng thái hoạt động của xã.
    - `POST /api/admin/administrative-units/sync`: Kích hoạt đồng bộ hóa danh mục gốc vào MongoDB.
    - `GET /api/admin/administrative-units/export`: Xuất dữ liệu danh mục ra file Excel `.xlsx` gồm 2 sheet chuyên nghiệp định dạng kiểm toán.
  - Xây dựng Giao diện Quản trị Cấu hình ĐVHC tại `/admin/administrative-units`:
    - 4 Thẻ chỉ số tổng quan (34 tỉnh, 3.321 xã, cơ cấu phân loại, căn cứ pháp lý hiệu lực 2026).
    - Thanh tác vụ: Đồng bộ nguồn, Xuất Excel, Thêm tỉnh, Thêm xã.
    - Bảng Tab 1: Danh mục 34 Tỉnh / Thành phố kèm nút xem nhanh danh sách xã theo tỉnh.
    - Bảng Tab 2: Danh mục Xã / Phường / Đặc khu với bộ lọc tỉnh, từ khóa, loại hình và phân trang.
    - Modals thêm/sửa Tỉnh và Xã/phường với đầy đủ xác thực client & server.
  - Cập nhật Sidebar Admin Layout bổ sung mục "Danh mục Tỉnh, Xã/Phường" (`/admin/administrative-units`).
  - Đăng ký tự động vào Phân hệ Hướng dẫn Sử dụng Động `SystemGuideService` như module chức năng thứ 7.
  - Viết bộ kiểm thử tự động `tests/services/administrative-units.test.ts` đạt **5/5 tests PASS (100%)**.

---

## [1.9.0] — 2026-11-14

### Dữ liệu Hành chính Thực tế (Real Administrative Units — 34 Tỉnh & 3.321 Xã/Phường)
- **Tích hợp Bộ dữ liệu Hành chính Thực tế:**
  - Nạp và xác thực toàn bộ dữ liệu đơn vị hành chính chính thức từ `tinh.json` và `xa.json`: đúng **34 Tỉnh/Thành phố** và đúng **3.321 Xã/Phường/Thị trấn** theo quy định của Kiểm toán nhà nước và Cục Tin học.
  - Xây dựng 2 Model Mongoose mới: `Province` (`src/models/Province.ts`) và `Commune` (`src/models/Commune.ts`) lưu trữ đầy đủ mã bưu chính, diện tích, quy mô dân số, số hiệu nghị quyết sáp nhập.
  - Xây dựng công cụ import tự động siêu tốc `scripts/import-dvhc.ts` (`npm run db:import-dvhc`) sử dụng `bulkWrite` và đồng bộ mã QR, liên kết khảo sát cho toàn bộ 34 tỉnh.
  - Nâng cấp API `GET /api/public/survey/validate-link/[token]` tự động lọc và nạp chính xác danh sách xã/phường thực tế của từng tỉnh (hỗ trợ cả kết nối Database trực tiếp lẫn chế độ Offline fallback).
  - Đồng bộ dữ liệu gốc vào `src/data/real-provinces.json` và `src/data/real-communes.json`.

---

## [1.8.1] — 2026-11-14

### Tinh chỉnh Giao diện (UI Refinement - Vertical Sidebar, Logo Slot & Select Beautification)
- **Làm đẹp toàn diện các thẻ Dropdown Select (Select Beautification):**
  - Xây dựng component chuẩn hóa `Select` (`src/components/common/Select.tsx`) hiện đại hóa toàn bộ dropdowns: loại bỏ mũi tên thô mặc định của hệ điều hành (`appearance-none`), bổ sung `ChevronDown` mượt mà, tích hợp Icon ngữ cảnh bên trái (MapPin, Landmark, Briefcase, Filter), bo góc mềm mại, đổ bóng nhẹ và hiệu ứng focus ring êm ái.
  - Nâng cấp toàn diện các trường chọn tại Cổng khảo sát cấp xã (`src/components/survey/StepGeneralInfo.tsx`) cho: Xã/Phường, Cơ quan, Vị trí việc làm.
  - Nâng cấp Dropdown bộ lọc trạng thái tiến độ trên Dashboard Quản trị (`src/app/(admin)/admin/dashboard/page.tsx`).
  - Bổ sung Dropdown chọn 34 Tỉnh/Thành phố trên thanh công cụ Phân tích 6 Bảng (`src/components/admin/AnalyticsTablesViewer.tsx`).
- **Chuyển đổi Header Quản trị sang dạng Sidebar Dọc (Vertical Admin Sidebar):**
  - Chuyển toàn bộ thanh điều hướng ngang trên cùng của Cổng quản trị (`src/app/(admin)/layout.tsx`) thành thanh Sidebar dọc cố định bên trái (`w-64 xl:w-72`), tối ưu hóa không gian làm việc cho các bảng dữ liệu và biểu đồ phân tích.
  - Tích hợp Logo Kiểm toán nhà nước, danh mục 5 chức năng dạng danh sách dọc kèm icon và mô tả phụ, đường dẫn nhanh mở form khảo sát, thẻ thông tin cán bộ đăng nhập và nút đăng xuất.
  - Hỗ trợ giao diện Responsive trên thiết bị di động thông qua thanh Topbar nhỏ gọn và Menu ngăn kéo (Drawer) trượt ngang.
- **Chuẩn hóa Header & Tạo vị trí chèn Logo:**
  - Bỏ hiển thị số hiệu phiên bản trên Header bài khảo sát di động (`/khao-sat/[token]`) và Header Quản trị (`/admin`).
  - Xây dựng component dùng chung `AppLogo` (`src/components/common/AppLogo.tsx`) tạo khung chứa logo chuẩn mực, tự động nạp file `public/logo.png` hoặc `public/logo.svg` kèm cơ chế fallback biểu trưng vector Kiểm toán nhà nước.
  - Bổ sung trang gốc chuyển hướng `/admin` tự động redirect sang `/admin/dashboard`.

---

## [1.8.0-milestone-8] — 2026-11-14

### Đã hoàn thành (Phân hệ Hướng dẫn Sử dụng Cập nhật Động - Dynamic User Guide Module & ADR-010)
- **TASK-017 (Xây dựng Cẩm nang Vận hành Động & Hướng dẫn Sử dụng Tự động Cập nhật theo Phần mềm):**
  - Xây dựng dịch vụ `SystemGuideService` (`src/services/system-guide.service.ts`) tự động bóc tách cấu hình thời gian thực từ cơ sở dữ liệu (`SurveySchemaConfig`, `Campaign`, `PositionWorkgroupsMapping`) và đăng ký động 6 modules phần mềm trực tuyến (Cổng khảo sát di động, Dashboard tiến độ, Quản lý QR 34 tỉnh, Thẩm tra phiếu trùng, 6 bảng tổng hợp B1-B6, Pipeline xuất Excel) kèm vai trò RBAC, năng lực cốt lõi, quy tắc nghiệp vụ và API endpoints.
  - Xây dựng model Mongoose `SystemGuide` (`src/models/SystemGuide.ts`) lưu trữ các ghi chú bổ sung của Ban chỉ đạo và trạng thái cẩm nang.
  - Xây dựng API Public `GET /api/public/guide` phân phối dữ liệu cẩm nang đồng bộ thời gian thực cho cả client và máy trạm.
  - Xây dựng API Admin `PATCH /api/admin/guide/sections/[key]` có bảo vệ RBAC (`TECHNICAL_ADMIN`, `CONTENT_ADMIN`) cho phép chỉnh sửa và lưu trực tiếp ghi chú tác nghiệp vào MongoDB ngay trên giao diện web.
  - Thiết kế trang Cẩm nang Vận hành Động tại `/admin/guide`: Banner trạng thái cơ sở dữ liệu thời gian thực (phiên bản schema, số nhóm việc, số vai trò, đợt khảo sát, chỉ tiêu, số modules online), tabs module chức năng động, bộ lọc tìm kiếm, dynamic schema explorer, editor ghi chú trực tuyến và in PDF.
  - Xây dựng component `SurveyGuideModal` và nút "Hướng dẫn làm bài" trực tiếp trên Header bài khảo sát công khai `/khao-sat/[token]` giúp cán bộ cấp xã xem nhanh 4 bước thực hiện, các lưu ý nghiệp vụ cốt lõi và chính sách Zero-PII.
  - Bổ sung mục "Hướng dẫn sử dụng" vào thanh điều hướng Admin Layout cho toàn bộ các vai trò người dùng.
  - Viết bộ kiểm thử tự động `tests/e2e/guide-module.test.ts` đạt 5/5 groups PASS (100%).
  - Biên dịch sản phẩm Next.js 15 đạt 23/23 routes thành công 100%.

---

## [1.7.0-milestone-7] — 2026-11-14

### Đã hoàn thành (Milestone 7 — 23 Ca kiểm thử E2E & Triển khai Production Go-Live)
- **TASK-015 (Bộ Test Tự động Nghiệp vụ 23 Ca kiểm thử TC-01 đến TC-23):**
  - Xây dựng file test tự động `tests/e2e/23-official-test-cases.test.ts` kiểm thử toàn diện toàn bộ 23 kịch bản theo yêu cầu của Kiểm toán nhà nước và Cục Tin học.
  - Bao phủ 100%: Luồng kết thúc sớm (TC-01), Kiêm nhiệm nhiều nhóm (TC-02), Nhiều vai trò (TC-03), Chưa có dịp (TC-04), Chỉ phối hợp (TC-05), Dọn dẹp state khi back (TC-06, TC-07, TC-08, TC-09), Ràng buộc khó khăn max 2 & độc quyền (TC-10, TC-11), Mức độ cần học (TC-12), Sắp xếp gợi ý theo vị trí (TC-13), Chống nộp đúp (TC-14), Băm 4 điểm nghi trùng (TC-15), Thẩm tra loại trừ (TC-16), Tính khoảng thiếu hụt Gap (TC-17), Ô không có chuẩn (TC-18), Primary suppression (TC-19), Row suppression (TC-20), Secondary suppression (TC-21), Phân quyền RBAC địa phương (TC-22), Xuất Excel đa sheet (TC-23).
  - Kết quả kiểm thử: **23/23 ca kiểm thử đạt 100% tiêu chí nghiệm thu**.
- **TASK-016 (Đóng gói Docker, Docker Compose, Healthcheck & Production Go-Live):**
  - Xây dựng Multi-stage `Dockerfile` tối ưu hóa kích thước image với Node 20 Alpine, Non-root user `nextjs`, Next.js 15 Standalone output.
  - Xây dựng `docker-compose.yml` tích hợp MongoDB 7.0 container với healthcheck ping và persistent storage.
  - Xây dựng Route Handler `GET /api/health` giám sát trạng thái DB, uptime, bộ nhớ RAM, phiên bản ứng dụng và ma trận schema 3.3.
  - Xây dựng kịch bản sao lưu tự động `scripts/backup.sh` (dump, nén tar.gz, tự dọn bản cũ sau 30 ngày).
  - Biên dịch toàn bộ ứng dụng bằng `npm run build` thành công 100% với 21 routes.

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
