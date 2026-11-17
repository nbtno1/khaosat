# KHAOSAT — HỆ THỐNG QUẢN LÝ KHẢO SÁT NĂNG LỰC TÀI CHÍNH, TÀI SẢN CÔNG CẤP XÃ/PHƯỜNG

Dự án phần mềm phục vụ khảo sát nhu cầu đào tạo và xác định khoảng thiếu hụt năng lực theo tự đánh giá đối với công việc quản lý, sử dụng tài chính, tài sản công ở cấp xã, phường (thuộc Trường Đào tạo và Bồi dưỡng nghiệp vụ kiểm toán - Kiểm toán nhà nước).

Dự án áp dụng phương pháp luận **Spec-Driven Development (SDD)**, đạt tiêu chuẩn kỹ thuật nghiêm ngặt, Zero-PII, thuật toán kiểm soát tiết lộ thống kê (< 5 người), và Zero-Page-Scroll UX.

---

## 1. CẤU TRÚC DỰ ÁN

```text
khaosat/
├── .agents/                               # Bộ quy tắc, skills và workflows cho AI Agents
│   ├── rules/project.md                   # Quy tắc SDD, Zero-PII, Zero-Scroll, Dual-Admin
│   ├── skills/resume-project/SKILL.md     # Kỹ năng tự động khôi phục ngữ cảnh phiên làm việc
│   └── workflows/resume-project.md        # Quy trình chuẩn tiếp tục dự án
├── AGENTS.md                              # Quy tắc thường trực & Hướng dẫn chạy đa thiết bị
├── docs/                                  # 20 tài liệu nghiệp vụ gốc (Bộ phiếu phiên bản 3.3)
├── specs/                                 # 22 tài liệu Đặc tả Kỹ thuật hoàn chỉnh
│   ├── PROGRESS.md                        # Báo cáo tiến độ thời gian thực (24/24 Tasks COMPLETED)
│   ├── TASKS.md                           # Backlog 24 tasks chi tiết kèm test cases (Milestone 1-13)
│   ├── DECISIONS.md                       # 15 Bản ghi quyết định kiến trúc (ADR-001 đến ADR-015)
│   ├── CHANGELOG.md                       # Lịch sử thay đổi hệ thống
│   └── REQUIREMENTS-TRACEABILITY.md       # Ma trận truy vết yêu cầu (RTM)
├── src/                                   # Mã nguồn ứng dụng Next.js 15 App Router
│   ├── app/
│   │   ├── (admin)/admin/                 # Cổng Quản trị (Dashboard, Campaigns, Questions, ĐVHC, Đề xuất, Users...)
│   │   ├── (auth)/login/                  # Trang đăng nhập tối giản chuẩn KTNN
│   │   ├── (public)/khao-sat/[token]/     # Cổng Khảo sát Công khai di động 4 bước
│   │   └── api/                           # Hệ thống RESTful Route Handlers
│   ├── components/                        # UI Components chuẩn hóa (shadcn/ui, Recharts)
│   ├── hooks/                             # Custom hooks (useProgressiveItems, useSurveyFormState...)
│   ├── lib/                               # Tiện ích, db.ts, auth.ts, audit-logger.ts
│   ├── models/                            # 10 Mongoose Models (SurveyResponse, AuditLog, TrainingProposal...)
│   └── services/                          # Business Services (Analytics, Duplicate, Questions, DVHC, Proposals, Users...)
├── tests/                                 # Bộ kiểm thử tự động toàn diện (Unit, Integration, E2E)
└── README.md
```

---

## 2. TECHNOLOGY STACK
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript (Strict Mode 100%).
- **UI & Styling:** Tailwind CSS v4, shadcn/ui, Lucide React Icons.
- **Form & Validation:** React Hook Form + Zod Schema Validation.
- **Biểu đồ & Thống kê:** Recharts.
- **Báo cáo & Xuất file:** ExcelJS (báo cáo đa sheet định dạng kiểm toán), AdmZip, QRCode.
- **Backend & Database:** Next.js Route Handlers + MongoDB 7.0+ (Mongoose ODM).
- **Bảo mật & Phân quyền:** JWT HMAC SHA-256 HttpOnly Cookie + Phân quyền RBAC Dual-Admin.
- **Kiểm thử:** Node.js Test Runner + tsx (10 bộ kiểm thử chuyên sâu, pass 100%).

---

## 3. HƯỚNG DẪN KHỞI CHẠY TRÊN THIẾT BỊ MỚI (SETUP & RESUME)

### Bước 1: Tải mã nguồn & Cài đặt thư viện
```bash
# Clone hoặc pull mã nguồn mới nhất
git pull origin main

# Cài đặt toàn bộ thư viện dependencies (Node 20+)
npm install
```

### Bước 2: Cấu hình biến môi trường
Tạo file `.env` từ file mẫu `.env.example`:
- Trên Windows PowerShell:
  ```powershell
  Copy-Item .env.example .env
  ```
- Trên macOS / Linux:
  ```bash
  cp .env.example .env
  ```

