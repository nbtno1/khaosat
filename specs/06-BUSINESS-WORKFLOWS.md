# 06. BUSINESS WORKFLOWS — QUY TRÌNH NGHIỆP VỤ HỆ THỐNG

## 1. QUY TRÌNH VÒNG ĐỜI MỘT ĐỢT KHẢO SÁT (CAMPAIGN LIFECYCLE WORKFLOW)

Quy trình chuẩn được thiết kế theo tiến độ từ tuần $P$ (ngày phê duyệt) đến $P+7$ tuần theo văn bản Phương án triển khai.

```mermaid
sequenceDiagram
    autonumber
    actor T as Trường Đào tạo KTNN
    actor C as Cục Tin học / Quản trị KT
    actor D as Đầu mối Địa phương
    actor CB as Cán bộ Xã/Phường
    actor L as Lãnh đạo KTNN

    Note over T,C: Giai đoạn P - P+1: Chuẩn bị & Phát hành
    T->>C: Bàn giao Quyết định phê duyệt & Bộ tài liệu phiên bản 3.3
    C->>C: Khởi tạo đợt khảo sát, sinh URL bảo mật và Mã QR theo từng tỉnh
    T->>D: Gửi công văn kèm đường dẫn, mã QR, hướng dẫn và hạn nộp (3 tuần)
    D->>CB: Phổ biến link, mã QR và đôn đốc thực hiện (không công khai link)

    Note over CB,C: Giai đoạn Mở phiếu (3 tuần)
    CB->>C: Truy cập khảo sát, làm bài và Nộp phiếu trực tuyến
    C->>C: Kiểm tra hợp lệ, chống gửi đúp, tự động gắn cờ "nghi trùng"
    T->>C: Phòng QLĐT theo dõi tiến độ nộp phiếu hàng ngày qua Dashboard

    Note over T,C: Giai đoạn Sau đóng phiếu (2 tuần)
    C->>C: Khóa đường dẫn khảo sát khi hết hạn
    C->>T: Xuất dữ liệu gốc & 6 Bảng tổng hợp (Bản nội bộ)
    T->>T: Khoa Cơ sở / Chuyên ngành thẩm tra các phiếu nghi trùng
    T->>C: Xác nhận trạng thái phiếu hợp lệ cuối cùng
    C->>T: Tự động chạy thuật toán ẩn số liệu (<5 người)
    T->>D: Gửi Bảng tổng hợp của địa phương mình (đã áp dụng quy tắc ẩn)
    T->>T: Xây dựng Đề xuất & Khung chương trình đào tạo theo 4 bước
    T->>L: Trình Báo cáo kết quả khảo sát & Đề xuất đào tạo lên Phó Tổng KTNN
```

---

## 2. QUY TRÌNH TRẢI NGHIỆM LÀM BÀI KHẢO SÁT CỦA CÁN BỘ (RESPONDENT UX JOURNEY)

