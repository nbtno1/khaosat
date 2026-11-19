# ASSUMPTIONS AND OPEN QUESTIONS — GIẢ ĐỊNH VÀ CÁC VẤN ĐỀ CẦN QUYẾT ĐỊNH

## Bổ sung đánh giá quy tắc UI — 19/11/2026 (chưa đổi Spec ứng dụng)

- **Yêu cầu phương án 02 tiếp theo:** người dùng yêu cầu bản riêng, chữ lớn, bớt chi tiết phụ và thao tác mượt. Bản `DE-XUAT-GIAO-DIEN-02-DE-DOC-2026-11-19.html` chọn body 18px/control 48–50px, root 16px mặc định; không đồng nhất với cấu hình Large/root 18px của phương án trước. Đây là lựa chọn trình bày theo yêu cầu mới, chưa thay Spec/mặc định ứng dụng. Màu/bố cục được đề xuất riêng; không đổi nghiệp vụ, schema, API hoặc stack. Khi triển khai phải giữ kiểm tra server, RBAC/suppression và các điểm drift nghiệp vụ đã ghi nhận.

- **Cỡ chữ:** quy tắc ghi Small/root 15px là mặc định, trong khi Spec phiếu và yêu cầu người dùng ưu tiên nội dung từ 16px. Prototype khởi tạo Large/root 18px theo nhu cầu xem; giữ vùng chạm phiếu ≥44px. Cần duyệt hồ sơ hiển thị của dự án trước triển khai.
- **Cuộn:** quy tắc cho phép cuộn ngoài khi bảng chiếm dưới 50%; AGENTS yêu cầu Zero-Page-Scroll tuyệt đối cho Admin. Bản đề xuất giữ cuộn vùng nội dung theo yêu cầu dự án; chưa thay AGENTS.
- **Thời gian:** quy tắc chung và mục nhật ký khác nhau về phần giây/GMT+7. Cần thống nhất một định dạng và múi giờ hiển thị; prototype không khẳng định thời gian demo là dữ liệu server.
- **Tùy chọn chưa rõ:** các lựa chọn “Kiểu đặt dấu” có nhãn trùng; chưa đưa thành cài đặt. Cài đặt hiển thị trong HTML chỉ giữ ở bộ nhớ tab, không giả lập đã lưu server. URL có thể giữ bộ lọc của liên kết drill-down.
- **Mức tuân thủ:** áp dụng các mục phù hợp nghiệp vụ; không kết luận đã triển khai toàn bộ quy tắc. Chưa mô phỏng chọn dải ô/khối hàng, kéo đổi thứ tự cột hoặc lưu cấu hình server. Các phần Gantt/lịch và chức năng ngoài KHAOSAT không được tự thêm.
- **Impact Analysis:** thay đổi ở tài liệu/prototype, không yêu cầu schema/API mới. Khi triển khai ứng dụng cần giữ stack, RBAC, Zod, suppression server và progressive rendering; xử lý riêng các drift nghiệp vụ đã ghi trước đó. Không đổi trạng thái 24 task ứng dụng.

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

## 2. CÁC VẤN ĐỀ ĐÃ ĐƯỢC PHÊ DUYỆT (RESOLVED DECISIONS)

### Vấn đề 1: Danh mục đơn vị hành chính 3.321 Xã/Phường
- **Quyết định:** Người dùng sẽ bổ sung danh mục dưới dạng file JSON chuẩn hóa; hệ thống xây dựng sẵn cấu trúc schema và script import tự động vào MongoDB. Giai đoạn khởi tạo sẽ seed sẵn cấu trúc mẫu và các địa bàn thử nghiệm (Pilot).
- **Trạng thái:** ĐÃ THỐNG NHẤT (RESOLVED ngày 14/11/2026).

### Vấn đề 2: Xuất hàng loạt Mã QR cho 34 Tỉnh (.zip)
- **Quyết định:** Bổ sung tính năng "Tải trọn bộ Mã QR 34 tỉnh (.zip)" trên màn hình quản lý đợt khảo sát để chuyên viên Văn phòng Trường tiện chèn vào văn bản gửi địa phương.
- **Trạng thái:** ĐÃ THỐNG NHẤT (RESOLVED ngày 14/11/2026).

