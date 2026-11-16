import fs from "fs";
import path from "path";
import { connectToDatabase } from "@/lib/db";
import {
  SurveySchemaConfig,
  ISurveySchemaConfig,
  IQuestionConfig,
  IWorkgroupConfig,
  ILearningTopic,
  IRoleConfig,
  IDifficultyConfig,
  ILearningFormatConfig,
} from "@/models/SurveySchemaConfig";
import {
  QuestionConfigInput,
  WorkgroupInput,
  LearningTopicInput,
  RoleInput,
  DifficultyInput,
  LearningFormatInput,
  CreateVersionInput,
  UpdateSchemaMetaInput,
} from "@/lib/validations/survey-schema-admin.schema";

export const DEFAULT_14_QUESTIONS: IQuestionConfig[] = [
  {
    id: "Q01",
    order: 1,
    section: "PART_I",
    title: "Tỉnh/Thành phố và Xã/Phường",
    description: "Địa bàn hành chính nơi cán bộ đang công tác",
    instruction: "Mã tỉnh được cố định theo đường link; chọn xã/phường từ danh mục địa bàn",
    isRequired: true,
  },
  {
    id: "Q02",
    order: 2,
    section: "PART_I",
    title: "Cơ quan, đơn vị công tác cấp xã",
    description: "11 cơ quan, ban ngành, đoàn thể, trạm y tế, trường học cấp xã",
    instruction: "Chọn 1 cơ quan công tác chính",
    isRequired: true,
  },
  {
    id: "Q03",
    order: 3,
    section: "PART_I",
    title: "Vị trí việc làm chính hiện nay",
    description: "Vị trí được phân công chính (chọn Khác nếu chưa có trong danh mục)",
    instruction: "Chọn 1 vị trí việc làm và ghi rõ nếu thuộc mục Khác",
    isRequired: true,
  },
  {
    id: "Q04",
    order: 4,
    section: "PART_I",
    title: "Tư cách thực hiện nhiệm vụ",
    description: "Cán bộ, Công chức, Viên chức, Đại biểu HĐND, Người hoạt động không chuyên trách, Người lao động",
    instruction: "Có thể chọn nhiều tư cách nếu kiêm nhiệm; ghi rõ nếu thuộc tư cách Khác",
    isRequired: true,
    maxSelect: 5,
  },
  {
    id: "Q05",
    order: 5,
    section: "PART_I",
    title: "Số năm kinh nghiệm trong lĩnh vực",
    description: "Thời gian tham gia quản lý, sử dụng tài chính, tài sản công",
    instruction: "Chọn 1 khoảng thời gian: Dưới 1 năm, Từ 1-3 năm, Trên 3 năm",
    isRequired: true,
  },
  {
    id: "Q06",
    order: 6,
    section: "PART_II",
    title: "Xác định các nhóm công việc được phân công",
    description: "Đánh giá tình trạng thực hiện đối với từng nhóm công việc trong danh mục",
    instruction: "Chọn 1 trong 4 trạng thái cho từng nhóm: Đang thực hiện, Chưa có dịp, Chỉ phối hợp, Không được giao",
    isRequired: true,
  },
  {
    id: "Q07",
    order: 7,
    section: "PART_II",
    title: "Nhóm công việc khác ngoài danh mục (nếu có)",
    description: "Khai báo bổ sung các công việc về tài chính, tài sản công chưa được liệt kê",
    instruction: "Ghi tự do tối đa 500 ký tự (không bắt buộc)",
    isRequired: false,
  },
  {
    id: "Q08",
    order: 8,
    section: "PART_III",
    title: "Vai trò đảm nhận trong nhóm công việc",
    description: "Trực tiếp thực hiện, Tham mưu, Kiểm tra/giám sát, Quyết định/phê duyệt",
    instruction: "Chọn các vai trò thực tế đảm nhận (ít nhất 1 vai trò)",
    isRequired: true,
    maxSelect: 4,
  },
  {
    id: "Q09",
    order: 9,
    section: "PART_III",
    title: "Tự đánh giá mức độ đáp ứng năng lực",
    description: "Thang điểm 4 mức (1: Chưa đáp ứng, 2: Đáp ứng một phần, 3: Cơ bản đáp ứng, 4: Đáp ứng tốt)",
    instruction: "Đánh giá theo từng vai trò đã chọn ở Câu 8 theo tiêu chí định lượng tương ứng",
    isRequired: true,
  },
  {
    id: "Q10",
    order: 10,
    section: "PART_III",
    title: "Khó khăn, vướng mắc lớn nhất khi thực hiện",
    description: "6 nhóm nguyên nhân về quy định, khối lượng việc, phối hợp, ứng dụng CNTT, tài liệu...",
    instruction: "Chọn tối đa 2 khó khăn hoặc chọn mục độc quyền 'Không gặp khó khăn đáng kể'",
    isRequired: true,
    maxSelect: 2,
    isExclusiveSupported: true,
  },
  {
    id: "Q11",
    order: 11,
    section: "PART_III",
    title: "Nội dung, chuyên đề đào tạo cần bồi dưỡng",
    description: "Ngân hàng các chuyên đề đào tạo theo nhóm công việc",
    instruction: "Chọn các chuyên đề mong muốn được tập huấn (nếu có)",
    isRequired: false,
  },
  {
    id: "Q12",
    order: 12,
    section: "PART_III",
    title: "Mức độ cần thiết bồi dưỡng năng lực",
    description: "Thời hạn và mức độ ưu tiên tham gia đào tạo",
    instruction: "Cần học ngay (trong 6 tháng), Cần học trong năm, hoặc Có thể học sau một năm",
    isRequired: false,
  },
  {
    id: "Q13",
    order: 13,
    section: "PART_IV",
    title: "Hình thức bồi dưỡng phù hợp nhất",
    description: "Lớp tập trung ngắn ngày, Trực tuyến, Kết hợp, Hướng dẫn tại chỗ, Sổ tay tự học",
    instruction: "Chọn tối đa 2 hình thức bồi dưỡng ưu tiên",
    isRequired: true,
    maxSelect: 2,
  },
  {
    id: "Q14",
    order: 14,
    section: "PART_IV",
    title: "Ý kiến đóng góp, đề xuất khác",
    description: "Góp ý về chương trình đào tạo, tài liệu và phương thức tổ chức",
    instruction: "Ghi tự do tối đa 500 ký tự (không bắt buộc)",
    isRequired: false,
  },
];

