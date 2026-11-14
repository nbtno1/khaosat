# 03. FUNCTIONAL REQUIREMENTS — YÊU CẦU CHỨC NĂNG HỆ THỐNG

Tài liệu đặc tả toàn bộ các yêu cầu chức năng của hệ thống với mã định danh duy nhất `FR-xxx`.

---

## MODULE A: QUẢN TRỊ HỆ THỐNG & ĐỢT KHẢO SÁT

### FR-001: Đăng nhập và Xác thực Quản trị viên
- **Mục tiêu:** Xác thực người dùng quản trị vào hệ thống an toàn.
- **Người sử dụng:** Quản trị kỹ thuật, Quản trị nội dung, Rà soát viên, Cán bộ theo dõi tiến độ, Đầu mối địa phương.
- **Dữ liệu đầu vào:** Tên đăng nhập (hoặc email công vụ), Mật khẩu.
- **Quy trình xử lý:**
  1. Kiểm tra định dạng đầu vào qua Zod schema.
  2. Truy vấn tài khoản trong MongoDB, kiểm tra trạng thái kích hoạt `isActive: true`.
  3. So khớp mật khẩu đã hash qua `bcrypt`.
  4. Tạo phiên làm việc JWT có thời hạn và gán quyền (RBAC role).
- **Dữ liệu đầu ra:** JWT token trong HTTP-only cookie, thông tin hồ sơ và quyền hạn.
- **Quy tắc nghiệp vụ:** Khóa tài khoản tạm thời 15 phút nếu nhập sai mật khẩu quá 5 lần liên tiếp.
- **Xử lý ngoại lệ:** Báo lỗi "Tài khoản hoặc mật khẩu không chính xác", ghi log kiểm toán.
- **Acceptance Criteria:** Đăng nhập thành công chuyển hướng đến Dashboard tương ứng với quyền; phân quyền không đúng sẽ bị từ chối truy cập (HTTP 403).
- **Nguồn tài liệu:** `Phương án triển khai...` Mục V.6 (Tài khoản quản trị, phân quyền).

### FR-002: Phân quyền người dùng theo vai trò (RBAC)
- **Mục tiêu:** Đảm bảo mỗi nhóm người dùng chỉ được thực hiện đúng nhiệm vụ được giao.
- **Người sử dụng:** Quản trị kỹ thuật (Cục Tin học).
- **Dữ liệu đầu vào:** Danh sách vai trò: `TECHNICAL_ADMIN`, `CONTENT_ADMIN`, `REVIEWER`, `PROGRESS_MONITOR`, `LOCAL_COORDINATOR`.
- **Quy trình xử lý:** Middleware kiểm tra role của user trong token trước khi xử lý request API hoặc render trang quản trị.
- **Dữ liệu đầu ra:** Phê duyệt hoặc từ chối truy cập.
- **Quy tắc nghiệp vụ:**
  - `LOCAL_COORDINATOR` chỉ được xem Bảng tổng hợp của địa phương mình đã áp dụng quy tắc ẩn danh dưới 5 người, tuyệt đối không được xem dữ liệu gốc.
  - `REVIEWER` được xem dữ liệu gốc, xem bảng nội bộ, ghi chú rà soát phiếu nghi trùng nhưng không được sửa câu trả lời của người khảo sát.
- **Acceptance Criteria:** Chặn truy cập trái quyền ở cả cấp độ Route Handler và Component UI.
- **Nguồn tài liệu:** `Phương án triển khai...` Mục V.6.

### FR-003: Quản lý Đợt khảo sát (Campaign Management)
- **Mục tiêu:** Tạo lập và quản lý các đợt khảo sát theo tiến độ (đợt thí điểm, đợt 1, đợt 2...).
- **Người sử dụng:** Quản trị nội dung, Quản trị kỹ thuật.
- **Dữ liệu đầu vào:** Tên đợt khảo sát, Danh sách tỉnh/thành phố tham gia, Ngày mở, Ngày đóng, Phiên bản bộ phiếu (mặc định 3.3), Danh sách số người dự kiến theo địa phương (nếu có).
- **Quy trình xử lý:** Khởi tạo campaign, tạo các bản ghi SurveyLink tương ứng cho từng tỉnh, sinh mã định danh và QR code.
- **Dữ liệu đầu ra:** Bản ghi Đợt khảo sát với trạng thái `DRAFT` / `OPEN` / `CLOSED`.
- **Acceptance Criteria:** Đợt khảo sát đã đóng sẽ tự động khóa các link truy cập; không cho phép gửi phiếu mới khi quá hạn.
- **Nguồn tài liệu:** `Phương án triển khai...` Mục I.4 & II.3.

