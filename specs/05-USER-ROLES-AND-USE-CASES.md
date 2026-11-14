# 05. USER ROLES AND USE CASES — TÁC NHÂN VÀ CA SỬ DỤNG

## 1. MA TRẬN PHÂN QUYỀN VAI TRÒ (RBAC MATRIX)

Hệ thống thiết lập 6 vai trò người dùng cụ thể với bảng phân quyền ma trận sau:

| Mã Quyền / Chức năng | Quản trị Kỹ thuật (`TECHNICAL_ADMIN`) | Quản trị Nội dung (`CONTENT_ADMIN`) | Tổng hợp, Rà soát (`REVIEWER`) | Theo dõi Tiến độ (`PROGRESS_MONITOR`) | Đầu mối Địa phương (`LOCAL_COORDINATOR`) | Người khảo sát (`SURVEY_RESPONDENT`) |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Quản lý Tài khoản & Phân quyền** | Toàn quyền (CRUD) | Không | Không | Không | Không | Không |
| **Quản lý Cấu hình Bộ phiếu & Schema** | Sửa kỹ thuật | Toàn quyền duyệt | Chỉ xem | Chỉ xem | Không | Không |
| **Quản lý Đợt khảo sát (Campaign)** | Tạo/Mở/Đóng/Sửa | Tạo/Duyệt | Chỉ xem | Chỉ xem | Không | Không |
| **Sinh & Quản lý Đường dẫn, Mã QR** | Toàn quyền | Xem/Tải QR | Xem/Tải QR | Xem link | Xem link tỉnh mình | Truy cập khảo sát |
| **Làm & Nộp bài Khảo sát Trực tuyến** | Không | Không | Không | Không | Không | Thực hiện |
| **Theo dõi Tiến độ nộp theo Tỉnh/Xã** | Xem toàn quốc | Xem toàn quốc | Xem toàn quốc | Xem toàn quốc | Xem tỉnh mình | Không |
| **Xem Dữ liệu Gốc (Raw Data)** | Xem hệ thống | Xem toàn quốc | Xem toàn quốc | Không | **Tuyệt đối cấm** | Không |
| **Rà soát & Xử lý Phiếu Nghi trùng** | Không can thiệp | Xem kết quả | Đánh giá & Duyệt | Không | Không | Không |
| **Xem 6 Bảng Tổng hợp Nội bộ (Full)** | Xem | Xem | Xem & Phân tích | Xem | **Tuyệt đối cấm** | Không |
| **Xem 6 Bảng Tổng hợp Ẩn danh (<5)** | Xem | Xem | Xem | Xem | Xem tỉnh mình | Không |
| **Xuất Báo cáo Excel Đa bảng** | Toàn quốc | Toàn quốc | Toàn quốc | Không | Xuất tỉnh mình (ẩn) | Không |
| **Nhật ký Hệ thống (Audit Logs)** | Xem toàn bộ | Xem nội dung | Không | Không | Không | Không |

---

## 2. DANH SÁCH CÁC CA SỬ DỤNG (USE CASE CATALOG)

### 2.1. Phân hệ Cán bộ Tham gia Khảo sát (Public Portal)
- **UC-01: Truy cập khảo sát qua Liên kết / Mã QR**
  - *Tác nhân:* Cán bộ, công chức cấp xã.
  - *Mô tả:* Quét mã QR hoặc click link của địa phương. Hệ thống xác thực tính hợp lệ của token và nạp đúng danh mục địa bàn của tỉnh đó.
- **UC-02: Điền thông tin chung (Phần I)**
  - *Tác nhân:* Cán bộ, công chức cấp xã.
  - *Mô tả:* Chọn Tỉnh, Xã; chọn Cơ quan; chọn Vị trí việc làm; chọn Tư cách; chọn Số năm kinh nghiệm.
- **UC-03: Khai báo 16 nhóm công việc (Phần II)**
  - *Tác nhân:* Cán bộ, công chức cấp xã.
  - *Mô tả:* Xem danh sách 16 nhóm công việc (đã ưu tiên xếp nhóm gợi ý theo vị trí lên trước); chọn 1 trong 4 trạng thái cho từng nhóm; khai báo công việc khác nếu có.
