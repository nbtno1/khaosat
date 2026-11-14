import {
  SurveySubmissionSchema,
  computeBusinessHash,
  isUserOutOfScope,
  getActiveWorkgroupsForPart3,
  ALL_WORKGROUP_IDS,
} from "../../src/lib/validations/survey.schema";

console.log("==================================================");
console.log("   RUNNING VALIDATION SCHEMA UNIT TESTS (TASK-004) ");
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

// 1. TC-10: Test Early Exit (Out-of-scope respondent)
console.log("\n[Test 1] TC-10: Kiểm thử Luồng Kết thúc sớm (Ngoài đối tượng)...");
const outOfScopeStatuses: Record<string, any> = {};
ALL_WORKGROUP_IDS.forEach((id, idx) => {
  outOfScopeStatuses[id] = idx % 2 === 0 ? "KHONG_DUOC_GIAO" : "CHI_PHOI_HOP";
});

assert(isUserOutOfScope(outOfScopeStatuses) === true, "Phát hiện toàn bộ 16 nhóm ngoài đối tượng");

const outOfScopeSubmission = {
  token: "test_token_pilot",
  schemaVersion: "3.3",
  part1: {
    provinceCode: "01",
    provinceName: "Thành phố Hà Nội",
    districtName: "Quận Ba Đình",
    communeCode: "00001",
    communeName: "Phường Phúc Xá",
    agencyCode: "UBND",
    agencyName: "Lãnh đạo Ủy ban nhân dân xã/phường",
    positionCode: "CHU_TICH_UBND",
    positionName: "Chủ tịch Ủy ban nhân dân",
    capacities: ["CAN_BO", "CONG_CHUC"],
    experienceYears: "OVER_3",
  },
  part2: {
    workgroupStatuses: outOfScopeStatuses,
    otherWorkText: "Lái xe cơ quan",
  },
  part3: [],
  // part4 is optional for out-of-scope
};

const resEarlyExit = SurveySubmissionSchema.safeParse(outOfScopeSubmission);
assert(resEarlyExit.success === true, "Phiếu ngoài đối tượng validate thành công mà không cần Phần III & IV");

// 2. TC-11: Test Difficulty constraints (Max 2 & Exclusive option)
console.log("\n[Test 2] TC-11: Ràng buộc Khó khăn tại Câu 10 (Max 2 & Độc quyền)...");
const inScopeStatuses: Record<string, any> = { ...outOfScopeStatuses };
inScopeStatuses["N01"] = "DANG_THUC_HIEN";
inScopeStatuses["N02"] = "CHUA_CO_DIP";

assert(isUserOutOfScope(inScopeStatuses) === false, "Phát hiện người trong đối tượng (có N01, N02)");
const activeWgs = getActiveWorkgroupsForPart3(inScopeStatuses);
assert(activeWgs.length === 2 && activeWgs.includes("N01") && activeWgs.includes("N02"), "Lọc đúng 2 nhóm cần đánh giá Phần III");

// Submitting with 3 difficulties (violates max 2)
const invalidDifficultiesSub = {
  token: "test_token_pilot",
  schemaVersion: "3.3",
  part1: outOfScopeSubmission.part1,
  part2: { workgroupStatuses: inScopeStatuses },
  part3: [
    {
      workgroupId: "N01",
      status: "DANG_THUC_HIEN",
      roles: ["DIRECT"],
      selfEvaluations: [{ roleId: "DIRECT", level: 3 }],
      difficulties: ["D1", "D2", "D3"], // 3 items -> FAIL
      learningTopics: ["N01_01"],
      urgencyLevel: "URGENT_6M",
    },
    {
      workgroupId: "N02",
      status: "CHUA_CO_DIP",
      roles: ["DIRECT"],
      selfEvaluations: [{ roleId: "DIRECT", level: 2 }],
      difficulties: [],
    },
  ],
  part4: {
    learningFormats: ["F1", "F2"],
  },
};
const resDiffMax = SurveySubmissionSchema.safeParse(invalidDifficultiesSub);
assert(resDiffMax.success === false, "Từ chối khi chọn quá 2 khó khăn");

// Submitting with KHONG_KHO_KHAN + D1 (violates exclusive rule)
invalidDifficultiesSub.part3[0].difficulties = ["KHONG_KHO_KHAN", "D1"];
const resDiffExcl = SurveySubmissionSchema.safeParse(invalidDifficultiesSub);
assert(resDiffExcl.success === false, "Từ chối khi chọn Không khó khăn kèm khó khăn khác");

// Valid exclusive difficulty
invalidDifficultiesSub.part3[0].difficulties = ["KHONG_KHO_KHAN"];
const resDiffValid = SurveySubmissionSchema.safeParse(invalidDifficultiesSub);
assert(resDiffValid.success === true, "Chấp nhận khi chỉ chọn duy nhất 'Không gặp khó khăn đáng kể'");

// 3. TC-12: Test Question 12 (Urgency level required if learningTopics selected)
console.log("\n[Test 3] TC-12: Ràng buộc Mức độ cần học tại Câu 12...");
const missingUrgencySub = JSON.parse(JSON.stringify(invalidDifficultiesSub));
missingUrgencySub.part3[0].learningTopics = ["N01_01", "N01_02"];
delete missingUrgencySub.part3[0].urgencyLevel;

const resUrgencyFail = SurveySubmissionSchema.safeParse(missingUrgencySub);
assert(resUrgencyFail.success === false, "Từ chối nếu có chọn nội dung học nhưng bỏ trống mức độ cần học (Câu 12)");

// 4. Test Part 4 Learning format constraints (Max 2)
console.log("\n[Test 4] TC-13: Ràng buộc Hình thức học tại Phần IV (Max 2)...");
const invalidFormatsSub = JSON.parse(JSON.stringify(invalidDifficultiesSub));
invalidFormatsSub.part4.learningFormats = ["F1", "F2", "F3"]; // 3 items -> FAIL
const resFormatsFail = SurveySubmissionSchema.safeParse(invalidFormatsSub);
assert(resFormatsFail.success === false, "Từ chối nếu chọn quá 2 hình thức học ở Phần IV");

// 5. Test 4-point Business Hash calculation
console.log("\n[Test 5] Kiểm thử Hàm Băm Nghiệp vụ 4 Điểm (Business Hash)...");
const hash1 = computeBusinessHash("00001", "UBND", "CHU_TICH_UBND", inScopeStatuses);
const hash2 = computeBusinessHash("00001", "UBND", "CHU_TICH_UBND", inScopeStatuses);
const hash3 = computeBusinessHash("00004", "UBND", "CHU_TICH_UBND", inScopeStatuses);

assert(hash1 === hash2, "2 bộ dữ liệu cùng xã, cùng cơ quan, cùng vị trí và 16 trạng thái sinh ra cùng hash");
assert(hash1 !== hash3, "Đổi mã xã sinh ra hash khác biệt");
assert(hash1.length === 64, "Mã băm SHA-256 có độ dài chuẩn 64 ký tự hex");

console.log("\n==================================================");
console.log(`   KẾT QUẢ KIỂM THỬ: ${passed}/${total} TESTS PASS  `);
console.log("==================================================");