---

## MODULE B: QUẢN LÝ BIỂU MẪU & NGÂN HÀNG CÂU HỎI

### FR-004: Quản lý Phiên bản Bộ câu hỏi (Survey Schema Versioning)
- **Mục tiêu:** Quản lý nội dung câu hỏi, thang đo, nhóm công việc theo số hiệu phiên bản bất biến.
- **Người sử dụng:** Quản trị nội dung.
- **Dữ liệu đầu vào:** Schema định nghĩa Bộ câu hỏi (Phiên bản hiện tại: `3.3`).
- **Quy trình xử lý:** Lưu cấu hình bộ câu hỏi dạng JSON schema trong cơ sở dữ liệu. Khi có bản cập nhật được phê duyệt, tạo phiên bản mới (ví dụ `3.4`), không ghi đè phiên bản cũ.
- **Dữ liệu đầu ra:** Cấu trúc form khảo sát chuẩn.
- **Quy tắc nghiệp vụ:** Mỗi phản hồi gửi lên bắt buộc lưu kèm `schemaVersion`. Báo cáo tổng hợp chỉ tổng hợp các phản hồi có cùng phiên bản.
- **Acceptance Criteria:** Thay đổi nội dung câu hỏi không làm sai lệch ý nghĩa các phản hồi cũ đã thu thập.
- **Nguồn tài liệu:** `Thuyết minh...` Phần III Mục 6 & `Phương án triển khai...` Mục V.3.d.

### FR-005: Cấu hình Ma trận Nhóm công việc gợi ý theo Vị trí
- **Mục tiêu:** Định nghĩa danh mục nhóm công việc ưu tiên hiển thị trước cho từng vị trí việc làm.
- **Người sử dụng:** Quản trị nội dung.
- **Dữ liệu đầu vào:** 11 cơ quan, danh sách vị trí việc làm tương ứng, mảng ID nhóm công việc gợi ý (ví dụ: Chủ tịch UBND gợi ý: 1, 2, 4, 5, 7, 9, 10, 13, 14).
- **Quy trình xử lý:** Lưu bảng tra cứu mapping `positionWorkgroupsMapping`.
- **Dữ liệu đầu ra:** Danh sách nhóm gợi ý trả về cho client khi người dùng chọn vị trí tại Câu 3.
- **Acceptance Criteria:** Đúng theo bảng danh mục tại Phụ lục Tài liệu số 1.
- **Nguồn tài liệu:** `Bộ phiếu hướng dẫn trả lời.docx` Phụ lục Mục 2.

### FR-006: Cấu hình Ma trận Mức yêu cầu chuẩn (Benchmark Matrix)
- **Mục tiêu:** Lưu trữ mức yêu cầu (Level 1-4) đã phê duyệt cho từng ô [Nhóm công việc × Vai trò].
- **Người sử dụng:** Quản trị nội dung.
- **Dữ liệu đầu vào:** Bảng 65 bản ghi [Nhóm N01-N16 × Vai trò (1-4) → RequiredLevel (1-4)].
- **Quy trình xử lý:** Lưu trữ bảng chuẩn mức yêu cầu tương ứng với từng phiên bản bộ phiếu.
- **Acceptance Criteria:** Là căn cứ tính toán chỉ số khoảng thiếu hụt trong Bảng B3.
- **Nguồn tài liệu:** `Thuyết minh...` Phần II.B.

---

## MODULE C: PHÁT HÀNH, QUẢN LÝ LIÊN KẾT & MÃ QR