- **UC-04: Xử lý Rẽ nhánh & Kết thúc sớm**
  - *Tác nhân:* Cán bộ, công chức cấp xã.
  - *Mô tả:* Nếu tất cả 16 nhóm đều là "Không được giao" hoặc "Chỉ phối hợp", hệ thống thông báo kết thúc khảo sát sớm và ghi nhận là đối tượng ngoài phạm vi công việc.
- **UC-05: Đánh giá Năng lực theo Nhóm công việc (Phần III)**
  - *Tác nhân:* Cán bộ, công chức cấp xã.
  - *Mô tả:* Lần lượt trả lời các nhóm được giao: Chọn vai trò (Câu 8) → Tự đánh giá mức năng lực theo từng vai trò (Câu 9) → Chọn tối đa 2 khó khăn (Câu 10 - chỉ người đang làm) → Chọn nội dung cần học (Câu 11) → Chọn mức độ cần học (Câu 12).
- **UC-06: Khai báo Hình thức học & Ý kiến khác (Phần IV)**
  - *Tác nhân:* Cán bộ, công chức cấp xã.
  - *Mô tả:* Chọn tối đa 2 hình thức học phù hợp và ghi ý kiến đóng góp tự do (tối đa 500 ký tự).
- **UC-07: Gửi bài và Nhận thông báo hoàn tất**
  - *Tác nhân:* Cán bộ, công chức cấp xã.
  - *Mô tả:* Bấm "Gửi", hệ thống kiểm tra hợp lệ, ghi nhận vào database và hiển thị màn hình hoàn thành.

---

### 2.2. Phân hệ Quản trị & Nghiệp vụ (Admin Portal)
- **UC-08: Đăng nhập quản trị**
  - *Tác nhân:* Các nhóm người dùng quản trị.
  - *Mô tả:* Nhập username/password, xác thực và nhận phiên làm việc.
- **UC-09: Quản lý đợt khảo sát & Phát hành liên kết**
  - *Tác nhân:* `TECHNICAL_ADMIN`, `CONTENT_ADMIN`.
  - *Mô tả:* Thiết lập chiến dịch khảo sát, gán địa bàn tỉnh, sinh mã QR, đóng/mở đợt khảo sát.
- **UC-10: Theo dõi tiến độ thời gian thực (Progress Dashboard)**
  - *Tác nhân:* `PROGRESS_MONITOR`, `CONTENT_ADMIN`, `TECHNICAL_ADMIN`.
  - *Mô tả:* Xem số lượng phiếu đã nộp theo ngày, theo từng tỉnh, từng xã; so sánh với số biên chế dự kiến.
- **UC-11: Rà soát & Thẩm tra Phiếu nghi trùng**
  - *Tác nhân:* `REVIEWER`.
  - *Mô tả:* Lọc danh sách phiếu bị gắn cờ trùng (cùng xã, đơn vị, vị trí và 16 nhóm giống hệt), kiểm tra chi tiết và ra quyết định Tính (`VALID`) hoặc Loại trừ (`EXCLUDED`) kèm lý do.
- **UC-12: Xem & Phân tích 6 Bảng Tổng hợp**
  - *Tác nhân:* `REVIEWER`, `CONTENT_ADMIN`.
  - *Mô tả:* Tự động tính toán các chỉ số B1, B2, B3, B4, B5, B6; lọc theo cơ quan, đơn vị; xem bảng khoảng thiếu hụt năng lực.
- **UC-13: Xuất Báo cáo Excel Chuẩn**
  - *Tác nhân:* `REVIEWER`, `CONTENT_ADMIN`, `LOCAL_COORDINATOR`.
  - *Mô tả:* Xuất file Excel đa sheet chuẩn định dạng; hệ thống tự động kiểm tra quyền để xuất bản Nội bộ (đầy đủ số liệu) hoặc bản Gửi địa phương (áp dụng quy tắc ẩn danh ngưỡng 5).
- **UC-14: Quản lý Tài khoản & Phân quyền người dùng**
  - *Tác nhân:* `TECHNICAL_ADMIN`.
  - *Mô tả:* Tạo tài khoản quản trị theo đầu mối cơ quan, cấp quyền, khóa tài khoản khi kết thúc đợt khảo sát.
- **UC-15: Tra cứu Nhật ký Kiểm toán (Audit Logs)**
  - *Tác nhân:* `TECHNICAL_ADMIN`.
  - *Mô tả:* Tìm kiếm và tra cứu lịch sử thao tác của các tài khoản quản trị trên hệ thống.
