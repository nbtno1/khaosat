# ARCHITECTURE DECISION RECORDS (ADR) — BẢN GHI CÁC QUYẾT ĐỊNH KIẾN TRÚC

## ADR-001: LỰA CHỌN KIẾN TRÚC FULLSTACK NEXT.JS 15 (APP ROUTER)
- **Bối cảnh:** Cần xây dựng nền tảng khảo sát hiện đại, vừa phục vụ hàng chục nghìn người truy cập công khai trên di động, vừa cung cấp cổng quản trị, phân tích báo cáo và xuất file phức tạp.
- **Quyết định:** Sử dụng Next.js 15 (App Router) với React 19 và TypeScript Strict Mode.
- **Lý do & Lợi ích:**
  - Hợp nhất Frontend và Backend trong cùng một repository (Monorepo tinh gọn), giảm chi phí bảo trì và độ trễ triển khai.
  - Tối ưu hóa SEO và tốc độ tải trang bằng Server-Side Rendering (SSR) và Server Components.
  - Route Handlers đóng vai trò REST API Gateway hiệu năng cao, dễ dàng tích hợp Middleware và bảo mật.
- **Phương án thay thế đã loại bỏ:** Tách riêng React SPA + Express.js backend (phức tạp hóa hạ tầng triển khai và quản lý CORS).
- **Trạng thái:** ĐÃ DUYỆT (APPROVED).

---

## ADR-002: SỬ DỤNG MONGODB CHO LƯU TRỮ BIỂU MẪU ĐỘNG
- **Bối cảnh:** Biểu mẫu khảo sát có cấu trúc phân tầng động phức tạp: người trả lời chọn số lượng nhóm công việc khác nhau (từ 1 đến 16 nhóm), mỗi nhóm lại chọn nhiều vai trò khác nhau, và mỗi vai trò có điểm tự đánh giá riêng.
- **Quyết định:** Sử dụng MongoDB 7.0+ kết hợp Mongoose ODM.
- **Lý do & Lợi ích:**
  - Cấu trúc BSON Document tự nhiên tương thích 100% với cấu trúc cây của bài khảo sát động, không cần thực hiện nhiều phép JOIN phức tạp như SQL truyền thống.
  - Dễ dàng snapshot trạng thái và số hiệu phiên bản bộ phiếu (`schemaVersion: "3.3"`) trên từng bản ghi.
  - Hỗ trợ Aggregation Framework cực mạnh để gom cụm và tính toán 6 bảng tổng hợp nhanh chóng.
- **Trạng thái:** ĐÃ DUYỆT (APPROVED).

---

## ADR-003: XÂY DỰNG 1 SURVEY ENGINE ĐỘNG DUY NHẤT THAY VÌ 15 FORM TĨNH
- **Bối cảnh:** Thư mục `docs/` chứa 15 file Word minh họa cho 15 vị trí việc làm.
- **Quyết định:** Xây dựng một Survey Engine động duy nhất, sử dụng dữ liệu cấu hình để render giao diện, thay vì code cứng 15 trang web khảo sát riêng biệt.
- **Lý do & Lợi ích:**
  - Phân tích nghiệp vụ cho thấy 15 file Word thực chất là các kịch bản lọc (Views) được sinh ra từ Bộ khung 14 câu hỏi chuẩn tại `Bo phieu huong dan tra loi.docx`.
  - Giúp hệ thống dễ bảo trì: khi cần chỉnh sửa câu chữ hoặc bổ sung nội dung đào tạo, chỉ cần cập nhật cấu hình Schema một lần duy nhất.
  - Hỗ trợ tối đa cho cán bộ kiêm nhiệm: cán bộ có thể linh hoạt bổ sung nhóm công việc được giao ngoài danh mục gợi ý của vị trí chính.
- **Trạng thái:** ĐÃ DUYỆT (APPROVED).

---