### Vấn đề 3: Phạm vi triển khai ưu tiên
- **Quyết định:** Tập trung hoàn thiện trọn vẹn phạm vi MVP (từ Milestone 1 đến Milestone 5): Cổng khảo sát di động, 16 nhóm việc động, chống gửi đúp và rà soát trùng, 6 bảng tổng hợp B1–B6, thuật toán ẩn danh dưới 5 người, xuất báo cáo Excel và đáp ứng 23 ca kiểm thử chuẩn.
- **Trạng thái:** ĐÃ THỐNG NHẤT (RESOLVED ngày 14/11/2026).

## Ghi nhận khi khảo sát repo ngày 18/11/2026 — Chờ xác nhận

Các điểm dưới đây được ghi nhận từ mã nguồn, không thay đổi yêu cầu đã duyệt và chưa triển khai sửa ứng dụng.

1. **Công nghệ thực tế khác mô tả:** `AGENTS.md` và `specs/00-PROJECT-OVERVIEW.md` quy định Tailwind CSS v4, Auth.js v5; `package.json` hiện khai báo Tailwind CSS v3, không khai báo Auth.js; `src/lib/auth.ts` tự ký token HMAC SHA-256. Cần xác nhận hướng đồng bộ tài liệu hoặc triển khai. Tác động cần đánh giá: UI/styling, API xác thực, phiên đăng nhập và bộ test auth; database tùy phương án xác thực được duyệt.
2. **Cấu hình seed có thể khác database ứng dụng:** `.env.example` và `src/lib/db.ts` dùng `khaosat_db`, trong khi `scripts/seed.ts` mặc định dùng `khaosat`. Lệnh `db:seed` chỉ gọi `tsx`, script không tự nạp `.env`. Khi hướng dẫn chạy local, cần truyền biến môi trường rõ ràng, ví dụ `node --env-file=.env --import=tsx scripts/seed.ts`. Nếu không kết nối DB, seed chỉ kiểm tra JSON offline rồi kết thúc; không được xem đó là bằng chứng đã nạp dữ liệu. Tác động: dữ liệu khởi tạo, API đọc dữ liệu, màn hình quản trị và kiểm thử tích hợp setup.
3. **Seed chưa đồng bộ Dual-Admin và còn tài khoản dự phòng:** ADR-013 quy định `cntt_admin` có role `TECHNICAL_ADMIN`, `admin` có role `SYSTEM_ADMIN`. `scripts/seed.ts` hiện chỉ tạo `admin` với role `TECHNICAL_ADMIN`; `src/app/api/auth/login/route.ts` có tài khoản dự phòng và mật khẩu mặc định khi không tìm thấy user trong DB, không giới hạn rõ theo môi trường. Cần PO xác nhận task sửa để đáp ứng quy tắc không có logic giả trong production. Tác động: dữ liệu User, API login/RBAC, UI hiển thị quyền và kiểm thử xác thực/audit logs.
4. **Hướng dẫn mở khảo sát trong README khác token seed:** README minh họa `LINK-PROV-42-HATINH`, còn seed sinh token dạng `pilot_dot-1-2026_p{provinceCode}`. Hướng dẫn chạy thử cần lấy liên kết từ `/admin/campaigns` sau khi seed đúng DB. Tác động: tài liệu setup và smoke test đường dẫn khảo sát; chưa thay đổi schema/API/UI.


## Rà soát giao diện theo yêu cầu ngày 18/11/2026

