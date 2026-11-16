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
   - Đọc [`specs/PROGRESS.md`](specs/PROGRESS.md) để biết Giai đoạn, Milestone và Task hiện tại.
   - Đọc [`specs/TASKS.md`](specs/TASKS.md) để xác định backlog nhiệm vụ.
   - Đọc [`specs/DECISIONS.md`](specs/DECISIONS.md) để nắm các quyết định kiến trúc (ADR) đã chốt.
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

- Khi phát hiện mâu thuẫn giữa các tài liệu nguồn hoặc giữa tài liệu với thực tế, không tự ý đưa ra phán đoán mà phải ghi nhận vào [`specs/ASSUMPTIONS-AND-OPEN-QUESTIONS.md`](specs/ASSUMPTIONS-AND-OPEN-QUESTIONS.md) để xin ý kiến Product Owner.
- Mọi thay đổi Spec phải được đánh giá tác động (Impact Analysis) đến Database Schema, API Handlers, UI Components và Test Suite trước khi cập nhật mã nguồn.

---

## 5. HƯỚNG DẪN KHỞI CHẠY VÀ TIẾP TỤC TRÊN THIẾT BỊ MỚI (CROSS-DEVICE SETUP & RESUME)

Khi chuyển sang thiết bị mới (Windows, macOS hoặc Linux), Agent hoặc Developer thực hiện tuần tự các bước sau để khôi phục môi trường phát triển:

### 5.1. Cài đặt phụ thuộc & Cấu hình môi trường
```bash
# 1. Clone hoặc kéo mã nguồn mới nhất
git pull origin main

# 2. Cài đặt toàn bộ thư viện dependencies (Node 20+)
npm install

# 3. Tạo file cấu hình môi trường từ mẫu
# Windows PowerShell:
Copy-Item .env.example .env
# Linux / macOS:
# cp .env.example .env
```

### 5.2. Khởi tạo Cơ sở dữ liệu (Database Seed)
Đảm bảo MongoDB đang chạy tại `mongodb://localhost:27017/khaosat_db` (hoặc cấu hình URI tương ứng trong `.env`):
```bash
# Nạp dữ liệu hạt giống: Schema câu hỏi 3.3, Benchmark matrix, Vị trí & Nhóm việc gợi ý, Đợt khảo sát, Tài khoản quản trị
npm run db:seed
```

### 5.3. Tài khoản Đăng nhập Quản trị Chuẩn hóa (Dual-Admin)
Hệ thống cấu hình 2 nhóm tài khoản đăng nhập tại `/login`:
| Loại tài khoản | Tên đăng nhập | Mật khẩu | Quyền hạn & Đặc quyền |
|:---|:---|:---|:---|
| **Cục Công nghệ thông tin** | `cntt_admin` | `Admin@123456` | `TECHNICAL_ADMIN`: Toàn quyền quản trị nghiệp vụ + **Đặc quyền duy nhất xem Nhật ký Hệ thống (`/admin/audit-logs`)**. |
| **Quản trị viên Hệ thống** | `admin` | `Admin@123456` | `SYSTEM_ADMIN`: Toàn quyền quản trị nghiệp vụ khảo sát (chặn truy cập Nhật ký Hệ thống). |

### 5.4. Chạy Ứng dụng & Kiểm thử Kỹ thuật
```bash
# Khởi chạy máy chủ phát triển (mặc định port 3000)
npm run dev

# Kiểm tra tĩnh kiểu dữ liệu (bắt buộc 0 lỗi)
npm run typecheck

# Chạy toàn bộ các bộ kiểm thử nghiệp vụ
npm run test:questions     # Quản trị bộ câu hỏi & chuyên đề (ADR-012)
npm run test:validations   # Zod validation & quy tắc nghiệp vụ
npm run test:api           # Public API khảo sát & nộp phiếu
npm run test:duplicates    # Thuật toán phát hiện phiếu nghi trùng 4 điểm
npm run test:analytics     # Tổng hợp số liệu 6 bảng B1 đến B6
npm run test:excel         # Xuất báo cáo Excel đa sheet & kiểm soát bảo mật < 5
npm run test:auth          # Xác thực RBAC & phân quyền
npm run test:dvhc          # Quản trị ĐVHC 34 tỉnh và 3.321 xã/phường
npm run test:guide         # Cẩm nang vận hành cập nhật động
npm run test:e2e           # 23 Ca kiểm thử chính thức (TC-01 đến TC-23)
```

### 5.5. Tiêu chuẩn Giao diện Bắt buộc
- **Zero-Page-Scroll & Full-Height:** Tất cả trang Admin tuyệt đối không sinh thanh cuộn toàn trang (`window.scrollY === 0`), dữ liệu dài cuộn nội bộ bên trong `overflow-y-auto`.
- **Progressive Item Rendering:** Các màn hình danh sách lớn/nhiều tab bắt buộc dùng hook `useProgressiveItems` để chuyển tab tức thì (< 16ms), không đơ trình duyệt.