### FR-007: Sinh liên kết chuyên biệt và Mã QR theo Địa phương
- **Mục tiêu:** Mỗi tỉnh/đợt khảo sát có một URL truy cập và mã QR duy nhất để phân luồng và quản lý truy cập.
- **Người sử dụng:** Quản trị kỹ thuật.
- **Dữ liệu đầu vào:** Campaign ID, Tỉnh/thành phố ID, Trạng thái kích hoạt.
- **Quy trình xử lý:** Sinh mã token bảo mật không đoán được (Secure UUID / Hash slug), tạo link dạng `https://domain/khao-sat/[campaignSlug]/[provinceCode]` và render mã QR độ phân giải cao dạng SVG/PNG.
- **Dữ liệu đầu ra:** Đường dẫn truy cập, file ảnh QR code để tải về in ấn hoặc gửi công văn.
- **Quy tắc nghiệp vụ:** Khi người dùng truy cập qua link của tỉnh nào, Câu 1 của phiếu chỉ hiển thị danh sách các xã/phường thuộc tỉnh đó.
- **Acceptance Criteria:** Không công bố link chung cho toàn quốc; tách biệt hoàn toàn URL thử nghiệm (`pilot`) với URL chính thức.
- **Nguồn tài liệu:** `Phương án triển khai...` Mục II.1 & V.4.

### FR-008: Quản lý Đóng/Mở và Thay thế Liên kết
- **Mục tiêu:** Kiểm soát trạng thái vận hành của đường dẫn khảo sát.
- **Người sử dụng:** Quản trị kỹ thuật.
- **Dữ liệu đầu vào:** ID liên kết, Thao tác: Kích hoạt / Tạm dừng / Đóng / Đổi mã token.
- **Quy trình xử lý:** Cập nhật trạng thái `SurveyLink`. Nếu cần thay đổi liên kết do lộ hoặc sự cố, hệ thống sinh token mới, giữ nguyên toàn bộ các phản hồi đã thu nhận trước đó.
- **Acceptance Criteria:** Link bị đóng hiển thị trang thông báo "Đợt khảo sát đã kết thúc hoặc liên kết tạm dừng".
- **Nguồn tài liệu:** `Phương án triển khai...` Mục V.4.

---

## MODULE D: CỔNG KHẢO SÁT DÀNH CHO CÁN BỘ (PUBLIC SURVEY PORTAL)

### FR-009: Hiển thị Động và Sắp xếp Nhóm công việc theo Vị trí
- **Mục tiêu:** Tối ưu hóa trải nghiệm người dùng, tự động đưa các nhóm công việc liên quan lên trước.
- **Người sử dụng:** Cán bộ tham gia khảo sát.
- **Dữ liệu đầu vào:** Vị trí đã chọn ở Câu 3.
- **Quy trình xử lý:**
  1. Lấy danh sách nhóm gợi ý của vị trí.
  2. Sắp xếp lại danh sách 16 nhóm: đưa các nhóm gợi ý lên trước, các nhóm còn lại xếp tiếp sau.
  3. Render đủ 16 nhóm, hiển thị mô tả rõ ràng.
  4. Mặc định chưa chọn radio nào ở cả 4 cột.
- **Acceptance Criteria:** Người dùng có thể chọn bất kỳ nhóm nào, không bị gò bó bởi gợi ý.
- **Nguồn tài liệu:** `Bộ phiếu hướng dẫn trả lời.docx` Phụ lục Mục 1.

### FR-010: Xử lý Điều kiện Rẽ nhánh & Kết thúc Sớm (Early Exit / Termination)
- **Mục tiêu:** Giảm tải thời gian khảo sát cho đối tượng không thuộc phạm vi công việc.
- **Người sử dụng:** Cán bộ tham gia khảo sát.
- **Dữ liệu đầu vào:** Lựa chọn của người dùng tại 16 nhóm của Câu 6.
- **Quy trình xử lý:**
  - Nếu tất cả 16 nhóm đều là "Không được giao" hoặc "Chỉ phối hợp":
    - Hệ thống cho phép trả lời Câu 7 (Công việc khác nếu có).
    - Sau khi trả lời Câu 7, hiển thị thông báo kết thúc khảo sát: "Cảm ơn anh/chị, phần việc của anh/chị thuộc diện ngoài đối tượng theo công việc".
    - Ẩn hoàn toàn Phần III và Phần IV.
    - Gắn cờ bản ghi `isOutOfScope: true`.
- **Acceptance Criteria:** Người ngoài đối tượng không phải trả lời các câu hỏi đánh giá năng lực; phản hồi được tính vào Bảng B1 nhưng loại khỏi B2-B6.
- **Nguồn tài liệu:** `Thuyết minh...` Phần III Mục 1 & `Bộ phiếu hướng dẫn...` dòng [290].