## ADR-004: THUẬT TOÁN STATISTICAL DISCLOSURE CONTROL (SUPPRESSION NGƯỠNG 5)
- **Bối cảnh:** Tài liệu Thuyết minh nghiệp vụ (Phần III Mục 6) bắt buộc bảo vệ dữ liệu nhóm nhỏ dưới 5 người khi công bố cho địa phương.
- **Quyết định:** Triển khai thuật toán kiểm soát tiết lộ thống kê gồm cả Primary Suppression, Row Suppression và Secondary Suppression.
- **Lý do & Lợi ích:**
  - Loại bỏ hoàn toàn khả năng các đối tượng khai thác lấy số liệu Tổng trừ đi các ô còn lại để suy đoán ra kết quả tự đánh giá của cán bộ tại các xã ít biên chế.
  - Đảm bảo tuân thủ nguyên tắc không xếp loại cá nhân và bảo vệ an toàn cho cán bộ tham gia trả lời trung thực.
- **Trạng thái:** ĐÃ DUYỆT (APPROVED).

---

## ADR-005: PHÁT HIỆN PHIẾU NGHI TRÙNG BẰNG 4-POINT BUSINESS HASH
- **Bối cảnh:** Cần phát hiện việc một người nộp phiếu nhiều lần mà không được thu thập bất kỳ thông tin định danh cá nhân nào (Họ tên, SĐT, Email).
- **Quyết định:** Sinh mã băm SHA-256 từ bộ 4 yếu tố: `CommuneCode + AgencyCode + PositionCode + 16_Workgroup_Statuses`.
- **Lý do & Lợi ích:**
  - Bảo đảm nguyên tắc Zero-PII tuyệt đối.
  - Độ chính xác cao: rất hiếm khi 2 cán bộ khác nhau trong cùng một cơ quan xã lại có cùng vị trí và có trạng thái phân công ở cả 16 nhóm công việc giống hệt nhau.
  - Không tự động xóa phiếu mà đưa vào danh sách cho chuyên viên rà soát thủ công, tránh mất mát dữ liệu hợp lệ.
- **Trạng thái:** ĐÃ DUYỆT (APPROVED).

---

## ADR-006: SỬ DỤNG EXCELJS CHO PIPELINE XUẤT BÁO CÁO ĐA SHEET
- **Bối cảnh:** Cần xuất file Excel tổng hợp gồm 6 sheet (B1 - B6) kèm sheet dữ liệu gốc với định dạng bảng biểu nghiêm ngặt, in đậm, gộp ô và bảo toàn font tiếng Việt.
- **Quyết định:** Sử dụng thư viện `ExcelJS`.
- **Lý do & Lợi ích:**
  - Hỗ trợ đầy đủ định dạng nâng cao: Cell Borders, Fills, Font Styles, Column Widths, Number Formats (tỷ lệ %).
  - Hỗ trợ cơ chế Streaming giúp tiết kiệm bộ nhớ khi xuất số lượng bản ghi lớn.
  - File tạo ra tương thích 100% với Microsoft Excel, Google Sheets và LibreOffice.
- **Trạng thái:** ĐÃ DUYỆT (APPROVED).

---

## ADR-007: BỔ SUNG CẤU TRÚC JSON IMPORT CHO 3.321 XÃ/PHƯỜNG
- **Bối cảnh:** Cần nạp toàn bộ danh mục 34 tỉnh và 3.321 đơn vị hành chính cấp xã sau sắp xếp 2025 vào MongoDB mà không phụ thuộc vào việc phải có sẵn file Excel ngay tại thời điểm khởi tạo dự án.
- **Quyết định:** Định nghĩa cấu trúc template JSON chuẩn hóa và xây dựng script import tự động `scripts/import-communes.ts`. Trong thời gian chuẩn bị dữ liệu, seed sẵn 34 tỉnh và các xã điểm phục vụ đợt trả lời thử (Pilot).
- **Trạng thái:** ĐÃ DUYỆT (APPROVED ngày 14/11/2026).

---

## ADR-008: XUẤT HÀNG LOẠT MÃ QR DẠNG GÓI NÉN (.ZIP)
- **Bối cảnh:** Mỗi tỉnh có một URL và mã QR riêng. Chuyên viên cần tải toàn bộ ảnh mã QR độ phân giải cao để đính kèm vào công văn gửi từng địa phương.
- **Quyết định:** Cung cấp endpoint API xuất file ZIP nén chứa 34 file ảnh PNG được đặt tên theo định dạng `QR_[MaTinh]_[TenTinh].png`.
- **Trạng thái:** ĐÃ DUYỆT (APPROVED ngày 14/11/2026).