- Bản đề xuất và ảnh minh họa: [Đề xuất cải tiến giao diện](../docs/DE-XUAT-CAI-TIEN-GIAO-DIEN-2026-11-18.html). Người dùng yêu cầu rà soát, đề xuất chi tiết; chưa yêu cầu triển khai src/.
- Sai lệch cần ghi nhận: specs/10 quy định nội dung mobile tối thiểu 16px; đo trực tiếp select của phiếu ở 390px đang là 12px, cao 38px. Đề xuất nội dung public 18px và admin 16px, kèm bố cục để tăng chữ không che nội dung.
- Không nhất quán hiển thị: p20 trả về Tỉnh Lạng Sơn, nhưng đường tắt sidebar ghi Thái Nguyên. Cần đối chiếu danh mục chuẩn và dữ liệu pilot, chưa tự sửa mã/tên tỉnh.
- Impact Analysis: phần thị giác không cần đổi DB schema hay thêm API; ảnh hưởng layout admin, dashboard, Select, các bước survey và CSS theo route. Cần kiểm tra font, vùng bấm, viewport, bàn phím, phóng chữ, luồng 4 bước; giữ RBAC, Zero-PII, useProgressiveItems và Zero-Page-Scroll của Admin.
- Trạng thái: đề xuất để xem xét, chưa thay Spec đã duyệt và chưa sửa mã ứng dụng.
- Đối chiếu bổ sung ngoài phần thị giác: `specs/10-UI-UX-SPECIFICATION.md` ghi Câu 7 tối đa 300 ký tự, trong khi màn hình bước 2 hiện hiển thị tối đa 500 ký tự và bộ đếm 0/500. Cần đối chiếu đặc tả validation và phiếu nghiệp vụ đã duyệt trước khi quyết định; chưa tự đổi giới hạn hoặc mã ứng dụng.
- Điều chỉnh đề xuất theo góp ý tiếp theo: giữ cỡ chữ dễ đọc nhưng bổ sung trang trí có chọn lọc (icon chức năng, thẻ chỉ số có viền/bóng nhẹ, màu nhấn và tiến trình trực quan). Báo cáo HTML được cập nhật thành bản điều chỉnh 2; chưa triển khai mã ứng dụng, DB hoặc API.
- Cập nhật Bản điều chỉnh 3 theo mong muốn người dùng: hoàn thiện phong cách “dễ nhìn, chuyên nghiệp nhưng không bị đơn giản quá” (khôi phục chiều sâu thẻ KPI có vạch màu đỉnh 4px & dòng ngữ cảnh phụ 14px, Segmented Tabs, Status Pill Badge 14px, nút thao tác đóng khung, Banner từng Phần và Thẻ câu hỏi rõ ràng) đồng thời mở rộng bản minh họa và quy chuẩn áp dụng đồng bộ cho toàn bộ 10 trang Quản trị, trang Đăng nhập và trọn vẹn 4 bước Phiếu khảo sát trong `docs/DE-XUAT-CAI-TIEN-GIAO-DIEN-2026-11-18.html`. Chờ xác nhận bản minh họa HTML trước khi sửa mã nguồn `src/`.

## Đánh giá bản đề xuất mới nhất gồm 18 ảnh

- Căn cứ: file HTML `docs/DE-XUAT-CAI-TIEN-GIAO-DIEN-2026-11-18.html`, tiêu đề “KHAOSAT — Đề xuất giao diện tinh gọn, dễ nhìn, chuyên nghiệp”, dung lượng 2.262.575 byte, cập nhật 18/11/2026 16:56 giờ địa phương. Đã trích và xem ảnh nhúng trực tiếp, không dùng ảnh bản cũ để đánh giá.
- Bản minh họa đang rút gọn nội dung nghiệp vụ: prototype bước 1 chỉ có Câu 1–4; bước 3 chỉ có Câu 9 và 11, không có lựa chọn vai trò Câu 8 và các câu 10/12 theo điều kiện của Spec 12; mô tả mức năng lực được viết lại dạng chung; bước 4 không có lựa chọn riêng “Học trực tuyến” trong 5 hình thức đã đặc tả. Cần phân biệt rõ ảnh trích đoạn với bộ phiếu đầy đủ, không lấy các prototype rút gọn làm nguồn thay thế yêu cầu đã duyệt.
- Ảnh B3 ghi Điểm TB/Chuẩn 2,15/3,00 nhưng Gap -0,85, không khớp công thức Req - Self tại Spec 12 và CapacityGapService (trường hợp này là +0,85). Chưa thay công thức hoặc mã nguồn.
- UX cần chỉnh: nút Tiếp tục trên ảnh mobile bị tách thành hai dòng; cụm nhận diện và banner chiếm khoảng một phần ba màn hình; biểu đồ có khoảng trắng lớn đẩy dữ liệu xuống thấp.
- Phạm vi tài liệu cần chính xác: có 10 route Admin và 1 route đăng nhập; ảnh mới chỉ minh họa Dashboard/biểu đồ, Analytics và public 4 bước. Các trang Admin còn lại mới có mô tả định hướng. `qa-results.json` hiện vẫn ghi 15 ảnh, cần cập nhật bằng chứng tương ứng bản 18 ảnh.
- Impact Analysis: chưa thay DB/API/UI ứng dụng. Trước khi triển khai cần đối chiếu đủ câu hỏi/lựa chọn, định nghĩa theo vai trò, công thức B3 và RBAC; kiểm tra validation/rẽ nhánh, bộ test analytics, màn hình mobile các bước và layout. Trạng thái: kết quả rà soát, chưa phê duyệt thay đổi nghiệp vụ; giữ nguyên file thiết kế để người dùng xem xét.

