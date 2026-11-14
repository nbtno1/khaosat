import assert from "node:assert/strict";
import fs from "fs";
import path from "path";

async function runGuideModuleTests() {
  console.log("=== BẮT ĐẦU KIỂM THỬ PHÂN HỆ HƯỚNG DẪN SỬ DỤNG PHẦN MỀM (TASK-017) ===");

  console.log("\n[TEST 1] Kiểm tra file trang Hướng dẫn Quản trị (/admin/guide/page.tsx)");
  {
    const guidePagePath = path.join(process.cwd(), "src/app/(admin)/admin/guide/page.tsx");
    assert.ok(fs.existsSync(guidePagePath), "File /admin/guide/page.tsx phải tồn tại");

    const content = fs.readFileSync(guidePagePath, "utf-8");
    assert.ok(content.includes("Cẩm nang Hướng dẫn Vận hành Hệ thống Khảo sát"));
    assert.ok(content.includes("Phân quyền và Trách nhiệm 5 Nhóm Tài khoản"));
    assert.ok(content.includes("Theo dõi Tiến độ & Phát hành Bộ 34 Mã QR Cấp Tỉnh"));
    assert.ok(content.includes("Quy trình Thẩm tra & Xử lý Phiếu Nghi trùng"));
    assert.ok(content.includes("Khai thác 6 Bảng Tổng hợp & Phương pháp Tính Khoảng Thiếu hụt"));
    assert.ok(content.includes("Thuật toán Ẩn danh Số liệu Nhóm nhỏ & Xuất Báo cáo ExcelJS"));
    assert.ok(content.includes("Cam kết Không Thu thập Dữ liệu Nhận dạng Cá nhân (Zero-PII)"));
    console.log("  ✓ Trang Hướng dẫn Vận hành chứa đầy đủ 5 chuyên đề quản trị và hướng dẫn cấp xã (PASS)");
  }

  console.log("\n[TEST 2] Kiểm tra Component Modal Hướng dẫn Làm bài Khảo sát (SurveyGuideModal)");
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

  console.log("\n[TEST 3] Kiểm tra Tích hợp vào Menu Điều hướng (Admin Layout) và Cổng Khảo sát");
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

  console.log("\n=======================================================");
  console.log("✅ TẤT CẢ CÁC BÀI KIỂM THỬ TASK-017 ĐÃ VƯỢT QUA 100%!");
  console.log("=======================================================");
}

runGuideModuleTests().catch((err) => {
  console.error("LỖI KIỂM THỬ GUIDE MODULE:", err);
  process.exit(1);
});
