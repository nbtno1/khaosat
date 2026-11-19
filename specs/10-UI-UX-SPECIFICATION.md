# 10. UI/UX SPECIFICATION — THIẾT KẾ GIAO DIỆN VÀ TRẢI NGHIỆM NGƯỜI DÙNG

## 1. HỆ THỐNG THIẾT KẾ (DESIGN SYSTEM)
- **Phong cách chủ đạo:** Giao diện công vụ hiện đại, tối giản, trang trọng, lấy người dùng làm trung tâm (User-Centered).
- **Thư viện UI:** `shadcn/ui` kết hợp `Tailwind CSS v4`.
- **Bảng màu chủ đạo (Color Palette):**
  - *Primary (Xanh Kiểm toán):* `hsl(215, 80%, 35%)` — Thể hiện tính chính xác, nghiêm cẩn, tin cậy của Kiểm toán nhà nước.
  - *Secondary / Accent:* `hsl(199, 89%, 48%)` — Điểm nhấn cho các nút hành động, thanh tiến trình.
  - *Success:* `hsl(142, 71%, 45%)` — Trạng thái nộp thành công, phiếu hợp lệ.
  - *Warning:* `hsl(38, 92%, 50%)` — Cảnh báo phiếu nghi trùng, thông báo thoát sớm.
  - *Destructive:* `hsl(0, 84%, 60%)` — Thao tác hủy, loại phiếu, báo lỗi.
  - *Background:* `hsl(210, 20%, 98%)` (Light mode dịu mắt, độ tương phản cao đạt chuẩn WCAG 2.1 AA).
- **Typography:** Phông chữ tiếng Việt hiện đại `Be Vietnam Pro` (tải qua `next/font/google`), fallback `Segoe UI Variable`, `system-ui`, `sans-serif`.
  - **Cổng Quản trị (Admin):** Tiêu đề trang `24–28px`, menu `15.5px` (cao `44px`), bảng dữ liệu `15.5–16px`, số KPI `32–36px` (`tabular-nums`), không dùng chữ `10–12px` cho nhãn nghiệp vụ.
  - **Cổng Khảo sát (Public):** Câu hỏi `20–21px`, ô chọn (`Select`) và đáp án `17.5–18px` (chiều cao vùng bấm `50–54px`) trên cả Desktop và Di động.

---

## 2. GIAO DIỆN CỔNG KHẢO SÁT CÔNG KHAI (PUBLIC SURVEY PORTAL)

Tối ưu hóa tuyệt đối cho trải nghiệm trên điện thoại thông minh (Mobile First).

### 2.1. Cấu trúc Thanh điều hướng & Tiến trình (Top Header)
- **Thành phần:**
  - Logo Kiểm toán nhà nước & Tên bộ phiếu "Khảo sát Nhu cầu Đào tạo Cấp Xã (Phiên bản 3.3)".
  - Huy hiệu (Badge): "Thời gian ước tính: ~12-16 phút".
  - Thanh tiến trình động (Progress Bar): Thể hiện % hoàn thành (Bước 1/4 → 2/4 → 3/4 → 4/4).

### 2.2. Chi tiết 4 Bước Khảo sát

#### BƯỚC 1: THÔNG TIN CHUNG (PHẦN I)
- **Bố cục:** Form dạng thẻ nổi (Card), các trường nhập liệu có nhãn rõ ràng:
  - Tỉnh/Thành phố: Cố định theo đường dẫn tỉnh hoặc danh sách chọn.
  - Xã/Phường: Dropdown chọn có tính năng tìm kiếm nhanh (Searchable Select).
  - Cơ quan, đơn vị: Dropdown 11 cơ quan.
  - Vị trí việc làm: Dropdown vị trí tương ứng. Khi chọn "Vị trí khác", xuất hiện thêm ô Input text với gợi ý "Vui lòng ghi rõ chức danh công việc của anh/chị".
  - Tư cách: Bộ Checkbox chọn nhiều (Cán bộ, Công chức, Viên chức...).
  - Số năm kinh nghiệm: Bộ Radio button 3 mức (Dưới 1 năm / 1-3 năm / Trên 3 năm).