---

## ADR-009: PHẠM VI ƯU TIÊN HOÀN THIỆN MVP (MILESTONES 1 ĐẾN 5)
- **Bối cảnh:** Cần bàn giao sớm hệ thống có khả năng vận hành thực tế đợt khảo sát và phân tích báo cáo cốt lõi.
- **Quyết định:** Ưu tiên dồn nguồn lực hoàn thành trọn vẹn Milestone 1 đến Milestone 5 (Cổng khảo sát di động, 16 nhóm việc, rà soát trùng, 6 bảng B1–B6, thuật toán ẩn danh dưới 5 người, xuất báo cáo Excel và 23 ca kiểm thử).
- **Trạng thái:** ĐÃ DUYỆT (APPROVED ngày 14/11/2026).

---

## ADR-010: KIẾN TRÚC CẨM NANG HƯỚNG DẪN SỬ DỤNG CẬP NHẬT ĐỘNG (DYNAMIC INTROSPECTION GUIDE ARCHITECTURE)
- **Bối cảnh:** Người dùng yêu cầu bổ sung chức năng Hướng dẫn sử dụng phần mềm, và yêu cầu cẩm nang hướng dẫn phải được cập nhật động theo các chức năng thực tế trên phần mềm và cấu hình dữ liệu thay vì văn bản tĩnh cứng.
- **Quyết định:** Xây dựng `SystemGuideService` kết hợp Dynamic Introspection + Schema Configuration + Admin In-App Notes:
  1. Tự động đọc dữ liệu cấu hình thời gian thực từ Database Models: `SurveySchemaConfig` (phiên bản, 16 nhóm việc, 4 vai trò, mô tả mức năng lực), `Campaign` (mã đợt, số tỉnh, chỉ tiêu), `PositionWorkgroupsMapping` (gợi ý nhóm việc theo vị trí), với cơ chế fallback local JSON khi khởi động.
  2. Bóc tách danh mục các phân hệ chức năng (Modules) đang trực tuyến trong phần mềm với phân quyền RBAC (`allowedRoles`), năng lực cốt lõi (`keyCapabilities`), quy tắc nghiệp vụ (`operationalRules`), và danh sách REST API (`apiEndpoints`).
  3. Cung cấp API `GET /api/public/guide` và model `SystemGuide` trong MongoDB cho phép quản trị viên (`TECHNICAL_ADMIN`, `CONTENT_ADMIN`) cập nhật và lưu trữ trực tiếp các ghi chú vận hành (`PATCH /api/admin/guide/sections/[key]`) mà không cần sửa code.
  4. Cung cấp giao diện tra cứu trực quan tại `/admin/guide` (hỗ trợ lọc module, tab đối tượng Quản trị / Cán bộ cấp xã, in PDF) và component `SurveyGuideModal` nhúng trực tiếp vào biểu mẫu khảo sát công khai `/khao-sat/[token]`.
- **Lý do & Lợi ích:**
  - Cẩm nang luôn phản ánh chính xác 100% hiện trạng phần mềm và dữ liệu khảo sát, tự động cập nhật khi cấu hình thay đổi mà không cần build lại ứng dụng.
  - Ban chỉ đạo có thể bổ sung hướng dẫn tác nghiệp nóng ngay trên giao diện web.
  - Bảo đảm tính đồng bộ cao nhất giữa đặc tả kỹ thuật, mã nguồn và cẩm nang người dùng.
- **Trạng thái:** ĐÃ DUYỆT (APPROVED ngày 14/11/2026).

---

