import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import mongoose from "mongoose";
import { connectToDatabase } from "../../src/lib/db";
import { TrainingProposal } from "../../src/models/TrainingProposal";
import { TrainingProposalService } from "../../src/services/training-proposal.service";

describe("PHÂN HỆ LẬP & QUẢN TRỊ BẢN ĐỀ XUẤT ĐÀO TẠO 12 MỤC TIÊU CHUẨN (BR-21 & THUYẾT MINH PHẦN V)", () => {
  let createdProposalId = "";

  before(async () => {
    try {
      await connectToDatabase();
      await TrainingProposal.deleteMany({ title: /Kiểm thử tự động/ });
    } catch (_) {}
  });

  after(async () => {
    try {
      await TrainingProposal.deleteMany({ title: /Kiểm thử tự động/ });
      await mongoose.disconnect();
    } catch (_) {}
  });

  it("TC-PROP-01: Tự động sinh Bản thảo Đề xuất 12 mục từ 6 bảng tổng hợp thành công", async () => {
    const draft = await TrainingProposalService.generateDraftFromAnalytics({
      provinceCode: "42",
      provinceName: "Tỉnh Hà Tĩnh",
      createdByName: "Chuyên viên Khoa Chuyên ngành",
    });

    assert.ok(draft, "Bản thảo phải được tạo ra");
    assert.strictEqual(draft.provinceCode, "42");
    assert.strictEqual(draft.provinceName, "Tỉnh Hà Tĩnh");
    assert.strictEqual(draft.status, "DRAFT");
    assert.strictEqual(draft.schemaVersion, "3.3");

    console.log("  ✓ PASS TC-PROP-01: Tự động trích xuất Bản thảo Đề xuất từ 6 bảng thành công");
  });

  it("TC-PROP-02: Kiểm tra tính toàn vẹn của đúng 12 mục tiêu chí theo quy chuẩn", async () => {
    const draft = await TrainingProposalService.generateDraftFromAnalytics({
      provinceCode: "ALL",
      provinceName: "Toàn quốc",
      createdByName: "Chuyên viên Kiểm toán",
    });

    // 1. Mục 1: Meta
    assert.ok(draft.item1_meta.provinceName, "Mục 1 phải có tên địa phương");
    assert.ok(draft.item1_meta.proposalDate, "Mục 1 phải có ngày lập");

    // 2. Mục 2: Căn cứ số liệu
    assert.ok(typeof draft.item2_dataBasis.totalRespondents === "number", "Mục 2 phải có tổng số người");

    // 3. Mục 3: Danh mục chuyên đề
    assert.ok(Array.isArray(draft.item3_proposedTopics), "Mục 3 phải là mảng chuyên đề");

    // 4. Mục 4: Lý do lựa chọn
    assert.ok(draft.item4_selectionReasons.length > 0, "Mục 4 phải có lý do lựa chọn");

    // 5. Mục 5: Khoảng thiếu hụt
    assert.ok(draft.item5_capacityGapAnalysis.length > 0, "Mục 5 phải có phân tích khoảng thiếu hụt");

    // 6. Mục 6: Hình thức học
    assert.ok(Array.isArray(draft.item6_suggestedFormats), "Mục 6 phải có hình thức học");

    // 7. Mục 7: Thời lượng và thời gian
    assert.ok(draft.item7_timingAndDuration.length > 0, "Mục 7 phải có thời lượng");

    // 8. Mục 8: Nhóm chưa có dịp
    assert.ok(draft.item8_noChanceModule.length > 0, "Mục 8 phải có phương án cho người chưa có dịp");

    // 9. Mục 9: Nhóm nhỏ (<5)
    assert.ok(draft.item9_smallGroupStrategy.length > 0, "Mục 9 phải có phương án nhóm nhỏ");

    // 10. Mục 10: Kiến nghị ngoài đào tạo
    assert.ok(draft.item10_institutionalRecommendations.length > 0, "Mục 10 phải có kiến nghị thể chế");

    // 11. Mục 11: Giới hạn pháp lý
    assert.ok(draft.item11_legalDisclaimer.toLowerCase().includes("không sử dụng") && draft.item11_legalDisclaimer.includes("xếp loại"), "Mục 11 phải có câu giới hạn pháp lý");

    // 12. Mục 12: Chữ ký phê duyệt
    assert.ok(draft.item12_approval.createdByName, "Mục 12 phải có tên người lập");

    console.log("  ✓ PASS TC-PROP-02: Đầy đủ 12 mục tiêu chí chuẩn theo quy định Thuyết minh Phần V Mục 3");
  });

  it("TC-PROP-03: Lưu Bản Đề xuất Đào tạo mới vào MongoDB thành công", async () => {
    const draft = await TrainingProposalService.generateDraftFromAnalytics({
      provinceCode: "42",
      provinceName: "Tỉnh Hà Tĩnh",
      createdByName: "Chuyên viên Thử nghiệm",
    });

    draft.title = "Bản Đề xuất Đào tạo (Kiểm thử tự động TC-PROP-03)";

    const saved = await TrainingProposalService.createProposal(draft);
    assert.ok(saved, "Phải lưu thành công vào MongoDB");
    assert.ok(saved._id, "Phải có ID MongoDB");
    assert.strictEqual(saved.status, "DRAFT");

    createdProposalId = saved._id.toString();
    console.log("  ✓ PASS TC-PROP-03: Lưu Bản Đề xuất Đào tạo vào Database thành công");
  });

  it("TC-PROP-04: Cập nhật nội dung Bản Đề xuất Đào tạo", async () => {
    assert.ok(createdProposalId, "Phải có ID đề xuất");

    const updated = await TrainingProposalService.updateProposal(createdProposalId, {
      title: "Bản Đề xuất Đào tạo Đã Hiệu Chỉnh (Kiểm thử tự động)",
      item7_timingAndDuration: "Tổ chức 3 đợt tập trung trong tháng 5/2026",
    });

    assert.strictEqual(updated.title, "Bản Đề xuất Đào tạo Đã Hiệu Chỉnh (Kiểm thử tự động)");
    assert.strictEqual(updated.item7_timingAndDuration, "Tổ chức 3 đợt tập trung trong tháng 5/2026");

    console.log("  ✓ PASS TC-PROP-04: Cập nhật nội dung Đề xuất Đào tạo thành công");
  });

  it("TC-PROP-05: Phê duyệt Bản Đề xuất Đào tạo", async () => {
    assert.ok(createdProposalId, "Phải có ID đề xuất");

    const approved = await TrainingProposalService.approveProposal(
      createdProposalId,
      "Giám đốc Trường ĐT&BD nghiệp vụ kiểm toán"
    );

    assert.strictEqual(approved.status, "APPROVED");
    assert.strictEqual(approved.item12_approval.approvedByName, "Giám đốc Trường ĐT&BD nghiệp vụ kiểm toán");
    assert.ok(approved.item12_approval.approvedAt, "Phải có thời điểm ký duyệt");

    console.log("  ✓ PASS TC-PROP-05: Phê duyệt Bản Đề xuất Đào tạo thành công");
  });

  it("TC-PROP-06: Xóa Bản Đề xuất Đào tạo thành công", async () => {
    assert.ok(createdProposalId, "Phải có ID đề xuất");

    await TrainingProposalService.deleteProposal(createdProposalId);
    const found = await TrainingProposal.findById(createdProposalId);
    assert.strictEqual(found, null, "Bản ghi phải được xóa khỏi cơ sở dữ liệu");

    console.log("  ✓ PASS TC-PROP-06: Xóa Bản Đề xuất Đào tạo thành công");
  });
});