- **Hành động:** Nút "Tiếp tục" (Next) lớn, nổi bật ở cuối màn hình. Tự động kiểm tra lỗi (validate) trước khi chuyển bước.

#### BƯỚC 2: CÔNG VIỆC ANH/CHỊ ĐƯỢC GIAO (PHẦN II)
- **Bố cục:**
  - Banner hướng dẫn: "Các nhóm công việc gắn với vị trí của anh/chị đã được tự động xếp lên đầu danh sách để thuận tiện lựa chọn. Anh/chị vui lòng xem hết các nhóm và khai đúng phần việc thực tế".
  - Danh sách 16 nhóm công việc:
    - Trên Desktop: Bảng biểu với 4 cột radio trực quan.
    - Trên Mobile: Mỗi nhóm là một Card riêng biệt, gồm tiêu đề nhóm in đậm, đoạn văn bản mô tả ngắn (kèm nút xem thêm "Gồm những việc như..."), và 4 nút chọn kích thước lớn ($44\times 44$ px) cho 4 trạng thái:
      1. Đang thực hiện
      2. Được giao, chưa có dịp
      3. Chỉ phối hợp (có tooltip giải thích rõ)
      4. Không được giao
  - Câu 7 (Việc khác): Ô TextArea cho phép nhập tối đa 300 ký tự (có bộ đếm ký tự thực tế).
- **Xử lý UX Rẽ nhánh:**
  - Nếu người dùng chọn toàn bộ 16 nhóm là "Không được giao" hoặc "Chỉ phối hợp": Hệ thống hiển thị hộp thoại thông báo màu xanh nhạt:
    > "Anh/chị không trực tiếp thực hiện hoặc tham mưu các nhóm công việc trong danh mục này. Sau khi nhập công việc khác (nếu có), phiếu sẽ kết thúc. Trân trọng cảm ơn anh/chị."
  - Nút bấm đổi thành "Gửi phiếu kết thúc".

#### BƯỚC 3: ĐÁNH GIÁ THEO TỪNG NHÓM CÔNG VIỆC (PHẦN III)
- **Bố cục Vòng lặp:**
  - Thanh chỉ số nhóm: "Đang đánh giá nhóm 1 / tổng số 5 nhóm được giao".
  - Mỗi nhóm công việc hiển thị đầy đủ:
    - **Câu 8 (Vai trò):** 4 Checkbox có kèm định nghĩa ngắn (Trực tiếp thực hiện / Tham mưu / Kiểm tra / Quyết định).
    - **Câu 9 (Mức tự đánh giá):** Render các hàng tương ứng với vai trò đã chọn ở Câu 8. Mỗi hàng hiển thị 4 mức tự đánh giá, khi rê chuột hoặc bấm vào từng mức sẽ bung ra câu mô tả ngữ cảnh tương ứng của vai trò đó.
    - **Câu 10 (Khó khăn):** Chỉ xuất hiện nếu nhóm là "Đang thực hiện". Danh sách Chip chọn tối đa 2 mục. Khi bấm chọn "Không gặp khó khăn đáng kể", toàn bộ các mục khác tự động bỏ chọn và bị vô hiệu hóa tạm thời.
    - **Câu 11 (Nội dung cần học):** Danh sách Checkbox các chuyên đề của nhóm đó + Ô "Khác".
    - **Câu 12 (Mức độ cần học):** 3 Radio button (Cần học ngay trong 6 tháng / Trong năm / Sau 1 năm). Tự động hiển thị khi Câu 11 có chọn ít nhất 1 mục.
- **Điều hướng:** Hỗ trợ nút "Quay lại" (Back) và "Nhóm tiếp theo" (Next). Khi bấm Quay lại, toàn bộ lựa chọn cũ vẫn được giữ nguyên vẹn.