## ADR-011: PHÂN HỆ CẤU HÌNH DANH MỤC ĐƠN VỊ HÀNH CHÍNH 2 CẤP (34 TỈNH & 3.321 XÃ/PHƯỜNG)
- **Bối cảnh:** Cần quản trị đầy đủ danh mục địa bàn hành chính 34 tỉnh/thành và 3.321 xã/phường hiệu lực năm 2026 sau sắp xếp đơn vị hành chính. Cần hỗ trợ tìm kiếm, lọc, sửa đổi tên/mã, bật/tắt trạng thái hoạt động, đồng bộ từ tệp dữ liệu chuẩn và xuất Excel báo cáo.
- **Quyết định:** Xây dựng `AdministrativeUnitsService` kết hợp RESTful APIs và giao diện Quản trị `/admin/administrative-units`. Chuẩn hóa mã tỉnh 2 chữ số và mã xã 5 chữ số duy nhất toàn quốc.
- **Trạng thái:** ĐÃ DUYỆT (APPROVED ngày 14/11/2026).

---

## ADR-012: QUẢN TRỊ BỘ CÂU HỎI VÀ NGÂN HÀNG CHUYÊN ĐỀ ĐÀO TẠO ĐỘNG (DYNAMIC SURVEY QUESTION & SCHEMA MANAGEMENT)
- **Bối cảnh:** Người dùng cần giao diện quản trị trực quan trên Admin Portal để toàn quyền quản trị các câu hỏi khảo sát, cho phép thay đổi:
  1. *Nội dung:* Tiêu đề câu hỏi, diễn giải hướng dẫn (Câu 1 đến Câu 14), tên nhóm công việc, tên chuyên đề đào tạo, định nghĩa và mô tả chi tiết mức năng lực theo 4 vai trò.
  2. *Số lượng:* Thêm/bớt nhóm công việc (vượt qua giới hạn cố định 16 nhóm), thêm/bớt chuyên đề đào tạo trong từng nhóm, thêm/bớt khó khăn, thêm/bớt hình thức đào tạo.
  3. *Cấu trúc:* Sắp xếp thứ tự hiển thị, số lượng chọn tối đa (`maxSelect`), quy tắc loại trừ/độc quyền (`isExclusive`), bật/tắt (kích hoạt) từng câu hỏi hoặc lựa chọn.
  4. *Quản lý phiên bản (FR-004):* Hỗ trợ nhân bản (Clone) phiên bản câu hỏi mới (ví dụ từ `3.3` sang `3.4`) để mọi thay đổi cấu trúc không làm sai lệch ý nghĩa các phiếu khảo sát cũ đã thu thập.
- **Quyết định:**
  1. **Mở rộng Model `SurveySchemaConfig`:** Bổ sung trường `title`, `description` và mảng `questions` cấu hình 14 câu hỏi chuẩn (hỗ trợ `id`, `order`, `section`, `title`, `instruction`, `isRequired`, `maxSelect`, `isExclusiveSupported`). Giữ nguyên tính tương thích ngược tuyệt đối với phiên bản 3.3 hiện hành.
  2. **Dịch vụ Quản trị Tập trung (`SurveyQuestionsAdminService`):** Đảm nhiệm các nghiệp vụ CRUD phiên bản, clone schema, cập nhật nhóm công việc, ngân hàng chuyên đề đào tạo, 4 vai trò & mô tả mức, danh mục khó khăn & hình thức học, và cấu hình từng câu hỏi.
  3. **Hệ thống API RESTful Quản trị (`/api/admin/questions/...`):** 8 Route Handlers bảo vệ bằng RBAC (`TECHNICAL_ADMIN`, `CONTENT_ADMIN`), xác thực đầu vào bằng Zod schema, có cơ chế ghi log kiểm toán.
  4. **Giao diện Quản trị Đa năng (`/admin/questions`):** Cung cấp 5 tabs chức năng chuyên nghiệp:
     - Tab 1: Cấu trúc & Hướng dẫn 14 Câu hỏi (Sửa tiêu đề, hướng dẫn, maxSelect).
     - Tab 2: Danh mục Nhóm Công việc (Thêm nhóm mới, sửa tên, mô tả, thứ tự, xóa).
     - Tab 3: Ngân hàng Chuyên đề Đào tạo (Thêm mới, sửa tiêu đề, xóa chuyên đề theo từng nhóm việc).
     - Tab 4: Vai trò & Thang Điểm Năng lực (Sửa tên vai trò và mô tả 4 mức năng lực).
     - Tab 5: Danh mục Khó khăn & Hình thức học (Thêm, sửa, xóa, cờ độc quyền).
  5. **Tích hợp Toàn diện:** Bổ sung menu "Quản trị Bộ Câu hỏi" vào thanh Sidebar Admin và đăng ký phân hệ thứ 8 vào Cẩm nang Vận hành Động.
