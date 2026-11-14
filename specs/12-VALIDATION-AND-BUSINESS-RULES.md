# 12. VALIDATION AND BUSINESS RULES — QUY TẮC KIỂM TRA VÀ NGHIỆP VỤ

## 1. 12 QUY TẮC HIỂN THỊ VÀ VẬN HÀNH KHẢO SÁT CHUẨN

Tất cả 12 quy tắc nghiệp vụ từ Phụ lục Tài liệu số 1 và Tài liệu số 2 được chuẩn hóa thành các luật logic bắt buộc tuân thủ:

### Quy tắc 1 (Hiển thị Câu 6 & Sắp xếp nhóm gợi ý)
- Câu 6 phải hiển thị đầy đủ 16 nhóm công việc (N01 đến N16).
- Các nhóm công việc gợi ý theo vị trí việc làm (tra cứu theo `agencyCode` và `positionCode` tại Câu 3) phải được tự động xếp lên trước; các nhóm còn lại xếp tiếp sau.
- Hệ thống **tuyệt đối không được chọn sẵn** bất kỳ trạng thái nào trong 4 lựa chọn.
- 4 trường hợp của mỗi nhóm là loại trừ lẫn nhau (Mutually Exclusive).

### Quy tắc 2 (Hiển thị Phần III theo nhóm hợp lệ)
- Phần III (từ Câu 8 đến Câu 12) **chỉ hiển thị** cho các nhóm công việc mà người dùng đã chọn trạng thái:
  $$\text{Status} \in \{\text{'CURRENTLY\_DOING'}, \text{'ASSIGNED\_NOT\_YET'}\}$$
- Phần III được lặp lại độc lập cho từng nhóm hợp lệ. Nhóm nào có trạng thái là `"COORDINATING_ONLY"` (Chỉ phối hợp) hoặc `"NOT_ASSIGNED"` (Không được giao) thì không xuất hiện ở Phần III.

### Quy tắc 3 (Danh mục Chuyên đề học tập của Câu 11)
- Câu 11 của nhóm công việc nào thì **chỉ hiển thị đúng danh mục nội dung cần học** của riêng nhóm công việc đó (theo danh mục chuẩn tại Phần D Tài liệu số 1), kèm tùy chọn "Khác (ghi rõ)".

### Quy tắc 4 (Hiển thị Câu 9 theo Vai trò Câu 8)
- Câu 9 hiển thị chính xác một dòng chọn mức (Thang 1 đến 4) cho mỗi vai trò đã được tích chọn ở Câu 8.
- Nhãn mô tả ngữ cảnh của 4 mức phải khớp chính xác với định nghĩa của vai trò đó (Trực tiếp thực hiện / Tham mưu / Kiểm tra, giám sát / Quyết định, phê duyệt).

### Quy tắc 5 (Điều kiện hiển thị Câu 10 Khó khăn)
- Câu 10 (Khó khăn) **chỉ hiển thị** khi nhóm công việc đó có trạng thái là `"CURRENTLY_DOING"` (Đang thực hiện).
- Nếu nhóm có trạng thái là `"ASSIGNED_NOT_YET"` (Được giao nhưng chưa có dịp), Câu 10 **bắt buộc bị ẩn**.

### Quy tắc 6 (Ràng buộc lựa chọn Khó khăn tại Câu 10)
- Người dùng được chọn tối đa 2 khó khăn trong danh mục 6 loại khó khăn.
- Lựa chọn *"Không gặp khó khăn đáng kể"* là lựa chọn độc quyền (Exclusive Option): Nếu chọn mục này thì không được chọn bất kỳ mục nào khác; nếu đang chọn mục khác mà bấm vào mục này thì hệ thống tự động bỏ chọn các mục trước.

### Quy tắc 7 (Điều kiện hiển thị Câu 12 Mức độ cần học)
- Câu 12 (Mức độ cần học: Cần học ngay trong 6 tháng / Trong năm / Sau 1 năm) **chỉ hiển thị** khi người dùng đã tích chọn ít nhất một nội dung tại Câu 11 của nhóm đó. Nếu Câu 11 bỏ trống, Câu 12 bị bỏ qua.

