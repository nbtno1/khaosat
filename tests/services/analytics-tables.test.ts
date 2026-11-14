import { CapacityGapService } from "../../src/services/capacity-gap.service";
import { AnalyticsAggregationService } from "../../src/services/analytics-aggregation.service";

console.log("==================================================");
console.log("   RUNNING ANALYTICS & 6 TABLES CALCULATION TESTS ");
console.log("==================================================");

let passed = 0;
let total = 0;

function assert(condition: boolean, msg: string) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${msg}`);
  } else {
    console.error(`  ✗ FAIL: ${msg}`);
    process.exitCode = 1;
  }
}

async function runTests() {
  // 1. Test CapacityGapService Benchmark Loading & Math Formulas (Table B3)
  console.log("\n[Test 1] Kiểm thử Công thức Tính toán Khoảng thiếu hụt Năng lực (Table B3)...");
  await CapacityGapService.loadBenchmarkMatrix("3.3");

  const reqN01Direct = CapacityGapService.getRequiredLevel("N01", "DIRECT", "3.3");
  assert(reqN01Direct !== undefined, "Tải thành công mức chuẩn N01_DIRECT từ Benchmark Matrix");
  assert(reqN01Direct?.requiredLevel === 3, "N01_DIRECT có mức chuẩn phê duyệt là Mức 3");

  // Đánh giá Mức 1 (Req = 3) -> Gap = 2 (Thiếu 2 mức)
  const gapResultLevel1 = CapacityGapService.evaluateGap("N01", "DIRECT", 1, "3.3");
  assert(gapResultLevel1.isDeficient === true, "Tự đánh giá Mức 1 so với chuẩn Mức 3 là dưới chuẩn");
  assert(gapResultLevel1.gap === 2, "Khoảng cách thiếu hụt là 2 mức");
  assert(gapResultLevel1.gapLevel === 2, "Xếp đúng vào nhóm thiếu 2 mức (gap2)");

  // Đánh giá Mức 3 (Req = 3) -> Gap = 0 (Đạt chuẩn)
  const gapResultLevel3 = CapacityGapService.evaluateGap("N01", "DIRECT", 3, "3.3");
  assert(gapResultLevel3.isDeficient === false, "Tự đánh giá Mức 3 so với chuẩn Mức 3 là Đạt chuẩn");
  assert(gapResultLevel3.gap === 0, "Khoảng cách Gap = 0");

  // Đánh giá Mức 4 (Req = 3) -> Gap = -1 (Vượt chuẩn)
  const gapResultLevel4 = CapacityGapService.evaluateGap("N01", "DIRECT", 4, "3.3");
  assert(gapResultLevel4.isDeficient === false, "Tự đánh giá Mức 4 so với chuẩn Mức 3 là Vượt chuẩn");
  assert(gapResultLevel4.gap === -1, "Khoảng cách Gap = -1");

  // 2. Test aggregateRowGapStats
  console.log("\n[Test 2] Kiểm thử Thống kê Dòng Bảng B3 (aggregateRowGapStats)...");
  // Giả sử có 10 người đánh giá vai trò N01_DIRECT:
  // 2 người mức 1, 3 người mức 2, 4 người mức 3, 1 người mức 4
  const sampleLevels = [1, 1, 2, 2, 2, 3, 3, 3, 3, 4];
  const rowStats = CapacityGapService.aggregateRowGapStats("N01", "DIRECT", sampleLevels, "3.3");

  assert(rowStats.denominator === 10, "Mẫu số dòng bằng đúng 10 người");
  assert(rowStats.level1.count === 2 && rowStats.level1.percentage === 20, "Mức 1: 2 người (20%)");
  assert(rowStats.level2.count === 3 && rowStats.level2.percentage === 30, "Mức 2: 3 người (30%)");
  assert(rowStats.level3.count === 4 && rowStats.level3.percentage === 40, "Mức 3: 4 người (40%)");
  assert(rowStats.level4.count === 1 && rowStats.level4.percentage === 10, "Mức 4: 1 người (10%)");

  // Dưới chuẩn = 2 (mức 1) + 3 (mức 2) = 5 người (50%)
  assert(rowStats.deficient.count === 5, "Tổng số người dưới mức chuẩn = 5 người");
  assert(rowStats.deficient.percentage === 50, "Tỷ lệ người dưới mức chuẩn = 50%");
  assert(rowStats.gap1.count === 3, "Thiếu 1 mức = 3 người (các cán bộ mức 2)");
  assert(rowStats.gap2.count === 2, "Thiếu 2 mức = 2 người (các cán bộ mức 1)");
  assert(rowStats.gap3.count === 0, "Thiếu 3 mức = 0 người");

  // 3. Test generateAllTables Structure
  console.log("\n[Test 3] Kiểm thử Tạo Trọn bộ 6 Bảng Tổng hợp (B1 - B6)...");
  const allTables = await AnalyticsAggregationService.generateAllTables();
  assert(allTables.schemaVersion === "3.3", "Số phiên bản bộ phiếu đúng chuẩn 3.3");
  assert(allTables.b1 && allTables.b1.title.includes("B1"), "Bảng B1 khởi tạo hợp lệ");
  assert(allTables.b2 && allTables.b2.rows.length === 16, "Bảng B2 chứa đủ 16 nhóm công việc");
  assert(
    allTables.b3 &&
    allTables.b3.subtitle === "khoảng thiếu hụt theo tự đánh giá - không đồng nhất với năng lực thực tế đã được kiểm chứng",
    "Bảng B3 có đúng câu ghi chú bắt buộc dưới tiêu đề"
  );
  assert(allTables.b4 && allTables.b4.rows.length > 0, "Bảng B4 chứa danh mục chuyên đề học");
  assert(allTables.b5 && allTables.b5.rows.length > 0, "Bảng B5 chứa danh mục khó khăn");
  assert(allTables.b6 && allTables.b6.rows.length === 5, "Bảng B6 chứa đủ 5 hình thức học tập");

  console.log("\n==================================================");
  console.log(`   KẾT QUẢ KIỂM THỬ: ${passed}/${total} TESTS PASS  `);
  console.log("==================================================");
}

runTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
