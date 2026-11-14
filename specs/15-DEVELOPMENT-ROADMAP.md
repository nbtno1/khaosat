# 15. DEVELOPMENT ROADMAP — LỘ TRÌNH PHÁT TRIỂN HỆ THỐNG

Lộ trình phát triển được phân chia thành 7 Milestone (tương ứng 7 Sprint) theo thứ tự phụ thuộc kỹ thuật chặt chẽ. Mỗi giai đoạn đều tạo ra sản phẩm chạy được và có thể kiểm thử độc lập.

---

## 1. TỔNG QUAN CÁC MILESTONES VÀ TIẾN ĐỘ DỰ KIẾN

```mermaid
gantt
    title Lộ trình Phát triển Hệ thống Khảo sát (khaosat)
    dateFormat  YYYY-MM-DD
    section Giai đoạn Khởi tạo
    M1: Cấu trúc Dự án & Database Schemas          :m1, 2026-11-15, 4d
    section Phân hệ Khảo sát (MVP)
    M2: Cổng Khảo sát & Dynamic Survey Engine    :m2, after m1, 6d
    M3: Chống gửi đúp & Rà soát Nghi trùng         :m3, after m2, 4d
    section Phân hệ Thống kê & Báo cáo
    M4: Analytics Engine & 6 Bảng Tổng hợp (B1-B6) :m4, after m3, 6d
    M5: Thuật toán Suppression & Xuất ExcelJS       :m5, after m4, 4d
    section Quản trị & Hoàn thiện
    M6: Admin Dashboard, RBAC & Giám sát tiến độ   :m6, after m5, 5d
    M7: 23 Ca kiểm thử E2E & Chạy thử nghiệm Pilot :m7, after m6, 5d
```

---

## 2. CHI TIẾT TỪNG MILESTONE

### MILESTONE 1: THIẾT LẬP DỰ ÁN & MÔ HÌNH DỮ LIỆU CỐT LÕI (SPRINT 1)
- **Mục tiêu:** Khởi tạo nền tảng Next.js 15, kết nối MongoDB Mongoose và nạp dữ liệu chuẩn phiên bản 3.3.
- **Phạm vi công việc:**
  - Cấu hình Next.js App Router, TypeScript Strict Mode, Tailwind CSS v4 và shadcn/ui.
  - Xây dựng 8 Mongoose Models: `User`, `Campaign`, `SurveyLink`, `SurveySchemaConfig`, `BenchmarkMatrix`, `PositionWorkgroupsMapping`, `SurveyResponse`, `AuditLog`.
  - Viết seed script nạp toàn bộ cấu hình phiên bản 3.3: 16 nhóm công việc, 4 vai trò kèm mô tả chi tiết, bảng ma trận mức yêu cầu (65 bản ghi), và ma trận nhóm gợi ý theo vị trí của 11 cơ quan.
  - Viết Unit Tests kiểm tra tính toàn vẹn của dữ liệu hạt giống (Seed Data).
- **Deliverable:** Database MongoDB có đầy đủ cấu trúc và dữ liệu chuẩn, sẵn sàng kết nối.

---

### MILESTONE 2: CỔNG KHẢO SÁT CÔNG KHAI & SURVEY ENGINE ĐỘNG (SPRINT 2 - CORE MVP)
- **Mục tiêu:** Cán bộ cấp xã có thể truy cập qua liên kết, trải nghiệm form khảo sát động và nộp phiếu thành công.
- **Phạm vi công việc:**
  - Xây dựng Public Route Handler `/api/public/survey/validate-link/:token` và `/api/public/survey/submit`.
  - Triển khai UI Form 4 bước bằng `React Hook Form` + `Zod`:
    - Bước 1: Thông tin chung (Câu 1 - 5) với dropdown phân cấp Tỉnh/Xã.
    - Bước 2: Hiển thị 16 nhóm công việc (Câu 6 - 7), tự động đưa nhóm gợi ý theo chức danh lên đầu; xử lý luồng kết thúc sớm (Early Exit).
    - Bước 3: Vòng lặp Part III động: Câu 8 (Vai trò) → Câu 9 (Mức tự đánh giá theo mô tả riêng) → Câu 10 (Khó khăn có điều kiện và mục độc quyền) → Câu 11 (Chuyên đề theo nhóm) → Câu 12 (Mức độ cần học).
    - Bước 4: Hình thức học (Câu 13) và Ý kiến tự do (Câu 14).
  - Triển khai cơ chế dọn dẹp state khi bấm Quay lại (Back-Navigation State Cleanup).
  - Khóa nút Gửi chống double-submit, hiển thị màn hình thông báo hoàn thành.
