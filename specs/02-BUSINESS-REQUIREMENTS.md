# 02. BUSINESS REQUIREMENTS — YÊU CẦU NGHIỆP VỤ HỆ THỐNG KHẢO SÁT

## 1. BỐI CẢNH VÀ MỤC ĐÍCH NGHIỆP VỤ
- **Bối cảnh:** Sau sắp xếp đơn vị hành chính năm 2025, cả nước có 34 đơn vị hành chính cấp tỉnh và 3.321 đơn vị hành chính cấp xã vận hành theo mô hình chính quyền địa phương 2 cấp. Công tác quản lý tài chính, ngân sách và tài sản công tại cấp xã tiếp nhận nhiều nhiệm vụ mới từ cấp huyện trước đây.
- **Mục đích khảo sát:**
  - Xác định nhu cầu bồi dưỡng và khoảng thiếu hụt năng lực theo tự đánh giá của cán bộ, công chức cấp xã đối với công việc quản lý, sử dụng tài chính, tài sản công.
  - Cung cấp số liệu chính xác để Trường Đào tạo và Bồi dưỡng nghiệp vụ kiểm toán xây dựng khung chương trình đào tạo bồi dưỡng sát thực tiễn cho từng địa phương.
- **Ranh giới pháp lý & nguyên tắc bắt buộc:**
  - *Không xếp loại cá nhân, không xếp hạng địa phương.*
  - *Không khẳng định đây là năng lực đã được kiểm chứng.*
  - *Không thu thập thông tin định danh cá nhân (PII):* Tuyệt đối không hỏi Họ và tên, Số điện thoại, Email, Số CCCD.
  - *Bảo mật & ẩn danh nhóm nhỏ (Statistical Disclosure Limitation):* Mọi bảng tổng hợp công bố cho địa phương phải áp dụng quy tắc ẩn số liệu đối với các nhóm có số người từ 1 đến 4 ("Dưới 5 - Không công bố").

---

## 2. CÁC TÁC NHÂN VÀ CƠ QUAN THAM GIA (STAKEHOLDERS)
1. **Kiểm toán nhà nước:** Cơ quan cấp trên phê duyệt chủ trương và phương án triển khai.
2. **Trường Đào tạo và Bồi dưỡng nghiệp vụ kiểm toán:**
   - *Ban Giám đốc Trường:* Ký duyệt phát hành đợt khảo sát và phê duyệt báo cáo chương trình đào tạo.
   - *Văn phòng Trường:* Quản trị nội dung, theo dõi cấu hình và nhận dữ liệu tổng hợp.
   - *Khoa Cơ sở & Khoa Chuyên ngành:* Tổng hợp dữ liệu, rà soát các phiếu nghi trùng, phân tích khoảng thiếu hụt năng lực và xây dựng khung đào tạo.
   - *Phòng Quản lý đào tạo:* Hỗ trợ nghiệp vụ cho cán bộ trả lời trong giờ hành chính, theo dõi tiến độ gửi phiếu từng xã/tỉnh.
3. **Cục Tin học / Đơn vị Kỹ thuật:**
   - Quản trị kỹ thuật, quản trị hạ tầng, phát hành và đóng mở các liên kết/mã QR theo tỉnh/đợt.
   - Bảo đảm an toàn hệ thống, xử lý chống ghi trùng, xuất dữ liệu gốc và 6 bảng báo cáo chuẩn.
4. **Đầu mối địa phương (UBND Tỉnh/Sở Tài chính):**
   - Tiếp nhận công văn, mã QR và đường dẫn khảo sát từ Trường.
   - Phổ biến đến cán bộ xã/phường, đôn đốc cán bộ hoàn thành khảo sát trong thời hạn quy định (khoảng 3 tuần).
   - Tiếp nhận Báo cáo tổng hợp số liệu của tỉnh mình (đã ẩn danh nhóm dưới 5 người).
5. **Người tham gia khảo sát (Cán bộ, công chức cấp xã):**
   - Truy cập liên kết hoặc quét mã QR qua thiết bị di động / máy tính.
   - Hoàn thành các câu hỏi khảo sát trong thời gian ước tính 10 - 17 phút.

---

## 3. CẤU TRÚC NGHIỆP VỤ BỘ PHIẾU KHẢO SÁT (PHIÊN BẢN 3.3)

Bộ phiếu chuẩn gồm 4 Phần, 14 câu hỏi với luồng logic nghiệp vụ sau:

### PHẦN I. THÔNG TIN CHUNG
- **Câu 1:** Tỉnh/thành phố, xã/phường nơi công tác (Chọn phân cấp từ danh mục hành chính của đợt khảo sát).
- **Câu 2:** Cơ quan, đơn vị công tác (Chọn 1 trong 11 cơ quan):
  1. Lãnh đạo Ủy ban nhân dân xã/phường
  2. Hội đồng nhân dân xã/phường
  3. Văn phòng Hội đồng nhân dân và Ủy ban nhân dân
  4. Phòng Kinh tế (xã) / Phòng Kinh tế, Hạ tầng và Đô thị (phường)
  5. Phòng Văn hóa - Xã hội
  6. Trung tâm phục vụ hành chính công
  7. Đơn vị sự nghiệp công lập trực thuộc (trường học, trạm y tế, trung tâm...)
  8. Ban quản lý dự án, tổ hoặc người được giao quản lý dự án
  9. Văn phòng Đảng ủy xã/phường
  10. Cơ quan Ủy ban Mặt trận Tổ quốc Việt Nam và các tổ chức chính trị - xã hội cấp xã
  11. Đơn vị khác được giao dự toán từ ngân sách cấp xã