### FR-011: Sinh Form Đánh giá Động theo Nhóm đã chọn (Phần III Loop)
- **Mục tiêu:** Chỉ hỏi đánh giá năng lực đối với các nhóm công việc thực tế được giao.
- **Người sử dụng:** Cán bộ tham gia khảo sát.
- **Dữ liệu đầu vào:** Các nhóm công việc có trạng thái "Đang thực hiện" hoặc "Được giao nhưng chưa có dịp".
- **Quy trình xử lý:**
  - Lặp qua từng nhóm hợp lệ:
    - Câu 8: Chọn vai trò (Trực tiếp, Tham mưu, Kiểm tra, Quyết định).
    - Câu 9: Sinh động các dòng chọn mức tự đánh giá tương ứng với vai trò đã chọn tại Câu 8, hiển thị câu mô tả cụ thể của vai trò đó.
    - Câu 10 (Khó khăn): Chỉ hiển thị nếu trạng thái nhóm là "Đang thực hiện". Tự động ẨN nếu trạng thái là "Chưa có dịp". Kiểm tra quy tắc chọn tối đa 2 mục; nếu chọn "Không gặp khó khăn đáng kể" thì hủy chọn các mục khác.
    - Câu 11 (Nội dung cần học): Hiển thị đúng danh mục chuyên đề học của nhóm đó.
    - Câu 12 (Mức độ cần học): Chỉ hiển thị nếu người dùng đã chọn ít nhất 1 nội dung ở Câu 11.
- **Acceptance Criteria:** Đúng hoàn toàn các quy tắc hiển thị logic từ Rule 1 đến Rule 7.
- **Nguồn tài liệu:** `Bộ phiếu hướng dẫn trả lời.docx` Phụ lục Mục 1.

### FR-012: Xử lý Dọn dẹp Dữ liệu khi Quay lại Thay đổi Lựa chọn (Back-Navigation Cleanup)
- **Mục tiêu:** Đảm bảo tính toàn vẹn dữ liệu, không lưu câu trả lời rác khi người dùng thay đổi quyết định.
- **Người sử dụng:** Cán bộ tham gia khảo sát.
- **Dữ liệu đầu vào:** Hành động quay lại (Back) và sửa trạng thái Câu 6 hoặc bỏ vai trò ở Câu 8.
- **Quy trình xử lý:**
  - Nếu đổi nhóm từ "Đang thực hiện" sang "Chỉ phối hợp" hoặc "Không được giao": Tự động xóa sạch toàn bộ câu trả lời Phần III của nhóm đó khỏi state.
  - Nếu bỏ chọn 1 vai trò tại Câu 8: Xóa điểm tự đánh giá của vai trò đó tại Câu 9.
  - Nếu đổi từ "Đang thực hiện" sang "Chưa có dịp": Xóa dữ liệu Câu 10 (Khó khăn).
  - Nếu đổi tất cả 16 nhóm sang ngoài phạm vi: Xóa toàn bộ dữ liệu Phần III và IV đã trả lời trước đó.
- **Acceptance Criteria:** Dữ liệu gửi lên server chỉ chứa duy nhất các câu trả lời còn phù hợp với khai báo cuối cùng.
- **Nguồn tài liệu:** `Thuyết minh...` Phần III Mục 1 dòng [600].

### FR-013: Gửi Phiếu Khảo sát và Xác nhận Ghi nhận
- **Mục tiêu:** Hoàn tất bài khảo sát một lần duy nhất, ngăn chặn tình trạng gửi đúp hoặc mất dữ liệu.
- **Người sử dụng:** Cán bộ tham gia khảo sát.
- **Dữ liệu đầu vào:** Dữ liệu hoàn chỉnh của biểu mẫu khảo sát.
- **Quy trình xử lý:**
  1. Validate toàn bộ dữ liệu tại client và server qua Zod schema.
  2. Tạo bản ghi SurveyResponse trong cơ sở dữ liệu.
  3. Trả về thông báo thành công: "Đã gửi thành công. Trân trọng cảm ơn anh/chị đã dành thời gian trả lời phiếu."
- **Quy tắc nghiệp vụ:** Hệ thống không hỗ trợ lưu tạm (no draft save) trên server để bảo vệ tính ẩn danh và tránh rò rỉ dữ liệu dở dang.
- **Acceptance Criteria:** Chỉ ghi nhận khi hiển thị rõ thông báo thành công; nút "Gửi" bị vô hiệu hóa ngay khi bấm để chống double submit.
- **Nguồn tài liệu:** `Phương án triển khai...` Mục II.2 & V.3.b.

