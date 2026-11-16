---
name: resume-project
description: Khôi phục ngữ cảnh và tiếp tục phát triển dự án KHAOSAT theo phương pháp Spec-Driven Development (SDD).
---

# WORKFLOW: RESUME PROJECT — TIẾP TỤC PHÁT TRIỂN DỰ ÁN KHAOSAT

Quy trình chuẩn để tiếp tục công việc trong dự án `khaosat` qua nhiều phiên làm việc mà không phụ thuộc vào bộ nhớ hội thoại của AI.

## CÁC BƯỚC THỰC HIỆN BẮT BUỘC

### Bước 1: Đọc Quy tắc Dự án & Thiết lập Môi trường
- Đọc file [`AGENTS.md`](AGENTS.md) tại thư mục gốc và mục 5 (Hướng dẫn chạy trên thiết bị mới).
- Đọc file [`.agents/rules/project.md`](.agents/rules/project.md).
- Ghi nhớ: Cố định Tech Stack (Next.js 15, React 19, TypeScript Strict, MongoDB Mongoose, Tailwind CSS v4, shadcn/ui, Zod, dnd-kit, Recharts, ExcelJS, Auth.js). Không tự ý thay đổi công nghệ hoặc yêu cầu nghiệp vụ đã phê duyệt.

### Bước 2: Khôi phục Trạng thái từ Spec và Mã nguồn
- Đọc [`specs/PROGRESS.md`](specs/PROGRESS.md) để xác định:
  - Giai đoạn hiện tại (Phase)
  - Milestone hiện tại
  - Task đang thực hiện
  - Các công việc đã hoàn thành & được xác minh
  - Các vướng mắc / điểm chặn (Blockers)
- Đọc [`specs/TASKS.md`](specs/TASKS.md) để nắm toàn bộ task backlog.
- Đọc [`specs/DECISIONS.md`](specs/DECISIONS.md) để nắm các quyết định kiến trúc đã chốt.
- Chạy lệnh `git status` để kiểm tra mã nguồn thực tế và các thay đổi chưa commit.

### Bước 3: Kiểm tra Tính Nhất quán giữa Tài liệu và Thực tế
- Đối chiếu trạng thái ghi nhận trong `specs/PROGRESS.md` và `specs/TASKS.md` với các file thực tế trong thư mục `./src/` và `./specs/`.
- Xác định rõ:
  - Công việc đã hoàn thành và có bằng chứng test.
  - Công việc đang dở dang.
  - Công việc chưa bắt đầu.
  - Các vấn đề phát sinh hoặc bất nhất (nếu có).

### Bước 4: Xác định Task Kế tiếp trong Roadmap
- Tra cứu [`specs/15-DEVELOPMENT-ROADMAP.md`](specs/15-DEVELOPMENT-ROADMAP.md) và `specs/TASKS.md`.
- Tìm task có trạng thái `PLANNED` với mức ưu tiên cao nhất mà toàn bộ các task phụ thuộc (dependencies) của nó đã đạt trạng thái `COMPLETED`.

### Bước 5: Kiểm tra Điều kiện Phê duyệt Giai đoạn
- **QUY TẮC CỐT LÕI:**
  - Nếu giai đoạn hiện tại hoặc task kế tiếp yêu cầu phê duyệt từ Product Owner / Lãnh đạo mà **chưa nhận được lệnh phê duyệt chính thức**:
    - **DỪNG LẠI NGAY LẬP TỨC.**
    - Báo cáo rõ ràng trạng thái hiện tại, danh sách nội dung đang chờ phê duyệt, các câu hỏi mở trong [`specs/ASSUMPTIONS-AND-OPEN-QUESTIONS.md`](specs/ASSUMPTIONS-AND-OPEN-QUESTIONS.md).
    - **Tuyệt đối không tự ý viết mã nguồn ứng dụng (`src/`).**

### Bước 6: Thực hiện Lập trình và Kiểm thử theo Spec (Khi đã được duyệt)
- Đọc kỹ Spec chi tiết liên quan đến task trước khi sửa code.
- Triển khai code tuân thủ TypeScript strict mode, Zod validation, Clean Architecture.
- Tuân thủ Zero-Page-Scroll và Progressive Rendering hook cho danh sách lớn.
- Viết Unit Test / Integration Test tương ứng theo [`specs/13-TEST-STRATEGY.md`](specs/13-TEST-STRATEGY.md).
- Chạy `npm run typecheck`, `npm run lint` và test runner để xác minh mã nguồn.

### Bước 7: Cập nhật Tiến độ sau khi Hoàn thành Task
- Cập nhật trạng thái task trong [`specs/TASKS.md`](specs/TASKS.md) sang `COMPLETED` kèm ghi chú test evidence.
- Cập nhật [`specs/PROGRESS.md`](specs/PROGRESS.md).
- Cập nhật [`specs/CHANGELOG.md`](specs/CHANGELOG.md) nếu có thay đổi tính năng/kiến trúc.
- Cập nhật [`specs/REQUIREMENTS-TRACEABILITY.md`](specs/REQUIREMENTS-TRACEABILITY.md) nếu có liên kết file/test mới.
- Ghi nhận quyết định kiến trúc mới vào [`specs/DECISIONS.md`](specs/DECISIONS.md) dưới dạng ADR.

### Bước 8: Báo cáo Kết quả Phiên làm việc
- Báo cáo danh sách file đã tạo hoặc cập nhật.
- Báo cáo kết quả kiểm thử kỹ thuật đã chạy (Pass/Fail).
- Báo cáo các vấn đề tồn đọng hoặc câu hỏi mở.
- Đề xuất task kế tiếp theo đúng roadmap.