// Fallback in-memory cache for test runner or when MongoDB is connecting
let inMemorySchemas: Map<string, any> = new Map();

export class SurveyQuestionsAdminService {
  /**
   * Helper: Read fallback local JSON
   */
  private static getLocalSeedSchema(version: string = "3.3"): any {
    const filePath = path.join(process.cwd(), `src/data/seed-schema-${version}.json`);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      return {
        ...data,
        questions: DEFAULT_14_QUESTIONS,
      };
    }
    return null;
  }

  /**
   * 1. Get all schema versions overview
   */
  public static async getVersionsOverview(): Promise<
    Array<{
      version: string;
      title: string;
      description?: string;
      isApproved: boolean;
      approvedAt?: string;
      approvedBy?: string;
      totalWorkgroups: number;
      totalTopics: number;
      totalQuestions: number;
      updatedAt?: string;
    }>
  > {
    try {
      await connectToDatabase();
      const docs = await SurveySchemaConfig.find().sort({ version: -1 }).lean();

      if (docs && docs.length > 0) {
        return docs.map((doc: any) => {
          const workgroups = doc.workgroups || [];
          const totalTopics = workgroups.reduce(
            (acc: number, wg: any) => acc + (wg.learningTopics?.length || 0),
            0
          );
          const totalQuestions = doc.questions?.length || DEFAULT_14_QUESTIONS.length;

          return {
            version: doc.version,
            title: doc.title || `Bộ phiếu khảo sát chuẩn phiên bản ${doc.version}`,
            description: doc.description,
            isApproved: !!doc.isApproved,
            approvedAt: doc.approvedAt ? new Date(doc.approvedAt).toISOString() : undefined,
            approvedBy: doc.approvedBy,
            totalWorkgroups: workgroups.length,
            totalTopics,
            totalQuestions,
            updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : undefined,
          };
        });
      }
    } catch (_) {
      // In-memory or fallback
    }

    // Fallback: check inMemorySchemas or seed
    if (inMemorySchemas.size > 0) {
      return Array.from(inMemorySchemas.values()).map((doc) => {
        const workgroups = doc.workgroups || [];
        const totalTopics = workgroups.reduce(
          (acc: number, wg: any) => acc + (wg.learningTopics?.length || 0),
          0
        );
        return {
          version: doc.version,
          title: doc.title || `Bộ phiếu khảo sát chuẩn phiên bản ${doc.version}`,
          description: doc.description,
          isApproved: !!doc.isApproved,
          approvedAt: doc.approvedAt ? new Date(doc.approvedAt).toISOString() : undefined,
          approvedBy: doc.approvedBy,
          totalWorkgroups: workgroups.length,
          totalTopics,
          totalQuestions: doc.questions?.length || DEFAULT_14_QUESTIONS.length,
          updatedAt: new Date().toISOString(),
        };
      });
    }

    const local33 = this.getLocalSeedSchema("3.3");
    if (local33) {
      const workgroups = local33.workgroups || [];
      const totalTopics = workgroups.reduce(
        (acc: number, wg: any) => acc + (wg.learningTopics?.length || 0),
        0
      );
      return [
        {
          version: local33.version || "3.3",
          title: local33.title || "Bộ phiếu khảo sát nhu cầu bồi dưỡng năng lực cấp xã",
          description: local33.description,
          isApproved: true,
          approvedAt: "2026-11-14T00:00:00.000Z",
          approvedBy: "Trường Đào tạo và Bồi dưỡng nghiệp vụ kiểm toán",
          totalWorkgroups: workgroups.length,
          totalTopics,
          totalQuestions: DEFAULT_14_QUESTIONS.length,
          updatedAt: new Date().toISOString(),
        },
      ];
    }

    return [];
  }

  /**
   * 2. Get detailed schema configuration by version
   */
  public static async getSchemaByVersion(version: string): Promise<any> {
    try {
      await connectToDatabase();
      let doc = await SurveySchemaConfig.findOne({ version }).lean();

      if (doc) {
        // Ensure questions array is populated
        if (!doc.questions || doc.questions.length === 0) {
          doc.questions = DEFAULT_14_QUESTIONS;
        }
        return doc;
      }
    } catch (_) {
      // In-memory or fallback
    }

    if (inMemorySchemas.has(version)) {
      const memDoc = inMemorySchemas.get(version);
      if (!memDoc.questions || memDoc.questions.length === 0) {
        memDoc.questions = DEFAULT_14_QUESTIONS;
      }
      return memDoc;
    }

    // Try local JSON
    const local = this.getLocalSeedSchema(version);
    if (local) {
      inMemorySchemas.set(version, local);
      return local;
    }

    // If 3.3, try default
    if (version === "3.3") {
      const local33 = this.getLocalSeedSchema("3.3");
      if (local33) return local33;
    }

    return null;
  }

  /**
   * 3. Create or Clone a new Version
   */
  public static async createOrCloneVersion(input: CreateVersionInput): Promise<any> {
    const { newVersion, sourceVersion, title, description, approvedBy } = input;

    // Check if newVersion already exists
    const existing = await this.getSchemaByVersion(newVersion);
    if (existing) {
      throw new Error(`Phiên bản '${newVersion}' đã tồn tại trong hệ thống.`);
    }

    // Load source schema to clone from
    const sourceVer = sourceVersion || "3.3";
    const sourceSchema = await this.getSchemaByVersion(sourceVer);

    if (!sourceSchema) {
      throw new Error(`Không tìm thấy phiên bản nguồn '${sourceVer}' để sao chép.`);
    }

    const newSchemaData = {
      version: newVersion,
      title: title || `Bộ phiếu khảo sát chuẩn phiên bản ${newVersion}`,
      description: description || `Nhân bản từ phiên bản ${sourceVer}`,
      isApproved: false,
      approvedAt: undefined,
      approvedBy: approvedBy || undefined,
      workgroups: JSON.parse(JSON.stringify(sourceSchema.workgroups || [])),
      roles: JSON.parse(JSON.stringify(sourceSchema.roles || [])),
      difficulties: JSON.parse(JSON.stringify(sourceSchema.difficulties || [])),
      learningFormats: JSON.parse(JSON.stringify(sourceSchema.learningFormats || [])),
      questions: JSON.parse(JSON.stringify(sourceSchema.questions || DEFAULT_14_QUESTIONS)),
    };

    try {
      await connectToDatabase();
      const created = await SurveySchemaConfig.create(newSchemaData);
      return created.toObject();
    } catch (_) {
      inMemorySchemas.set(newVersion, newSchemaData);
      return newSchemaData;
    }
  }

  /**
   * 4. Update Schema Metadata (Title, Description, Approval Status)
   */
  public static async updateSchemaMeta(
    version: string,
    input: UpdateSchemaMetaInput
  ): Promise<any> {
    const updatePayload: any = {};
    if (input.title !== undefined) updatePayload.title = input.title;
    if (input.description !== undefined) updatePayload.description = input.description;
    if (input.isApproved !== undefined) {
      updatePayload.isApproved = input.isApproved;
      if (input.isApproved) {
        updatePayload.approvedAt = input.approvedAt ? new Date(input.approvedAt) : new Date();
        if (input.approvedBy) updatePayload.approvedBy = input.approvedBy;
      } else {
        updatePayload.approvedAt = null;
        updatePayload.approvedBy = null;
      }
    }

    try {
      await connectToDatabase();
      const updated = await SurveySchemaConfig.findOneAndUpdate(
        { version },
        { $set: updatePayload },
        { new: true }
      ).lean();

      if (updated) return updated;
    } catch (_) {}

    if (inMemorySchemas.has(version)) {
      const doc = inMemorySchemas.get(version);
      Object.assign(doc, updatePayload);
      inMemorySchemas.set(version, doc);
      return doc;
    }

    throw new Error(`Không tìm thấy phiên bản ${version} để cập nhật.`);
  }

  /**
   * 5. Save Full Schema (Bulk Save)
   */
  public static async saveFullSchema(version: string, data: Partial<ISurveySchemaConfig>): Promise<any> {
    const payload: any = { ...data };
    delete payload._id;
    delete payload.createdAt;
    delete payload.updatedAt;

    try {
      await connectToDatabase();
      const doc = await SurveySchemaConfig.findOneAndUpdate(
        { version },
        { $set: payload },
        { new: true, upsert: true }
      ).lean();
      return doc;
    } catch (_) {
      const current = inMemorySchemas.get(version) || {};
      const merged = { ...current, ...payload, version };
      inMemorySchemas.set(version, merged);
      return merged;
    }
  }

  /**
   * 6. Workgroup Management
   */
  public static async addWorkgroup(version: string, wg: WorkgroupInput): Promise<any> {
    const schema = await this.getSchemaByVersion(version);
    if (!schema) throw new Error(`Không tìm thấy phiên bản ${version}`);

    const workgroups: IWorkgroupConfig[] = schema.workgroups || [];
    if (workgroups.some((w) => w.id === wg.id)) {
      throw new Error(`Mã nhóm công việc '${wg.id}' đã tồn tại trong phiên bản ${version}.`);
    }

    const newWg: IWorkgroupConfig = {
      id: wg.id.trim().toUpperCase(),
      order: wg.order || workgroups.length + 1,
      title: wg.title.trim(),
      description: wg.description || "",
      learningTopics: (wg.learningTopics || []).map((t) => ({
        topicId: t.topicId.trim(),
        topicTitle: t.topicTitle.trim(),
      })),
    };

    workgroups.push(newWg);
    workgroups.sort((a, b) => a.order - b.order);

    return await this.saveFullSchema(version, { workgroups });
  }

  public static async updateWorkgroup(
    version: string,
    workgroupId: string,
    wg: Partial<WorkgroupInput>
  ): Promise<any> {
    const schema = await this.getSchemaByVersion(version);
    if (!schema) throw new Error(`Không tìm thấy phiên bản ${version}`);

    const workgroups: IWorkgroupConfig[] = schema.workgroups || [];
    const targetIdx = workgroups.findIndex((w) => w.id === workgroupId);
    if (targetIdx === -1) {
      throw new Error(`Không tìm thấy nhóm công việc '${workgroupId}'.`);
    }

    if (wg.title !== undefined) workgroups[targetIdx].title = wg.title.trim();
    if (wg.description !== undefined) workgroups[targetIdx].description = wg.description.trim();
    if (wg.order !== undefined) workgroups[targetIdx].order = wg.order;
    if (wg.learningTopics !== undefined) {
      workgroups[targetIdx].learningTopics = wg.learningTopics.map((t) => ({
        topicId: t.topicId.trim(),
        topicTitle: t.topicTitle.trim(),
      }));
    }

    workgroups.sort((a, b) => a.order - b.order);
    return await this.saveFullSchema(version, { workgroups });
  }

  public static async deleteWorkgroup(version: string, workgroupId: string): Promise<any> {
    const schema = await this.getSchemaByVersion(version);
    if (!schema) throw new Error(`Không tìm thấy phiên bản ${version}`);

    let workgroups: IWorkgroupConfig[] = schema.workgroups || [];
    const initialLen = workgroups.length;
    workgroups = workgroups.filter((w) => w.id !== workgroupId);

    if (workgroups.length === initialLen) {
      throw new Error(`Không tìm thấy nhóm công việc '${workgroupId}' để xóa.`);
    }

    // Re-index orders
    workgroups.forEach((w, idx) => {
      w.order = idx + 1;
    });

    return await this.saveFullSchema(version, { workgroups });
  }

  public static async reorderWorkgroups(version: string, orderedIds: string[]): Promise<any> {
    const schema = await this.getSchemaByVersion(version);
    if (!schema) throw new Error(`Không tìm thấy phiên bản ${version}`);

    const workgroups: IWorkgroupConfig[] = schema.workgroups || [];
    const idToWgMap = new Map(workgroups.map((w) => [w.id, w]));

    const reordered: IWorkgroupConfig[] = [];
    orderedIds.forEach((id, idx) => {
      const wg = idToWgMap.get(id);
      if (wg) {
        wg.order = idx + 1;
        reordered.push(wg);
        idToWgMap.delete(id);
      }
    });

    // Append any unmentioned workgroups
    idToWgMap.forEach((wg) => {
      wg.order = reordered.length + 1;
      reordered.push(wg);
    });

    return await this.saveFullSchema(version, { workgroups: reordered });
  }

  /**
   * 7. Learning Topic Management
   */
  public static async addTopic(
    version: string,
    workgroupId: string,
    topic: LearningTopicInput
  ): Promise<any> {
    const schema = await this.getSchemaByVersion(version);
    if (!schema) throw new Error(`Không tìm thấy phiên bản ${version}`);

    const workgroups: IWorkgroupConfig[] = schema.workgroups || [];
    const wg = workgroups.find((w) => w.id === workgroupId);
    if (!wg) throw new Error(`Không tìm thấy nhóm công việc '${workgroupId}'.`);

    wg.learningTopics = wg.learningTopics || [];
    if (wg.learningTopics.some((t) => t.topicId === topic.topicId)) {
      throw new Error(`Mã chuyên đề '${topic.topicId}' đã tồn tại trong nhóm '${workgroupId}'.`);
    }

    wg.learningTopics.push({
      topicId: topic.topicId.trim(),
      topicTitle: topic.topicTitle.trim(),
    });

    return await this.saveFullSchema(version, { workgroups });
  }

  public static async updateTopic(
    version: string,
    workgroupId: string,
    topicId: string,
    topic: Partial<LearningTopicInput>
  ): Promise<any> {
    const schema = await this.getSchemaByVersion(version);
    if (!schema) throw new Error(`Không tìm thấy phiên bản ${version}`);

    const workgroups: IWorkgroupConfig[] = schema.workgroups || [];
    const wg = workgroups.find((w) => w.id === workgroupId);
    if (!wg) throw new Error(`Không tìm thấy nhóm công việc '${workgroupId}'.`);

    const tIdx = (wg.learningTopics || []).findIndex((t) => t.topicId === topicId);
    if (tIdx === -1) {
      throw new Error(`Không tìm thấy chuyên đề '${topicId}' trong nhóm '${workgroupId}'.`);
    }

    if (topic.topicTitle !== undefined) {
      wg.learningTopics[tIdx].topicTitle = topic.topicTitle.trim();
    }

    return await this.saveFullSchema(version, { workgroups });
  }

  public static async deleteTopic(
    version: string,
    workgroupId: string,
    topicId: string
  ): Promise<any> {
    const schema = await this.getSchemaByVersion(version);
    if (!schema) throw new Error(`Không tìm thấy phiên bản ${version}`);

    const workgroups: IWorkgroupConfig[] = schema.workgroups || [];
    const wg = workgroups.find((w) => w.id === workgroupId);
    if (!wg) throw new Error(`Không tìm thấy nhóm công việc '${workgroupId}'.`);

    const initialLen = (wg.learningTopics || []).length;
    wg.learningTopics = (wg.learningTopics || []).filter((t) => t.topicId !== topicId);

    if (wg.learningTopics.length === initialLen) {
      throw new Error(`Không tìm thấy chuyên đề '${topicId}' để xóa.`);
    }

    return await this.saveFullSchema(version, { workgroups });
  }

  /**
   * 8. Roles & Level Descriptions Management
   */
  public static async updateRoles(version: string, roles: RoleInput[]): Promise<any> {
    const schema = await this.getSchemaByVersion(version);
    if (!schema) throw new Error(`Không tìm thấy phiên bản ${version}`);

    const formattedRoles: IRoleConfig[] = roles.map((r) => ({
      roleId: r.roleId,
      title: r.title.trim(),
      description: r.description?.trim() || "",
      levelDescriptions: {
        "1": r.levelDescriptions["1"].trim(),
        "2": r.levelDescriptions["2"].trim(),
        "3": r.levelDescriptions["3"].trim(),
        "4": r.levelDescriptions["4"].trim(),
      },
    }));

    return await this.saveFullSchema(version, { roles: formattedRoles });
  }

  /**
   * 9. Difficulties Management
   */
  public static async updateDifficulties(
    version: string,
    difficulties: DifficultyInput[]
  ): Promise<any> {
    const schema = await this.getSchemaByVersion(version);
    if (!schema) throw new Error(`Không tìm thấy phiên bản ${version}`);

    const formatted: IDifficultyConfig[] = difficulties.map((d) => ({
      id: d.id.trim(),
      title: d.title.trim(),
      isExclusive: !!d.isExclusive,
    }));

    return await this.saveFullSchema(version, { difficulties: formatted });
  }

  /**
   * 10. Learning Formats Management
   */
  public static async updateLearningFormats(
    version: string,
    formats: LearningFormatInput[]
  ): Promise<any> {
    const schema = await this.getSchemaByVersion(version);
    if (!schema) throw new Error(`Không tìm thấy phiên bản ${version}`);

    const formatted: ILearningFormatConfig[] = formats.map((f) => ({
      id: f.id.trim(),
      title: f.title.trim(),
    }));

    return await this.saveFullSchema(version, { learningFormats: formatted });
  }

  /**
   * 11. Questions Structure (14 Questions) Management
   */
  public static async updateQuestions(
    version: string,
    questions: (QuestionConfigInput | IQuestionConfig)[]
  ): Promise<any> {
    const schema = await this.getSchemaByVersion(version);
    if (!schema) throw new Error(`Không tìm thấy phiên bản ${version}`);

    const formatted: IQuestionConfig[] = questions.map((q) => ({
      id: q.id.trim(),
      order: q.order,
      section: q.section,
      title: q.title.trim(),
      description: q.description?.trim() || "",
      instruction: q.instruction?.trim() || "",
      isRequired: q.isRequired ?? true,
      maxSelect: q.maxSelect,
      isExclusiveSupported: !!q.isExclusiveSupported,
    }));

    formatted.sort((a, b) => a.order - b.order);

    return await this.saveFullSchema(version, { questions: formatted });
  }
}