- **Deliverable:** Hoàn thành giao diện khảo sát trực tuyến Responsive, đáp ứng các ca kiểm từ TC-01 đến TC-14.

---

### MILESTONE 3: KIỂM SOÁT GỬI ĐÚP & TRUNG TÂM RÀ SOÁT PHIẾU NGHI TRÙNG (SPRINT 3)
- **Mục tiêu:** Tự động phát hiện và cung cấp công cụ thẩm tra phiếu nghi trùng cho chuyên viên Trường.
- **Phạm vi công việc:**
  - Viết service tính toán `businessHash` SHA-256 từ 4 yếu tố nghiệp vụ.
  - Tự động gắn cờ `isSuspectedDuplicate = true` khi lưu phiếu.
  - Xây dựng Route Handlers `/api/admin/reviews/duplicates` và PATCH `/decision`.
  - Thiết kế UI "Duplicate Review Workbench" cho phép so sánh song song (Side-by-side Diff) các phiếu trong nhóm trùng và thao tác phê duyệt Tính (`VALID`) hoặc Loại trừ (`EXCLUDED`) kèm lý do bắt buộc.
- **Deliverable:** Hoàn thành module rà soát chất lượng dữ liệu, đáp ứng TC-15 và TC-16.

---

### MILESTONE 4: ANALYTICS AGGREGATION ENGINE & 6 BẢNG TỔNG HỢP (SPRINT 4)
- **Mục tiêu:** Tự động hóa hoàn toàn việc tính toán các chỉ số thống kê của 6 Bảng tổng hợp B1 đến B6.
- **Phạm vi công việc:**
  - Viết các MongoDB Aggregation Pipelines tính toán Bảng B1, B2, B3, B4, B5, B6.
  - Triển khai logic tính toán khoảng thiếu hụt năng lực theo tự đánh giá trong Bảng B3 (so khớp với Benchmark Matrix).
  - Bổ sung nhãn bắt buộc: *"khoảng thiếu hụt theo tự đánh giá - không đồng nhất với năng lực thực tế đã được kiểm chứng"*.
  - Xây dựng giao diện Analytics Explorer với 6 Tabs hiển thị trực quan số liệu và biểu đồ Recharts.
- **Deliverable:** Hệ thống tính toán báo cáo thời gian thực, đáp ứng TC-17 và TC-18.

---

### MILESTONE 5: THUẬT TOÁN ẨN DANH SỐ LIỆU & XUẤT BÁO CÁO EXCELJS (SPRINT 5)
- **Mục tiêu:** Bảo vệ danh tính cán bộ xã theo quy tắc ngưỡng 5 người và xuất file Excel chuẩn.
- **Phạm vi công việc:**
  - Viết thuật toán Statistical Disclosure Service:
    - Primary Suppression: Chuyển các ô có số đếm $1 \le n \le 4$ thành `"dưới 5 - không công bố"`.
    - Row Suppression: Ẩn toàn bộ dòng nếu mẫu số $\in [1, 4]$.
    - Secondary Suppression: Tự động ẩn ô nhỏ nhất kế tiếp để triệt tiêu phép trừ ngược từ ô Tổng.
  - Xây dựng service sinh file Excel đa sheet bằng `ExcelJS`:
    - Tạo 6 sheets B1 - B6 + 1 sheet Dữ liệu gốc (đối với bản nội bộ).
    - Định dạng bảng biểu, font chữ Unicode, header ghi số phiên bản 3.3.
  - Route Handler `/api/admin/export/excel` hỗ trợ stream tải về.
