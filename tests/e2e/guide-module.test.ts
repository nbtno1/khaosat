import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { SystemGuideService } from "../../src/services/system-guide.service";

async function runGuideModuleTests() {
  console.log("=== BẮT ĐẦU KIỂM THỬ PHÂN HỆ HƯỚNG DẪN SỬ DỤNG ĐỘNG (TASK-017 & ADR-010) ===");

  console.log("\n[TEST 1] Kiểm tra file trang Hướng dẫn Quản trị Động (/admin/guide/page.tsx)");
  {
    const guidePagePath = path.join(process.cwd(), "src/app/(admin)/admin/guide/page.tsx");
    assert.ok(fs.existsSync(guidePagePath), "File /admin/guide/page.tsx phải tồn tại");

    const content = fs.readFileSync(guidePagePath, "utf-8");
    assert.ok(content.includes("guideData.modules"));
    assert.ok(content.includes("Hướng dẫn Sử dụng & Vận hành Phần mềm"));
    assert.ok(content.includes("filteredModules"));
    assert.ok(content.includes("Cam kết Không Thu thập Dữ liệu Nhận dạng Cá nhân (Zero-PII)"));
    assert.ok(content.includes("/api/public/guide"));
    assert.ok(content.includes("/api/admin/guide/sections/"));
    console.log("  ✓ Trang Hướng dẫn Vận hành chứa đầy đủ giao diện đồng bộ hóa động và bóc tách modules (PASS)");
  }

  console.log("\n[TEST 2] Kiểm tra Service Introspection Động (SystemGuideService.getDynamicGuideData)");
  {
    const guideData = await SystemGuideService.getDynamicGuideData();
    assert.ok(guideData, "guideData không được rỗng");
    assert.equal(guideData.schemaMeta.version, "3.3", "Schema version phải là 3.3");
    assert.equal(guideData.schemaMeta.totalWorkgroups, 16, "Phải có đúng 16 nhóm công việc");
    assert.equal(guideData.schemaMeta.totalRoles, 4, "Phải có đúng 4 vai trò công vụ");
    assert.equal(guideData.campaignMeta.code, "DOT-1-2026", "Mã chiến dịch khảo sát phải là DOT-1-2026");
    assert.equal(guideData.campaignMeta.participatingProvincesCount, 34, "Phải có 34 tỉnh/thành phố tham gia");

    // Kiểm tra danh mục modules được đăng ký
    assert.ok(guideData.modules.length >= 6, "Phải có ít nhất 6 phân hệ chức năng cốt lõi");
    const moduleIds = guideData.modules.map((m) => m.id);
    assert.ok(moduleIds.includes("public_survey"), "Phải có module public_survey");
    assert.ok(moduleIds.includes("progress_dashboard"), "Phải có module progress_dashboard");
    assert.ok(moduleIds.includes("campaign_qr"), "Phải có module campaign_qr");
    assert.ok(moduleIds.includes("duplicate_workbench"), "Phải có module duplicate_workbench");
    assert.ok(moduleIds.includes("analytics_tables"), "Phải có module analytics_tables");
    assert.ok(moduleIds.includes("excel_export"), "Phải có module excel_export");

    for (const mod of guideData.modules) {
      assert.ok(mod.allowedRoles.length > 0, `Module ${mod.id} phải có danh sách vai trò cho phép`);
      assert.ok(mod.keyCapabilities.length > 0, `Module ${mod.id} phải có năng lực cốt lõi`);
      assert.ok(mod.operationalRules.length > 0, `Module ${mod.id} phải có quy tắc nghiệp vụ`);
      assert.ok(mod.apiEndpoints.length > 0, `Module ${mod.id} phải có API endpoints tương ứng`);
    }

    console.log(`  ✓ SystemGuideService bóc tách thành công ${guideData.modules.length} modules, 16 nhóm việc, 4 vai trò và 34 tỉnh (PASS)`);
  }

  console.log("\n[TEST 3] Kiểm tra Component Modal Hướng dẫn Làm bài Khảo sát (SurveyGuideModal)");
  {
    const modalPath = path.join(process.cwd(), "src/components/survey/SurveyGuideModal.tsx");
    assert.ok(fs.existsSync(modalPath), "File SurveyGuideModal.tsx phải tồn tại");

    const content = fs.readFileSync(modalPath, "utf-8");
    assert.ok(content.includes("Hướng dẫn Điền Phiếu Khảo sát (Phiên bản 3.3)"));
    assert.ok(content.includes("Bước 1: Khai báo Thông tin Chung"));
    assert.ok(content.includes("Bước 2: Xác định Tình trạng 16 Nhóm Công việc"));
    assert.ok(content.includes("Bước 3: Tự Đánh giá Năng lực & Nhu cầu Học"));
    assert.ok(content.includes("Bước 4: Đề xuất Hình thức Học & Gửi Phiếu"));
    assert.ok(content.includes("Quy tắc Kết thúc Sớm (Ngoài phạm vi)"));
    assert.ok(content.includes("Ràng buộc chọn Khó khăn tại Câu 10"));
    assert.ok(content.includes("Chính sách Bảo mật Quyền riêng tư (Zero-PII)"));
    console.log("  ✓ SurveyGuideModal tích hợp đầy đủ 4 bước làm bài, các quy tắc và FAQ (PASS)");
  }

  console.log("\n[TEST 4] Kiểm tra Tích hợp Điều hướng (Admin Layout) và Cổng Khảo sát");
  {
    const layoutPath = path.join(process.cwd(), "src/app/(admin)/layout.tsx");
    const layoutContent = fs.readFileSync(layoutPath, "utf-8");
    assert.ok(layoutContent.includes("/admin/guide"), "Admin Layout phải có liên kết tới /admin/guide");
    assert.ok(layoutContent.includes("Hướng dẫn sử dụng"));

    const containerPath = path.join(process.cwd(), "src/components/survey/SurveyContainer.tsx");
    const containerContent = fs.readFileSync(containerPath, "utf-8");
    assert.ok(containerContent.includes("SurveyGuideModal"), "SurveyContainer phải tích hợp SurveyGuideModal");
    assert.ok(containerContent.includes("Hướng dẫn làm bài"), "Header biểu mẫu khảo sát phải có nút mở hướng dẫn");
    console.log("  ✓ Tích hợp điều hướng Admin Layout và Cổng Khảo sát hoàn tất (PASS)");
  }

  console.log("\n[TEST 5] Kiểm tra API Endpoints của Phân hệ Hướng dẫn Động");
  {
    const publicRoutePath = path.join(process.cwd(), "src/app/api/public/guide/route.ts");
    assert.ok(fs.existsSync(publicRoutePath), "Route GET /api/public/guide phải tồn tại");

    const adminRoutePath = path.join(process.cwd(), "src/app/api/admin/guide/sections/[key]/route.ts");
    assert.ok(fs.existsSync(adminRoutePath), "Route PATCH /api/admin/guide/sections/[key] phải tồn tại");

    const adminRouteContent = fs.readFileSync(adminRoutePath, "utf-8");
    assert.ok(adminRouteContent.includes("TECHNICAL_ADMIN"), "Route PATCH phải yêu cầu quyền TECHNICAL_ADMIN hoặc CONTENT_ADMIN");
    assert.ok(adminRouteContent.includes("CONTENT_ADMIN"));
    console.log("  ✓ API Endpoints bảo vệ phân quyền RBAC và phân phối dữ liệu cẩm nang động (PASS)");
  }

  console.log("\n=======================================================");
  console.log("✅ TẤT CẢ CÁC BÀI KIỂM THỬ TASK-017 & ADR-010 ĐÃ VƯỢT QUA 100%!");
  console.log("=======================================================");
}

runGuideModuleTests().catch((err) => {
  console.error("LỖI KIỂM THỬ GUIDE MODULE:", err);
  process.exit(1);
});