---

## MODULE E: XỬ LÝ PHIẾU NGHI TRÙNG & KIỂM SOÁT CHẤT LƯỢNG

### FR-014: Thuật toán Tự động Nhận diện Phiếu Nghi trùng (Suspected Duplicates Detection)
- **Mục tiêu:** Phát hiện các trường hợp một cán bộ gửi nhiều lần hoặc gửi nhầm phiếu mà không thu thập PII.
- **Người sử dụng:** Hệ thống tự động.
- **Dữ liệu đầu vào:** Các bản ghi SurveyResponse trong cùng một đợt khảo sát.
- **Quy trình xử lý:**
  - Tự động đánh dấu cờ `isSuspectedDuplicate: true` khi thỏa mãn đồng thời:
    1. Cùng Tỉnh, cùng Xã/Phường (Câu 1).
    2. Cùng Cơ quan, đơn vị (Câu 2).
    3. Cùng Vị trí công việc chính (Câu 3).
    4. Trả lời giống nhau hoàn toàn ở cả 16 nhóm của Câu 6.
- **Quy tắc nghiệp vụ:** Hệ thống KHÔNG ĐƯỢC TỰ ĐỘNG XÓA phiếu nghi trùng.
- **Acceptance Criteria:** Bản ghi nghi trùng được gắn nhãn cảnh báo để cán bộ Khoa Cơ sở / Chuyên ngành rà soát thủ công.
- **Nguồn tài liệu:** `Phương án triển khai...` Mục V.5.

### FR-015: Giao diện Rà soát và Quyết định Tính/Không tính Phiếu Nghi trùng
- **Mục tiêu:** Cung cấp công cụ cho chuyên viên Trường đối chiếu, thẩm tra phiếu nghi trùng.
- **Người sử dụng:** Rà soát viên (Khoa Cơ sở, Khoa Chuyên ngành).
- **Dữ liệu đầu vào:** Danh sách các nhóm phiếu nghi trùng, thông tin đối chiếu (thời điểm gửi, câu trả lời chi tiết Phần III, số biên chế của vị trí đó tại địa phương).
- **Quy trình xử lý:** Chuyên viên đánh dấu trạng thái bản ghi:
  - `status: VALID` (Được tính)
  - `status: EXCLUDED` (Không tính kèm ghi rõ lý do: ví dụ "Cán bộ gửi lại do thao tác nhầm lần đầu", "Phiếu gửi đúp cách nhau 1 phút").
- **Acceptance Criteria:** Các phiếu bị loại `EXCLUDED` không được đưa vào tính toán trong B1-B6; số lượng và lý do loại được báo cáo rõ ràng ở Bảng B1.
- **Nguồn tài liệu:** `Phương án triển khai...` Mục V.5 & `Thuyết minh...` Mục 1.

---

## MODULE F: TỔNG HỢP SỐ LIỆU & BÁO CÁO 6 BẢNG CHUẨN (B1 - B6)

### FR-016: Tổng hợp Bảng B1 — Thống kê Người trả lời
- **Mục tiêu:** Thống kê cơ cấu người tham gia theo cơ quan, vị trí việc làm và tư cách công tác.
- **Người sử dụng:** Quản trị viên, Cán bộ phân tích.
- **Dữ liệu đầu ra:** Ma trận B1:
  - Phân loại theo Cơ quan / Đơn vị.
  - Số người được tổng hợp (mỗi người tính 1 lần).
  - Số người ngoài đối tượng theo công việc.
  - Số xã có người trả lời.
  - Số phiếu không tính và lý do.
  - Phân tích theo Tư cách (Cán bộ, Công chức, Viên chức...): Cho phép tổng tư cách > 100% do chọn nhiều; tỷ lệ tính trên số người được tổng hợp.
- **Acceptance Criteria:** Số liệu chính xác tuyệt đối, khớp với số lượng bản ghi hợp lệ trong cơ sở dữ liệu.
- **Nguồn tài liệu:** `Thuyết minh...` Phần III Mục 5 (Bảng B1).

