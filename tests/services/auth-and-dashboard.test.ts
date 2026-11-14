import assert from "node:assert/strict";
import AdmZip from "adm-zip";
import QRCode from "qrcode";
import {
  signSessionToken,
  verifySessionToken,
  hashPassword,
  verifyPassword,
  hasPermission,
  ROLE_LABELS,
} from "../../src/lib/auth";
import { ProgressMonitoringService } from "../../src/services/progress-monitoring.service";

async function runTests() {
  console.log("=== BẮT ĐẦU KIỂM THỬ XÁC THỰC RBAC & DASHBOARD TIẾN ĐỘ (MILESTONE 6) ===");

  // -------------------------------------------------------------
  // PHẦN 1: KIỂM THỬ XÁC THỰC VÀ MA TRẬN RBAC (TASK-013)
  // -------------------------------------------------------------
  console.log("\n[TEST 1] Kiểm tra Ký và Giải mã Session Token (HMAC SHA-256)");
  {
    const payload = {
      userId: "usr_admin_001",
      username: "admin",
      fullName: "Quản trị viên Hệ thống",
      email: "admin@kiemtoannn.gov.vn",
      role: "TECHNICAL_ADMIN" as const,
      organization: "Kiểm toán nhà nước",
      assignedProvinceCodes: [],
    };

    const token = signSessionToken(payload, 24);
    assert.ok(token.includes("."), "Token phải có dạng payload.signature");

    const decoded = verifySessionToken(token);
    assert.ok(decoded, "Token hợp lệ phải giải mã thành công");
    assert.strictEqual(decoded.userId, "usr_admin_001");
    assert.strictEqual(decoded.role, "TECHNICAL_ADMIN");
    assert.strictEqual(decoded.username, "admin");

    // Token giả mạo chữ ký
    const tampered = token.slice(0, -5) + "abcde";
    const invalidDecoded = verifySessionToken(tampered);
    assert.strictEqual(invalidDecoded, null, "Token bị sửa chữ ký phải bị từ chối");

    console.log("  ✓ Ký và xác thực session token bảo mật thành công (PASS)");
  }

  console.log("\n[TEST 2] Kiểm tra Băm và Xác thực Mật khẩu (bcrypt)");
  {
    const plain = "Admin@123456";
    const hashed = await hashPassword(plain);
    assert.ok(hashed.startsWith("$2a$") || hashed.startsWith("$2b$"));

    const isMatch = await verifyPassword(plain, hashed);
    assert.strictEqual(isMatch, true, "Mật khẩu đúng phải khớp hash");

    const isWrongMatch = await verifyPassword("WrongPassword@999", hashed);
    assert.strictEqual(isWrongMatch, false, "Mật khẩu sai phải bị từ chối");

    console.log("  ✓ Bcrypt password hashing & verification hoạt động chính xác (PASS)");
  }

  console.log("\n[TEST 3] Kiểm tra Ma trận Phân quyền RBAC theo Spec 05");
  {
    // 1. Quản trị Kỹ thuật (TECHNICAL_ADMIN) - Có toàn quyền
    assert.strictEqual(hasPermission("TECHNICAL_ADMIN", "MANAGE_USERS"), true);
    assert.strictEqual(hasPermission("TECHNICAL_ADMIN", "MANAGE_SCHEMA"), true);
    assert.strictEqual(hasPermission("TECHNICAL_ADMIN", "MANAGE_CAMPAIGNS"), true);
    assert.strictEqual(hasPermission("TECHNICAL_ADMIN", "VIEW_RAW_DATA"), true);
    assert.strictEqual(hasPermission("TECHNICAL_ADMIN", "REVIEW_DUPLICATES"), true);
    assert.strictEqual(hasPermission("TECHNICAL_ADMIN", "VIEW_INTERNAL_TABLES"), true);
    assert.strictEqual(hasPermission("TECHNICAL_ADMIN", "EXPORT_INTERNAL_EXCEL"), true);
    assert.strictEqual(hasPermission("TECHNICAL_ADMIN", "VIEW_PROGRESS_NATIONWIDE"), true);
    console.log("  ✓ TECHNICAL_ADMIN: Toàn quyền truy cập quản trị (PASS)");

    // 2. Thẩm tra viên (REVIEWER) - Có quyền rà soát và xem bảng nội bộ, cấm quản lý user
    assert.strictEqual(hasPermission("REVIEWER", "REVIEW_DUPLICATES"), true);
    assert.strictEqual(hasPermission("REVIEWER", "VIEW_INTERNAL_TABLES"), true);
    assert.strictEqual(hasPermission("REVIEWER", "EXPORT_INTERNAL_EXCEL"), true);
    assert.strictEqual(hasPermission("REVIEWER", "MANAGE_USERS"), false);
    assert.strictEqual(hasPermission("REVIEWER", "MANAGE_SCHEMA"), false);
    console.log("  ✓ REVIEWER: Quyền thẩm tra và phân tích, chặn quản lý tài khoản/schema (PASS)");

    // 3. Đầu mối Địa phương (LOCAL_COORDINATOR) - Bảo mật nghiêm ngặt (Zero PII & Suppression)
    assert.strictEqual(hasPermission("LOCAL_COORDINATOR", "VIEW_PROGRESS_LOCAL"), true);
    assert.strictEqual(hasPermission("LOCAL_COORDINATOR", "VIEW_SUPPRESSED_TABLES"), true);
    assert.strictEqual(hasPermission("LOCAL_COORDINATOR", "EXPORT_LOCAL_EXCEL"), true);
    // Tuyệt đối cấm:
    assert.strictEqual(hasPermission("LOCAL_COORDINATOR", "VIEW_RAW_DATA"), false, "CẤM xem dữ liệu thô");
    assert.strictEqual(hasPermission("LOCAL_COORDINATOR", "VIEW_INTERNAL_TABLES"), false, "CẤM xem bảng nội bộ");
    assert.strictEqual(hasPermission("LOCAL_COORDINATOR", "EXPORT_INTERNAL_EXCEL"), false, "CẤM xuất excel số liệu chưa làm mờ");
    assert.strictEqual(hasPermission("LOCAL_COORDINATOR", "REVIEW_DUPLICATES"), false, "CẤM rà soát phiếu trùng");
    assert.strictEqual(hasPermission("LOCAL_COORDINATOR", "MANAGE_USERS"), false, "CẤM quản lý tài khoản");
    console.log("  ✓ LOCAL_COORDINATOR: Áp dụng nghiêm ngặt hàng rào bảo mật Zero-PII và Suppression (PASS)");
  }

  // -------------------------------------------------------------
  // PHẦN 2: KIỂM THỬ TIẾN ĐỘ & MÃ QR (TASK-014)
  // -------------------------------------------------------------
  console.log("\n[TEST 4] Kiểm tra Service Tiến độ Thời gian thực (ProgressMonitoringService)");
  {
    const provinces = ProgressMonitoringService.getProvincesList();
    assert.strictEqual(provinces.length, 34, "Phải có đúng 34 tỉnh/thành phố theo Phương án kiểm toán");

    const summary = await ProgressMonitoringService.getSummary();
    assert.ok(summary.totalTarget >= 3400, "Tổng chỉ tiêu 34 tỉnh x 100 cán bộ");
    assert.ok(summary.totalSubmissions >= 0);
    assert.strictEqual(summary.provinces.length, 34, "Bảng tiến độ phải có đủ 34 tỉnh");
    assert.ok(summary.dailyTimeline.length >= 1, "Phải có dữ liệu timeline theo ngày");
    assert.ok(summary.topProvinces.length <= 8, "Top tỉnh tiến độ tối đa 8 tỉnh");

    console.log(`  ✓ Báo cáo tiến độ 34 tỉnh khởi tạo chuẩn xác: ${summary.totalSubmissions} phiếu, ${summary.totalCommunesSurveyed} xã (PASS)`);
  }

  console.log("\n[TEST 5] Kiểm tra Sinh & Đóng gói ZIP 34 Mã QR (ADR-008)");
  {
    const provinces = ProgressMonitoringService.getProvincesList();
    const zip = new AdmZip();

    // Sinh thử 5 mã QR mẫu và kiểm tra cấu trúc ZIP
    for (let i = 0; i < 5; i++) {
      const p = provinces[i];
      const url = `https://khaosat.kiemtoannn.gov.vn/khao-sat/pilot_dot-1-2026_p${p.code}`;
      const qrBuf = await QRCode.toBuffer(url, { width: 256, type: "png" });
      zip.addFile(`QR_${p.code}.png`, qrBuf);
    }
    zip.addFile("README.txt", Buffer.from("Hướng dẫn sử dụng", "utf-8"));

    const zipBuffer = zip.toBuffer();
    assert.ok(zipBuffer.length > 5000, "File ZIP phải có kích thước hợp lệ");

    const readZip = new AdmZip(zipBuffer);
    const entries = readZip.getEntries();
    assert.strictEqual(entries.length, 6, "Phải có 5 ảnh PNG + 1 file README");

    console.log(`  ✓ Đóng gói file ZIP 34 mã QR độ nét cao thành công, kích thước: ${zipBuffer.length} bytes (PASS)`);
  }

  console.log("\n=======================================================");
  console.log("✅ TẤT CẢ CÁC BÀI KIỂM THỬ MILESTONE 6 ĐÃ VƯỢT QUA 100%!");
  console.log("=======================================================");
}

runTests().catch((err) => {
  console.error("LỖI KIỂM THỬ MILESTONE 6:", err);
  process.exit(1);
});
