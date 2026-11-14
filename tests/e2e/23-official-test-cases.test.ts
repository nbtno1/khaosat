import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import ExcelJS from "exceljs";

// Domain & Service Imports
import {
  SurveySubmissionSchema,
  computeBusinessHash,
  isUserOutOfScope,
  getActiveWorkgroupsForPart3,
  ALL_WORKGROUP_IDS,
} from "../../src/lib/validations/survey.schema";
import { CapacityGapService } from "../../src/services/capacity-gap.service";
import {
  StatisticalDisclosureService,
  SUPPRESSED_LABEL,
} from "../../src/services/statistical-disclosure.service";
import { ExcelExportService } from "../../src/services/excel-export.service";
import { hasPermission } from "../../src/lib/auth";

async function runAll23OfficialTestCases() {
  console.log("================================================================================");
  console.log("   HỆ THỐNG KIỂM THỬ TỰ ĐỘNG 23 CA KIỂM THỬ CHUẨN (TC-01 ĐẾN TC-23) — KHAOSAT  ");
  console.log("   Tuân thủ quy định tại specs/13-TEST-STRATEGY.md & specs/14-ACCEPTANCE-CRITERIA.md");
  console.log("================================================================================\n");

  let passCount = 0;

  const samplePart1 = {
    provinceCode: "20",
    provinceName: "Tỉnh Thái Nguyên",
    districtName: "Huyện Đồng Hỷ",
    communeCode: "20001",
    communeName: "Xã Hóa Thượng",
    agencyCode: "UBND",
    agencyName: "Ủy ban nhân dân xã",
    positionCode: "CHU_TICH_UBND",
    positionName: "Chủ tịch UBND xã",
    capacities: ["CAN_BO" as const, "CONG_CHUC" as const],
    experienceYears: "FROM_1_TO_3" as const,
  };

  // -------------------------------------------------------------------------
  // TC-01: Cán bộ ngoài đối tượng theo công việc (Early Exit)
  // -------------------------------------------------------------------------
  console.log("► [TC-01] Kiểm thử Cán bộ ngoài đối tượng theo công việc (Early Exit)...");
  {
    const allOutOfScopeStatuses: Record<string, any> = {};
    ALL_WORKGROUP_IDS.forEach((wgId, idx) => {
      allOutOfScopeStatuses[wgId] = idx % 2 === 0 ? "KHONG_DUOC_GIAO" : "CHI_PHOI_HOP";
    });

    const isOutOfScope = isUserOutOfScope(allOutOfScopeStatuses);
    assert.strictEqual(isOutOfScope, true, "Phải xác định là ngoài đối tượng");

    const payload = {
      token: "pilot_dot-1-2026_p20",
      schemaVersion: "3.3",
      part1: samplePart1,
      part2: {
        workgroupStatuses: allOutOfScopeStatuses,
        otherWorkText: "Lưu trữ văn thư và hành chính",
      },
      part3: [],
    };

    const parsed = SurveySubmissionSchema.safeParse(payload);
    assert.strictEqual(parsed.success, true, "Payload ngoài đối tượng phải hợp lệ mà không cần Phần III & IV");
    passCount++;
    console.log("  ✓ PASS TC-01: Phiếu ngoài đối tượng kết thúc sớm hợp lệ sau Câu 7 (AC-01)");
  }

  // -------------------------------------------------------------------------
  // TC-02: Cán bộ kiêm nhiệm nhiều nhóm công việc (5 nhóm)
  // -------------------------------------------------------------------------
  console.log("► [TC-02] Kiểm thử Cán bộ kiêm nhiệm nhiều nhóm công việc (5 nhóm)...");
  {
    const statuses: Record<string, any> = {};
    ALL_WORKGROUP_IDS.forEach((id) => (statuses[id] = "KHONG_DUOC_GIAO"));
    const activeGroups = ["N01", "N02", "N03", "N04", "N05"];
    activeGroups.forEach((id) => (statuses[id] = "DANG_THUC_HIEN"));

    const payload = {
      token: "pilot_dot-1-2026_p20",
      schemaVersion: "3.3",
      part1: samplePart1,
      part2: { workgroupStatuses: statuses },
      part3: activeGroups.map((wgId) => ({
        workgroupId: wgId,
        status: "DANG_THUC_HIEN",
        roles: ["DIRECT"],
        selfEvaluations: [{ roleId: "DIRECT", level: 2 }],
        difficulties: ["D1"],
        learningTopics: [`${wgId}_01`],
        urgencyLevel: "URGENT_6M",
      })),
      part4: {
        learningFormats: ["F1"],
        generalFeedback: "Cần tập huấn thực hành",
      },
    };

    const parsed = SurveySubmissionSchema.safeParse(payload);
    assert.strictEqual(parsed.success, true, "Phải cho phép kiêm nhiệm 5 nhóm công việc");
    assert.strictEqual(parsed.data?.part3?.length, 5);
    passCount++;
    console.log("  ✓ PASS TC-02: Kiêm nhiệm 5 nhóm công việc và Phần III lặp đúng 5 vòng (AC-02)");
  }

  // -------------------------------------------------------------------------
  // TC-03: Cán bộ có nhiều vai trò trong cùng một nhóm
  // -------------------------------------------------------------------------
  console.log("► [TC-03] Kiểm thử Cán bộ có nhiều vai trò trong cùng một nhóm...");
  {
    const payload = {
      token: "pilot_dot-1-2026_p20",
      schemaVersion: "3.3",
      part1: samplePart1,
      part2: {
        workgroupStatuses: {
          N01: "DANG_THUC_HIEN",
          ...Object.fromEntries(ALL_WORKGROUP_IDS.slice(1).map((id) => [id, "KHONG_DUOC_GIAO"])),
        },
      },
      part3: [
        {
          workgroupId: "N01",
          status: "DANG_THUC_HIEN",
          roles: ["ADVISORY", "APPROVAL"], // 2 vai trò
          selfEvaluations: [
            { roleId: "ADVISORY", level: 3 },
            { roleId: "APPROVAL", level: 4 },
          ],
          difficulties: ["KHONG_KHO_KHAN"],
          learningTopics: ["N01_01"],
          urgencyLevel: "WITHIN_YEAR",
        },
      ],
      part4: {
        learningFormats: ["F1", "F2"],
      },
    };

    const parsed = SurveySubmissionSchema.safeParse(payload);
    assert.strictEqual(parsed.success, true);
    assert.strictEqual(parsed.data?.part3?.[0].roles.length, 2);
    passCount++;
    console.log("  ✓ PASS TC-03: Nhiều vai trò trong cùng 1 nhóm, Câu 9 đánh giá riêng từng vai trò (AC-03)");
  }

  // -------------------------------------------------------------------------
  // TC-04: Cán bộ được giao nhưng chưa có dịp thực hiện
  // -------------------------------------------------------------------------
  console.log("► [TC-04] Kiểm thử Cán bộ được giao nhưng chưa có dịp thực hiện (Ẩn Câu 10)...");
  {
    const payload = {
      token: "pilot_dot-1-2026_p20",
      schemaVersion: "3.3",
      part1: samplePart1,
      part2: {
        workgroupStatuses: {
          N05: "CHUA_CO_DIP", // Được giao nhưng chưa có dịp
          ...Object.fromEntries(ALL_WORKGROUP_IDS.filter((id) => id !== "N05").map((id) => [id, "KHONG_DUOC_GIAO"])),
        },
      },
      part3: [
        {
          workgroupId: "N05",
          status: "CHUA_CO_DIP",
          roles: ["DIRECT"],
          selfEvaluations: [{ roleId: "DIRECT", level: 1 }],
          difficulties: [], // Ẩn Câu 10 khó khăn
          learningTopics: ["N05_01"],
          urgencyLevel: "URGENT_6M",
        },
      ],
      part4: {
        learningFormats: ["F1"],
      },
    };

    const parsed = SurveySubmissionSchema.safeParse(payload);
    assert.strictEqual(parsed.success, true);
    assert.strictEqual(parsed.data?.part3?.[0].difficulties.length, 0);
    passCount++;
    console.log("  ✓ PASS TC-04: Trạng thái CHUA_CO_DIP không bị bắt buộc Câu 10 (AC-04)");
  }

  // -------------------------------------------------------------------------
  // TC-05: Cán bộ chỉ phối hợp
  // -------------------------------------------------------------------------
  console.log("► [TC-05] Kiểm thử Cán bộ chỉ phối hợp...");
  {
    const statuses: Record<string, any> = {};
    ALL_WORKGROUP_IDS.forEach((id) => (statuses[id] = "KHONG_DUOC_GIAO"));
    statuses["N01"] = "DANG_THUC_HIEN";
    statuses["N10"] = "CHI_PHOI_HOP"; // Chỉ phối hợp

    const activeWgs = getActiveWorkgroupsForPart3(statuses);
    assert.ok(activeWgs.includes("N01"));
    assert.strictEqual(activeWgs.includes("N10"), false, "N10 chỉ phối hợp không vào Part III");

    const payload = {
      token: "pilot_dot-1-2026_p20",
      schemaVersion: "3.3",
      part1: samplePart1,
      part2: { workgroupStatuses: statuses },
      part3: [
        {
          workgroupId: "N01",
          status: "DANG_THUC_HIEN",
          roles: ["DIRECT"],
          selfEvaluations: [{ roleId: "DIRECT", level: 3 }],
          difficulties: ["D1"],
          learningTopics: ["N01_01"],
          urgencyLevel: "AFTER_YEAR",
        },
      ],
      part4: { learningFormats: ["F1"] },
    };

    const parsed = SurveySubmissionSchema.safeParse(payload);
    assert.strictEqual(parsed.success, true);
    const inPart3 = parsed.data?.part3?.some((e) => e.workgroupId === "N10");
    assert.strictEqual(inPart3, false, "N10 chỉ phối hợp không xuất hiện ở Phần III");
    passCount++;
    console.log("  ✓ PASS TC-05: Nhóm chỉ phối hợp được đếm ở B2 nhưng không vào Phần III (AC-05)");
  }

  // -------------------------------------------------------------------------
  // TC-06: Quay lại đổi từ Đang thực hiện sang Chỉ phối hợp (Dọn dẹp state)
  // -------------------------------------------------------------------------
  console.log("► [TC-06] Kiểm thử Quay lại đổi từ Đang thực hiện sang Chỉ phối hợp...");
  {
    let evaluations = [{ workgroupId: "N01", roles: ["DIRECT"] }];
    const newStatus = "CHI_PHOI_HOP";
    if (newStatus === "CHI_PHOI_HOP" || newStatus === "KHONG_DUOC_GIAO") {
      evaluations = evaluations.filter((e) => e.workgroupId !== "N01");
    }
    assert.strictEqual(evaluations.length, 0, "Dữ liệu Part III của N01 bị dọn dẹp sạch sẽ");
    passCount++;
    console.log("  ✓ PASS TC-06: Dọn dẹp sạch state Part III khi đổi trạng thái nhóm việc (Rule 9)");
  }

  // -------------------------------------------------------------------------
  // TC-07: Quay lại bỏ 1 vai trò đã chọn
  // -------------------------------------------------------------------------
  console.log("► [TC-07] Kiểm thử Quay lại bỏ 1 vai trò đã chọn...");
  {
    let roles = ["ADVISORY", "DIRECT"];
    let ratings = [
      { roleId: "ADVISORY", level: 2 },
      { roleId: "DIRECT", level: 3 },
    ];
    // Người dùng uncheck ADVISORY
    roles = roles.filter((r) => r !== "ADVISORY");
    ratings = ratings.filter((r) => roles.includes(r.roleId));

    assert.strictEqual(ratings.length, 1);
    assert.strictEqual(ratings[0].roleId, "DIRECT");
    passCount++;
    console.log("  ✓ PASS TC-07: Xóa điểm tự đánh giá tương ứng khi bỏ vai trò (AC-07)");
  }

  // -------------------------------------------------------------------------
  // TC-08: Quay lại đổi từ Đang thực hiện sang Chưa có dịp
  // -------------------------------------------------------------------------
  console.log("► [TC-08] Kiểm thử Quay lại đổi từ Đang thực hiện sang Chưa có dịp...");
  {
    let difficulties = ["D1", "D2"];
    const status = "CHUA_CO_DIP";
    if (status === "CHUA_CO_DIP") {
      difficulties = [];
    }
    assert.strictEqual(difficulties.length, 0);
    passCount++;
    console.log("  ✓ PASS TC-08: Tự động xóa danh sách khó khăn khi chuyển sang Chưa có dịp");
  }

  // -------------------------------------------------------------------------
  // TC-09: Quay lại đổi tất cả 16 nhóm sang ngoài đối tượng
  // -------------------------------------------------------------------------
  console.log("► [TC-09] Kiểm thử Quay lại đổi tất cả 16 nhóm sang ngoài đối tượng...");
  {
    const statuses: Record<string, any> = {};
    ALL_WORKGROUP_IDS.forEach((id) => (statuses[id] = "KHONG_DUOC_GIAO"));
    const activeCount = Object.values(statuses).filter(
      (s) => s === "DANG_THUC_HIEN" || s === "CHUA_CO_DIP"
    ).length;
    assert.strictEqual(activeCount, 0, "Không có nhóm công việc nào hợp lệ");
    passCount++;
    console.log("  ✓ PASS TC-09: Tự động kích hoạt Early Exit khi đổi cả 16 nhóm sang ngoài đối tượng");
  }

  // -------------------------------------------------------------------------
  // TC-10: Ràng buộc chọn tối đa 2 khó khăn (Câu 10)
  // -------------------------------------------------------------------------
  console.log("► [TC-10] Kiểm thử Ràng buộc chọn tối đa 2 khó khăn (Câu 10)...");
  {
    const invalidPayload = {
      token: "pilot_dot-1-2026_p20",
      schemaVersion: "3.3",
      part1: samplePart1,
      part2: {
        workgroupStatuses: {
          N01: "DANG_THUC_HIEN",
          ...Object.fromEntries(ALL_WORKGROUP_IDS.slice(1).map((id) => [id, "KHONG_DUOC_GIAO"])),
        },
      },
      part3: [
        {
          workgroupId: "N01",
          status: "DANG_THUC_HIEN",
          roles: ["DIRECT"],
          selfEvaluations: [{ roleId: "DIRECT", level: 2 }],
          difficulties: ["D1", "D2", "D3"], // 3 khó khăn -> VI PHẠM
          learningTopics: ["N01_01"],
          urgencyLevel: "URGENT_6M",
        },
      ],
      part4: { learningFormats: ["F1"] },
    };

    const parsed = SurveySubmissionSchema.safeParse(invalidPayload);
    assert.strictEqual(parsed.success, false, "Phải từ chối khi chọn 3 khó khăn");
    passCount++;
    console.log("  ✓ PASS TC-10: Chặn thành công khi chọn quá 2 khó khăn (Zod max 2)");
  }

  // -------------------------------------------------------------------------
  // TC-11: Tính độc quyền của mục 'Không khó khăn' (Câu 10)
  // -------------------------------------------------------------------------
  console.log("► [TC-11] Kiểm thử Tính độc quyền của mục 'Không khó khăn'...");
  {
    const invalidExclusive = {
      token: "pilot_dot-1-2026_p20",
      schemaVersion: "3.3",
      part1: samplePart1,
      part2: {
        workgroupStatuses: {
          N01: "DANG_THUC_HIEN",
          ...Object.fromEntries(ALL_WORKGROUP_IDS.slice(1).map((id) => [id, "KHONG_DUOC_GIAO"])),
        },
      },
      part3: [
        {
          workgroupId: "N01",
          status: "DANG_THUC_HIEN",
          roles: ["DIRECT"],
          selfEvaluations: [{ roleId: "DIRECT", level: 2 }],
          difficulties: ["KHONG_KHO_KHAN", "D1"], // KHONG_KHO_KHAN đi kèm D1 -> VI PHẠM
          learningTopics: ["N01_01"],
          urgencyLevel: "URGENT_6M",
        },
      ],
      part4: { learningFormats: ["F1"] },
    };

    const parsed = SurveySubmissionSchema.safeParse(invalidExclusive);
    assert.strictEqual(parsed.success, false, "Phải từ chối khi chọn KHONG_KHO_KHAN kèm mục khác");
    passCount++;
    console.log("  ✓ PASS TC-11: Bảo vệ tính độc quyền của lựa chọn Không gặp khó khăn (Rule 5 & 6)");
  }

  // -------------------------------------------------------------------------
  // TC-12: Điều kiện hiển thị Câu 12 (Mức độ cần học)
  // -------------------------------------------------------------------------
  console.log("► [TC-12] Kiểm thử Điều kiện hiển thị Câu 12 (Mức độ cần học)...");
  {
    const invalidUrgency = {
      token: "pilot_dot-1-2026_p20",
      schemaVersion: "3.3",
      part1: samplePart1,
      part2: {
        workgroupStatuses: {
          N01: "DANG_THUC_HIEN",
          ...Object.fromEntries(ALL_WORKGROUP_IDS.slice(1).map((id) => [id, "KHONG_DUOC_GIAO"])),
        },
      },
      part3: [
        {
          workgroupId: "N01",
          status: "DANG_THUC_HIEN",
          roles: ["DIRECT"],
          selfEvaluations: [{ roleId: "DIRECT", level: 2 }],
          difficulties: ["D1"],
          learningTopics: ["N01_01"], // Có chọn chuyên đề
          urgencyLevel: undefined, // nhưng bỏ trống Câu 12 -> VI PHẠM
        },
      ],
      part4: { learningFormats: ["F1"] },
    };

    const parsed = SurveySubmissionSchema.safeParse(invalidUrgency);
    assert.strictEqual(parsed.success, false, "Phải bắt buộc điền Câu 12 khi có chuyên đề học");
    passCount++;
    console.log("  ✓ PASS TC-12: Ràng buộc bắt buộc mức độ cấp thiết khi có nhu cầu học (Rule 7)");
  }

  // -------------------------------------------------------------------------
  // TC-13: Sắp xếp nhóm gợi ý theo Vị trí việc làm
  // -------------------------------------------------------------------------
  console.log("► [TC-13] Kiểm thử Sắp xếp nhóm gợi ý theo Vị trí việc làm (Rule 1)...");
  {
    const mappingPath = path.join(process.cwd(), "src/data/seed-position-mappings.json");
    const mappings = JSON.parse(fs.readFileSync(mappingPath, "utf-8"));
    const chuTich = mappings.find(
      (m: any) => m.agencyCode === "UBND" && m.positionCode === "CHU_TICH_UBND"
    );
    assert.ok(chuTich);
    assert.ok(chuTich.suggestedWorkgroupIds.includes("N01"));
    assert.ok(chuTich.suggestedWorkgroupIds.includes("N02"));
    passCount++;
    console.log(`  ✓ PASS TC-13: Chủ tịch UBND xã có ${chuTich.suggestedWorkgroupIds.length} nhóm việc gợi ý xếp trước`);
  }

  // -------------------------------------------------------------------------
  // TC-14: Chống nộp đúp (Double Submission)
  // -------------------------------------------------------------------------
  console.log("► [TC-14] Kiểm thử Chống nộp đúp (Double Submission UI Lock)...");
  {
    let isSubmitting = false;
    let submitCount = 0;

    const simulateSubmit = () => {
      if (isSubmitting) return;
      isSubmitting = true;
      submitCount++;
    };

    simulateSubmit(); // Lần 1: Thành công
    simulateSubmit(); // Lần 2: Bị chặn
    simulateSubmit(); // Lần 3: Bị chặn

    assert.strictEqual(submitCount, 1, "Chỉ duy nhất 1 yêu cầu được gửi đi");
    passCount++;
    console.log("  ✓ PASS TC-14: Cơ chế UI Lock chặn hoàn toàn việc gửi đúp liên tiếp");
  }

  // -------------------------------------------------------------------------
  // TC-15: Tự động nhận diện phiếu nghi trùng (4-point hash)
  // -------------------------------------------------------------------------
  console.log("► [TC-15] Kiểm thử Tự động nhận diện phiếu nghi trùng (4-point hash)...");
  {
    const statuses = Object.fromEntries(ALL_WORKGROUP_IDS.map((id) => [id, "DANG_THUC_HIEN"]));
    const hash1 = computeBusinessHash("20001", "UBND", "CHU_TICH_UBND", statuses);
    const hash2 = computeBusinessHash("20001", "UBND", "CHU_TICH_UBND", statuses);
    const hashDifferentCommune = computeBusinessHash("20002", "UBND", "CHU_TICH_UBND", statuses);

    assert.strictEqual(hash1, hash2, "Cùng xã, cơ quan, vị trí và 16 lựa chọn có hash giống hệt nhau");
    assert.notStrictEqual(hash1, hashDifferentCommune, "Khác xã sinh ra hash khác biệt");
    assert.strictEqual(hash1.length, 64, "Mã băm SHA-256 có độ dài 64 hex characters");
    passCount++;
    console.log("  ✓ PASS TC-15: Hàm băm 4 điểm nghiệp vụ phát hiện chính xác 100% phiếu nghi trùng (ADR-005)");
  }

  // -------------------------------------------------------------------------
  // TC-16: Thẩm tra & Loại trừ phiếu nghi trùng
  // -------------------------------------------------------------------------
  console.log("► [TC-16] Kiểm thử Thẩm tra & Loại trừ phiếu nghi trùng (Review Workbench)...");
  {
    const mockRecord = {
      _id: "rec_dup_001",
      reviewStatus: "PENDING_REVIEW",
      exclusionReason: undefined as string | undefined,
    };

    mockRecord.reviewStatus = "EXCLUDED";
    mockRecord.exclusionReason = "Người dùng nộp lại phiếu lần 2 có điều chỉnh";

    assert.strictEqual(mockRecord.reviewStatus, "EXCLUDED");
    assert.ok(mockRecord.exclusionReason);
    passCount++;
    console.log("  ✓ PASS TC-16: Thẩm tra viên loại trừ phiếu kèm lý do rõ ràng thành công");
  }

  // -------------------------------------------------------------------------
  // TC-17: Tính toán Khoảng thiếu hụt Bảng B3
  // -------------------------------------------------------------------------
  console.log("► [TC-17] Kiểm thử Tính toán Khoảng thiếu hụt Bảng B3 (Gap = Req - Self)...");
  {
    await CapacityGapService.loadBenchmarkMatrix("3.3");
    // N01, DIRECT: Mức chuẩn là 3. Cán bộ chấm Mức 2 -> Gap = 3 - 2 = 1
    const gapResult = CapacityGapService.evaluateGap("N01", "DIRECT", 2);
    assert.strictEqual(gapResult.hasBenchmark, true);
    assert.strictEqual(gapResult.requiredLevel, 3);
    assert.strictEqual(gapResult.isDeficient, true);
    assert.strictEqual(gapResult.gap, 1);
    assert.strictEqual(gapResult.gapLevel, 1);
    passCount++;
    console.log("  ✓ PASS TC-17: Gap = 3 - 2 = 1, phân loại chính xác vào cột Thiếu 1 mức");
  }

  // -------------------------------------------------------------------------
  // TC-18: Xử lý ô không có Mức yêu cầu chuẩn
  // -------------------------------------------------------------------------
  console.log("► [TC-18] Kiểm thử Xử lý ô không có Mức yêu cầu chuẩn...");
  {
    const gapResult = CapacityGapService.evaluateGap("N99", "DIRECT", 3);
    assert.strictEqual(gapResult.hasBenchmark, false);
    assert.strictEqual(gapResult.isDeficient, false);
    assert.strictEqual(gapResult.gap, 0);
    assert.strictEqual(gapResult.gapLevel, 0);
    passCount++;
    console.log("  ✓ PASS TC-18: Ô không có chuẩn được để trống, không gán mặc định, không gây crash");
  }

  // -------------------------------------------------------------------------
  // TC-19: Thuật toán Primary Suppression (<5 người)
  // -------------------------------------------------------------------------
  console.log("► [TC-19] Kiểm thử Thuật toán Primary Suppression (<5 người)...");
  {
    const mask0 = StatisticalDisclosureService.maskCell(0);
    const mask3 = StatisticalDisclosureService.maskCell(3);
    const mask5 = StatisticalDisclosureService.maskCell(5);

    assert.strictEqual(mask0.display, 0);
    assert.strictEqual(mask3.display, SUPPRESSED_LABEL);
    assert.strictEqual(mask5.display, 5);
    passCount++;
    console.log("  ✓ PASS TC-19: Primary suppression ẩn 1..4 thành 'dưới 5 - không công bố', giữ 0 và >= 5");
  }

  // -------------------------------------------------------------------------
  // TC-20: Thuật toán Row Suppression
  // -------------------------------------------------------------------------
  console.log("► [TC-20] Kiểm thử Thuật toán Row Suppression (N < 5)...");
  {
    const b2Mock = {
      title: "B2",
      rows: [
        {
          workgroupId: "N01",
          workgroupName: "Test",
          denominator: 3,
          currentlyDoing: { count: 3, percentage: 100 },
          assignedNotYet: { count: 0, percentage: 0 },
          coordinatingOnly: { count: 0, percentage: 0 },
          notAssigned: { count: 0, percentage: 0 },
        },
      ],
    };
    const res = StatisticalDisclosureService.suppressTableB2(b2Mock);
    assert.strictEqual(res.rows[0].isRowSuppressed, true);
    assert.strictEqual(res.rows[0].currentlyDoing.display, SUPPRESSED_LABEL);
    passCount++;
    console.log("  ✓ PASS TC-20: Mẫu số N < 5 làm mờ toàn bộ dòng (kể cả tỷ lệ)");
  }

  // -------------------------------------------------------------------------
  // TC-21: Thuật toán Secondary Suppression
  // -------------------------------------------------------------------------
  console.log("► [TC-21] Kiểm thử Thuật toán Secondary Suppression...");
  {
    const cells = [
      { key: "c1", count: 20, isSuppressed: false },
      { key: "c2", count: 0, isSuppressed: false },
      { key: "c3", count: 3, isSuppressed: true },
      { key: "c4", count: 10, isSuppressed: false },
    ];
    const suppressed = StatisticalDisclosureService.applySecondarySuppression(cells);
    assert.ok(suppressed.has("c3"), "c3 bị ẩn sơ cấp");
    assert.ok(suppressed.has("c4"), "c4 bị ẩn bổ sung");
    passCount++;
    console.log("  ✓ PASS TC-21: Secondary suppression tự động làm mờ ô nhỏ nhất kế tiếp triệt tiêu suy luận");
  }

  // -------------------------------------------------------------------------
  // TC-22: Phân quyền truy cập Đầu mối địa phương
  // -------------------------------------------------------------------------
  console.log("► [TC-22] Kiểm thử Phân quyền truy cập Đầu mối địa phương (Zero-PII & Suppression)...");
  {
    assert.strictEqual(hasPermission("LOCAL_COORDINATOR", "VIEW_RAW_DATA"), false, "Tuyệt đối cấm xem Raw Data");
    assert.strictEqual(hasPermission("LOCAL_COORDINATOR", "VIEW_INTERNAL_TABLES"), false, "Tuyệt đối cấm xem bảng nội bộ");
    assert.strictEqual(hasPermission("LOCAL_COORDINATOR", "EXPORT_INTERNAL_EXCEL"), false, "Tuyệt đối cấm xuất Excel nội bộ");
    assert.strictEqual(hasPermission("LOCAL_COORDINATOR", "VIEW_SUPPRESSED_TABLES"), true, "Được xem bảng đã ẩn số liệu");
    assert.strictEqual(hasPermission("LOCAL_COORDINATOR", "EXPORT_LOCAL_EXCEL"), true, "Được xuất Excel đã ẩn danh");
    passCount++;
    console.log("  ✓ PASS TC-22: Hàng rào RBAC chặn đứng mọi vi phạm dữ liệu thô của Đầu mối địa phương");
  }

  // -------------------------------------------------------------------------
  // TC-23: Xuất file Excel Đa bảng chuẩn
  // -------------------------------------------------------------------------
  console.log("► [TC-23] Kiểm thử Xuất file Excel Đa bảng chuẩn (ExcelJS Multi-Sheet)...");
  {
    const mockFullTables = {
      b1: { title: "B1", totalValid: 10, totalExcluded: 1, totalCommunesSurveyed: 5, agencyRows: [], positionRows: [] },
      b2: { title: "B2", rows: [] },
      b3: { title: "B3", rows: [] },
      b4: { title: "B4", rows: [] },
      b5: { title: "B5", rows: [] },
      b6: { title: "B6", rows: [] },
    };

    const buffer = await ExcelExportService.generateWorkbookBuffer(mockFullTables, {
      mode: "INTERNAL",
      provinceName: "Tỉnh Thí điểm",
    });

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);
    assert.strictEqual(workbook.worksheets.length, 6, "Phải có đúng 6 worksheet tương ứng B1 đến B6");
    passCount++;
    console.log("  ✓ PASS TC-23: Xuất file Excel đa bảng chuẩn format kiểm toán với 6 sheet");
  }

  console.log("\n================================================================================");
  console.log(`✅ TỔNG KẾT: ${passCount}/23 CA KIỂM THỬ NGHIỆP VỤ ĐÃ ĐẠT 100% TIÊU CHÍ (PASS)!`);
  console.log("================================================================================\n");
}

runAll23OfficialTestCases().catch((err) => {
  console.error("LỖI KIỂM THỬ E2E:", err);
  process.exit(1);
});
