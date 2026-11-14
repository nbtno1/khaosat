# 11. SECURITY SPECIFICATION — ĐẶC TẢ AN TOÀN VÀ BẢO MẬT HỆ THỐNG

## 1. MÔ HÌNH NGUY CƠ BẢO MẬT (STRIDE THREAT MODEL)

| Mối đe dọa (STRIDE) | Rủi ro cụ thể trong hệ thống Khảo sát | Biện pháp kiểm soát kỹ thuật áp dụng |
|:---|:---|:---|
| **Spoofing (Giả mạo)** | Giả mạo quản trị viên hoặc giả mạo địa phương nộp phiếu. | - Xác thực Auth.js v5 với mật khẩu băm `bcrypt` (cost 12).<br>- Token định danh đợt/tỉnh bảo mật ngẫu nhiên không thể đoán được. |
| **Tampering (Can thiệp dữ liệu)** | Can thiệp thay đổi câu trả lời hoặc sửa kết quả 6 bảng tổng hợp. | - Ký toàn vẹn dữ liệu nộp bằng Zod schema chặt chẽ.<br>- Dữ liệu phản hồi là bất biến (immutable write); chuyên viên chỉ được đổi trạng thái hợp lệ, không được sửa nội dung câu trả lời. |
| **Repudiation (Chối bỏ trách nhiệm)** | Quản trị viên thay đổi cấu hình hoặc loại phiếu mà không thừa nhận. | - Ghi nhận mọi thao tác vào collection `audit_logs` (thời gian, user ID, IP, hành vi, thay đổi trước/sau). |
| **Information Disclosure (Lộ lọt thông tin)** | - Lộ danh tính cán bộ xã qua phân tích chéo số liệu ít người.<br>- Lộ dữ liệu thô qua API công khai. | - **Chính sách Zero-PII:** Không thu thập họ tên, điện thoại, email, CCCD.<br>- **Thuật toán Suppression:** Bắt buộc ẩn số liệu nhóm dưới 5 người (Primary & Secondary Suppression) cho bản công bố.<br>- Chặn hoàn toàn endpoint đọc danh sách câu trả lời thô ở phía Public API. |
| **Denial of Service (Từ chối dịch vụ)** | Tấn công gửi hàng loạt phiếu ảo làm tràn database hoặc treo server. | - Rate Limiting: Giới hạn tối đa 10 lượt nộp / phút / IP.<br>- CSRF Protection và Cloudflare WAF bảo vệ ở tầng ngoài. |
| **Elevation of Privilege (Leo thang đặc quyền)** | Tài khoản Đầu mối địa phương cố tình xem dữ liệu tỉnh khác hoặc dữ liệu gốc. | - Middleware & Service Layer kiểm tra sở hữu dữ liệu (Tenant Isolation) theo `assignedProvinceCodes`. Báo 403 Forbidden nếu vi phạm. |

---

## 2. NGUYÊN TẮC BẢO MẬT VÀ QUYỀN RIÊNG TƯ (PRIVACY BY DESIGN)

### 2.1. Chính sách Không thu thập Thông tin Định danh (Zero-PII Policy)
- Biểu mẫu khảo sát được thiết kế có chủ đích nhằm loại bỏ toàn bộ các trường định danh cá nhân trực tiếp (Họ tên, Điện thoại, Email, Địa chỉ nhà, Số định danh CCCD).
- Hệ thống không sử dụng Persistent Tracking Cookies trên trình duyệt người tham gia khảo sát.
- Khi người dùng hoàn thành bài khảo sát, session làm việc tại trình duyệt được dọn dẹp sạch sẽ.

### 2.2. Kiểm soát Tiết lộ Thống kê (Statistical Disclosure Limitation - Ngưỡng 5 người)
Để ngăn ngừa việc suy đoán danh tính cán bộ tại các xã có quy mô biên chế nhỏ (ví dụ: xã chỉ có duy nhất 1 Chủ tịch UBND và 1 Kế toán):
1. **Ngưỡng kiểm duyệt:** Bất kỳ ô dữ liệu nào có số lượng người trả lời từ 1 đến 4 cá nhân ($1 \le n \le 4$) đều bị coi là có nguy cơ nhận diện cao.
2. **Quy tắc Primary Suppression:**
   - Thay thế toàn bộ các số liệu này thành thông điệp chuẩn hóa: `"dưới 5 - không công bố"`.
   - Riêng giá trị $n = 0$ được phép công bố vì không gắn với cá nhân cụ thể nào.