### FR-017: Tổng hợp Bảng B2 — Thống kê Trạng thái 16 Nhóm công việc
- **Mục tiêu:** Đo lường tỷ lệ phân công thực tế của 16 nhóm công việc tại cấp xã.
- **Người sử dụng:** Quản trị viên, Cán bộ phân tích.
- **Dữ liệu đầu ra:** Ma trận B2: 16 hàng (N01 - N16) × 4 cột trạng thái:
  - Đang thực hiện
  - Được giao nhưng chưa có dịp
  - Chỉ phối hợp
  - Không được giao
  - Mẫu số = Tổng 4 cột = Số người được tổng hợp.
- **Acceptance Criteria:** Tổng 4 cột của mỗi hàng luôn bằng 100% mẫu số.
- **Nguồn tài liệu:** `Thuyết minh...` Phần III Mục 5 (Bảng B2).

### FR-018: Tổng hợp Bảng B3 — Khả năng thực hiện & Khoảng thiếu hụt theo Tự đánh giá
- **Mục tiêu:** Đo lường năng lực tự đánh giá và tính toán tỷ lệ, phân bố mức thiếu hụt so với mức chuẩn phê duyệt.
- **Người sử dụng:** Quản trị viên, Cán bộ phân tích.
- **Dữ liệu đầu ra:** Ma trận B3:
  - Hàng: Nhóm công việc (N01-N16) × 4 Vai trò.
  - Cột:
    - Mẫu số (Số người đang thực hiện ở vai trò đó).
    - Phân bố Mức 1, Mức 2, Mức 3, Mức 4.
    - Tỷ lệ Mức 1 hoặc Mức 2 (%).
    - Mức yêu cầu đã phê duyệt (Cột chuẩn Benchmark).
    - Số người dưới mức yêu cầu & Tỷ lệ dưới mức yêu cầu (%).
    - Phân bố chi tiết: Thiếu 1 mức, Thiếu 2 mức, Thiếu 3 mức.
    - Cột riêng cho người "Được giao nhưng chưa có dịp" (tự ước lượng).
- **Quy tắc tính toán:**
  - So sánh: `Gap = RequiredLevel - SelfAssessedLevel`. Nếu `Gap > 0` thì tính là dưới mức yêu cầu.
  - Nhãn bắt buộc tại tiêu đề bảng và báo cáo: *"khoảng thiếu hụt theo tự đánh giá - không đồng nhất với năng lực thực tế đã được kiểm chứng"*.
- **Acceptance Criteria:** Khớp với ví dụ tính toán tại Mục IV dòng [684] của Thuyết minh.
- **Nguồn tài liệu:** `Thuyết minh...` Phần III & IV.

### FR-019: Tổng hợp Bảng B4 — Thống kê Nhu cầu đào tạo theo Chuyên đề
- **Mục tiêu:** Tổng hợp chi tiết nhu cầu học theo từng nội dung cụ thể trong từng nhóm công việc và mức độ cấp thiết.
- **Người sử dụng:** Quản trị viên, Cán bộ phân tích.
- **Dữ liệu đầu ra:** Ma trận B4: Nhóm công việc × Nội dung cần học:
  - Số người chọn (tách riêng người Đang thực hiện và Chưa có dịp).
  - Phân bố theo mức độ ưu tiên: Cần học ngay (trong 6 tháng), Cần học trong năm, Có thể học sau một năm.
- **Acceptance Criteria:** Tách bạch rõ ràng giữa người đang làm thực tế và người học để chuẩn bị tiếp nhận công việc.
- **Nguồn tài liệu:** `Thuyết minh...` Phần III Mục 5 (Bảng B4).

### FR-020: Tổng hợp Bảng B5 — Thống kê Khó khăn vướng mắc
- **Mục tiêu:** Phân loại các nguyên nhân khó khăn, đặc biệt tách nhóm khó khăn cần đào tạo với khó khăn về cơ chế/công cụ.
- **Người sử dụng:** Quản trị viên, Cán bộ phân tích.
- **Dữ liệu đầu ra:** Ma trận B5: Nhóm công việc × 6 loại khó khăn & Không khó khăn:
  - Tỷ lệ % người chọn trên tổng số người đang thực hiện của nhóm.
  - Gắn nhãn *"Ngoài đào tạo"* đối với 4 loại: Hướng dẫn, Quy trình, Nhân lực, Công cụ (làm cơ sở kiến nghị cấp có thẩm quyền).
