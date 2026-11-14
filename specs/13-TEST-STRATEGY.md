# 13. TEST STRATEGY — CHIẾN LƯỢC KIỂM THỬ VÀ 23 CA KIỂM THỬ CHUẨN

## 1. MÔ HÌNH KIM TỰ THÁP KIỂM THỬ (TESTING PYRAMID)

Hệ thống áp dụng chiến lược kiểm thử đa tầng nghiêm ngặt bảo đảm chất lượng sản phẩm trước khi phát hành chính thức:

```text
               / \
              /   \
             / E2E \       Playwright: 23 Ca kiểm thử kịch bản người dùng toàn diện
            /-------\
           / Integr. \     Next.js Route Handlers + MongoDB Test Environment
          /-----------\
         /    Unit     \   Jest: Zod Schemas, Suppression Algorithm, Gap Calculator
        /---------------\
```

- **Unit Testing (Jest):** Kiểm thử các hàm độc lập, thuật toán tính toán khoảng thiếu hụt, thuật toán ẩn số liệu Suppression, logic dọn dẹp state và Zod schema validations. Độ bao phủ (Coverage) tối thiểu: **85%**.
- **Integration Testing (Jest + Supertest):** Kiểm thử các Route Handlers, middleware RBAC, logic giao dịch database, phát hiện phiếu nghi trùng và sinh file Excel.
- **End-to-End Testing (Playwright):** Kiểm thử hành vi thực tế trên trình duyệt Desktop và Mobile (Chrome, Safari, Firefox), kiểm tra phản hồi tương tác, điều hướng quay lại (back-navigation) và nộp phiếu.

---

## 2. ĐẶC TẢ CHI TIẾT 23 CA KIỂM THỬ NGHIỆP VỤ (23 BUSINESS TEST CASES)

23 ca kiểm thử được quy định tại văn bản *Phương án triển khai phối hợp với Cục Tin học* (Mục V.2 và VI.1) được cụ thể hóa thành bộ kịch bản kiểm thử:

| Mã Ca kiểm | Tên Ca kiểm thử | Điều kiện đầu vào & Thao tác | Kết quả mong đợi (Acceptance Criteria) |
|:---:|:---|:---|:---|
| **TC-01** | **Cán bộ ngoài đối tượng theo công việc (Early Exit)** | Chọn Câu 6 với toàn bộ 16 nhóm đều là "Không được giao" hoặc "Chỉ phối hợp" → Điền Câu 7. | Phiếu kết thúc ngay sau Câu 7, ẩn hoàn toàn Phần III và IV. Phiếu ghi nhận cờ `isOutOfScope = true`, được tính vào B1 nhưng bị loại khỏi B2-B6. |
| **TC-02** | **Cán bộ kiêm nhiệm nhiều nhóm công việc** | Chọn 5 nhóm ở trạng thái "Đang thực hiện" hoặc "Chưa có dịp". | Phần II hiển thị đủ 16 nhóm; Phần III tự động lặp đúng 5 vòng cho 5 nhóm đã chọn; Bảng B2 ghi nhận đúng từng nhóm. |
| **TC-03** | **Cán bộ có nhiều vai trò trong cùng một nhóm** | Tại Câu 8 của 1 nhóm, chọn cả 2 vai trò: "Tham mưu" và "Trực tiếp thực hiện". | Câu 9 hiển thị chính xác 2 dòng chọn mức tương ứng với mô tả riêng của từng vai trò; Bảng B3 đếm người này ở cả 2 dòng vai trò. |
| **TC-04** | **Cán bộ được giao nhưng chưa có dịp thực hiện** | Chọn nhóm N05 trạng thái "Được giao nhưng chưa có dịp thực hiện". | Phần III của nhóm này hỏi Câu 8, Câu 9, Câu 11; **tự động ẨN Câu 10 (Khó khăn)**; Bảng B3 và B4 tính riêng ở cột Chưa có dịp; không vào B5. |
| **TC-05** | **Cán bộ chỉ phối hợp** | Chọn nhóm N10 trạng thái "Chỉ phối hợp". | Nhóm N10 không xuất hiện trong Phần III; Bảng B2 đếm người này ở cột "Chỉ phối hợp"; không tham gia B3-B6. |
| **TC-06** | **Quay lại đổi từ Đang thực hiện sang Chỉ phối hợp** | Đã trả lời Phần III của nhóm N01 → Bấm Quay lại (Back) → Đổi N01 thành "Chỉ phối hợp" → Bấm Tiếp tục. | Toàn bộ câu trả lời Phần III của nhóm N01 bị xóa sạch khỏi state; dữ liệu gửi lên không còn câu trả lời của N01. |
| **TC-07** | **Quay lại bỏ 1 vai trò đã chọn** | Nhóm N01 đã chọn vai trò "Tham mưu" và "Trực tiếp", đã chấm mức ở Câu 9 → Quay lại Câu 8 bỏ chọn "Tham mưu". | Câu 9 chỉ còn hiển thị dòng "Trực tiếp thực hiện"; điểm mức của vai trò "Tham mưu" bị xóa khỏi dữ liệu. |
| **TC-08** | **Quay lại đổi từ Đang thực hiện sang Chưa có dịp** | Nhóm N05 đang làm, đã chọn khó khăn Câu 10 → Quay lại Câu 6 đổi sang "Chưa có dịp". | Câu 10 bị ẩn, dữ liệu khó khăn của Câu 10 bị xóa bỏ hoàn toàn. |
| **TC-09** | **Quay lại đổi tất cả 16 nhóm sang ngoài đối tượng** | Đã làm đến Phần IV → Quay lại Câu 6 đổi cả 16 nhóm thành "Không được giao". | Phiếu kết thúc sau Câu 7; toàn bộ dữ liệu Phần III và IV đã làm trước đó bị hủy bỏ. |
| **TC-10** | **Ràng buộc chọn tối đa 2 khó khăn (Câu 10)** | Đang chọn 2 mục khó khăn → Cố gắng tích chọn mục thứ 3. | Hệ thống chặn không cho chọn mục thứ 3 và hiển thị cảnh báo "Chỉ được chọn tối đa 2 khó khăn". |
| **TC-11** | **Tính độc quyền của mục "Không khó khăn" (Câu 10)** | Đang chọn mục khó khăn khác → Bấm chọn "Không gặp khó khăn đáng kể" (và ngược lại). | Toàn bộ các mục khó khăn khác tự động bị bỏ chọn; khi mục độc quyền đang chọn thì các mục khác bị vô hiệu hóa. |
| **TC-12** | **Điều kiện hiển thị Câu 12 (Mức độ cần học)** | Xem xét Câu 12 khi: (a) Câu 11 chưa chọn mục nào; (b) Câu 11 đã chọn ít nhất 1 mục. | Trường hợp (a): Câu 12 bị ẩn; Trường hợp (b): Câu 12 hiển thị 3 radio chọn mức cấp thiết. |
| **TC-13** | **Sắp xếp nhóm gợi ý theo Vị trí việc làm** | Chọn vị trí "Chủ tịch UBND" tại Câu 3 → Chuyển sang Câu 6. | 9 nhóm gợi ý (1, 2, 4, 5, 7, 9, 10, 13, 14) được tự động xếp lên đầu danh sách; không có radio nào bị tích sẵn. |
| **TC-14** | **Chống nộp đúp (Double Submission)** | Bấm liên tục nút "Gửi" nhiều lần trong 1 giây. | Nút Gửi bị vô hiệu hóa ngay lập tức kèm biểu tượng xoay (loading); chỉ có duy nhất 1 bản ghi được tạo trong database. |
| **TC-15** | **Tự động nhận diện phiếu nghi trùng** | 2 lần gửi có cùng Xã, cùng Đơn vị, cùng Vị trí và lựa chọn 16 nhóm ở Câu 6 giống hệt nhau. | Bản ghi thứ hai được tự động gắn cờ `isSuspectedDuplicate = true`, trạng thái `PENDING_REVIEW`, không bị xóa. |
| **TC-16** | **Thẩm tra & Loại trừ phiếu nghi trùng** | Chuyên viên Khoa Cơ sở vào Review Workbench, chọn phiếu nghi trùng và bấm "Loại trừ" kèm nhập lý do. | Trạng thái chuyển thành `EXCLUDED`; phiếu này bị loại khỏi B1-B6; Bảng B1 ghi nhận số lượng phiếu loại và hiển thị lý do. |
| **TC-17** | **Tính toán Khoảng thiếu hụt Bảng B3** | Dữ liệu thử nghiệm: Nhóm N08, vai trò Trực tiếp, Mức yêu cầu = 3; Người làm chấm mức 2. | Tính ra $\text{Gap} = 3 - 2 = 1$; tính là "Dưới mức yêu cầu" và phân loại vào cột "Thiếu 1 mức"; tỷ lệ tính chuẩn xác. |
| **TC-18** | **Xử lý ô không có Mức yêu cầu chuẩn** | Nhóm công việc × Vai trò không có trong bảng Benchmark Matrix. | Cột Mức yêu cầu để trống, không tính khoảng thiếu hụt, không gán giá trị mặc định, vẫn tổng hợp số người ở các mức 1-4. |
| **TC-19** | **Thuật toán Primary Suppression (<5 người)** | Xuất báo cáo địa phương có ô đếm số người $n \in [1, 4]$ và ô có $n = 0$. | Ô $n \in [1, 4]$ hiển thị chuỗi `"dưới 5 - không công bố"`; ô $n = 0$ hiển thị `0`. |
| **TC-20** | **Thuật toán Row Suppression** | Dòng có mẫu số (tổng số người) $N \in [1, 4]$. | Toàn bộ dòng bị ẩn danh, mọi ô trong dòng đều hiển thị `"dưới 5 - không công bố"`. |
| **TC-21** | **Thuật toán Secondary Suppression** | Trong 1 hàng có Tổng và chỉ có đúng 1 ô bị ẩn theo Primary Suppression. | Hệ thống tự động tìm và ẩn thêm ô có giá trị nhỏ nhất tiếp theo trong hàng đó để triệt tiêu việc lấy Tổng trừ ngược. |
| **TC-22** | **Phân quyền truy cập Đầu mối địa phương** | Đăng nhập tài khoản `LOCAL_COORDINATOR` của Tỉnh A → Cố tình request API báo cáo Tỉnh B hoặc dữ liệu gốc. | Trả về lỗi HTTP 403 Forbidden; giao diện chỉ xem được Bảng B1-B6 của Tỉnh A đã áp dụng thuật toán ẩn danh < 5 người. |
| **TC-23** | **Xuất file Excel Đa bảng chuẩn** | Bấm xuất báo cáo Excel cho một chiến dịch khảo sát. | File `.xlsx` được tải về với đủ 6 sheet B1-B6, có tiêu đề ghi rõ số phiên bản "3.3", mở chuẩn xác trên MS Excel và Google Sheets. |

---

## 3. QUY TRÌNH CHẠY TEST TỰ ĐỘNG (CI/CD PIPELINE)
- **Pre-commit Hook:** Tự động chạy ESLint, Prettier và TypeScript Typecheck (`tsc --noEmit`).
- **PR Check (Continuous Integration):**
  1. Chạy toàn bộ Unit Tests (`npm run test:unit`).
  2. Khởi tạo MongoDB Memory Server và chạy Integration Tests (`npm run test:integration`).
  3. Khởi chạy Next.js server và thực thi bộ 23 Test Cases bằng Playwright Headless (`npm run test:e2e`).
- **Quy tắc cổng chất lượng (Quality Gate):** Mọi pull request chỉ được phép merge khi 100% test cases đều pass và không có lỗi TypeScript hay Linting.