#### BƯỚC 4: HÌNH THỨC HỌC VÀ Ý KIẾN KHÁC (PHẦN IV)
- **Bố cục:**
  - Câu 13: 5 ô chọn hình thức học (cho phép chọn tối đa 2, tự động khóa khi đã chọn đủ 2).
  - Câu 14: Ô TextArea góp ý (tối đa 500 ký tự, có đếm ký tự).
  - Tóm tắt xác nhận: Bảng tóm tắt các thông tin chính đã khai báo.
  - Nút bấm: "XÁC NHẬN VÀ GỬI PHIẾU" (Nút Primary lớn, có hiệu ứng loading spinner khi đang gửi).

#### MÀN HÌNH HOÀN THÀNH (SUCCESS SCREEN)
- Icon tích xanh động (Checkmark animation).
- Tiêu đề: "Đã gửi thành công!".
- Lời cảm ơn trang trọng từ Trường Đào tạo và Bồi dưỡng nghiệp vụ kiểm toán.
- Khóa toàn bộ form, không cho phép gửi lại để chống trùng lặp.

---

## 3. GIAO DIỆN PHÂN HỆ QUẢN TRỊ (ADMIN MANAGEMENT PORTAL)

### 3.1. Bố cục Tổng thể (Layout Architecture)
- **Sidebar bên trái:**
  - Dashboard tổng quan (Tổng số phản hồi, tỷ lệ hoàn thành, số xã tham gia).
  - Quản lý đợt khảo sát & Mã QR.
  - Theo dõi tiến độ (Tiến độ tỉnh/xã, biểu đồ thời gian thực).
  - Trung tâm rà soát phiếu nghi trùng (Duplicate Review Workbench).
  - Báo cáo 6 Bảng tổng hợp (Analytics Explorer).
  - Xuất báo cáo Excel.
  - Quản trị tài khoản & Phân quyền.
  - Nhật ký hệ thống (Audit Logs).
- **Header:** Thông tin người dùng đăng nhập, cơ quan công tác, nút chuyển đổi theme (Light/Dark), nút Đăng xuất.

### 3.2. Trung tâm Rà soát Phiếu Nghi trùng (Duplicate Review Workbench)
- Danh sách các nhóm nghi trùng hiển thị dưới dạng Accordion.
- Giao diện so sánh song song (Side-by-side Diff View):
  - Hiển thị thời điểm nộp (Timestamp), xã/phường, chức danh, câu trả lời Phần III, IV của từng phiếu trong nhóm.
  - Nổi bật các điểm khác biệt (nếu có).
- Hộp hành động cho Chuyên viên thẩm tra:
  - Nút "Xác nhận Hợp lệ" (Valid).
  - Nút "Loại trừ Phiếu này" (Exclude) kèm popup nhập bắt buộc lý do loại trừ (ví dụ: "Người nộp gửi lại do sai sót ở phiếu trước").

### 3.3. Trình Khám phá 6 Bảng Tổng hợp (Analytics Explorer)
- Thanh công cụ phía trên:
  - Bộ lọc Đợt khảo sát (Campaign).
  - Bộ lọc Địa phương (Tỉnh/Thành phố).
  - Bộ lọc Cơ quan/Đơn vị.
  - Nút chuyển chế độ: "Bản Nội bộ (Đầy đủ)" vs "Bản Gửi Địa phương (Đã ẩn danh < 5 người)" (chỉ dành cho tài khoản có quyền).
- Khu vực hiển thị Tab: 6 tab tương ứng B1, B2, B3, B4, B5, B6.
  - Bảng B3 hiển thị biểu đồ phân bố khoảng thiếu hụt (Bar Chart) trực quan bên cạnh bảng số liệu.
  - Các ô bị ẩn danh được đánh dấu màu xám nhạt với nhãn `"dưới 5 - không công bố"`.
  - Nút "Xuất Excel" xuất hiện ở góc phải trên từng bảng.