- **Câu 3:** Vị trí công việc chính (Chọn 1 vị trí theo danh mục của cơ quan đã chọn ở Câu 2, hoặc chọn "Vị trí khác" kèm văn bản mô tả tối đa 200 ký tự).
- **Câu 4:** Tư cách hiện tại (Chọn nhiều - Checkbox):
  - Cán bộ / Công chức / Viên chức / Đại biểu Hội đồng nhân dân / Người hoạt động không chuyên trách / Người lao động / Khác (ghi rõ).
- **Câu 5:** Số năm làm công việc tài chính, tài sản công (Chọn 1 - Single choice):
  - Dưới 1 năm / Từ 1 đến 3 năm / Trên 3 năm.

### PHẦN II. CÔNG VIỆC ĐƯỢC GIAO (16 NHÓM CÔNG VIỆC)
- **Câu 6:** Với từng nhóm công việc trong danh mục 16 nhóm (N01 đến N16), người trả lời chọn đúng 1 trong 4 trạng thái loại trừ nhau:
  1. *Đang thực hiện*
  2. *Được giao nhưng chưa có dịp thực hiện*
  3. *Chỉ phối hợp* (chỉ cung cấp thông tin, hồ sơ sẵn có khi đơn vị khác yêu cầu; không tự lập sản phẩm)
  4. *Không được giao*
  - **Quy tắc sắp xếp nhóm gợi ý:** Các nhóm công việc gắn với vị trí công việc đã chọn ở Câu 3 được tự động đưa lên đầu danh sách để thuận tiện thao tác; hệ thống KHÔNG tích sẵn bất kỳ lựa chọn nào.
  - **Quy tắc kết thúc sớm (Early Exit):** Nếu người trả lời chọn "Không được giao" hoặc "Chỉ phối hợp" ở TOÀN BỘ 16 nhóm công việc, phiếu chuyển sang Câu 7 và KẾT THÚC ngay sau Câu 7. Phiếu được ghi nhận là *"Ngoài đối tượng theo công việc"*, người này chỉ được tính vào Bảng B1, không tham gia B2 - B6.
- **Câu 7:** Công việc tài chính, tài sản công khác ngoài 16 nhóm (Không bắt buộc, nhập văn bản tối đa 300 ký tự).

### PHẦN III. ĐÁNH GIÁ THEO TỪNG NHÓM CÔNG VIỆC
Vòng lặp nghiệp vụ: Lặp lại cho từng nhóm công việc đã chọn *"Đang thực hiện"* HOẶC *"Được giao nhưng chưa có dịp thực hiện"*:
- **Câu 8:** Vai trò đảm nhiệm trong nhóm (Chọn tất cả vai trò phù hợp - Multiple choice):
  1. *Trực tiếp thực hiện:* Lập chứng từ, sổ, bảng theo dõi, hồ sơ số liệu.
  2. *Tham mưu:* Lập hồ sơ, tờ trình, phương án, đề xuất để trình.
  3. *Kiểm tra, giám sát:* Kiểm soát hồ sơ người khác lập; thẩm tra, giám sát.
  4. *Quyết định, phê duyệt:* Ký quyết định, phê duyệt hoặc chịu trách nhiệm cuối cùng.
- **Câu 9:** Mức tự đánh giá khả năng thực hiện (Chọn 1 mức cho mỗi vai trò đã chọn ở Câu 8):
  - *Thang 4 mức:*
    - **Mức 1:** Cần người khác làm cùng, hướng dẫn từng bước.
    - **Mức 2:** Tự làm được, nhưng còn cần hỗ trợ chuyên môn để hoàn thành đúng công việc thường gặp.
    - **Mức 3:** Tự thực hiện, tự xem xét kết quả, xử lý được trường hợp thường gặp; chỉ hỏi ý kiến với trường hợp mới, phức tạp.
    - **Mức 4:** Xử lý được trường hợp phức tạp, hướng dẫn được người khác.
  - Giao diện phải hiển thị đúng câu mô tả ngữ cảnh tương ứng với vai trò đó.
- **Câu 10:** Khó khăn chính gặp phải trong nhóm (Chỉ hiển thị cho người *Đang thực hiện*; ẨN đối với người *Chưa có dịp*):
  - Chọn tối đa 2 khó khăn trong danh mục:
    1. Kiến thức - Chưa nắm vững quy định, nguyên tắc
    2. Kỹ năng - Chưa thành thạo cách làm, cách tính, cách lập hồ sơ
    3. Hướng dẫn - Văn bản hướng dẫn chưa rõ hoặc thay đổi nhiều
    4. Quy trình - Phân công, phối hợp, trình tự chưa rõ
    5. Nhân lực - Thiếu người, kiêm nhiệm nhiều việc
    6. Công cụ - Phần mềm, mẫu biểu, dữ liệu, hồ sơ chưa đáp ứng
    7. Không gặp khó khăn đáng kể *(Lựa chọn độc quyền - không chọn cùng các mục khác)*.
