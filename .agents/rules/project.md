# WORKSPACE RULE: SPEC-DRIVEN DEVELOPMENT (SDD) PROTOCOL

## 1. NGUYÊN TẮC CỐT LÕI
1. **Spec-Driven Development (SDD):** Mọi công việc phát triển mã nguồn, API, schema database, UI components bắt buộc phải đối chiếu và tuân thủ bộ đặc tả kỹ thuật tại `./specs/`.
2. **Không tự suy diễn:** Tài liệu nghiệp vụ (`./docs/`) là căn cứ xác định yêu cầu. Bộ Spec đã duyệt (`./specs/`) là "Single Source of Truth" cho việc lập trình.
3. **Cấm viết mã tự do:** Tuyệt đối không viết source code ứng dụng (`src/`) khi bộ Spec chưa được phê duyệt hoặc chưa có task cụ thể trong `specs/TASKS.md`.

## 2. QUY TRÌNH MỖI KHI BẮT ĐẦU PHIÊN LÀM VIỆC MỚI
Mỗi agent hoặc developer khi bắt đầu phiên làm việc mới phải thực hiện theo đúng trình tự:
1. Đọc workspace rule này (`.agents/rules/project.md`).
2. Đọc `specs/00-PROJECT-OVERVIEW.md`.
3. Đọc `specs/PROGRESS.md` và `specs/TASKS.md` để nắm trạng thái hiện tại.
4. Đọc `specs/DECISIONS.md` và Spec của module dự kiến làm việc.
5. Kiểm tra trạng thái git và mã nguồn thực tế (`git status`).
6. Tiếp tục từ task chưa hoàn thành trong backlog.

## 3. QUY TRÌNH KHI HOÀN THÀNH MỘT TASK
Khi hoàn thành một task từ `specs/TASKS.md`:
1. Cập nhật trạng thái trong `specs/TASKS.md` (chuyển sang `COMPLETED`, ghi chú PR/commit).
2. Cập nhật `specs/PROGRESS.md`.
3. Cập nhật `specs/CHANGELOG.md` nếu có thay đổi kiến trúc/chức năng.
4. Cập nhật `specs/REQUIREMENTS-TRACEABILITY.md`.
5. Báo cáo các unit/integration test đã chạy và kết quả xác minh.
6. Đề xuất task kế tiếp theo đúng roadmap (`specs/15-DEVELOPMENT-ROADMAP.md`).

## 4. QUY TRÌNH QUẢN LÝ THAY ĐỔI SPEC
1. Khi phát hiện yêu cầu mới hoặc mâu thuẫn cần sửa đổi Spec:
   - Ghi nhận vào `specs/ASSUMPTIONS-AND-OPEN-QUESTIONS.md` hoặc `specs/DECISIONS.md`.
   - Đánh giá tác động (Impact Analysis) đến Database Schema, API Handlers, UI Components và Test Suites.
   - Chỉ sửa code sau khi thay đổi Spec đã được phê duyệt.

## 5. CHUẨN CÔNG NGHỆ BẮT BUỘC
- Frontend: React 19, Next.js 15 (App Router), TypeScript (Strict Mode)
- UI/Styling: Tailwind CSS, shadcn/ui, Lucide Icons
- State & Form: React Hook Form, Zod
- Drag-and-Drop: dnd-kit
- Charts & Visualization: Recharts
- Export: ExcelJS
- Backend: Next.js Route Handlers (RESTful API)
- Database: MongoDB via Mongoose
- Authentication: Auth.js (NextAuth v5) với phân quyền RBAC
- Testing: Jest, React Testing Library, Playwright (E2E)