- **Acceptance Criteria:** Khó khăn ngoài đào tạo không được gộp vào nhu cầu đào tạo.
- **Nguồn tài liệu:** `Thuyết minh...` Phần III Mục 5 (Bảng B5) & Phần V Mục 1.

### FR-021: Tổng hợp Bảng B6 — Hình thức học & Giới hạn dữ liệu
- **Mục tiêu:** Xác định phương thức tổ chức đào tạo phù hợp nhất với điều kiện công tác tại địa phương.
- **Người sử dụng:** Quản trị viên, Cán bộ phân tích.
- **Dữ liệu đầu ra:** Ma trận B6: 5 hình thức học tập trung/trực tuyến/hỗn hợp:
  - Số người chọn và tỷ lệ % trên tổng số người được tổng hợp.
  - Tỷ lệ phản hồi khảo sát của địa phương.
  - Ghi nhận số ô bị ẩn do áp dụng ngưỡng 5 người.
- **Acceptance Criteria:** Đáp ứng đầy đủ các chỉ số thống kê của Bảng B6.
- **Nguồn tài liệu:** `Thuyết minh...` Phần III Mục 5 (Bảng B6).

---

## MODULE G: BẢO VỆ ẨN DANH & XUẤT BÁO CÁO EXCEL

### FR-022: Thuật toán Ẩn số liệu Nhóm nhỏ (Ngưỡng 5 người — Suppression Engine)
- **Mục tiêu:** Tự động bảo vệ danh tính cán bộ, ngăn chặn truy vết ngược danh tính từ các tổ chức/vị trí ít người.
- **Người sử dụng:** Hệ thống báo cáo.
- **Quy trình xử lý:**
  1. *Primary Suppression:* Duyệt qua từng ô đếm số người hoặc ô mẫu số. Nếu giá trị ∈ [1, 4] → thay thế bằng nhãn `"dưới 5 - không công bố"`. Nếu giá trị = 0 → giữ nguyên `0`.
  2. *Row Suppression:* Nếu mẫu số của một dòng ∈ [1, 4] → ẩn toàn bộ các ô trong dòng đó.
  3. *Secondary Suppression:* Trong một hàng hoặc cột có ô Tổng (Total), nếu chỉ có đúng 1 ô bị ẩn theo Primary Suppression, hệ thống tự động tìm ô có giá trị nhỏ nhất kế tiếp trong hàng/cột đó và ẩn tiếp ô này.
- **Acceptance Criteria:** Áp dụng bắt buộc cho toàn bộ các bảng B1 - B6 khi xuất dữ liệu cho Đầu mối địa phương hoặc hiển thị cho tài khoản `LOCAL_COORDINATOR`.
- **Nguồn tài liệu:** `Thuyết minh...` Phần III Mục 6.

### FR-023: Xuất Dữ liệu Gốc và Báo cáo Excel Đa bảng
- **Mục tiêu:** Xuất dữ liệu phục vụ đối chiếu, lưu trữ và báo cáo lãnh đạo.
- **Người sử dụng:** Quản trị nội dung, Quản trị kỹ thuật, Chuyên viên phân tích.
- **Dữ liệu đầu vào:** Tùy chọn xuất: Toàn quốc hoặc Theo từng tỉnh; Chế độ: Bảng Nội bộ (Full số liệu) hoặc Bảng Gửi địa phương (Đã ẩn danh nhóm dưới 5 người).
- **Quy trình xử lý:** Dùng thư viện `ExcelJS` sinh file `.xlsx` được định dạng chuẩn:
  - Header ghi rõ: Tên đơn vị, Đợt khảo sát, Tỉnh/thành phố, Số hiệu phiên bản bộ phiếu (ví dụ: "Bảng B3 - bộ phiếu phiên bản 3.3"), Ngày xuất báo cáo.
  - Gồm 6 sheet tương ứng B1, B2, B3, B4, B5, B6 + 1 sheet Dữ liệu gốc (đối với bản nội bộ).
  - Tự động căn lề, border bảng biểu, định dạng phần trăm và định dạng văn bản cho các ô ẩn danh.
- **Acceptance Criteria:** File Excel mở được chuẩn xác trên Microsoft Excel, Google Sheets, LibreOffice, không bị lỗi font Tiếng Việt Unicode.
- **Nguồn tài liệu:** `Phương án triển khai...` Mục V.7 & VII.
