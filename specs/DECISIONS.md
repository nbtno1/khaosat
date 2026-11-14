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