### Quy tắc 8 (Quy tắc Kết thúc sớm / Early Exit)
- Nếu người trả lời chọn `"NOT_ASSIGNED"` (Không được giao) hoặc `"COORDINATING_ONLY"` (Chỉ phối hợp) ở **toàn bộ 16 nhóm** của Câu 6:
  - Phiếu chuyển sang Câu 7 (Việc khác).
  - Kết thúc phiếu ngay sau Câu 7, ẩn hoàn toàn Phần III và Phần IV.
  - Phản hồi được ghi nhận là *"ngoài đối tượng theo công việc"* (`isOutOfScope = true`).
  - Được tính số lượng ở Bảng B1, nhưng bị loại khỏi các Bảng B2 đến B6.

### Quy tắc 9 (Dọn dẹp dữ liệu khi Quay lại Thay đổi lựa chọn)
- Khi người dùng bấm Quay lại (Back) và thay đổi trạng thái ở Câu 6 hoặc bỏ chọn vai trò ở Câu 8:
  - Đổi trạng thái nhóm sang `"NOT_ASSIGNED"` hoặc `"COORDINATING_ONLY"`: Xóa sạch toàn bộ câu trả lời Phần III của nhóm đó khỏi bộ nhớ/state.
  - Bỏ chọn 1 vai trò ở Câu 8: Xóa điểm tự đánh giá của vai trò đó ở Câu 9.
  - Đổi trạng thái từ "Đang thực hiện" sang "Chưa có dịp": Xóa dữ liệu khó khăn của Câu 10.
  - Đổi toàn bộ 16 nhóm sang ngoài đối tượng: Xóa sạch toàn bộ Phần III và IV.
  - Dữ liệu nộp lên server chỉ lưu các câu trả lời còn phù hợp với khai báo cuối cùng khi bấm Gửi.

### Quy tắc 10 (Quy tắc Câu 4 và Câu 7)
- Câu 4 (Tư cách) là câu hỏi chọn nhiều (Checkbox), không ảnh hưởng đến luồng câu hỏi tiếp theo.
- Câu 7 (Việc khác) và Câu 14 (Ý kiến khác) là tùy chọn không bắt buộc, không ảnh hưởng đến logic hiển thị.

### Quy tắc 11 (Tính Bất biến của Phiên bản Bộ phiếu)
- Toàn bộ câu hỏi, lựa chọn, thang mức, ma trận mức yêu cầu và thuật toán tính toán phải gắn chặt với một mã số phiên bản duy nhất (mặc định: `3.3`).
- Mỗi bản ghi gửi lên và mỗi bảng tổng hợp xuất ra đều phải in rõ số phiên bản ở tiêu đề. Báo cáo tổng hợp chỉ tổng hợp các phản hồi có cùng phiên bản.

### Quy tắc 12 (Quy tắc Một lần gửi & Chống Ghi trùng)
- Người dùng chỉ bấm "Gửi" một lần duy nhất, nút bấm bị khóa ngay lập tức khi đang xử lý để chống double submit.
- Phiếu cùng xã/phường, cùng cơ quan, cùng vị trí việc làm và có 16 lựa chọn ở Câu 6 giống hệt nhau sẽ được tự động gắn cờ `"nghi trùng"` (`isSuspectedDuplicate = true`), không tự ý xóa bỏ mà chuyển sang giao diện thẩm tra cho chuyên viên Trường.

---

## 2. CÔNG THỨC TOÁN HỌC TÍNH KHOẢNG THIẾU HỤT NĂNG LỰC (BẢNG B3)

Căn cứ quy định tại Phần IV Tài liệu số 2:
- Xét một ô cụ thể gồm $[\text{Nhóm công việc } g \times \text{Vai trò } r]$ có mức yêu cầu đã phê duyệt là $\text{Req}(g, r) \in \{1, 2, 3, 4\}$.
- Gọi $P_{g, r}$ là tập hợp các cán bộ *đang thực hiện* vai trò $r$ trong nhóm $g$. Mẫu số của dòng là:
  $$N_{g, r} = |P_{g, r}|$$
