# 14. ACCEPTANCE CRITERIA — TIÊU CHÍ CHẤP NHẬN BÀN GIAO HỆ THỐNG

Tài liệu này xác lập Định nghĩa Hoàn thành (Definition of Done - DoD) và các tiêu chí nghiệm thu bắt buộc đối với từng module và toàn bộ hệ thống `khaosat`.

---

## 1. ĐỊNH NGHĨA HOÀN THÀNH CHUNG (DEFINITION OF DONE - DoD)
Một task hoặc một module chỉ được coi là hoàn thành (`DONE`) khi đáp ứng đầy đủ 7 điều kiện sau:
1. **Tuân thủ Spec:** Mã nguồn được triển khai khớp 100% với đặc tả kỹ thuật tương ứng trong `./specs/`.
2. **Không có lỗi Typecheck & Lint:** Lệnh `npm run typecheck` và `npm run lint` chạy thành công không có cảnh báo hoặc lỗi; không sử dụng kiểu `any` tùy tiện.
3. **Độ bao phủ Test:** Đã viết đầy đủ Unit Test và Integration Test tương ứng; vượt qua toàn bộ các ca kiểm thử liên quan.
4. **Không để lại Mock Data:** Tuyệt đối không còn dữ liệu giả (mock data), hàm giả (stub logic) hay cờ test hardcode trong code production.
5. **Giao diện chuẩn Responsive:** Hoạt động mượt mà, không vỡ layout trên cả màn hình di động (tối thiểu 360px chiều rộng) và màn hình máy tính (1920x1080).
6. **Xử lý Ngoại lệ Toàn diện:** Có đầy đủ trạng thái Loading (Skeleton/Spinner), Empty state và Error boundary thân thiện bằng tiếng Việt.
7. **Cập nhật Tài liệu:** Đã cập nhật trạng thái trong `specs/TASKS.md`, `specs/PROGRESS.md` và `specs/REQUIREMENTS-TRACEABILITY.md`.

---

## 2. BẢNG TIÊU CHÍ NGHIỆM THU THEO TỪNG PHÂN HỆ

### Phân hệ 1: Cổng Khảo sát Trực tuyến (Public Survey Portal)
- [ ] **AC-01:** Người dùng quét mã QR hoặc click link của một tỉnh mở đúng giao diện khảo sát; Câu 1 chỉ hiển thị danh sách xã/phường thuộc tỉnh đó.
- [ ] **AC-02:** Chọn Vị trí việc làm tại Câu 3 làm thay đổi thứ tự ưu tiên của danh mục 16 nhóm công việc tại Câu 6 (nhóm gợi ý được xếp lên trước) mà không tự động chọn sẵn bất kỳ ô nào.
- [ ] **AC-03:** Người dùng chọn toàn bộ 16 nhóm là "Không được giao" hoặc "Chỉ phối hợp" sẽ kích hoạt luồng kết thúc sớm (Early Exit) sau Câu 7, ẩn Phần III và IV, ghi nhận đúng cờ `isOutOfScope = true`.
- [ ] **AC-04:** Phần III lặp chính xác số nhóm công việc hợp lệ.
- [ ] **AC-05:** Câu 9 hiển thị đúng mô tả ngữ cảnh tương ứng với vai trò đã chọn tại Câu 8.
- [ ] **AC-06:** Câu 10 (Khó khăn) chỉ xuất hiện với nhóm "Đang thực hiện", bị ẩn với nhóm "Chưa có dịp". Cho phép chọn tối đa 2 mục; chọn mục độc quyền "Không khó khăn" thì tự động hủy chọn các mục khác.
- [ ] **AC-07:** Câu 12 (Mức độ cần học) chỉ hiển thị khi Câu 11 có chọn ít nhất 1 nội dung.
- [ ] **AC-08:** Thao tác Quay lại (Back) và đổi lựa chọn tại Câu 6 hoặc Câu 8 tự động dọn dẹp sạch sẽ các câu trả lời lỗi thời tại Phần III.
- [ ] **AC-09:** Nút "Gửi" bị khóa ngay khi bấm, chống gửi đúp; chỉ ghi nhận khi xuất hiện màn hình thông báo "Đã gửi thành công".
- [ ] **AC-10:** Tuyệt đối không thu thập Họ tên, Điện thoại, Email, Số CCCD.

---