- **Deliverable:** Đáp ứng các ca kiểm từ TC-19 đến TC-23; file Excel mở được chuẩn xác trên mọi phần mềm bảng tính.

---

### MILESTONE 6: DASHBOARD QUẢN TRỊ, PHÂN QUYỀN RBAC & GIÁM SÁT TIẾN ĐỘ (SPRINT 6)
- **Mục tiêu:** Hoàn thiện phân hệ quản trị toàn diện, bảo vệ phân quyền đa cấp.
- **Phạm vi công việc:**
  - Triển khai xác thực Auth.js v5 (NextAuth) với session HTTP-Only Cookie.
  - Phân quyền RBAC cho 5 nhóm tài khoản: Quản trị KT, Quản trị nội dung, Chuyên viên rà soát, Theo dõi tiến độ, Đầu mối địa phương.
  - Xây dựng Dashboard theo dõi tiến độ nộp phiếu thời gian thực (Progress Monitor): biểu đồ số phiếu theo ngày, tỷ lệ hoàn thành theo tỉnh/xã.
  - Quản lý đợt khảo sát, phát hành liên kết và sinh mã QR tự động.
  - Ghi nhật ký kiểm toán vào collection `audit_logs`.
- **Deliverable:** Hệ thống quản trị vận hành hoàn chỉnh, an toàn, sẵn sàng bàn giao.

---

### MILESTONE 7: CHẠY THỬ NGHIỆM PILOT, KIỂM TOÀN TOÀN DIỆN & PRODUCTION GO-LIVE (SPRINT 7)
- **Mục tiêu:** Xác minh 100% tiêu chí nghiệm thu và triển khai sản phẩm thực tế.
- **Phạm vi công việc:**
  - Chạy toàn bộ bộ 23 Test Cases (TC-01 đến TC-23) bằng Playwright E2E.
  - Tạo đợt khảo sát thử nghiệm (`PILOT-2026`) trên 3-4 xã theo quy định tại Mục VI.2 của Phương án triển khai.
  - Đối chiếu số liệu xuất ra của 6 bảng với bảng tính mẫu của Trường.
  - Đóng gói Docker Container, thiết lập biến môi trường và tài liệu hướng dẫn vận hành.
- **Deliverable:** Hệ thống sẵn sàng đưa vào vận hành chính thức (Production Ready).

---

## 3. PHẠM VI MVP (MINIMUM VIABLE PRODUCT) VS NÂNG CAO

| Phân hệ / Tính năng | Phiên bản MVP (Bắt buộc bàn giao đợt 1) | Phiên bản Nâng cao (Phát triển tiếp theo) |
|:---|:---:|:---:|
| Cổng khảo sát cán bộ xã (4 Phần, 14 Câu) | **Bắt buộc** | Lưu tiến trình bằng liên kết phục hồi qua SMS/Email (nếu có yêu cầu) |
| 16 Nhóm công việc & Logic rẽ nhánh | **Bắt buộc** | Tùy biến bộ câu hỏi động trực quan qua Drag-and-drop (Module B nâng cao) |
| Tự động nhận diện phiếu nghi trùng | **Bắt buộc** | Phân tích AI phát hiện các câu trả lời ngẫu nhiên/thiếu nghiêm túc |
| Tổng hợp 6 Bảng B1 - B6 | **Bắt buộc** | Gợi ý tự động khung chương trình đào tạo bằng thuật toán phân cụm |
| Thuật toán Ẩn danh ngưỡng 5 người | **Bắt buộc** | Bổ sung các phương pháp nhiễu số liệu vi mô (Micro-aggregation) |
| Xuất Báo cáo Excel đa sheet | **Bắt buộc** | Xuất Báo cáo tổng quan tự động ra định dạng PDF/Word |
| Phân quyền 5 nhóm tài khoản quản trị | **Bắt buộc** | Tích hợp xác thực Single Sign-On (SSO) ngành Kiểm toán |
