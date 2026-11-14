# 04. NON-FUNCTIONAL REQUIREMENTS — YÊU CẦU PHI CHỨC NĂNG

## 1. YÊU CẦU VỀ HIỆU NĂNG (PERFORMANCE)
- **Quy mô người dùng (Capacity):**
  - Hệ thống phục vụ 34 tỉnh/thành phố với 3.321 đơn vị hành chính cấp xã.
  - Dự kiến quy mô mỗi đợt: từ 5.000 đến 30.000 cán bộ tham gia.
  - Năng lực chịu tải đồng thời (Concurrency): Tối thiểu **1.000 người dùng đồng thời (CCU)** làm khảo sát và nộp phiếu mà không bị nghẽn mạch hoặc quá tải database.
- **Thời gian phản hồi (Response Times):**
  - Thời gian tải trang ban đầu (First Contentful Paint - FCP): $\le 1.2$ giây trên mạng 4G tiêu chuẩn.
  - Thời gian xử lý nộp phiếu (Submit Survey API): $\le 500$ ms.
  - Thời gian tính toán và kết xuất 6 Bảng tổng hợp (B1 - B6) cho 1 tỉnh: $\le 1.5$ giây.
  - Thời gian xuất file Excel tổng hợp toàn bộ chiến dịch: $\le 5$ giây.
- **Tối ưu hóa tài nguyên mạng:** Dung lượng gói tải trang công khai $\le 300$ KB (gzipped), tối ưu nén tài nguyên tĩnh và phông chữ Unicode Tiếng Việt.

---

## 2. BẢO MẬT VÀ QUYỀN RIÊNG TƯ (SECURITY & PRIVACY)
- **Nguyên tắc bảo vệ danh tính tuyệt đối (No PII):**
  - Cơ sở dữ liệu và API tuyệt đối không lưu trữ, không yêu cầu và không suy đoán Họ tên, Số điện thoại, Email, Số CCCD, Địa chỉ IP cá nhân của người tham gia.
- **Bảo vệ ranh giới thống kê (Statistical Disclosure Limitation):**
  - Bắt buộc áp dụng thuật toán Primary & Secondary Suppression với ngưỡng dưới 5 người cho toàn bộ dữ liệu công bố ra bên ngoài.
- **Mã hóa và An toàn truyền thông:**
  - Bắt buộc giao thức HTTPS với chuẩn TLS 1.3.
  - Session quản trị viên lưu trong HTTP-Only, Secure, SameSite=Lax Cookies để chống tấn công XSS và CSRF.
  - Mật khẩu tài khoản quản trị được mã hóa bằng thuật toán `bcrypt` với cost factor $\ge 12$ hoặc `Argon2id`.
- **Chống lạm dụng & Tấn công mạng (Anti-abuse & Rate Limiting):**
  - Áp dụng Rate Limiting trên API nộp phiếu: tối đa 10 requests / phút / IP để ngăn chặn bot spam.
  - Xác thực CSRF Token trên mọi hành động nộp dữ liệu.
  - Sanitization toàn bộ các trường nhập tự do (Câu 7, Câu 14) để chống tấn công HTML/Script Injection.
- **Nhật ký kiểm toán (Audit Trail):**
  - Ghi nhận toàn bộ các thao tác quản trị nhạy cảm: Đăng nhập, thay đổi cấu hình đợt khảo sát, đóng/mở liên kết, xuất báo cáo, gắn cờ phiếu nghi trùng vào collection `AuditLog`.

---

## 3. ĐỘ SẴN SÀNG VÀ ĐỘ TIN CẬY (AVAILABILITY & RELIABILITY)
- **Độ sẵn sàng (Uptime SLA):** Đạt tối thiểu **99.9%** trong suốt thời gian các đợt khảo sát mở phiếu (khoảng 3 tuần mỗi đợt).
- **Tính toàn vẹn dữ liệu (Zero Data Loss):**
  - Một phiếu sau khi có thông báo "Đã gửi thành công" phải được ghi nhận bền vững (durable write) trong MongoDB với write concern `w: "majority"`.
  - Sao lưu cơ sở dữ liệu tự động định kỳ hàng ngày (Automated Daily Backups) và sao lưu tức thời trước/sau khi đóng đợt khảo sát.
- **Xử lý sự cố và phục hồi (Disaster Recovery):**
  - RPO (Recovery Point Objective): $\le 1$ giờ.
  - RTO (Recovery Time Objective): $\le 30$ phút.

---

## 4. KHẢ NĂNG SỬ DỤNG VÀ TRẢI NGHIỆM NGƯỜI DÙNG (USABILITY & UX)
- **Tính tương thích đa thiết bị (Responsive Design):**
  - Tối ưu hóa 100% giao diện cho màn hình điện thoại thông minh (từ iPhone SE màn hình nhỏ đến các dòng máy Android phổ biến) và máy tính để bàn/laptop.
  - Cỡ chữ tối thiểu 16px trên di động để chống hiện tượng tự động zoom trên iOS Safari.
  - Vùng bấm (Touch Target) cho các nút radio, checkbox tối thiểu $44 \times 44$ px.
- **Thời gian hoàn thành khảo sát:**
  - Được thiết kế luồng câu hỏi mượt mà, ước tính từ 8 đến 17 phút tùy vị trí.
  - Hiển thị thanh tiến trình trực quan (% hoàn thành) và bộ đếm thời gian ước lượng còn lại.
- **Trạng thái kết nối mạng yếu (Offline / Low Bandwidth Resilience):**
  - Lưu trạng thái form tạm thời trên `sessionStorage` của trình duyệt người dùng để nếu bị ngắt kết nối mạng hoặc vô tình reload trang khi đang trả lời, dữ liệu không bị mất trắng.
  - Cảnh báo rõ ràng nếu người dùng bấm nộp phiếu khi mất kết nối Internet.

---

## 5. KHẢ NĂNG BẢO TRÌ VÀ MỞ RỘNG (MAINTAINABILITY & EXTENSIBILITY)
- **Kiến trúc module hóa (Modular Architecture):**
  - Codebase phân tầng rõ ràng: Presentation Layer (Next.js components) → Domain/Service Layer → Data Access Layer (Mongoose models).
  - TypeScript Strict Mode 100%, không sử dụng kiểu dữ liệu `any` vô nguyên tắc.
- **Khả năng mở rộng trong tương lai:**
  - Sẵn sàng mở rộng thêm các bộ phiếu khảo sát khác của ngành Kiểm toán / Bộ ngành khác ngoài phạm vi cấp xã/phường thông qua mô hình Survey Engine động.
  - Hỗ trợ triển khai linh hoạt: Container Docker, Node.js runtime độc lập, hoặc Serverless trên hạ tầng đám mây.
