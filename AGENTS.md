# AGENTS.md — QUY TẮC PHÁT TRIỂN DỰ ÁN KHAOSAT (SPEC-DRIVEN DEVELOPMENT)

Tài liệu này là bộ quy tắc thường trực áp dụng bắt buộc cho mọi phiên làm việc của AI Agent và Nhà phát triển trong dự án `khaosat`. Không được bỏ qua hoặc vi phạm các nguyên tắc dưới đây.

---

## 1. NGUYÊN TẮC CỐT LÕI (CORE PRINCIPLES)

1. **Không phụ thuộc vào lịch sử hội thoại (Stateless Agent):**
   - Mọi quyết định, trạng thái và kế hoạch phải được đọc trực tiếp từ tài liệu và mã nguồn thực tế trong workspace. Tuyệt đối không giả định hoặc suy đoán dựa trên ngữ cảnh phiên chat trước.
2. **Spec-Driven Development (SDD):**
   - Tài liệu nghiệp vụ (`./docs/`) là căn cứ xác định yêu cầu.
   - Bộ đặc tả kỹ thuật đã duyệt (`./specs/`) là "Single Source of Truth" (Nguồn sự thật duy nhất) cho việc triển khai mã nguồn.
   - Không được tự ý thay đổi các yêu cầu nghiệp vụ đã được phê duyệt.
   - Tuyệt đối không viết code ứng dụng (`src/`) khi giai đoạn phát triển chưa được phê duyệt chính thức.
3. **Cố định Technology Stack:**
   - **Frontend:** Next.js 15 (App Router), React 19, TypeScript (Strict Mode).
   - **UI / Styling:** shadcn/ui, Tailwind CSS v4, Lucide Icons.
   - **Database & ODM:** MongoDB 7.0+, Mongoose.
   - **Form & Validation:** React Hook Form, Zod.
   - **Kéo thả / Sắp xếp:** @dnd-kit/core, @dnd-kit/sortable.
   - **Biểu đồ & Thống kê:** Recharts.
   - **Xuất Báo cáo:** ExcelJS.
   - **Xác thực:** Auth.js (NextAuth v5) với phân quyền RBAC.
   - *Không được tự ý bổ sung hoặc thay đổi công nghệ nếu chưa có lý do kỹ thuật rõ ràng và văn bản phê duyệt.*
4. **Không làm lại việc đã hoàn thành (No Redundant Work):**
   - Không thực hiện lại các task đã có trạng thái `COMPLETED` trong `specs/TASKS.md`, trừ khi phát hiện lỗi hoặc có yêu cầu thay đổi từ người dùng.
5. **Tuân thủ Tiêu chuẩn Chất lượng:**
   - TypeScript Strict Mode 100%, cấm sử dụng `any` tùy tiện.
   - Mọi endpoint API phải có Zod validation và kiểm tra phân quyền tại server.
   - Không để lại mock data, console.log thừa hoặc logic giả trong môi trường production.
   - Không đánh dấu task hoàn thành nếu chưa có bằng chứng kiểm thử (test evidence).

---

## 2. QUY TRÌNH MỖI KHI BẮT ĐẦU PHIÊN LÀM VIỆC (SESSION RESUME PROTOCOL)

Trước khi thực hiện bất kỳ yêu cầu nào, Agent bắt buộc phải thực hiện đủ 6 bước kiểm tra trạng thái:

1. **Đọc quy tắc dự án:** Đọc file này (`AGENTS.md`) và `.agents/rules/project.md`.
2. **Khôi phục trạng thái từ Spec:**
   - Đọc [`specs/PROGRESS.md`](file:///Users/macbook/Desktop/khaosat/specs/PROGRESS.md) để biết Giai đoạn, Milestone và Task hiện tại.
   - Đọc [`specs/TASKS.md`](file:///Users/macbook/Desktop/khaosat/specs/TASKS.md) để xác định backlog nhiệm vụ.
   - Đọc [`specs/DECISIONS.md`](file:///Users/macbook/Desktop/khaosat/specs/DECISIONS.md) để nắm các quyết định kiến trúc (ADR) đã chốt.
   - Đọc Spec chi tiết của module dự kiến làm việc trong `./specs/`.
3. **Kiểm tra thực tế mã nguồn & Git:**
   - Chạy `git status` để kiểm tra các file đang sửa đổi, branch hiện tại.
   - Kiểm tra cấu trúc thư mục thực tế (`src/`, `specs/`, `docs/`).
4. **Phân loại công việc:** Xác định rõ công việc ĐÃ HOÀN THÀNH, ĐANG THỰC HIỆN, CHƯA THỰC HIỆN và BỊ CHẶN (Blockers).
5. **Kiểm tra điều kiện bắt đầu:**
   - Nếu giai đoạn/task yêu cầu phê duyệt mà chưa có phê duyệt: **DỪNG LẠI**, chỉ báo cáo trạng thái và các nội dung đang chờ phê duyệt. Không tự ý viết mã nguồn.
6. **Thực thi task:** Chỉ nhận task tiếp theo có độ ưu tiên cao nhất trong Roadmap khi đã đủ điều kiện bắt đầu.

---

## 3. QUY TRÌNH KẾT THÚC MỖI TASK (TASK COMPLETION PROTOCOL)

Sau khi hoàn thành lập trình một task, Agent bắt buộc phải thực hiện tuần tự các bước sau trước khi báo cáo hoàn tất:

1. **Kiểm tra kỹ thuật:** Chạy `npm run typecheck`, `npm run lint` và các unit/integration test liên quan.
2. **Xác minh Acceptance Criteria:** Đối chiếu từng tiêu chí nghiệm thu của task trong `specs/TASKS.md` và `specs/14-ACCEPTANCE-CRITERIA.md`.
3. **Cập nhật `specs/TASKS.md`:** Chuyển trạng thái task sang `COMPLETED`, ghi chú PR/commit và bằng chứng test.
4. **Cập nhật `specs/PROGRESS.md`:** Cập nhật công việc đã hoàn thành, kết quả test và task kế tiếp.
5. **Cập nhật `specs/CHANGELOG.md`:** Ghi nhận thay đổi chức năng/kiến trúc nếu có.
6. **Cập nhật `specs/REQUIREMENTS-TRACEABILITY.md`:** Bổ sung liên kết file code và ca kiểm thử nếu có yêu cầu mới.
7. **Ghi nhận quyết định kiến trúc mới:** Nếu có phát sinh giải pháp kỹ thuật mới, ghi vào `specs/DECISIONS.md` dưới dạng ADR.
8. **Báo cáo kết quả:** Nêu rõ các thay đổi đã thực hiện, bằng chứng test đã chạy, các vấn đề tồn đọng (nếu có) và đề xuất bước tiếp theo.

---

## 4. QUẢN LÝ THAY ĐỔI & XỬ LÝ XUNG ĐỘT

- Khi phát hiện mâu thuẫn giữa các tài liệu nguồn hoặc giữa tài liệu với thực tế, không tự ý đưa ra phán đoán mà phải ghi nhận vào [`specs/ASSUMPTIONS-AND-OPEN-QUESTIONS.md`](file:///Users/macbook/Desktop/khaosat/specs/ASSUMPTIONS-AND-OPEN-QUESTIONS.md) để xin ý kiến Product Owner.
- Mọi thay đổi Spec phải được đánh giá tác động (Impact Analysis) đến Database Schema, API Handlers, UI Components và Test Suite trước khi cập nhật mã nguồn.
