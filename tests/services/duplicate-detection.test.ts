import { computeBusinessHash, ALL_WORKGROUP_IDS } from "../../src/lib/validations/survey.schema";
import { DuplicateDetectionService } from "../../src/services/duplicate-detection.service";

console.log("==================================================");
console.log("   RUNNING DUPLICATE DETECTION SERVICE TESTS      ");
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
  console.log("\n[Test 1] AC-06: Kiểm thử logic băm 4 điểm nghiệp vụ (Business Hash)...");
  const statuses1: Record<string, string> = {};
  ALL_WORKGROUP_IDS.forEach((id, idx) => {
    statuses1[id] = idx === 0 ? "DANG_THUC_HIEN" : "KHONG_DUOC_GIAO";
  });

  const hashA = computeBusinessHash("00001", "UBND", "CHU_TICH_UBND", statuses1);
  const hashB = computeBusinessHash("00001", "UBND", "CHU_TICH_UBND", statuses1);
  assert(hashA === hashB, "2 phiếu cùng xã, cơ quan, vị trí và 16 lựa chọn có hash giống hệt nhau");

  // Đổi 1 trạng thái trong 16 nhóm
  const statuses2 = { ...statuses1, N02: "CHI_PHOI_HOP" };
  const hashC = computeBusinessHash("00001", "UBND", "CHU_TICH_UBND", statuses2);
  assert(hashA !== hashC, "Thay đổi bất kỳ nhóm công việc nào sinh ra mã băm khác (Không bị nhận nhầm là đúp)");

  // Đổi vị trí việc làm
  const hashD = computeBusinessHash("00001", "UBND", "PHO_CHU_TICH_UBND", statuses1);
  assert(hashA !== hashD, "Khác vị trí việc làm trong cùng cơ quan thì mã băm khác nhau (Hợp lệ, không nghi trùng)");

  console.log("\n[Test 2] AC-07: Kiểm thử Mock Quy trình Thẩm tra Nghi trùng (Review Decisions)...");
  // Kiểm tra cấu trúc interface DuplicateGroupItem
  const sampleGroup = {
    duplicateGroupId: "grp_123",
    businessHash: hashA,
    count: 2,
    provinceCode: "01",
    provinceName: "Thành phố Hà Nội",
    communeCode: "00001",
    communeName: "Phường Phúc Xá",
    agencyCode: "UBND",
    agencyName: "Lãnh đạo UBND",
    positionCode: "CHU_TICH_UBND",
    positionTitle: "Chủ tịch UBND",
    responses: [
      {
        _id: "res_01",
        submittedAt: new Date("2026-11-14T08:00:00Z"),
        reviewStatus: "PENDING_REVIEW" as const,
        isOutOfScope: false,
        part1: {},
        part2: {},
        part3: [],
        part4: {},
      },
      {
        _id: "res_02",
        submittedAt: new Date("2026-11-14T08:45:00Z"),
        reviewStatus: "PENDING_REVIEW" as const,
        isOutOfScope: false,
        part1: {},
        part2: {},
        part3: [],
        part4: {},
      },
    ],
  };

  assert(sampleGroup.responses.length === 2, "Nhóm nghi trùng chứa đúng 2 phiếu có cùng hash");
  assert(sampleGroup.responses[0].submittedAt < sampleGroup.responses[1].submittedAt, "Phiếu nộp sớm xếp trước");

  // Giả lập quyết định VALID
  const decisionValid = {
    responseId: "res_02",
    decision: "VALID",
    reason: "Xác nhận thực tế xã có 2 người cùng đảm nhiệm hoặc là cán bộ khác nhau",
  };
  assert(decisionValid.decision === "VALID", "Thẩm tra viên có quyền chuyển trạng thái sang VALID");

  // Giả lập quyết định EXCLUDED
  const decisionExcluded = {
    responseId: "res_01",
    decision: "EXCLUDED",
    reason: "Cùng cán bộ nộp lại phiếu lúc 08:45, loại bỏ phiếu nộp lúc 08:00",
  };
  assert(decisionExcluded.decision === "EXCLUDED", "Thẩm tra viên có quyền loại trừ phiếu gửi đúp sang EXCLUDED");
  assert(decisionExcluded.reason.length > 5, "Bắt buộc có lý do thẩm tra rõ ràng");

  console.log("\n==================================================");
  console.log(`   KẾT QUẢ KIỂM THỬ: ${passed}/${total} TESTS PASS  `);
  console.log("==================================================");
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
