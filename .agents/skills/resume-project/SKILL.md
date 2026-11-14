---
name: resume-project
description: Khôi phục ngữ cảnh và tiếp tục phát triển dự án KHAOSAT theo phương pháp Spec-Driven Development (SDD).
---

# SKILL / WORKFLOW: RESUME PROJECT — TIẾP TỤC PHÁT TRIỂN DỰ ÁN KHAOSAT

Sử dụng skill/workflow này mỗi khi bắt đầu một phiên làm việc mới trên dự án `khaosat`. Có thể kích hoạt bằng cách gõ `/resume-project` hoặc khi người dùng yêu cầu tiếp tục công việc.

## QUY TRÌNH THỰC HIỆN 8 BƯỚC

### 1. Đọc Quy tắc Dự án
- Đọc file [`AGENTS.md`](file:///Users/macbook/Desktop/khaosat/AGENTS.md) tại thư mục gốc.
- Đọc file [`.agents/rules/project.md`](file:///Users/macbook/Desktop/khaosat/.agents/rules/project.md).
- Ghi nhớ: Cố định Tech Stack (Next.js 15, React 19, TypeScript Strict, MongoDB Mongoose, Tailwind CSS v4, shadcn/ui, Zod, dnd-kit, Recharts, ExcelJS, Auth.js). Không tự ý thay đổi công nghệ hoặc yêu cầu nghiệp vụ đã phê duyệt.

### 2. Khôi phục Trạng thái từ Spec và Mã nguồn
- Đọc [`specs/PROGRESS.md`](file:///Users/macbook/Desktop/khaosat/specs/PROGRESS.md) để xác định Giai đoạn, Milestone, Task hiện tại, Blockers.
- Đọc [`specs/TASKS.md`](file:///Users/macbook/Desktop/khaosat/specs/TASKS.md) để nắm toàn bộ task backlog.
- Đọc [`specs/DECISIONS.md`](file:///Users/macbook/Desktop/khaosat/specs/DECISIONS.md) để nắm các quyết định kiến trúc đã chốt.
- Chạy lệnh `git status` để kiểm tra mã nguồn thực tế và các thay đổi chưa commit.

### 3. Kiểm tra Tính Nhất quán giữa Tài liệu và Thực tế
- Đối chiếu trạng thái ghi nhận trong `specs/PROGRESS.md` và `specs/TASKS.md` với các file thực tế trong thư mục `./src/` và `./specs/`.
- Xác định rõ: Công việc đã hoàn thành, đang dở dang, chưa bắt đầu và bị chặn.

### 4. Xác định Task Kế tiếp trong Roadmap
- Tra cứu [`specs/15-DEVELOPMENT-ROADMAP.md`](file:///Users/macbook/Desktop/khaosat/specs/15-DEVELOPMENT-ROADMAP.md) và `specs/TASKS.md`.
- Tìm task có trạng thái `PLANNED` với mức ưu tiên cao nhất mà toàn bộ các task phụ thuộc đã `COMPLETED`.

### 5. Kiểm tra Điều kiện Phê duyệt Giai đoạn
- **QUY TẮC CỐT LÕI:**
  - Nếu giai đoạn hiện tại hoặc task kế tiếp yêu cầu phê duyệt từ Product Owner / Lãnh đạo mà **chưa nhận được lệnh phê duyệt chính thức**:
    - **DỪNG LẠI NGAY LẬP TỨC.**
    - Báo cáo rõ ràng trạng thái hiện tại, danh sách nội dung đang chờ phê duyệt, các câu hỏi mở trong `specs/ASSUMPTIONS-AND-OPEN-QUESTIONS.md`.
    - **Tuyệt đối không tự ý viết mã nguồn ứng dụng (`src/`).**

### 6. Thực hiện Lập trình và Kiểm thử theo Spec (Khi đã được duyệt)
- Đọc kỹ Spec chi tiết liên quan đến task trước khi sửa code.
- Triển khai code tuân thủ TypeScript strict mode, Zod validation, Clean Architecture.
- Viết Unit Test / Integration Test tương ứng theo `specs/13-TEST-STRATEGY.md`.
- Chạy `npm run typecheck`, `npm run lint` và test runner để xác minh mã nguồn.

### 7. Cập nhật Tiến độ sau khi Hoàn thành Task
- Cập nhật trạng thái task trong `specs/TASKS.md` sang `COMPLETED` kèm ghi chú test evidence.
- Cập nhật `specs/PROGRESS.md`.
- Cập nhật `specs/CHANGELOG.md` nếu có thay đổi tính năng/kiến trúc.
- Cập nhật `specs/REQUIREMENTS-TRACEABILITY.md` nếu có liên kết file/test mới.
- Ghi nhận quyết định kiến trúc mới vào `specs/DECISIONS.md` nếu có phát sinh.

### 8. Báo cáo Kết quả Phiên làm việc
- Báo cáo danh sách file đã tạo hoặc cập nhật.
- Báo cáo kết quả kiểm thử kỹ thuật đã chạy (Pass/Fail).
- Báo cáo các vấn đề tồn đọng hoặc câu hỏi mở.
- Đề xuất task kế tiếp theo đúng roadmap.