```mermaid
flowchart TD
    Start(["Quét mã QR / Truy cập link tỉnh"]) --> Step1["Phần I: Chọn Tỉnh, Xã, Đơn vị, Vị trí việc làm, Tư cách, Năm kinh nghiệm"]
    Step1 --> Step2["Phần II: Tải danh mục 16 nhóm công việc<br>(Nhóm gợi ý theo vị trí được xếp lên trước)"]
    Step2 --> Step2Choice{"Người dùng chọn trạng thái cho từng nhóm?"}
    
    Step2Choice -->|"Tất cả 16 nhóm đều là<br>'Không được giao' hoặc 'Chỉ phối hợp'"| EarlyExit["Chuyển sang Câu 7 (Việc khác)<br>Hiển thị thông báo: Ngoài đối tượng công việc"]
    EarlyExit --> SubmitEarly["Bấm Gửi phiếu<br>(Gắn cờ isOutOfScope: true, tính vào B1, loại B2-B6)"]
    SubmitEarly --> Finish(["Thông báo: Đã gửi thành công"])

    Step2Choice -->|"Có ít nhất 1 nhóm<br>'Đang thực hiện' hoặc 'Chưa có dịp'"| Step3["Phần III: Vòng lặp từng nhóm công việc hợp lệ"]
    
    subgraph LoopGroup ["Vòng lặp chi tiết từng Nhóm công việc"]
        Step3 --> Q8["Câu 8: Chọn vai trò (Trực tiếp / Tham mưu / Kiểm tra / Quyết định)"]
        Q8 --> Q9["Câu 9: Tự đánh giá mức 1-4 theo mô tả ngữ cảnh của từng vai trò đã chọn"]
        Q9 --> CheckState{"Trạng thái nhóm là gì?"}
        CheckState -->|"Đang thực hiện"| Q10["Câu 10: Chọn tối đa 2 khó khăn<br>(Không khó khăn là lựa chọn độc quyền)"]
        CheckState -->|"Chưa có dịp"| SkipQ10["Tự động ẨN Câu 10 khó khăn"]
        Q10 --> Q11["Câu 11: Chọn nội dung cần học trong nhóm"]
        SkipQ10 --> Q11
        Q11 --> CheckQ11{"Đã chọn ít nhất 1 nội dung ở Câu 11?"}
        CheckQ11 -->|Có| Q12["Câu 12: Chọn mức độ cần học (Ngay / Trong năm / Sau 1 năm)"]
        CheckQ11 -->|Không| SkipQ12["Bỏ qua Câu 12"]
    end

    Q12 --> NextGroup{"Còn nhóm công việc nào tiếp theo không?"}
    SkipQ12 --> NextGroup
    NextGroup -->|Còn nhóm| Step3
    NextGroup -->|Hết nhóm| Step4["Phần IV: Chọn tối đa 2 hình thức học (Câu 13) & Ý kiến tự do (Câu 14)"]
    
    Step4 --> SubmitFull["Bấm Gửi phiếu<br>(Validate toàn diện, ghi nhận database)"]
    SubmitFull --> Finish
```

---

## 3. QUY TRÌNH PHÁT HIỆN VÀ RÀ SOÁT PHIẾU NGHI TRÙNG (DUPLICATES REVIEW WORKFLOW)

```mermaid
flowchart TD
    Recv["Nhận phản hồi SurveyResponse"] --> HashCheck{"So khớp tiêu chí nghi trùng:<br>1. Cùng Xã/Phường<br>2. Cùng Cơ quan đơn vị<br>3. Cùng Vị trí việc làm<br>4. Trả lời giống nhau 16/16 nhóm ở Câu 6"}
    
    HashCheck -->|Không trùng| Valid["Gắn nhãn: HỢP LỆ (VALID)<br>Tự động đưa vào tính toán tổng hợp"]
    HashCheck -->|Khớp cả 4 tiêu chí| FlagDup["Gắn nhãn: NGHI TRÙNG (isSuspectedDuplicate = true)<br>Trạng thái: PENDING_REVIEW<br>KHÔNG TỰ ĐỘNG XÓA"]
    
    FlagDup --> ManualReview["Chuyên viên Khoa Cơ sở / Chuyên ngành thẩm tra:<br>- So sánh thời điểm gửi phiếu<br>- So sánh câu trả lời chi tiết Phần III, IV<br>- Đối chiếu số biên chế thực tế của vị trí đó tại xã"]
    
    ManualReview --> Decision{"Quyết định của Chuyên viên?"}
    Decision -->|Xác nhận cán bộ khác nhau| Approved["Đổi trạng thái: VALID<br>Ghi lý do thẩm tra"]
    Decision -->|Cùng 1 người gửi nhầm/gửi lại| Rejected["Đổi trạng thái: EXCLUDED<br>Ghi lý do: Gửi lại phiếu / gửi đúp"]
    
    Approved --> Calc["Đưa vào tổng hợp số liệu"]
    Rejected --> OutCalc["Loại khỏi B2 - B6<br>Thống kê số lượng và lý do loại tại Bảng B1"]
```

---

## 4. QUY TRÌNH THUẬT TOÁN ẨN DANH SỐ LIỆU NHÓM NHỎ (SUPPRESSION WORKFLOW)

