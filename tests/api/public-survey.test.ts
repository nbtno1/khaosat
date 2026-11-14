import { NextRequest } from "next/server";
import { GET as validateLinkHandler } from "../../src/app/api/public/survey/validate-link/[token]/route";
import { GET as schemaHandler } from "../../src/app/api/public/survey/schema/[version]/route";
import { GET as positionMappingHandler } from "../../src/app/api/public/survey/position-mapping/route";
import { POST as submitHandler } from "../../src/app/api/public/survey/submit/route";

console.log("==================================================");
console.log("   RUNNING PUBLIC API ROUTES INTEGRATION TESTS    ");
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
  // 1. Test Schema Endpoint
  console.log("\n[Test 1] GET /api/public/survey/schema/3.3...");
  const schemaReq = new NextRequest("http://localhost:3000/api/public/survey/schema/3.3");
  const schemaRes = await schemaHandler(schemaReq, {
    params: Promise.resolve({ version: "3.3" }),
  });
  const schemaJson = await schemaRes.json();

  assert(schemaRes.status === 200, "Schema endpoint returns 200 OK");
  assert(schemaJson.success === true, "Schema response success is true");
  assert(schemaJson.data.workgroups.length === 16, "Returns exactly 16 workgroups");
  assert(schemaJson.data.roles.length === 4, "Returns exactly 4 roles with level descriptions");
  assert(schemaJson.data.difficulties.length === 7, "Returns 7 difficulties (including exclusive option)");

  // 2. Test Position Mapping Endpoint
  console.log("\n[Test 2] GET /api/public/survey/position-mapping?agencyCode=UBND&positionCode=CHU_TICH_UBND...");
  const mappingReq = new NextRequest(
    "http://localhost:3000/api/public/survey/position-mapping?agencyCode=UBND&positionCode=CHU_TICH_UBND&version=3.3"
  );
  const mappingRes = await positionMappingHandler(mappingReq);
  const mappingJson = await mappingRes.json();

  assert(mappingRes.status === 200, "Position mapping endpoint returns 200 OK");
  assert(mappingJson.success === true, "Mapping response success is true");
  assert(
    mappingJson.data.suggestedWorkgroupIds &&
    mappingJson.data.suggestedWorkgroupIds.includes("N01") &&
    mappingJson.data.suggestedWorkgroupIds.includes("N02"),
    "Returns suggested workgroups for Chủ tịch UBND (includes N01, N02)"
  );
  assert(mappingJson.data.commonRoleId === "APPROVAL", "Common role is APPROVAL (Ký duyệt, phê duyệt)");

  // 3. Test Submit Validation Failure (Invalid payload returns 400)
  console.log("\n[Test 3] POST /api/public/survey/submit (Kiểm tra Reject Payload thiếu trường)...");
  const invalidReq = new NextRequest("http://localhost:3000/api/public/survey/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: "invalid_token", part1: {} }),
  });
  const invalidRes = await submitHandler(invalidReq);
  const invalidJson = await invalidRes.json();

  assert(invalidRes.status === 400, "Từ chối dữ liệu thiếu với mã HTTP 400");
  assert(invalidJson.success === false, "Phản hồi success === false khi validation thất bại");
  assert(invalidJson.error.code === "VALIDATION_FAILED", "Mã lỗi chuẩn VALIDATION_FAILED");

  console.log("\n==================================================");
  console.log(`   KẾT QUẢ KIỂM THỬ API: ${passed}/${total} TESTS PASS `);
  console.log("==================================================");
}

runTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