- Với mỗi cán bộ $i \in P_{g, r}$, điểm tự đánh giá là $\text{Self}(i, g, r) \in \{1, 2, 3, 4\}$.
- **Khoảng chênh lệch (Gap):**
  $$\Delta(i, g, r) = \text{Req}(g, r) - \text{Self}(i, g, r)$$
- **Phân loại dưới mức yêu cầu:**
  Cán bộ $i$ được xác định là *dưới mức yêu cầu* khi và chỉ khi:
  $$\Delta(i, g, r) > 0$$
- **Số lượng và Tỷ lệ người dưới mức yêu cầu:**
  $$N_{\text{deficient}}(g, r) = \sum_{i \in P_{g, r}} \mathbb{I}\Big(\Delta(i, g, r) > 0\Big)$$
  $$\text{Rate}_{\text{deficient}}(g, r) = \frac{N_{\text{deficient}}(g, r)}{N_{g, r}} \times 100\%$$
- **Phân bố chi tiết mức thiếu hụt:**
  - *Thiếu 1 mức:* $N_{\text{gap}=1} = \sum_{i} \mathbb{I}(\Delta = 1)$
  - *Thiếu 2 mức:* $N_{\text{gap}=2} = \sum_{i} \mathbb{I}(\Delta = 2)$
  - *Thiếu 3 mức:* $N_{\text{gap}=3} = \sum_{i} \mathbb{I}(\Delta = 3)$
  - Thỏa mãn: $N_{\text{deficient}} = N_{\text{gap}=1} + N_{\text{gap}=2} + N_{\text{gap}=3}$.
- **Nguyên tắc hiển thị:** Ô nào không có mức yêu cầu phê duyệt trong ma trận thì cột mức yêu cầu để trống, không tính khoảng thiếu hụt và không gán mức mặc định.

---

## 3. THUẬT TOÁN BẢO VỆ ẨN DANH SỐ LIỆU NHÓM NHỎ (SUPPRESSION ALGORITHM)

```typescript
// Pseudocode Thuật toán Kiểm soát Tiết lộ Thống kê (Ngưỡng 5 người)
export function applyStatisticalSuppression(tableMatrix: TableData): TableData {
  const THRESHOLD = 5;
  const SUPPRESSED_LABEL = "dưới 5 - không công bố";

  // Bước 1: Primary Suppression trên từng ô đếm
  for (const row of tableMatrix.rows) {
    // Nếu mẫu số của dòng nằm trong khoảng [1, 4] -> Áp dụng Row Suppression
    if (row.denominator >= 1 && row.denominator < THRESHOLD) {
      row.isRowSuppressed = true;
      for (const cell of row.cells) {
        cell.displayValue = SUPPRESSED_LABEL;
      }
      continue;
    }

    // Kiểm tra từng ô trong dòng có mẫu số >= 5
    for (const cell of row.cells) {
      if (cell.isCountCell && cell.numericValue >= 1 && cell.numericValue < THRESHOLD) {
        cell.isSuppressed = true;
        cell.displayValue = SUPPRESSED_LABEL;
      } else {
        cell.displayValue = cell.numericValue.toString();
      }
    }
  }

  // Bước 2: Secondary Suppression (Chống phép trừ suy diễn từ Tổng)
  for (const row of tableMatrix.rows) {
    if (row.isRowSuppressed || !row.hasTotalColumn) continue;

    const countCells = row.cells.filter(c => c.isCountCell);
    const suppressedCells = countCells.filter(c => c.isSuppressed);

    // Nếu chỉ có DUY NHẤT 1 ô bị ẩn và tổng được công bố
    if (suppressedCells.length === 1) {
      // Tìm ô có giá trị nhỏ nhất kế tiếp chưa bị ẩn (nhưng > 0)
      const remainingCells = countCells.filter(c => !c.isSuppressed && c.numericValue > 0);
      if (remainingCells.length > 0) {
        remainingCells.sort((a, b) => a.numericValue - b.numericValue);
        const cellToSuppress = remainingCells[0];
        cellToSuppress.isSuppressed = true;
        cellToSuppress.displayValue = SUPPRESSED_LABEL;
      }
    }
  }

  return tableMatrix;
}
```

