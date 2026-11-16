import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import mongoose from "mongoose";
import { connectToDatabase } from "../../src/lib/db";
import { SurveySchemaConfig } from "../../src/models/SurveySchemaConfig";
import {
  SurveyQuestionsAdminService,
  DEFAULT_14_QUESTIONS,
} from "../../src/services/survey-questions-admin.service";
import {
  QuestionConfigInputSchema,
  WorkgroupInputSchema,
  LearningTopicInputSchema,
  CreateVersionInputSchema,
} from "../../src/lib/validations/survey-schema-admin.schema";

describe("PHÂN HỆ QUẢN TRỊ BỘ CÂU HỎI & NGÂN HÀNG CHUYÊN ĐỀ ĐÀO TẠO (ADR-012)", () => {
  before(async () => {
    try {
      await connectToDatabase();
      await SurveySchemaConfig.deleteOne({ version: "3.4" });
    } catch (_) {}
  });
  it("TC-QA-01: Lấy danh sách phiên bản và nạp đầy đủ cấu hình phiên bản chuẩn 3.3", async () => {
    const versions = await SurveyQuestionsAdminService.getVersionsOverview();
    assert.ok(versions.length >= 1, "Phải có ít nhất 1 phiên bản bộ phiếu (3.3)");

    const schema33 = await SurveyQuestionsAdminService.getSchemaByVersion("3.3");
    assert.ok(schema33, "Phải nạp được cấu hình phiên bản 3.3");
    assert.ok(schema33.workgroups.length >= 16, "Phiên bản 3.3 phải có ít nhất 16 nhóm công việc");
    assert.strictEqual(schema33.roles.length, 4, "Phải có đủ 4 vai trò");
    assert.ok(schema33.difficulties.length >= 7, "Phải có ít nhất 7 mục khó khăn");
    assert.ok(schema33.learningFormats.length >= 5, "Phải có ít nhất 5 hình thức học");
    assert.strictEqual(schema33.questions.length, 14, "Phải có đủ 14 câu hỏi chuẩn");

    console.log("  ✓ PASS TC-QA-01: Danh sách phiên bản và cấu trúc bộ phiếu 3.3 đầy đủ tính toàn vẹn");
  });

  it("TC-QA-02: Nhân bản (Clone) phiên bản mới (3.4) từ phiên bản 3.3 thành công", async () => {
    const newVersionInput = {
      newVersion: "3.4",
      sourceVersion: "3.3",
      title: "Bộ phiếu khảo sát nhu cầu bồi dưỡng năng lực cấp xã phiên bản 3.4",
      description: "Thử nghiệm cấu hình mở rộng câu hỏi",
    };

    const validParse = CreateVersionInputSchema.safeParse(newVersionInput);
    assert.ok(validParse.success, "Dữ liệu tạo phiên bản mới phải hợp lệ");

    const created = await SurveyQuestionsAdminService.createOrCloneVersion(newVersionInput);
    assert.strictEqual(created.version, "3.4");
    assert.strictEqual(created.isApproved, false, "Phiên bản mới khởi tạo phải ở trạng thái Chưa duyệt (bản nháp)");
    assert.ok(created.workgroups.length >= 16, "Phải sao chép đầy đủ các nhóm việc từ phiên bản gốc");
    assert.strictEqual(created.questions.length, 14, "Phải sao chép đầy đủ 14 câu hỏi");

    // Lấy lại từ service để đảm bảo tính lưu trữ
    const fetched = await SurveyQuestionsAdminService.getSchemaByVersion("3.4");
    assert.strictEqual(fetched.version, "3.4");
    console.log("  ✓ PASS TC-QA-02: Nhân bản phiên bản 3.4 thành công và bảo toàn cấu trúc độc lập");
  });

  it("TC-QA-03: Thêm mới nhóm công việc N17, cập nhật tên và xóa nhóm việc", async () => {
    const newWg = {
      id: "N17",
      order: 17,
      title: "Nhóm công việc bổ sung thử nghiệm",
      description: "Mô tả phần việc mới được giao theo yêu cầu thực tế địa phương",
      learningTopics: [
        { topicId: "N17_01", topicTitle: "Chuyên đề số 1 của nhóm mới" },
      ],
    };

    const parseWg = WorkgroupInputSchema.safeParse(newWg);
    assert.ok(parseWg.success, "Dữ liệu nhóm việc mới phải hợp lệ theo Zod schema");

    // 1. Thêm nhóm N17 vào phiên bản 3.4
    const addedRes = await SurveyQuestionsAdminService.addWorkgroup("3.4", newWg);
    const wgList = addedRes.workgroups;
    const n17 = wgList.find((w: any) => w.id === "N17");
    assert.ok(n17, "Nhóm N17 phải có trong danh sách sau khi thêm");
    assert.strictEqual(n17.title, "Nhóm công việc bổ sung thử nghiệm");

    // 2. Cập nhật nhóm N17
    const updatedRes = await SurveyQuestionsAdminService.updateWorkgroup("3.4", "N17", {
      title: "Nhóm công việc bổ sung thử nghiệm (Đã cập nhật)",
    });
    const updatedN17 = updatedRes.workgroups.find((w: any) => w.id === "N17");
    assert.strictEqual(updatedN17.title, "Nhóm công việc bổ sung thử nghiệm (Đã cập nhật)");

    // 3. Xóa nhóm N17
    const deletedRes = await SurveyQuestionsAdminService.deleteWorkgroup("3.4", "N17");
    const existsAfterDelete = deletedRes.workgroups.some((w: any) => w.id === "N17");
    assert.strictEqual(existsAfterDelete, false, "Nhóm N17 phải không còn trong danh sách sau khi xóa");

    console.log("  ✓ PASS TC-QA-03: Thao tác Thêm, Sửa và Xóa nhóm công việc hoạt động chính xác 100%");
  });

  it("TC-QA-04: Thêm, sửa và xóa chuyên đề đào tạo con thuộc nhóm công việc", async () => {
    const newTopic = {
      topicId: "N01_99",
      topicTitle: "Chuyên đề kỹ năng số kiểm toán cấp xã",
    };

    const parseTopic = LearningTopicInputSchema.safeParse(newTopic);
    assert.ok(parseTopic.success, "Dữ liệu chuyên đề phải hợp lệ theo Zod schema");

    // 1. Thêm chuyên đề vào N01 của phiên bản 3.4
    const resAdded = await SurveyQuestionsAdminService.addTopic("3.4", "N01", newTopic);
    const n01 = resAdded.workgroups.find((w: any) => w.id === "N01");
    assert.ok(n01.learningTopics.some((t: any) => t.topicId === "N01_99"));

    // 2. Sửa tên chuyên đề
    const resUpdated = await SurveyQuestionsAdminService.updateTopic("3.4", "N01", "N01_99", {
      topicTitle: "Chuyên đề kỹ năng số kiểm toán cấp xã (Nâng cao)",
    });
    const n01Updated = resUpdated.workgroups.find((w: any) => w.id === "N01");
    const targetTopic = n01Updated.learningTopics.find((t: any) => t.topicId === "N01_99");
    assert.strictEqual(targetTopic.topicTitle, "Chuyên đề kỹ năng số kiểm toán cấp xã (Nâng cao)");

    // 3. Xóa chuyên đề
    const resDeleted = await SurveyQuestionsAdminService.deleteTopic("3.4", "N01", "N01_99");
    const n01AfterDel = resDeleted.workgroups.find((w: any) => w.id === "N01");
    assert.strictEqual(n01AfterDel.learningTopics.some((t: any) => t.topicId === "N01_99"), false);

    console.log("  ✓ PASS TC-QA-04: Thao tác Thêm, Sửa và Xóa chuyên đề đào tạo hoạt động chính xác");
  });

  it("TC-QA-05: Cập nhật cấu hình 14 câu hỏi, ràng buộc số lượng chọn và danh mục khó khăn", async () => {
    // 1. Cập nhật câu hỏi Q10 (chọn tối đa 3 thay vì 2)
    const questions = [...DEFAULT_14_QUESTIONS];
    const q10 = questions.find((q) => q.id === "Q10");
    assert.ok(q10);
    q10.maxSelect = 3;
    q10.instruction = "Chọn tối đa 3 khó khăn lớn nhất";

    const resQuestions = await SurveyQuestionsAdminService.updateQuestions("3.4", questions);
    const updatedQ10 = resQuestions.questions.find((q: any) => q.id === "Q10");
    assert.strictEqual(updatedQ10.maxSelect, 3);
    assert.strictEqual(updatedQ10.instruction, "Chọn tối đa 3 khó khăn lớn nhất");

    // 2. Cập nhật danh mục khó khăn
    const newDifficulties = [
      { id: "D1", title: "Quy định chưa rõ ràng", isExclusive: false },
      { id: "D2", title: "Khối lượng công việc quá tải", isExclusive: false },
      { id: "D_NONE", title: "Không gặp khó khăn đáng kể", isExclusive: true },
    ];
    const resDiffs = await SurveyQuestionsAdminService.updateDifficulties("3.4", newDifficulties);
    assert.strictEqual(resDiffs.difficulties.length, 3);
    assert.strictEqual(resDiffs.difficulties.find((d: any) => d.id === "D_NONE")?.isExclusive, true);

    console.log("  ✓ PASS TC-QA-05: Cập nhật ràng buộc câu hỏi và danh mục khó khăn thành công");
  });

  after(async () => {
    try {
      await mongoose.disconnect();
    } catch (_) {}
  });
});
