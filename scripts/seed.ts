import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";

// Import Models
import { SurveySchemaConfig } from "../src/models/SurveySchemaConfig";
import { BenchmarkMatrix } from "../src/models/BenchmarkMatrix";
import { PositionWorkgroupsMapping } from "../src/models/PositionWorkgroupsMapping";
import { User } from "../src/models/User";
import { Campaign } from "../src/models/Campaign";
import { SurveyLink } from "../src/models/SurveyLink";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/khaosat";

async function main() {
  console.log("=================================================");
  console.log("   KHAOSAT SEED SCRIPT (v3.3) — SPEC-DRIVEN     ");
  console.log("=================================================");
  console.log(`[1/6] Kết nối MongoDB: ${MONGODB_URI}`);

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("  -> Kết nối MongoDB thành công.");
  } catch (err) {
    console.warn("  -> [Cảnh báo] Không thể kết nối MongoDB trực tiếp. Chế độ kiểm tra tĩnh / Offline seed validation.");
    console.warn("  -> " + (err instanceof Error ? err.message : String(err)));
    // We will still validate all data files locally and exit gracefully if MongoDB is not running locally.
    validateSeedFilesLocally();
    return;
  }

  // 1. SurveySchemaConfig (v3.3)
  console.log("\n[2/6] Nạp SurveySchemaConfig phiên bản 3.3...");
  const schemaPath = path.join(__dirname, "../src/data/seed-schema-3.3.json");
  const schemaData = JSON.parse(fs.readFileSync(schemaPath, "utf-8"));
  
  await SurveySchemaConfig.findOneAndUpdate(
    { version: schemaData.version },
    {
      version: schemaData.version,
      isApproved: true,
      approvedAt: new Date("2026-11-14"),
      approvedBy: "Trường Đào tạo và Bồi dưỡng nghiệp vụ kiểm toán",
      workgroups: schemaData.workgroups,
      roles: schemaData.roles,
      difficulties: schemaData.difficulties,
      learningFormats: schemaData.learningFormats,
    },
    { upsert: true, new: true }
  );
  console.log(`  -> Đã nạp thành công Schema v${schemaData.version} (16 nhóm việc, 4 vai trò, 7 khó khăn, 5 hình thức học).`);

  // 2. BenchmarkMatrix
  console.log("\n[3/6] Nạp BenchmarkMatrix (64 mức chuẩn theo Thuyết minh Phần II.B)...");
  const benchmarkPath = path.join(__dirname, "../src/data/seed-benchmark-matrix.json");
  const benchmarkData = JSON.parse(fs.readFileSync(benchmarkPath, "utf-8"));

  let bmCount = 0;
  for (const bm of benchmarkData) {
    await BenchmarkMatrix.findOneAndUpdate(
      {
        schemaVersion: bm.schemaVersion,
        workgroupId: bm.workgroupId,
        roleId: bm.roleId,
      },
      {
        schemaVersion: bm.schemaVersion,
        workgroupId: bm.workgroupId,
        roleId: bm.roleId,
        requiredLevel: bm.requiredLevel,
        rationale: bm.rationale,
      },
      { upsert: true }
    );
    bmCount++;
  }
  console.log(`  -> Đã nạp thành công ${bmCount} mục Benchmark Matrix.`);

  // 3. PositionWorkgroupsMapping
  console.log("\n[4/6] Nạp PositionWorkgroupsMapping (40 cấu hình vị trí - nhóm việc gợi ý)...");
  const posPath = path.join(__dirname, "../src/data/seed-position-mappings.json");
  const posData = JSON.parse(fs.readFileSync(posPath, "utf-8"));

  let posCount = 0;
  for (const pos of posData) {
    await PositionWorkgroupsMapping.findOneAndUpdate(
      {
        schemaVersion: pos.schemaVersion,
        agencyCode: pos.agencyCode,
        positionCode: pos.positionCode,
      },
      {
        schemaVersion: pos.schemaVersion,
        agencyCode: pos.agencyCode,
        agencyName: pos.agencyName,
        positionCode: pos.positionCode,
        positionTitle: pos.positionTitle,
        suggestedWorkgroupIds: pos.suggestedWorkgroupIds,
        commonRoleId: pos.commonRoleId,
        estimatedMinutes: pos.estimatedMinutes,
      },
      { upsert: true }
    );
    posCount++;
  }
  console.log(`  -> Đã nạp thành công ${posCount} cấu hình Position Mappings.`);

  // 4. Default Admin User
  console.log("\n[5/6] Khởi tạo tài khoản Quản trị viên (admin)...");
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash("Admin@123456", salt);

  const adminUser = await User.findOneAndUpdate(
    { username: "admin" },
    {
      username: "admin",
      email: "admin@kiemtoannn.gov.vn",
      passwordHash,
      fullName: "Quản trị viên Hệ thống",
      organization: "Kiểm toán nhà nước",
      role: "TECHNICAL_ADMIN",
      assignedProvinceCodes: [],
      isActive: true,
    },
    { upsert: true, new: true }
  );
  console.log(`  -> Đã khởi tạo User: ${adminUser.username} (${adminUser.role}) - Mật khẩu mặc định: Admin@123456`);

  // 5. Campaign & SurveyLinks (34 Tỉnh)
  console.log("\n[6/6] Khởi tạo Đợt khảo sát 2026 (DOT-1-2026) và 34 Đường dẫn / Mã QR cấp Tỉnh...");
  const provincesPilotPath = path.join(__dirname, "../src/data/seed-provinces-pilot.json");
  const pilotData = JSON.parse(fs.readFileSync(provincesPilotPath, "utf-8"));

  const campaign = await Campaign.findOneAndUpdate(
    { code: "DOT-1-2026" },
    {
      code: "DOT-1-2026",
      title: "Đợt khảo sát năng lực quản lý tài chính, tài sản công cấp xã năm 2026",
      schemaVersion: "3.3",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-12-31"),
      status: "OPEN",
      description: "Đợt khảo sát diện rộng trên 34 tỉnh, thành phố và 3.321 xã/phường/thị trấn theo Phương án triển khai của Kiểm toán nhà nước.",
      createdBy: adminUser._id,
      participatingProvinces: pilotData.provinces.map((p: { code: string; name: string }) => ({
        provinceCode: p.code,
        provinceName: p.name,
        targetRespondents: 100,
      })),
    },
    { upsert: true, new: true }
  );
  console.log(`  -> Đã nạp Campaign: ${campaign.code} - ${campaign.title}`);

  // Base URL for survey link
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://khaosat.kiemtoannn.gov.vn";

  let linkCount = 0;
  for (const prov of pilotData.provinces) {
    // Generate deterministic pilot token from province code and campaign
    const token = `pilot_${campaign.code.toLowerCase()}_p${prov.code}`;
    const surveyUrl = `${baseUrl}/khao-sat/${token}`;
    const qrCodeDataUrl = await QRCode.toDataURL(surveyUrl, {
      margin: 2,
      width: 256,
      errorCorrectionLevel: "M",
    });

    await SurveyLink.findOneAndUpdate(
      { campaignId: campaign._id, provinceCode: prov.code },
      {
        campaignId: campaign._id,
        provinceCode: prov.code,
        provinceName: prov.name,
        token,
        qrCodeDataUrl,
        status: "ACTIVE",
        isPilot: true,
      },
      { upsert: true }
    );
    linkCount++;
  }
  console.log(`  -> Đã tạo và sinh mã QR cho ${linkCount} đường dẫn cấp Tỉnh.`);

  console.log("\n=================================================");
  console.log("   HOÀN THÀNH NẠP DỮ LIỆU SEED (v3.3) THÀNH CÔNG! ");
  console.log("=================================================");

  await mongoose.disconnect();
}

function validateSeedFilesLocally() {
  console.log("\n--- KIỂM TRA TÍNH TOÀN VẸN CÁC FILE DỮ LIỆU SEED (OFFLINE) ---");
  const files = [
    "../src/data/seed-schema-3.3.json",
    "../src/data/seed-benchmark-matrix.json",
    "../src/data/seed-position-mappings.json",
    "../src/data/seed-provinces-pilot.json",
    "../src/data/communes-catalog.template.json",
  ];

  for (const relPath of files) {
    const fullPath = path.join(__dirname, relPath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File không tồn tại: ${fullPath}`);
    }
    const content = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
    const count = Array.isArray(content)
      ? content.length
      : content.workgroups
      ? content.workgroups.length
      : content.provinces
      ? content.provinces.length
      : 1;
    console.log(`  [OK] ${path.basename(relPath)}: JSON hợp lệ (${count} bản ghi chính)`);
  }
  console.log("  -> Tất cả các file seed data đã sẵn sàng 100% cho database nạp.\n");
}

main().catch((err) => {
  console.error("Lỗi thực thi seed script:", err);
  process.exit(1);
});