## Hiệu đính file đề xuất theo yêu cầu người dùng ngày 18/11/2026

- Đã sửa trực tiếp [file đề xuất giao diện](../docs/DE-XUAT-CAI-TIEN-GIAO-DIEN-2026-11-18.html), giữ phong cách hiện tại và dựng lại ảnh. Prototype có đủ 14 câu, 16 nhóm, 4 vai trò, 7 tư cách, 3 mức kinh nghiệm, 7 khó khăn và 5 hình thức học; Câu 9 dùng nguyên văn mô tả theo vai trò từ schema 3.3. Đây là minh họa tĩnh có thông tin điền sẵn, không phải biểu mẫu chức năng đã được nghiệm thu.
- Đã sửa B3 theo nhóm công việc × vai trò, công thức Gap = Req - Self, tỷ lệ dưới chuẩn và số người thiếu 1/2/3 mức. Số liệu mẫu được tính từ phân bố mức 1–4 và được ghi rõ là minh họa. Giữ yêu cầu bảo mật số nhỏ, chế độ báo cáo và RBAC; không thay nghiệp vụ hoặc mã nguồn.
- Đã sửa nút mobile một dòng, thu gọn banner, bố cục biểu đồ và phạm vi tài liệu: 10 route Admin cộng trang đăng nhập; chỉ Dashboard/Analytics có ảnh Admin riêng, các trang còn lại là định hướng. Bổ sung ảnh dài bước 1/3 và ảnh mobile bước 2–4 để tránh hiểu nhầm ảnh viewport là toàn bộ phiếu.
- Bằng chứng: `output/playwright/ui-review/corrected-review-qa.json` và `qa-results.json` được tạo lại bởi `render-corrected-review.mjs`: 23 ảnh giải mã thành công, 0 ảnh lỗi; báo cáo không tràn ngang ở 1440/768/375px; 12 trường hợp mobile (4 bước × 320/375/390px) không tràn ngang, nhãn nút một dòng, nội dung cuối tiếp cận được bằng cuộn; Dashboard scrollY = 0 ở 1440×900 và 1366×768. Đã kiểm tra mục lục, chuyển ảnh, phóng 100% và đóng bằng Escape. Kiểm tra mô tả Câu 9 và phép tính B3 đạt. Đây là kiểm tra tài liệu/prototype, không thay cho kiểm thử ứng dụng thật hoặc khả năng tiếp cận 200%.
- Điểm còn mở: giới hạn Câu 7 vẫn là 300 ký tự trong Spec 10 và 500 trong Zod/giao diện hiện tại. Báo cáo nêu rõ khác biệt, minh họa không tự chọn giới hạn và không sửa validation. Chưa thay `src/`, DB, API hoặc trạng thái các task phát triển đã hoàn thành.

## Nâng cấp đề xuất thành prototype tương tác — 18/11/2026

