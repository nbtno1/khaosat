---
trigger: always_on
description: Quy tắc phát triển Spec-Driven Development (SDD) và tiêu chuẩn kỹ thuật cho dự án KHAOSAT.
---

# WORKSPACE RULE: SPEC-DRIVEN DEVELOPMENT (SDD) PROTOCOL

Quy tắc này áp dụng cho mọi thao tác phát triển và kiểm thử trong phạm vi workspace `khaosat`.

## 1. MỐI QUAN HỆ VỚI AGENTS.MD
- `AGENTS.md` tại thư mục gốc là văn bản quy định nguyên tắc tổng thể và quy trình tiếp tục dự án.
- Quy tắc này (`.agents/rules/project.md`) chi tiết hóa các chuẩn mực kỹ thuật và quy trình thực thi mã nguồn.
- Trường hợp có điểm chưa rõ, áp dụng mức độ ưu tiên cao nhất cho tài liệu Spec trong `./specs/` đã được phê duyệt.

## 2. QUY CHUẨN KỸ THUẬT VÀ PHÁT TRIỂN MÃ NGUỒN
1. **Tuân thủ TypeScript Strict Mode:**
   - Không tắt strict mode trong `tsconfig.json`.
   - Cấm sử dụng `any`, `unknown` không có type guard, hoặc `@ts-ignore` vô nguyên tắc.
   - Mọi data model, API request/response và form state đều phải có type/interface tường minh.
2. **Kiến trúc Next.js App Router:**
   - Ưu tiên Server Components cho các trang đọc dữ liệu để tối ưu kích thước bundle và SEO.
   - Chỉ sử dụng Client Component (`"use client"`) khi có tương tác người dùng, state form, kéo thả hoặc sự kiện chuột.
   - Toàn bộ logic nghiệp vụ nhạy cảm, tính toán thống kê và kiểm tra quyền RBAC bắt buộc phải xử lý tại server (Route Handlers / Server Actions).
3. **Quản lý Form & Validation:**
   - Sử dụng `React Hook Form` kết hợp với `zodResolver`.
   - Mọi form input đều phải có validation schema Zod tương ứng; đồng thời backend API phải tái sử dụng chính Zod schema đó để xác thực phía máy chủ.
4. **Bảo mật và Quyền riêng tư (Zero-PII & Suppression):**
   - Tuyệt đối không bổ sung các trường thông tin Họ tên, SĐT, Email, CCCD vào biểu mẫu khảo sát công khai.
   - Bắt buộc áp dụng thuật toán `StatisticalDisclosureService` (ngưỡng < 5 người) cho toàn bộ các báo cáo xuất ra bên ngoài hoặc giao diện dành cho Đầu mối địa phương.

5. **Kiến trúc Giao diện Full-Height & Zero-Page-Scroll:**
   - Toàn bộ các trang Quản trị (`src/app/(admin)/admin/**`) phải tuân thủ nghiêm ngặt nguyên tắc Zero-Page-Scroll (`window.scrollY === 0`).
   - Container chính trong Layout là `flex flex-col h-full overflow-hidden`.
   - Vùng nội dung dài phải sử dụng container con `flex-1 min-h-0 overflow-y-auto` với thanh cuộn nội bộ; bảng dữ liệu phải có `sticky thead`.
6. **Tối ưu Chuyển Tab (Progressive Item Rendering):**
   - Khi giao diện có nhiều tab hoặc danh sách dài có nhiều icon/inputs phức tạp (ví dụ `/admin/questions`, `/admin/analytics`, `/admin/administrative-units`), bắt buộc áp dụng hook `useProgressiveItems` để hiển thị ngay 3-6 item đầu tiên trong < 16ms, sau đó render dần các item còn lại, tránh hiện tượng đơ trình duyệt.
7. **Phân quyền Dual-Admin & Bảo mật Nhật ký Hệ thống (ADR-013):**
   - Hai nhóm tài khoản quản trị: Cục Công nghệ thông tin (`TECHNICAL_ADMIN`) và Quản trị viên Nghiệp vụ (`SYSTEM_ADMIN`).
   - Cả hai tài khoản có quyền hạn quản trị nghiệp vụ như nhau. Tuy nhiên, quyền `VIEW_AUDIT_LOGS` chỉ cấp độc quyền cho `TECHNICAL_ADMIN`.
   - Mọi thao tác truy cập trái quyền vào log hệ thống phải tự động trả về `403 Forbidden` và lập tức ghi nhật ký cảnh báo an ninh.

## 3. QUY TRÌNH QUẢN LÝ THAY ĐỔI SPEC
1. Khi phát hiện yêu cầu mới hoặc mâu thuẫn nghiệp vụ:
   - Ghi nhận chi tiết vào [`specs/ASSUMPTIONS-AND-OPEN-QUESTIONS.md`](specs/ASSUMPTIONS-AND-OPEN-QUESTIONS.md).
   - Đánh giá tác động đến Database Schema, API Handlers, UI Components và Test Suite.
   - Chỉ sửa mã nguồn sau khi thay đổi Spec đã được phê duyệt.