Nội dung `.env` chuẩn mặc định:
```env
NODE_ENV=development
PORT=3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/khaosat_db
AUTH_SECRET=secret_survey_token_random_jwt_string_minimum_32_characters_long
AUTH_TRUST_HOST=true
AUTH_URL=http://localhost:3000/api/auth
RATE_LIMIT_MAX_SUBMISSIONS_PER_MINUTE=10
DEFAULT_SCHEMA_VERSION=3.3
```

### Bước 3: Nạp dữ liệu hạt giống (Seed Database)
Đảm bảo MongoDB daemon đang chạy, sau đó chạy:
```bash
npm run db:seed
```
Lệnh trên sẽ tự động nạp:
- Schema cấu hình câu hỏi chuẩn v3.3 (16 nhóm việc, 87 chuyên đề, 14 câu hỏi).
- Ma trận Benchmark chuẩn 64 mức năng lực.
- Danh mục 40 vị trí và phân công nhóm việc gợi ý.
- Đợt khảo sát đợt 1 và sinh mã QR cho 34 tỉnh thí điểm.
- Khởi tạo 2 tài khoản quản trị chuẩn.

### Bước 4: Khởi chạy máy chủ phát triển
```bash
npm run dev
```
Truy cập ứng dụng tại:
- Cổng Quản trị & Đăng nhập: [http://localhost:3000/login](http://localhost:3000/login)
- Cổng Khảo sát công khai (Ví dụ tỉnh Hà Tĩnh): [http://localhost:3000/khao-sat/LINK-PROV-42-HATINH](http://localhost:3000/khao-sat/LINK-PROV-42-HATINH)

---

## 4. TÀI KHOẢN ĐĂNG NHẬP QUẢN TRỊ (DUAL-ADMIN RBAC)

Hệ thống thiết lập 2 loại tài khoản tại trang `/login`:

| Loại tài khoản | Tên đăng nhập | Mật khẩu | Phạm vi quyền hạn |
|:---|:---|:---|:---|
| **Cục Công nghệ thông tin** | `cntt_admin` | `Admin@123456` | `TECHNICAL_ADMIN`: Có toàn bộ quyền quản trị nghiệp vụ + **Đặc quyền duy nhất xem và kiểm tra Nhật ký Hệ thống (`/admin/audit-logs`)**. |
| **Quản trị viên Hệ thống** | `admin` | `Admin@123456` | `SYSTEM_ADMIN`: Toàn quyền quản trị nghiệp vụ (Dashboard, Câu hỏi, ĐVHC, Đợt khảo sát, Thẩm tra nghi trùng, Báo cáo 6 bảng, Cẩm nang). Chặn xem log hệ thống. |

---

## 5. BỘ LỆNH KIỂM THỬ KỸ THUẬT (TEST SUITE)

Tất cả các ca kiểm thử đều độc lập và tự động:
```bash
# 1. Kiểm tra tĩnh kiểu dữ liệu (Strict Mode)
npm run typecheck

# 2. Phân hệ Quản trị Bộ Câu hỏi & Chuyên đề (ADR-012)
npm run test:questions

# 3. Zod Schemas & Quy tắc nghiệp vụ Cổng khảo sát
npm run test:validations

# 4. Public API & Nộp bài khảo sát
npm run test:api

# 5. Thuật toán phát hiện phiếu nghi trùng 4 điểm nghiệp vụ
npm run test:duplicates

# 6. Tổng hợp số liệu 6 bảng B1 - B6 & Khoảng thiếu hụt năng lực
npm run test:analytics

# 7. Thuật toán ẩn danh bảo mật (<5 người) & Xuất ExcelJS
npm run test:excel

# 8. Xác thực an toàn JWT & Phân quyền RBAC
npm run test:auth

# 9. Quản trị ĐVHC 34 tỉnh và 3.321 xã/phường (ADR-011)
npm run test:dvhc

# 10. Cẩm nang vận hành cập nhật động (ADR-010)
npm run test:guide

# 11. Phân hệ Quản trị Người dùng & Phân quyền RBAC (ADR-015)
npm run test:users

# 12. Phân hệ Lập Đề xuất Đào tạo 12 Mục & Xuất Dữ liệu Thô (ADR-015)
npm run test:proposals

# 13. Bộ 23 Ca kiểm thử chính thức toàn hệ thống (TC-01 đến TC-23)
npm run test:e2e
```

---

## 6. TIÊU CHUẨN GIAO DIỆN & HIỆU NĂNG ĐẶC THÙ
- **Zero-Page-Scroll:** Mọi trang Admin (`/admin/**`) và Login (`/login`) cố định `100vh` (`window.scrollY === 0`). Dữ liệu cuộn nội bộ trong container con `overflow-y-auto`.
- **Progressive Item Rendering (`useProgressiveItems`):** Chuyển tab giữa các danh mục lớn (114 chuyên đề, 6 bảng thống kê, 34 tỉnh) hiển thị ngay lô đầu tiên trong <16ms, không đơ trình duyệt.
- **Zero-PII Compliance:** Tuyệt đối không thu thập Họ tên, SĐT, Email, CCCD trên toàn bộ hệ thống.