### Phân hệ 2: Quản trị Chiến dịch & Liên kết (Campaign & Link Management)
- [ ] **AC-11:** Quản trị viên tạo được đợt khảo sát mới, chọn danh sách tỉnh và hệ thống tự động sinh link bảo mật + mã QR cho từng tỉnh.
- [ ] **AC-12:** Đóng đợt khảo sát hoặc tạm dừng liên kết khiến đường dẫn đó từ chối nhận phiếu mới ngay lập tức (hiển thị trang thông báo hết hạn).
- [ ] **AC-13:** Đổi mã token của một liên kết không làm mất hoặc sai lệch các phản hồi đã thu nhận trước đó.
- [ ] **AC-14:** Đường dẫn trả lời thử (`pilot`) được tách biệt hoàn toàn, dữ liệu thử nghiệm không bị gộp vào kết quả khảo sát chính thức.

---

### Phân hệ 3: Kiểm soát Trùng lặp & Rà soát (Duplicate Review Center)
- [ ] **AC-15:** Hệ thống tự động phát hiện và gắn cờ `isSuspectedDuplicate = true` cho các phiếu cùng xã, đơn vị, vị trí và giống hệt 16 nhóm công việc.
- [ ] **AC-16:** Phiếu nghi trùng không bị tự động xóa mà xuất hiện trong giao diện thẩm tra của chuyên viên.
- [ ] **AC-17:** Chuyên viên có thể so sánh trực quan (Side-by-side Diff) các phiếu trong nhóm trùng và đưa ra quyết định Tính (`VALID`) hoặc Loại trừ (`EXCLUDED`) kèm lý do bắt buộc.
- [ ] **AC-18:** Phiếu bị loại trừ (`EXCLUDED`) bị loại khỏi toàn bộ các Bảng B1 - B6, số lượng và lý do loại được thống kê minh bạch tại Bảng B1.

---

### Phân hệ 4: Tổng hợp Số liệu & Báo cáo 6 Bảng Chuẩn (Analytics Engine)
- [ ] **AC-19:** Bảng B1 thống kê chính xác số người tham gia, số người ngoài đối tượng, cơ cấu theo tư cách và số phiếu không tính.
- [ ] **AC-20:** Bảng B2 thống kê 16 nhóm công việc, tổng 4 cột của từng hàng luôn bằng 100% số người được tổng hợp.
- [ ] **AC-21:** Bảng B3 tính đúng chỉ số khoảng thiếu hụt: so khớp điểm tự đánh giá với mức yêu cầu trong Benchmark Matrix, phân bố chính xác số người thiếu 1, 2, 3 mức. Tiêu đề bảng có nhãn bắt buộc: *"khoảng thiếu hụt theo tự đánh giá - không đồng nhất với năng lực thực tế đã được kiểm chứng"*.
- [ ] **AC-22:** Bảng B4 thống kê chi tiết nhu cầu theo chuyên đề, tách biệt người đang làm và người chuẩn bị nhận việc.
- [ ] **AC-23:** Bảng B5 thống kê khó khăn và ghi rõ nhãn "ngoài đào tạo" với hướng dẫn, quy trình, nhân lực, công cụ.
- [ ] **AC-24:** Bảng B6 thống kê 5 hình thức học và các giới hạn dữ liệu.

---

### Phân hệ 5: Bảo vệ Ẩn danh & Xuất Báo cáo Excel
- [ ] **AC-25:** Thuật toán Primary Suppression tự động chuyển các ô đếm có giá trị từ 1 đến 4 thành `"dưới 5 - không công bố"`; ô có giá trị bằng 0 được hiển thị `0`.
- [ ] **AC-26:** Thuật toán Row Suppression tự động ẩn toàn bộ dòng nếu mẫu số của dòng đó từ 1 đến 4.
- [ ] **AC-27:** Thuật toán Secondary Suppression tự động tìm và ẩn thêm ô nhỏ nhất kế tiếp nếu trong hàng/cột có tổng chỉ có đúng 1 ô bị ẩn.
- [ ] **AC-28:** Tài khoản Đầu mối địa phương (`LOCAL_COORDINATOR`) chỉ xem được số liệu tỉnh mình đã áp dụng Suppression, tuyệt đối không xem được dữ liệu gốc hoặc số liệu của tỉnh khác.
- [ ] **AC-29:** File Excel xuất ra có đầy đủ 6 sheet B1 - B6, định dạng bảng biểu chuyên nghiệp, in đúng số phiên bản bộ phiếu (3.3) ở tiêu đề, không bị lỗi font tiếng Việt Unicode.
- [ ] **AC-30:** Đạt tỷ lệ 23/23 ca kiểm thử chuẩn (từ TC-01 đến TC-23) đều chạy thành công (Pass 100%).
