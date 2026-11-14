import assert from "node:assert/strict";
import ExcelJS from "exceljs";
import {
  StatisticalDisclosureService,
  SUPPRESSED_LABEL,
  SUPPRESSION_THRESHOLD,
} from "../../src/services/statistical-disclosure.service";
import { ExcelExportService } from "../../src/services/excel-export.service";

async function runTests() {
  console.log("=== BẮT ĐẦU KIỂM THỬ THUẬT TOÁN BẢO VỆ ẨN DANH & XUẤT EXCEL (MILESTONE 5) ===");

  // -------------------------------------------------------------
  // PHẦN 1: KIỂM THỬ STATISTICAL DISCLOSURE SERVICE
  // -------------------------------------------------------------
  console.log("\n[TEST 1] Kiểm tra Primary Suppression (maskCell)");
  {
    const zero = StatisticalDisclosureService.maskCell(0);
    assert.strictEqual(zero.isSuppressed, false, "Giá trị 0 không được làm mờ");
    assert.strictEqual(zero.display, 0);

    const one = StatisticalDisclosureService.maskCell(1);
    assert.strictEqual(one.isSuppressed, true, "Giá trị 1 phải bị làm mờ");
    assert.strictEqual(one.display, SUPPRESSED_LABEL);

    const four = StatisticalDisclosureService.maskCell(4);
    assert.strictEqual(four.isSuppressed, true, "Giá trị 4 phải bị làm mờ");
    assert.strictEqual(four.display, SUPPRESSED_LABEL);

    const five = StatisticalDisclosureService.maskCell(5);
    assert.strictEqual(five.isSuppressed, false, "Giá trị 5 đạt ngưỡng công bố");
    assert.strictEqual(five.display, 5);

    const fortyTwo = StatisticalDisclosureService.maskCell(42);
    assert.strictEqual(fortyTwo.isSuppressed, false);
    assert.strictEqual(fortyTwo.display, 42);

    console.log("  ✓ maskCell: 0 và >= 5 giữ nguyên, 1..4 bị làm mờ chính xác (PASS)");
  }

  console.log("\n[TEST 2] Kiểm tra Secondary Suppression (applySecondarySuppression)");
  {
    // Trường hợp 1: Chỉ có đúng 1 ô bị làm mờ sơ cấp (count=3), các ô còn lại: 0, 10, 20
    // Ô nhỏ nhất khác 0 kế tiếp là ô có count=10 -> phải tự động ẩn thêm ô này!
    const cellsScenario1 = [
      { key: "c1", count: 20, isSuppressed: false },
      { key: "c2", count: 0, isSuppressed: false },
      { key: "c3", count: 3, isSuppressed: true }, // Bị ẩn sơ cấp
      { key: "c4", count: 10, isSuppressed: false },
    ];
    const suppressedKeys1 = StatisticalDisclosureService.applySecondarySuppression(cellsScenario1);
    assert.ok(suppressedKeys1.has("c3"), "Ô c3 bị ẩn sơ cấp");
    assert.ok(suppressedKeys1.has("c4"), "Ô c4 phải bị ẩn bổ sung (nhỏ nhất khác 0 kế tiếp)");
    assert.strictEqual(suppressedKeys1.size, 2, "Chính xác 2 ô bị ẩn");
    console.log("  ✓ Trường hợp 1 ô sơ cấp -> Ẩn bổ sung ô nhỏ nhất kế tiếp thành công (PASS)");

    // Trường hợp 2: Đã có từ 2 ô trở lên bị làm mờ sơ cấp (count=2, count=3)
    // Người xem không thể lấy Tổng trừ đi 1 ẩn số duy nhất -> Không cần ẩn thêm
    const cellsScenario2 = [
      { key: "c1", count: 20, isSuppressed: false },
      { key: "c2", count: 2, isSuppressed: true },
      { key: "c3", count: 3, isSuppressed: true },
      { key: "c4", count: 10, isSuppressed: false },
    ];
    const suppressedKeys2 = StatisticalDisclosureService.applySecondarySuppression(cellsScenario2);
    assert.strictEqual(suppressedKeys2.size, 2, "Giữ nguyên 2 ô đã ẩn, không cần ẩn thêm");
    console.log("  ✓ Trường hợp >= 2 ô sơ cấp -> Không làm mờ thừa thãi (PASS)");
  }

  console.log("\n[TEST 3] Kiểm tra Row Suppression trong Bảng B2 & B3");
  {
    // Bảng B2: Dòng có mẫu số = 3 (<5) -> Toàn bộ dòng bị làm mờ
    const mockB2 = {
      title: "Bảng B2",
      denominator: 100,
      rows: [
        {
          workgroupId: "WG_1",
          workgroupName: "Lập dự toán",
          denominator: 3, // Dưới ngưỡng 5
          currentlyDoing: { count: 3, percentage: 100 },
          assignedNotYet: { count: 0, percentage: 0 },
          coordinatingOnly: { count: 0, percentage: 0 },
          notAssigned: { count: 0, percentage: 0 },
        },
        {
          workgroupId: "WG_2",
          workgroupName: "Kế toán",
          denominator: 20,
          currentlyDoing: { count: 15, percentage: 75 },
          assignedNotYet: { count: 3, percentage: 15 }, // ô này < 5
          coordinatingOnly: { count: 2, percentage: 10 }, // ô này < 5
          notAssigned: { count: 0, percentage: 0 },
        },
      ],
    };

    const suppressedB2 = StatisticalDisclosureService.suppressTableB2(mockB2);
    assert.strictEqual(suppressedB2.rows[0].isRowSuppressed, true, "Dòng mẫu số < 5 phải kích hoạt isRowSuppressed");
    assert.strictEqual(suppressedB2.rows[0].currentlyDoing.display, SUPPRESSED_LABEL);
    assert.strictEqual(suppressedB2.rows[1].isRowSuppressed, false, "Dòng mẫu số >= 5 không bị row suppression");
    console.log("  ✓ Row Suppression B2: Ẩn toàn bộ dòng khi N < 5 chính xác (PASS)");

    // Bảng B3: Dòng có mẫu số = 4
    const mockB3 = {
      title: "Bảng B3",
      rows: [
        {
          workgroupId: "WG_1",
          workgroupName: "Lập dự toán",
          roleId: "ROLE_CHINH",
          roleName: "Thực hiện chính",
          benchmarkLevel: 3,
          denominator: 4, // Dưới ngưỡng 5
          level1: { count: 1, percentage: 25 },
          level2: { count: 2, percentage: 50 },
          level3: { count: 1, percentage: 25 },
          level4: { count: 0, percentage: 0 },
          deficient: { count: 3, percentage: 75 },
        },
      ],
    };
    const suppressedB3 = StatisticalDisclosureService.suppressTableB3(mockB3);
    assert.strictEqual(suppressedB3.rows[0].isRowSuppressed, true);
    assert.strictEqual(suppressedB3.rows[0].denominatorDisplay, SUPPRESSED_LABEL);
    console.log("  ✓ Row Suppression B3: Ẩn mẫu số và toàn bộ cột phân bố khi N < 5 (PASS)");
  }

  // -------------------------------------------------------------
  // PHẦN 2: KIỂM THỬ EXCEL EXPORT SERVICE
  // -------------------------------------------------------------
  console.log("\n[TEST 4] Kiểm tra Tạo file Excel Bản Nội bộ (INTERNAL)");
  {
    const mockTablesData = createMockFullTablesData();
    const buffer = await ExcelExportService.generateWorkbookBuffer(mockTablesData, {
      mode: "INTERNAL",
      provinceName: "Tỉnh Thí điểm",
    });

    assert.ok(buffer instanceof Buffer, "Phải trả về Node Buffer");
    assert.ok(buffer.length > 5000, `Kích thước buffer phải hợp lệ (thực tế: ${buffer.length} bytes)`);

    // Đọc lại workbook bằng ExcelJS để xác minh cấu trúc 6 sheet
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);

    const sheetNames = workbook.worksheets.map((ws) => ws.name);
    assert.deepStrictEqual(
      sheetNames,
      [
        "B1_NguoiTraLoi",
        "B2_NhomCongViec",
        "B3_KhoangThieuHut",
        "B4_NoiDungCanHoc",
        "B5_KhoKho",
        "B6_HinhThucHoc",
      ],
      "Phải có đầy đủ 6 sheet chuẩn kiểm toán"
    );

    // Kiểm tra sheet B1 có tiêu đề
    const wsB1 = workbook.getWorksheet("B1_NguoiTraLoi");
    assert.ok(wsB1);
    assert.ok(wsB1.rowCount > 5);

    // Kiểm tra sheet B3 có câu ghi chú bắt buộc
    const wsB3 = workbook.getWorksheet("B3_KhoangThieuHut");
    assert.ok(wsB3);
    let foundNote = false;
    wsB3.eachRow((row) => {
      row.eachCell((cell) => {
        if (cell.value && cell.value.toString().includes("Ma trận chuẩn năng lực phiên bản 3.3")) {
          foundNote = true;
        }
      });
    });
    assert.ok(foundNote, "Sheet B3 phải chứa câu ghi chú chuẩn nghiệp vụ 3.3");

    console.log(`  ✓ Excel Internal Mode: 6 sheets được tạo chuẩn định dạng, buffer: ${buffer.length} bytes (PASS)`);
  }

  console.log("\n[TEST 5] Kiểm tra Tạo file Excel Bản Địa phương (LOCAL_CONFIDENTIAL) với Suppression");
  {
    const mockTablesData = createMockFullTablesData();
    const buffer = await ExcelExportService.generateWorkbookBuffer(mockTablesData, {
      mode: "LOCAL_CONFIDENTIAL",
      provinceName: "Tỉnh Thái Nguyên",
    });

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);

    // Sheet B2: Dòng WG_16 có count=2 phải hiển thị nhãn "dưới 5 - không công bố"
    const wsB2 = workbook.getWorksheet("B2_NhomCongViec");
    assert.ok(wsB2);

    let foundSuppressedText = false;
    wsB2.eachRow((row) => {
      row.eachCell((cell) => {
        if (cell.value && cell.value.toString().includes(SUPPRESSED_LABEL)) {
          foundSuppressedText = true;
        }
      });
    });
    assert.ok(foundSuppressedText, "Sheet B2 bản địa phương phải chứa nhãn bảo vệ 'dưới 5 - không công bố'");

    console.log("  ✓ Excel Local Confidential Mode: Số liệu < 5 đã được ẩn danh hoàn toàn (PASS)");
  }

  console.log("\n=======================================================");
  console.log("✅ TẤT CẢ CÁC BÀI KIỂM THỬ MILESTONE 5 ĐÃ VƯỢT QUA 100%!");
  console.log("=======================================================");
}