- **Câu 11:** Nội dung cần học trong nhóm:
  - Chọn nhiều trong danh mục nội dung học chuyên đề của nhóm đó + Tùy chọn "Khác (ghi rõ)".
- **Câu 12:** Mức độ cần học đối với nhóm này (Chỉ hiển thị khi đã chọn ít nhất 1 nội dung ở Câu 11; chọn 1 mức duy nhất cho cả nhóm):
  - *Cần học ngay (trong 6 tháng tới)*
  - *Cần học trong năm*
  - *Có thể học sau một năm*

### PHẦN IV. HÌNH THỨC HỌC VÀ Ý KIẾN KHÁC
- **Câu 13:** Hình thức học phù hợp (Chọn tối đa 2 hình thức):
  1. Lớp tập trung ngắn ngày
  2. Học trực tuyến
  3. Kết hợp trực tuyến và tập trung
  4. Hướng dẫn tại chỗ, theo hồ sơ thực tế
  5. Tài liệu, sổ tay tự học
- **Câu 14:** Ý kiến khác về nhu cầu bồi dưỡng (Không bắt buộc, nhập văn bản tối đa 500 ký tự).
- **Hành động nộp phiếu:** Người dùng bấm "Gửi" và nhận thông báo "Đã gửi thành công".

---

## 4. QUY TẮC TỔNG HỢP VÀ BÁO CÁO (6 BẢNG TỔNG HỢP)

| Bảng | Tên Bảng | Quy cách Hàng & Cột | Mẫu số tổng hợp |
|:---:|:---|:---|:---|
| **B1** | **Người trả lời** | - Hàng: Cơ quan, đơn vị; chi tiết theo vị trí; phần riêng theo tư cách.<br>- Cột: Số người tổng hợp, số ngoài đối tượng, số xã có người trả lời, số dự kiến, tỷ lệ phản hồi, số phiếu không tính & lý do. | Số người được tổng hợp (mỗi người đếm 1 lần). |
| **B2** | **Nhóm công việc** | - Hàng: 16 nhóm công việc (N01 - N16).<br>- Cột: Đang thực hiện, Chưa có dịp, Chỉ phối hợp, Không được giao (4 cột cộng lại = 100%). | Tổng 4 cột của từng nhóm (không gồm người ngoài đối tượng). |
| **B3** | **Khả năng thực hiện & Khoảng thiếu hụt** | - Hàng: Nhóm công việc × 4 Vai trò.<br>- Cột: Phân bố Mức 1, 2, 3, 4; Mức yêu cầu; Số & % dưới mức yêu cầu; Phân bố thiếu 1 mức, 2 mức, 3 mức. Người chưa có dịp tính riêng. | Số người của dòng nhóm × vai trò (người đang thực hiện). |
| **B4** | **Nội dung cần học** | - Hàng: Nhóm công việc × Nội dung học.<br>- Cột: Số người chọn (tách Đang thực hiện và Chưa có dịp); Số người theo mức độ cần học (Học ngay, Trong năm, Sau 1 năm). | Người đang thực hiện / chưa có dịp của nhóm. |
| **B5** | **Khó khăn** | - Hàng: Nhóm công việc × 6 loại khó khăn và Không khó khăn.<br>- Cột: Số người chọn và tỷ lệ %. Ghi nhãn "ngoài đào tạo" với hướng dẫn, quy trình, nhân lực, công cụ. | Người đang thực hiện của nhóm. |
| **B6** | **Hình thức học & Giới hạn dữ liệu** | - Hàng: 5 hình thức học.<br>- Cột: Số người chọn và tỷ lệ % trên tổng số người được tổng hợp; câu giới hạn cố định; số ô không công bố. | Tổng số người được tổng hợp. |

### QUY TẮC BẢO VỆ DỮ LIỆU NHÓM NHỎ (NGƯỠNG 5 NGƯỜI)
1. **Primary Suppression:** Bất kỳ ô đếm nhóm người hoặc ô mẫu số nào có giá trị từ 1 đến 4 phải được hiển thị thành chuỗi: `"dưới 5 - không công bố"`. Ô có giá trị = 0 được phép công bố.
2. **Row Suppression:** Dòng nào có mẫu số từ 1 đến 4 thì ẩn toàn bộ dòng (kể cả các cột phân bổ tỷ lệ và khoảng thiếu hụt).
3. **Secondary Suppression:** Trong một hàng hoặc một cột có tổng mà chỉ có duy nhất 1 ô bị ẩn theo ngưỡng 5, hệ thống phải tự động ẩn thêm ô có giá trị nhỏ nhất kế tiếp nhằm triệt tiêu khả năng người xem lấy Tổng trừ đi các ô còn lại để tính ra giá trị ẩn.