- Theo yêu cầu mới, đã nâng trực tiếp [file đề xuất](../docs/DE-XUAT-CAI-TIEN-GIAO-DIEN-2026-11-18.html) thành HTML tự chứa, mở bằng trình duyệt không cần máy chủ. Có Dashboard, B1–B6, đủ 10 trang Admin, đăng nhập và phiếu 4 bước. Các trang có cấu trúc/tương tác theo chức năng riêng; không thay source ứng dụng.
- Phương án thống nhất: xanh công vụ, nền trung tính, thang chữ theo nhiệm vụ, icon nét đồng nhất; điều khiển có focus/pressed/selected, sidebar/drawer, native popover/dialog, chuyển nội dung ngắn và reduced motion. Analytics ưu tiên bảng chi tiết, có chuyển sang biểu đồ; Dashboard có tìm/lọc/sắp xếp/phân trang. Dữ liệu tổng hợp giả được dùng chung giữa Dashboard, Analytics và thẩm tra.
- Phiếu mặc định trống, chỉ điền bộ mẫu khi người xem chủ động chọn. Giữ 14 câu, 16 nhóm, 4 vai trò/thang theo vai trò, 5 hình thức; có validation, điều kiện, kết thúc sớm, giữ và dọn câu trả lời khi quay lại; mô phỏng lỗi/thành công, khóa nút khi xử lý. Không gửi hoặc lưu lên máy chủ.
- B3 tính Gap từ điểm gốc trước khi làm tròn; mẫu số chỉ gồm người đang thực hiện vai trò, chưa có dịp tính riêng. B4 là chuyên đề, B5 là khó khăn. Bản địa phương áp dụng primary/row/secondary và ẩn dẫn xuất thận trọng, giữ giá trị 0 khi không thuộc dòng bị ẩn toàn bộ. RBAC chỉ là mô phỏng client; dữ liệu trong file HTML không được bảo vệ bằng việc ẩn giao diện. Server vẫn là nơi kiểm tra quyền và bảo vệ số liệu khi triển khai thật.
- Bản trước được giữ nguyên từng byte trong dữ liệu nhúng, gồm 23 ảnh, mục lục, phóng ảnh và lệnh in riêng; thêm 4 ảnh chụp prototype mới và so sánh trước/sau. Ghi rõ một số nhãn B4/B5 trong ảnh lịch sử chưa chuẩn, không dùng các ảnh đó làm nguồn nghiệp vụ cho bản mới. Có bố cục in phương án mới và kiểm tra sinh PDF.
- Bằng chứng: `output/playwright/ui-studio/interactive-qa.json` (595 kiểm tra đầy đủ + 182 kiểm tra đóng gói, tổng 777; 136 trường hợp viewport/phóng chữ), `bundle-verification.json` (PASS, 0 lỗi JavaScript, 0 ảnh lỗi, 0 yêu cầu mạng). Đã kiểm tra 320/375/390/768/1366/1440px, Zero-Page-Scroll, bàn phím, focus dialog, tabs, popover, giữ/dọn dữ liệu, xuất CSV bảo vệ, QR và in. Đã xem ảnh thực tế; ảnh bàn giao được chụp khi thông báo tạm đã hết. Chưa kiểm thử Safari/iPhone thật hoặc chứng nhận VoiceOver/NVDA/WCAG.
- Điểm cần thống nhất: Câu 7 Spec 300 / Zod 500 vẫn chưa chốt, prototype chỉ đếm ký tự; trường Khác dùng 200 theo Spec 12 trong khi Zod hiện tại 255; Part1 Zod còn yêu cầu `districtName`, không tự thêm cấp hành chính vào phiếu theo danh mục mới; mã trạng thái/payload có khác biệt giữa trích yếu Spec và seed/Zod. Các khác biệt đã được trình bày trong mục Kiểm thử & phạm vi, chưa sửa validation/model/API.
- Giới hạn demo được công bố: thay đổi chỉ ở bộ nhớ tab; CSV/JSON/SVG demo có thể tải thật, QR trỏ `example.invalid`; chưa tạo XLSX đa sheet, ZIP 34 QR, dữ liệu gốc mã hóa, phiên đăng nhập server hoặc ký duyệt điện tử. Các nút xử lý quan trọng có mô phỏng và xác nhận rõ, không báo đã gửi/lưu máy chủ.
- Impact Analysis cho bước triển khai: không cần schema/endpoint mới chỉ cho phần thị giác; giữ version, mã dữ liệu, Zero-PII, Zod/RBAC/suppression server, khung Admin full-height và `useProgressiveItems`. Cần duyệt phương án và thống nhất các drift nêu trên trước khi thay `src/`; test ứng dụng liên quan phải chạy khi thực sự triển khai. Không đổi trạng thái 24 task đã hoàn thành.