- **Trạng thái:** ĐÃ DUYỆT (APPROVED ngày 16/11/2026).

---

## ADR-013: MÔ HÌNH PHÂN QUYỀN HAI LOẠI TÀI KHOẢN (CỤC CNTT VS ADMIN NGHIỆP VỤ) & HỆ THỐNG NHẬT KÝ HỆ THỐNG (AUDIT LOGGING ENGINE)
- **Bối cảnh:** Theo chỉ đạo mới của ban lãnh đạo:
  1. Hệ thống cần rà soát và cấu hình 2 loại tài khoản đăng nhập quản trị chính:
     - **Tài khoản Cục Công nghệ thông tin** (`TECHNICAL_ADMIN` - username: `cntt_admin`): Đại diện Cục CNTT - Kiểm toán nhà nước.
     - **Tài khoản Quản trị viên Hệ thống** (`SYSTEM_ADMIN` - username: `admin`): Phục vụ cán bộ quản trị vận hành nghiệp vụ khảo sát.
  2. **Quy tắc phân quyền:** Cả 2 loại tài khoản có quyền hạn quản trị nghiệp vụ ngang nhau (Dashboard, 14 câu hỏi, ĐVHC 34 tỉnh/3.321 xã, Đợt khảo sát & QR, Thẩm tra nghi trùng, Báo cáo 6 bảng, Cẩm nang vận hành). **Tuy nhiên, DUY NHẤT tài khoản Cục Công nghệ thông tin mới có thẩm quyền truy cập và kiểm tra Nhật ký Hệ thống (Audit Logs)**.
  3. Cần xây dựng phân hệ Nhật ký Hệ thống để ghi nhận toàn diện lịch sử đăng nhập/đăng xuất và các thao tác cập nhật, biến đổi dữ liệu nhạy cảm.
- **Quyết định:**
  1. **RBAC & Quyền `VIEW_AUDIT_LOGS`:** Bổ sung quyền `VIEW_AUDIT_LOGS` vào ma trận phân quyền, chỉ cấp duy nhất cho `TECHNICAL_ADMIN`. Thêm role `SYSTEM_ADMIN` với toàn bộ quyền quản trị nghiệp vụ.
  2. **Lưu vết Tự động (Zero-Impact Audit Logger):** Thiết kế `AuditLogService` và `logActionFromRequest` ghi nhận phi đồng bộ (non-blocking) vào collection `auditlogs` với đầy đủ ngữ cảnh: `username`, `userFullName`, `userRole`, `action`, `module`, `description`, `targetResource`, `targetId`, `details`, `ipAddress`, `userAgent`, `status` (`SUCCESS`, `FAILED`, `WARNING`), `createdAt`.
  3. **Chặn Đa Tầng (Defense-in-Depth):**
     - Ở cấp Server API: `GET /api/admin/audit-logs` kiểm tra nghiêm ngặt `session.role === "TECHNICAL_ADMIN"`. Nếu tài khoản khác (kể cả `admin`) cố ý truy cập, hệ thống tự động trả về `403 Forbidden` và lập tức ghi nhận 1 bản ghi cảnh báo an ninh (`UNAUTHORIZED_LOG_ACCESS`).
     - Ở cấp UI: Ẩn menu "Nhật ký Hệ thống" trên Sidebar đối với người dùng không phải Cục CNTT; nếu nhập trực tiếp URL `/admin/audit-logs`, hiển thị màn hình cảnh báo từ chối truy cập có kèm thông điệp giải thích chính sách bảo mật.
  4. **Giao diện Quản trị Nhật ký (`/admin/audit-logs`):** Tuân thủ tiêu chuẩn Full-Height & Zero-Page-Scroll, tích hợp 4 thẻ KPIs, bộ lọc đa chiều (phân hệ, trạng thái, tìm kiếm từ khóa), bảng cuộn độc lập với tiêu đề dính, modal xem chi tiết metadata JSON và chức năng xuất báo cáo CSV.