3. **Quy tắc Row Suppression:**
   - Nếu mẫu số tổng của một hàng nằm trong khoảng $[1, 4]$, hệ thống tự động ẩn toàn bộ dòng dữ liệu đó (bao gồm các cột tỷ lệ phân bố % và các cột khoảng thiếu hụt).
4. **Quy tắc Secondary Suppression (Chống phép trừ ngược):**
   - Trong một hàng hoặc cột có giá trị Tổng (Total), nếu chỉ có đúng 1 ô bị ẩn theo Primary Suppression, người xem có thể lấy Tổng trừ đi các ô còn lại để tính ra giá trị của ô bị ẩn.
   - Do đó, thuật toán sẽ tự động tìm ô có giá trị nhỏ nhất tiếp theo trong cùng hàng/cột đó và áp dụng ẩn bổ sung.

---

## 3. BẢO MẬT XÁC THỰC VÀ PHÂN QUYỀN (AUTH & RBAC)
- **Quản lý Session Quản trị:**
  - Token JWT được ký bằng thuật toán `HS256` hoặc `RS256` với khóa bí mật `AUTH_SECRET` có độ dài tối thiểu 32 ký tự ngẫu nhiên.
  - Thời hạn hiệu lực của Session: Tối đa 8 giờ làm việc, tự động gia hạn khi có tương tác (Sliding Expiration).
  - Cookie lưu trữ bắt buộc các cờ: `HttpOnly = true`, `Secure = true` (trên môi trường HTTPS), `SameSite = 'Lax'`.
- **Phân quyền Đa cấp (RBAC Guard):**
  - Mọi Route Handler trong `/api/admin/*` bắt buộc phải kiểm tra `session.user.role`.
  - Phân tách rõ ràng giữa 2 chế độ xuất báo cáo:
    - Chế độ `INTERNAL`: Chỉ dành cho `TECHNICAL_ADMIN`, `CONTENT_ADMIN`, `REVIEWER`.
    - Chế độ `LOCAL_CONFIDENTIAL`: Bắt buộc đối với `LOCAL_COORDINATOR` (tự động kích hoạt thuật toán Suppression).

---

## 4. BẢO VỆ CHỐNG TẤN CÔNG WEB (INJECTION & ATTACK MITIGATION)
1. **Chống NoSQL Injection:**
   - Mongoose ODM tự động cast kiểu dữ liệu nghiêm ngặt theo Schema định nghĩa trước.
   - Tuyệt đối cấm sử dụng các toán tử truy vấn `$where` hoặc trực tiếp truyền `req.body` chưa qua parse vào câu lệnh truy vấn MongoDB.
2. **Chống XSS (Cross-Site Scripting):**
   - Các trường nhập văn bản tự do (Câu 7: Công việc khác, Câu 14: Ý kiến khác, Câu 3: Vị trí khác) được kiểm tra độ dài tối đa qua Zod và được làm sạch (Sanitize) bằng cách mã hóa HTML Entities trước khi lưu vào cơ sở dữ liệu và trước khi hiển thị trên giao diện quản trị.
3. **Chống CSRF (Cross-Site Request Forgery):**
   - Áp dụng SameSite Cookie kết hợp kiểm tra Origin/Referer Header trên toàn bộ các Server Actions và Route Handlers.
4. **Bảo mật HTTP Headers:**
   - Cấu hình Next.js `headers` bổ sung:
     - `Content-Security-Policy (CSP)`
     - `X-Content-Type-Options: nosniff`
     - `X-Frame-Options: DENY` (chống Clickjacking)
     - `Strict-Transport-Security (HSTS): max-age=31536000; includeSubDomains; preload`
     - `Referrer-Policy: strict-origin-when-cross-origin`
