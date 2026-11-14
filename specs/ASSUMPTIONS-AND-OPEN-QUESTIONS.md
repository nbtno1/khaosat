# ASSUMPTIONS AND OPEN QUESTIONS — GIẢ ĐỊNH VÀ CÁC VẤN ĐỀ CẦN QUYẾT ĐỊNH

## 1. CÁC GIẢ ĐỊNH KỸ THUẬT VÀ NGHIỆP VỤ (ASSUMPTIONS)

1. **Giả định về Bộ danh mục hành chính cấp Xã/Phường sau sắp xếp 2025:**
   - *Giả định:* Hệ thống sử dụng danh mục gồm 34 đơn vị hành chính cấp tỉnh và 3.321 đơn vị hành chính cấp xã theo số liệu chốt trong văn bản Phương án triển khai. Trong giai đoạn MVP, hệ thống sẽ seed sẵn danh mục chuẩn phân cấp Tỉnh/Xã từ cơ sở dữ liệu quốc gia về đơn vị hành chính.
   - *Mức độ chắc chắn:* Cao (95%). Căn cứ: `Phương án triển khai...` Mục I.4 dòng [7].

2. **Giả định về Phương thức phát hành và Bảo mật Liên kết:**
   - *Giả định:* Không phát hành một đường link chung cho toàn quốc. Mỗi tỉnh có một URL bảo mật và mã QR riêng biệt. Đường dẫn này được Trường gửi qua đường công văn cho đầu mối địa phương, không niêm yết công khai trên Cổng thông tin điện tử để tránh người ngoài không liên quan vào làm sai lệch số liệu.
   - *Mức độ chắc chắn:* Tuyệt đối (100%). Căn cứ: `Phương án triển khai...` Mục II.1 & II.4.

3. **Giả định về Quản lý Phiếu nghi trùng:**
   - *Giả định:* Khi phát hiện 2 hay nhiều phiếu có cùng Xã, cùng Cơ quan, cùng Vị trí và trả lời 16 nhóm công việc giống hệt nhau, hệ thống **không bao giờ tự động xóa**. Toàn bộ các phiếu này được giữ nguyên và hiển thị trên giao diện thẩm tra để chuyên viên Khoa Cơ sở / Chuyên ngành ra quyết định bằng tay.
   - *Mức độ chắc chắn:* Tuyệt đối (100%). Căn cứ: `Phương án triển khai...` Mục V.5 dòng [148].

4. **Giả định về Cơ chế Xác thực Quản trị:**
   - *Giả định:* Giai đoạn MVP sử dụng giải pháp xác thực tài khoản nội bộ (Username/Password) qua Auth.js v5 kèm phân quyền RBAC đa cấp, lưu trữ mật khẩu băm an toàn trong MongoDB. Chưa cần tích hợp hệ thống SSO tập trung của ngành Kiểm toán trong giai đoạn 1.
   - *Mức độ chắc chắn:* Cao (90%).

5. **Giả định về Tài liệu trùng lặp trong thư mục docs:**
   - *Giả định:* File `Phieu số 09_Giam đốc_Phó GĐ Trung tâm (1).docx` có mã băm MD5 trùng khớp 100% với file `Phieu số 09_Giam đốc_Phó GĐ Trung tâm.docx`. Đây là file sao chép trùng lặp, nội dung khảo sát của vị trí này được quy định thống nhất tại biểu mẫu Phiếu số 9.
   - *Mức độ chắc chắn:* Tuyệt đối (100%).

---

## 2. CÁC VẤN ĐỀ MỞ CẦN PHÊ DUYỆT (OPEN QUESTIONS FOR DECISION)

### Vấn đề 1: Danh mục đơn vị hành chính 3.321 Xã/Phường
- **Câu hỏi:** Bạn đã có sẵn file danh mục Excel chuẩn của 34 tỉnh và 3.321 xã/phường sau sắp xếp hành chính năm 2025 chưa, hay chúng tôi sẽ tạo danh mục hạt giống (seed data) mẫu gồm các tỉnh đại diện và cấu trúc chuẩn để nạp bổ sung sau?
- **Đề xuất của AI:** Trong giai đoạn khởi tạo, nạp đầy đủ danh mục các tỉnh/thành phố và các xã điểm phục vụ đợt trả lời thử (Pilot) gồm 3-4 xã, đồng thời cung cấp công cụ nạp tự động (import script) từ file Excel khi có danh mục chính thức.

### Vấn đề 2: Xuất hàng loạt Mã QR cho 34 Tỉnh
- **Câu hỏi:** Phía Trường Đào tạo có nhu cầu xuất gói nén `.zip` chứa toàn bộ ảnh mã QR (dạng `.png` độ phân giải cao kèm tên tỉnh) để tiện chèn vào văn bản gửi địa phương không?
- **Đề xuất của AI:** Bổ sung tính năng "Tải trọn bộ Mã QR (.zip)" trên màn hình quản lý đợt khảo sát để tiết kiệm thời gian cho chuyên viên Văn phòng Trường.

### Vấn đề 3: Thời hạn lưu trữ dữ liệu khảo sát
- **Câu hỏi:** Dữ liệu phản hồi gốc và các bản sao lưu có quy định cụ thể về thời gian lưu trữ tối thiểu (ví dụ: 1 năm hay 5 năm) trước khi chuyển vào kho lưu trữ số (Archived) không?
- **Đề xuất của AI:** Mặc định lưu trữ dữ liệu trực tuyến trong suốt thời gian mở đợt và 6 tháng sau khi kết thúc báo cáo, sau đó chuyển sang trạng thái nén lưu trữ (Archived) lâu dài mà không xóa bỏ.
