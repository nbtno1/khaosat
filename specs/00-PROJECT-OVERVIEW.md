# 00. PROJECT OVERVIEW — HỆ THỐNG QUẢN LÝ KHẢO SÁT NĂNG LỰC TÀI CHÍNH, TÀI SẢN CÔNG (KHAOSAT)

## 1. TỔNG QUAN DỰ ÁN
- **Tên dự án:** Hệ thống Quản lý Khảo sát Năng lực Quản lý, Sử dụng Tài chính và Tài sản công cấp Xã/Phường (`khaosat`).
- **Cơ quan chủ quản & nghiệp vụ:** Trường Đào tạo và Bồi dưỡng nghiệp vụ kiểm toán (thuộc Kiểm toán nhà nước).
- **Đơn vị kỹ thuật phối hợp:** Cục Tin học (hoặc Đội ngũ phát triển phần mềm chuyên trách).
- **Phiên bản nghiệp vụ chuẩn:** Phiên bản 3.3 (kèm Tờ trình tháng 11/2026).
- **Phương pháp luận phát triển:** Spec-Driven Development (SDD).

## 2. MỤC TIÊU DỰ ÁN
1. **Mục tiêu nghiệp vụ:**
   - Xác định nhu cầu bồi dưỡng và khoảng thiếu hụt năng lực theo tự đánh giá đối với công chức, cán bộ thực hiện công việc quản lý, sử dụng tài chính, tài sản công tại cấp xã, phường (theo mô hình chính quyền địa phương 2 cấp sau khi sắp xếp đơn vị hành chính 2025 với 34 tỉnh/thành phố và 3.321 đơn vị cấp xã).
   - Làm cơ sở khoa học và thực tiễn để Trường Đào tạo và Bồi dưỡng nghiệp vụ kiểm toán thiết kế chương trình, tài liệu và lộ trình đào tạo phù hợp cho từng địa phương.
   - **Nguyên tắc cốt lõi:** Kết quả khảo sát tuyệt đối không dùng để xếp loại cá nhân, không xếp hạng địa phương và không kết luận năng lực thực tế đã kiểm chứng.
2. **Mục tiêu kỹ thuật & sản phẩm:**
   - Xây dựng nền tảng Web Application hiện đại, độc lập thay thế cho việc sử dụng Google Forms thủ công.
   - Hệ thống gồm 2 phân hệ chính:
     - **Cổng khảo sát trực tuyến (Public Survey Portal):** Cho phép cán bộ cấp xã/phường truy cập qua liên kết riêng hoặc mã QR, trải nghiệm biểu mẫu động đa tầng, tự động điều chỉnh câu hỏi theo chức danh, nhóm công việc và vai trò.
     - **Phân hệ Quản trị & Báo cáo (Admin Management & Analytics Dashboard):** Cho phép quản trị viên quản lý đợt khảo sát, quản lý liên kết/mã QR theo tỉnh, rà soát phiếu nghi trùng, tự động xử lý và xuất 6 Bảng tổng hợp (B1 đến B6) kèm thuật toán bảo mật/ẩn danh số liệu (Statistical Disclosure Limitation) và xuất báo cáo Excel chuẩn hóa.

## 3. PHẠM VI HỆ THỐNG
- **Quy mô khảo sát:** Dự kiến triển khai theo từng đợt tại 34 đơn vị hành chính cấp tỉnh và 3.321 đơn vị hành chính cấp xã.
- **Đối tượng khảo sát:** 11 nhóm cơ quan, đơn vị tại cấp xã/phường với 15 nhóm chức danh/vị trí việc làm chính.
- **Cấu trúc bộ phiếu:** Gồm 4 phần, 14 câu hỏi chuẩn, bao phủ 16 nhóm công việc nghiệp vụ (N01 - N16) và 4 vai trò công tác (Quyết định, Tham mưu, Kiểm tra/Giám sát, Trực tiếp thực hiện).
- **Hệ thống phân quyền (RBAC):**
  1. *Quản trị kỹ thuật (Cục Tin học / Admin System)*
  2. *Quản trị nội dung (Văn phòng Trường)*
  3. *Tổng hợp, rà soát (Khoa Cơ sở, Khoa Chuyên ngành)*
  4. *Theo dõi tiến độ (Phòng Quản lý đào tạo)*
  5. *Đầu mối địa phương (Sở/Huyện/Xã liên quan - chỉ xem số liệu tổng hợp địa phương đã ẩn danh)*

## 4. CÔNG NGHỆ CHỦ ĐẠO (TECH STACK)
- **Frontend Framework:** Next.js 15 (App Router), React 19, TypeScript (Strict Mode).
- **UI Components & Styling:** shadcn/ui, Tailwind CSS v4, Lucide React icons.
- **Form Management & Validation:** React Hook Form, Zod.
- **Form Builder & Drag-and-Drop:** @dnd-kit/core, @dnd-kit/sortable.
- **Biểu đồ & Thống kê:** Recharts.
- **Xử lý Báo cáo & Xuất file:** ExcelJS.
- **Backend Architecture:** Next.js Route Handlers (RESTful APIs), Server Actions cho mutation nhạy cảm.
- **Database & ODM:** MongoDB Serverless / MongoDB 7.0+, Mongoose ODM.
- **Authentication & Authorization:** Auth.js (NextAuth.js v5) hỗ trợ Credentials & Session JWT.
- **Kiểm thử tự động:** Jest, React Testing Library, Playwright E2E.
