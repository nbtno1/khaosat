# KHAOSAT — HỆ THỐNG QUẢN LÝ KHẢO SÁT NĂNG LỰC TÀI CHÍNH, TÀI SẢN CÔNG CẤP XÃ/PHƯỜNG

Dự án phần mềm phục vụ khảo sát nhu cầu đào tạo và xác định khoảng thiếu hụt năng lực theo tự đánh giá đối với công việc quản lý, sử dụng tài chính, tài sản công ở cấp xã, phường (thuộc Trường Đào tạo và Bồi dưỡng nghiệp vụ kiểm toán - Kiểm toán nhà nước).

Dự án áp dụng phương pháp luận **Spec-Driven Development (SDD)**.

---

## 1. CẤU TRÚC THƯ MỤC

```text
khaosat/
├── .agents/
│   └── rules/
│       └── project.md                    # Quy tắc Workspace duy trì ngữ cảnh SDD
├── docs/                                 # 20 tài liệu nghiệp vụ gốc (Bộ phiếu phiên bản 3.3)
├── specs/                                # Trọn bộ 22 tài liệu Đặc tả Kỹ thuật hoàn chỉnh
│   ├── 00-PROJECT-OVERVIEW.md            # Tổng quan dự án & Tech Stack
│   ├── 01-DOCUMENT-INVENTORY.md          # Danh mục & trạng thái đọc 20 tài liệu
│   ├── 02-BUSINESS-REQUIREMENTS.md       # Yêu cầu nghiệp vụ & Ranh giới pháp lý
│   ├── 03-FUNCTIONAL-REQUIREMENTS.md     # Yêu cầu chức năng FR-001 đến FR-023
│   ├── 04-NON-FUNCTIONAL-REQUIREMENTS.md # Yêu cầu phi chức năng (Hiệu năng, Bảo mật, SLA)
│   ├── 05-USER-ROLES-AND-USE-CASES.md    # Phân quyền 5 nhóm tài khoản & 15 Use Cases
│   ├── 06-BUSINESS-WORKFLOWS.md          # 5 Sơ đồ quy trình Mermaid nghiệp vụ
│   ├── 07-SYSTEM-ARCHITECTURE.md         # Kiến trúc hệ thống Clean Architecture Next.js
│   ├── 08-DATABASE-DESIGN.md             # Thiết kế 8 MongoDB Collections & Schemas
│   ├── 09-API-SPECIFICATION.md           # Đặc tả OpenAPI 3.0 RESTful Route Handlers
│   ├── 10-UI-UX-SPECIFICATION.md         # Thiết kế UI/UX Mobile-First & Review Workbench
│   ├── 11-SECURITY-SPECIFICATION.md      # Mô hình STRIDE, Zero-PII & Thuật toán Suppression
│   ├── 12-VALIDATION-AND-BUSINESS-RULES.md # 12 Quy tắc hiển thị chuẩn & Công thức toán học
│   ├── 13-TEST-STRATEGY.md               # Kim tự tháp kiểm thử & Bộ 23 Ca kiểm thử chuẩn
│   ├── 14-ACCEPTANCE-CRITERIA.md         # Tiêu chuẩn nghiệm thu AC-01 đến AC-30 (DoD)
│   ├── 15-DEVELOPMENT-ROADMAP.md         # Lộ trình 7 Milestones & Phạm vi MVP
│   ├── 16-DEPLOYMENT-SPECIFICATION.md    # Đặc tả hạ tầng, Dockerfile & Kịch bản sao lưu
│   ├── REQUIREMENTS-TRACEABILITY.md      # Ma trận truy vết Yêu cầu (RTM)
│   ├── ASSUMPTIONS-AND-OPEN-QUESTIONS.md # Giả định kỹ thuật & 3 vấn đề cần phê duyệt
│   ├── DECISIONS.md                      # 7 Bản ghi quyết định kiến trúc (ADR-001 đến ADR-007)
│   ├── TASKS.md                          # Task Backlog 16 nhiệm vụ chi tiết
│   ├── PROGRESS.md                       # Báo cáo tiến độ thời gian thực
│   └── CHANGELOG.md                      # Lịch sử thay đổi hệ thống
├── src/                                  # Mã nguồn ứng dụng (Bắt đầu sau khi duyệt Spec)
└── README.md                             # Hướng dẫn tổng quan dự án
```

---

## 2. TECHNOLOGY STACK
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript (Strict Mode).
- **UI & Styling:** Tailwind CSS v4, shadcn/ui, Lucide React Icons.
- **Form & Validation:** React Hook Form + Zod.
- **Biểu đồ & Thống kê:** Recharts.
- **Xuất Báo cáo:** ExcelJS.
- **Backend & Database:** Next.js Route Handlers (REST APIs) + MongoDB 7.0 (Mongoose ODM).
- **Xác thực:** Auth.js (NextAuth v5) với phân quyền RBAC đa cấp.
- **Kiểm thử:** Jest, React Testing Library, Playwright E2E.

---

## 3. TRẠNG THÁI HIỆN TẠI
- Đã hoàn thành 100% Giai đoạn 1 (Đọc và phân tích tài liệu).
- Đã hoàn thành 100% Giai đoạn 2 (Xây dựng trọn bộ Spec kỹ thuật).
- **Đang tạm dừng theo đúng quy tắc SDD: Chưa viết mã nguồn ứng dụng (`src/`).**
- Chờ Phê duyệt từ người dùng/lãnh đạo để bắt đầu triển khai Milestone 1 trong `specs/TASKS.md`.