Quy trình áp dụng cho việc công bố số liệu ra bên ngoài hoặc tài khoản Đầu mối địa phương:

```mermaid
flowchart TD
    InputCell["Duyệt qua từng ô số liệu và ô mẫu số trong Bảng B1 - B6"] --> CheckZero{"Giá trị ô = 0?"}
    CheckZero -->|Đúng| KeepZero["Cho phép công bố (Hiển thị 0)"]
    CheckZero -->|Sai| CheckThreshold{"Giá trị ô ∈ [1, 4]?"}
    
    CheckThreshold -->|Đúng| PrimarySup["ÁP DỤNG PRIMARY SUPPRESSION:<br>Thay thế giá trị bằng chuỗi: 'dưới 5 - không công bố'"]
    CheckThreshold -->|Sai (Giá trị >= 5)| KeepVal["Giữ nguyên giá trị số"]
    
    PrimarySup --> CheckRowDenom{"Ô này có phải là mẫu số của dòng?"}
    CheckRowDenom -->|Đúng| RowSup["ÁP DỤNG ROW SUPPRESSION:<br>Ẩn toàn bộ dòng (kể cả tỷ lệ % và khoảng thiếu hụt)"]
    CheckRowDenom -->|Không| NextCheck["Tiếp tục kiểm tra tổng"]
    
    RowSup --> CheckSecondary["Kiểm tra Secondary Suppression"]
    KeepVal --> CheckSecondary
    NextCheck --> CheckSecondary
    
    subgraph SecSup ["Thuật toán Secondary Suppression"]
        CheckSecondary --> SumCheck{"Hàng hoặc cột có ô Tổng (Total)?<br>Và trong hàng/cột đó chỉ có DUY NHẤT 1 ô bị ẩn?"}
        SumCheck -->|Đúng| FindMin["Tìm ô có giá trị nhỏ nhất kế tiếp trong hàng/cột đó"]
        FindMin --> SupMin["Thực hiện ẩn bổ sung ô nhỏ nhất đó<br>(Chống việc lấy Tổng trừ để suy ra ô ẩn)"]
        SumCheck -->|Sai| EndSec["Không cần ẩn bổ sung"]
    end
    
    SupMin --> FinalOutput["Bảng Báo cáo an toàn bàn giao cho Địa phương"]
    EndSec --> FinalOutput
```

---

## 5. QUY TRÌNH 4 BƯỚC CHUYỂN HÓA KẾT QUẢ THÀNH CHƯƠNG TRÌNH ĐÀO TẠO

Căn cứ quy định tại Phần V Tài liệu số 2:
1. **Bước 1 (Xuất & Đối chiếu dữ liệu):** Cục Tin học xuất dữ liệu gốc và 6 bảng tổng hợp; Khoa Cơ sở đối chiếu chéo số liệu trước khi đưa vào sử dụng.
2. **Bước 2 (Lập Đề xuất đào tạo từng địa phương):** Khoa Cơ sở và Khoa Chuyên ngành lập phiếu đề xuất đào tạo căn cứ vào:
   - Quy mô nhu cầu (Tỷ lệ người dưới mức yêu cầu ở Bảng B3).
   - Tính chất nhu cầu (Phân bố thiếu 1 mức vs thiếu 2-3 mức ở B3).
   - Nội dung cấp thiết cần học ngay (Bảng B4).
   - Khó khăn nội tại về kiến thức, kỹ năng (Bảng B5) tách biệt với khó khăn thể chế/công cụ.
   - Hình thức học ưu tiên của địa phương (Bảng B6).
3. **Bước 3 (Chuyển thành Chương trình đào tạo):** Hội đồng/Ban Biên soạn chuyển đề xuất thành khung chương trình chi tiết: Đối tượng, Nội dung chuyên đề, Hình thức tổ chức, Thời lượng.
4. **Bước 4 (Báo cáo & Phổ biến kết quả):** Giám đốc Trường ký Báo cáo trình Lãnh đạo Kiểm toán nhà nước; đồng thời gửi Bảng tổng hợp đã ẩn danh cho địa phương.