- **Trạng thái:** ĐÃ DUYỆT & TRIỂN KHAI HOÀN TẤT (APPROVED ngày 16/11/2026).

---

## ADR-014: KIẾN TRÚC GIAO DIỆN KHÔNG CUỘN TOÀN TRANG (ZERO-PAGE-SCROLL), TỐI GIẢN HÓA AUTH UX & CƠ CHẾ STREAMING RENDER NỘI DUNG TỪNG PHẦN (PROGRESSIVE RENDERING ENGINE)
- **Bối cảnh:**
  1. Giao diện Cổng Quản trị phát sinh thanh cuộn trên toàn bộ trang (page scroll) khiến trải nghiệm thao tác bị rời rạc, các thanh tác vụ và tiêu đề bị trôi khi cuộn xuống dưới.
  2. Giao diện trang Đăng nhập (`/login`) trước đó chứa khối 5 nút preset thử nghiệm chiếm nhiều diện tích, rườm rà và không phù hợp với chuẩn mực chuyên nghiệp của Kiểm toán nhà nước.
  3. Tiêu đề các trang Admin mang nhiều nhãn badge kỹ thuật (như `TIẾN ĐỘ THỜI GIAN THỰC — BỘ TIÊU CHUẨN 3.3`, `ADR-008`, `Phiên bản 3.3`) gây cảm giác chưa hoàn thiện.
  4. Khi chuyển tab trên các trang có dữ liệu đồ sộ (ví dụ 114 chuyên đề đào tạo, 16 nhóm việc, 6 bảng thống kê chi tiết), trình duyệt render đồng bộ hàng trăm phần tử DOM, SVG icons và input fields dẫn đến hiện tượng đóng băng / lag (độ trễ 200ms+).
- **Quyết định:**
  1. **Kiến trúc Full-Height & Zero-Page-Scroll:**
     - Thiết lập cấu trúc Layout bao bọc toàn bộ màn hình Admin với chiều cao cố định 100vh (`h-screen overflow-hidden`).
     - Mọi trang con cấu trúc theo mô hình: Header trang và Toolbar cố định (`shrink-0`), nội dung dài cuộn độc lập bên trong container con (`flex-1 min-h-0 overflow-y-auto`). Bảng dữ liệu trang bị tiêu đề dính (`sticky top-0 thead`).
     - Đảm bảo thuộc tính `window.scrollY === 0` tuyệt đối trên toàn bộ các route quản trị.
  2. **Tối giản hóa Trang Đăng nhập (`/login`):**
     - Thu gọn kích thước card đăng nhập (`max-w-[390px]`), huy hiệu và tiêu đề trang nghiêm chuẩn thương hiệu Kiểm toán nhà nước, loại bỏ hoàn toàn các khối nút preset cồng kềnh.
     - Bổ sung toggle hiển thị mật khẩu và dòng gợi ý một chạm kín đáo (`Gợi ý: Cục CNTT • Admin`) hỗ trợ kiểm thử tiện lợi mà không làm rối mắt.
  3. **Dọn dẹp Tiêu đề Trang (Title Header Cleanup):**
     - Loại bỏ toàn bộ các badge mang tính kỹ thuật / dev specs trên toàn bộ các trang Admin.
  4. **Cơ chế Progressive Item Rendering Engine (`useProgressiveItems`):**
     - Xây dựng custom hook `useProgressiveItems<T>(items, options)`: Render ngay lập tức lô đầu tiên (3-6 phần tử) trong frame đầu tiên (< 16ms), sau đó dùng `setTimeout(..., 16)` để nạp nối tiếp từng lô theo mỗi khung hình.
     - Bổ sung `resetKey: activeTab` để tự động làm mới bộ đếm hiển thị ngay khi người dùng bấm chuyển tab, biến thao tác chuyển tab từ đơ giật thành mượt mà tức thì.
- **Trạng thái:** ĐÃ DUYỆT & TRIỂN KHAI HOÀN TẤT (APPROVED ngày 16/11/2026).