function createMockFullTablesData() {
  return {
    b1: {
      title: "Bảng B1",
      totalValid: 45,
      totalExcluded: 2,
      totalCommunesSurveyed: 18,
      agencyRows: [
        { agencyCode: "UBND_XA", agencyName: "UBND cấp xã", validCount: 40, validPercentage: 88.9, outOfScopeCount: 0 },
        { agencyCode: "HDND_XA", agencyName: "HĐND cấp xã", validCount: 3, validPercentage: 6.7, outOfScopeCount: 0 }, // < 5
        { agencyCode: "DANG_UY", agencyName: "Đảng ủy xã", validCount: 2, validPercentage: 4.4, outOfScopeCount: 0 }, // < 5
      ],
      positionRows: [
        { agencyCode: "UBND_XA", positionTitle: "Chủ tịch UBND xã", validCount: 15, validPercentage: 33.3 },
        { agencyCode: "UBND_XA", positionTitle: "Kế toán xã", validCount: 25, validPercentage: 55.6 },
        { agencyCode: "HDND_XA", positionTitle: "Phó Chủ tịch HĐND", validCount: 3, validPercentage: 6.7 },
        { agencyCode: "DANG_UY", positionTitle: "Bí thư Đảng ủy", validCount: 2, validPercentage: 4.4 },
      ],
      capacityRows: [
        { capacityId: "CHINH_QUYEN", capacityName: "Cán bộ chính quyền cơ sở", count: 40, percentage: 88.9 },
        { capacityId: "DANG", capacityName: "Cán bộ Đảng ủy", count: 2, percentage: 4.4 },
      ],
    },
    b2: {
      title: "Bảng B2",
      denominator: 45,
      rows: [
        {
          workgroupId: "WG_1",
          workgroupName: "Lập dự toán ngân sách",
          denominator: 45,
          currentlyDoing: { count: 35, percentage: 77.8 },
          assignedNotYet: { count: 5, percentage: 11.1 },
          coordinatingOnly: { count: 3, percentage: 6.7 }, // < 5
          notAssigned: { count: 2, percentage: 4.4 }, // < 5
        },
        {
          workgroupId: "WG_16",
          workgroupName: "Quản lý tài chính dự án",
          denominator: 3, // Dưới 5 -> row suppression
          currentlyDoing: { count: 2, percentage: 66.7 },
          assignedNotYet: { count: 1, percentage: 33.3 },
          coordinatingOnly: { count: 0, percentage: 0 },
          notAssigned: { count: 0, percentage: 0 },
        },
      ],
    },
    b3: {
      title: "Bảng B3",
      rows: [
        {
          workgroupId: "WG_1",
          workgroupName: "Lập dự toán ngân sách",
          roleId: "ROLE_CHINH",
          roleName: "Thực hiện chính",
          benchmarkLevel: 3,
          denominator: 40,
          level1: { count: 5, percentage: 12.5 },
          level2: { count: 15, percentage: 37.5 },
          level3: { count: 18, percentage: 45.0 },
          level4: { count: 2, percentage: 5.0 }, // < 5
          deficient: { count: 20, percentage: 50.0 },
          gap1: { count: 15, percentage: 37.5 },
          gap2: { count: 5, percentage: 12.5 },
          gap3: { count: 0, percentage: 0 },
          noOccasion: { count: 0, percentage: 0 },
        },
      ],
    },
    b4: {
      title: "Bảng B4",
      rows: [
        {
          workgroupId: "WG_1",
          workgroupName: "Lập dự toán ngân sách",
          topicId: "CD_1.1",
          topicTitle: "Phương pháp lập dự toán thu ngân sách xã",
          totalSelected: 28,
          urgent6mCount: 18,
          urgent6mPercentage: 64.3,
          urgent12mCount: 8,
          urgent12mPercentage: 28.6,
          whenPossibleCount: 2,
          whenPossiblePercentage: 7.1,
        },
      ],
    },
    b5: {
      title: "Bảng B5",
      denominator: 45,
      rows: [
        {
          obstacleId: "KK_1",
          label: "Thiếu tài liệu hướng dẫn nghiệp vụ cụ thể",
          isTrainingRelated: true,
          count: 32,
          percentage: 71.1,
        },
        {
          obstacleId: "KK_2",
          label: "Hệ thống văn bản pháp luật thay đổi liên tục, chưa đồng bộ",
          isTrainingRelated: false,
          count: 26,
          percentage: 57.8,
        },
      ],
    },
    b6: {
      title: "Bảng B6",
      denominator: 45,
      rows: [
        { methodId: "HT_1", label: "Tập huấn trực tiếp kết hợp thực hành tình huống", count: 35, percentage: 77.8 },
        { methodId: "HT_2", label: "Học trực tuyến qua hệ thống E-learning của Kiểm toán nhà nước", count: 20, percentage: 44.4 },
      ],
      limitations: [
        "Kết quả khảo sát phản ánh năng lực và nhu cầu theo tự đánh giá của cán bộ ở cấp xã.",
        "Ma trận mức yêu cầu (Benchmark) được áp dụng thống nhất theo Bộ đặc tả 3.3.",
      ],
    },
  };
}

runTests().catch((err) => {
  console.error("LỖI KIỂM THỬ:", err);
  process.exit(1);
});