---

## 4. ĐẶC TẢ ZOD VALIDATION SCHEMA (TRÍCH YẾU)

```typescript
import { z } from "zod";

// Schema Phần I: Thông tin chung
export const Part1Schema = z.object({
  provinceCode: z.string().min(1, "Vui lòng chọn Tỉnh/Thành phố"),
  provinceName: z.string().min(1),
  communeCode: z.string().min(1, "Vui lòng chọn Xã/Phường"),
  communeName: z.string().min(1),
  agencyCode: z.string().min(1, "Vui lòng chọn Cơ quan, đơn vị"),
  agencyName: z.string().min(1),
  positionCode: z.string().min(1, "Vui lòng chọn Vị trí công việc"),
  positionTitle: z.string().min(1),
  positionOtherText: z.string().max(200).optional().nullable(),
  capacities: z.array(z.string()).min(1, "Vui lòng chọn ít nhất 1 tư cách"),
  capacitiesOtherText: z.string().max(200).optional().nullable(),
  experienceYears: z.enum(["LT_1", "1_TO_3", "GT_3"], {
    errorMap: () => ({ message: "Vui lòng chọn số năm kinh nghiệm" })
  })
});

// Schema 1 nhóm công việc ở Phần II
export const WorkgroupStatusItemSchema = z.object({
  workgroupId: z.string(),
  status: z.enum([
    "CURRENTLY_DOING",
    "ASSIGNED_NOT_YET",
    "COORDINATING_ONLY",
    "NOT_ASSIGNED"
  ])
});

// Schema Phần II: Đủ 16 nhóm
export const Part2Schema = z.object({
  workgroupStatuses: z.array(WorkgroupStatusItemSchema).length(16, "Bắt buộc chọn trạng thái cho đủ 16 nhóm công việc"),
  otherWorkText: z.string().max(300, "Tối đa 300 ký tự").optional().nullable()
});

// Schema Đánh giá 1 nhóm ở Phần III
export const Part3GroupEvaluationSchema = z.object({
  workgroupId: z.string(),
  status: z.enum(["CURRENTLY_DOING", "ASSIGNED_NOT_YET"]),
  roles: z.array(z.enum(["DIRECT", "ADVISORY", "SUPERVISORY", "APPROVAL"])).min(1, "Phải chọn ít nhất 1 vai trò"),
  evaluations: z.array(
    z.object({
      roleId: z.enum(["DIRECT", "ADVISORY", "SUPERVISORY", "APPROVAL"]),
      selfAssessedLevel: z.number().int().min(1).max(4)
    })
  ).min(1),
  difficulties: z.array(z.string()).max(2, "Chọn tối đa 2 khó khăn").refine(
    items => !(items.includes("KHONG_KHO_KHAN") && items.length > 1),
    "Lựa chọn 'Không gặp khó khăn đáng kể' không được chọn cùng các mục khác"
  ),
  selectedTopics: z.array(z.string()),
  selectedTopicsOtherText: z.string().max(200).optional().nullable(),
  urgencyLevel: z.enum(["IMMEDIATE_6M", "WITHIN_YEAR", "AFTER_1Y"]).optional().nullable()
});

// Schema Tổng thể Nộp khảo sát
export const SurveySubmissionSchema = z.object({
  campaignId: z.string().min(1),
  linkToken: z.string().min(1),
  schemaVersion: z.literal("3.3"),
  part1: Part1Schema,
  part2: Part2Schema,
  part3: z.array(Part3GroupEvaluationSchema),
  part4: z.object({
    preferredFormats: z.array(z.string()).min(1, "Chọn ít nhất 1 hình thức").max(2, "Chọn tối đa 2 hình thức"),
    otherOpinions: z.string().max(500, "Tối đa 500 ký tự").optional().nullable()
  })
});
```
