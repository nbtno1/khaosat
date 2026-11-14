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

## 3. QUY TRÌNH QUẢN LÝ THAY ĐỔI SPEC
1. Khi phát hiện yêu cầu mới hoặc mâu thuẫn nghiệp vụ:
   - Ghi nhận chi tiết vào [`specs/ASSUMPTIONS-AND-OPEN-QUESTIONS.md`](file:///Users/macbook/Desktop/khaosat/specs/ASSUMPTIONS-AND-OPEN-QUESTIONS.md).
   - Đánh giá tác động đến Database Schema, API Handlers, UI Components và Test Suite.
   - Chỉ sửa mã nguồn sau khi thay đổi Spec đã được phê duyệt.
