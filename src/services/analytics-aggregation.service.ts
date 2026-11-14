import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { SurveyResponse, ISurveyResponse } from "@/models/SurveyResponse";
import { CapacityGapService } from "./capacity-gap.service";
import { ALL_WORKGROUP_IDS, RoleId } from "@/lib/validations/survey.schema";
import fs from "fs";
import path from "path";

export interface AnalyticsFilter {
  campaignId?: string;
  provinceCode?: string;
  agencyCode?: string;
}

export class AnalyticsAggregationService {
  /**
   * Truy vấn các phản hồi hợp lệ cho việc tính toán tổng hợp (Chỉ lấy reviewStatus === 'VALID')
   */
  static async getValidResponses(filter: AnalyticsFilter = {}): Promise<any[]> {
    try {
      await connectToDatabase();
      const query: Record<string, any> = {
        reviewStatus: "VALID",
      };

      if (filter.campaignId) {
        query.campaignId = new Types.ObjectId(filter.campaignId);
      }
      if (filter.provinceCode) {
        query["part1.provinceCode"] = filter.provinceCode;
      }
      if (filter.agencyCode) {
        query["part1.agencyCode"] = filter.agencyCode;
      }

      const records = await SurveyResponse.find(query).lean();
      return records;
    } catch (_) {
      return [];
    }
  }

  /**
   * Truy vấn các phản hồi bị loại (reviewStatus === 'EXCLUDED') để thống kê Bảng B1
   */
  static async getExcludedResponses(filter: AnalyticsFilter = {}): Promise<any[]> {
    try {
      await connectToDatabase();
      const query: Record<string, any> = {
        reviewStatus: "EXCLUDED",
      };

      if (filter.campaignId) {
        query.campaignId = new Types.ObjectId(filter.campaignId);
      }
      if (filter.provinceCode) {
        query["part1.provinceCode"] = filter.provinceCode;
      }

      const records = await SurveyResponse.find(query).lean();
      return records;
    } catch (_) {
      return [];
    }
  }

  /**
   * BẢNG B1: NGƯỜI TRẢ LỜI
   * Phân loại theo Cơ quan/đơn vị, vị trí việc làm và tư cách làm việc
   */
  static async generateTableB1(filter: AnalyticsFilter = {}) {
    const [validResponses, excludedResponses] = await Promise.all([
      this.getValidResponses(filter),
      this.getExcludedResponses(filter),
    ]);

    const totalValid = validResponses.length;
    const totalExcluded = excludedResponses.length;

    // Phân loại lý do loại trừ
    const exclusionReasonsMap = new Map<string, number>();
    for (const r of excludedResponses) {
      const reason = r.exclusionReason || "Gửi lại phiếu / gửi đúp";
      exclusionReasonsMap.set(reason, (exclusionReasonsMap.get(reason) || 0) + 1);
    }

    // Đếm số xã có người trả lời
    const distinctCommunes = new Set(
      validResponses.map((r) => `${r.part1?.provinceCode}_${r.part1?.communeCode}`)
    );

    // Nhóm theo cơ quan & vị trí
    const agencyGroups = new Map<string, { name: string; count: number; outOfScope: number }>();
    const positionGroups = new Map<string, { agencyCode: string; title: string; count: number; outOfScope: number }>();
    const capacityGroups = new Map<string, number>();

    for (const r of validResponses) {
      const p1 = r.part1 || {};
      const agCode = p1.agencyCode || "UNKNOWN";
      const agName = p1.agencyName || agCode;
      const posCode = p1.positionCode || "UNKNOWN";
      const posTitle = p1.positionTitle || posCode;
      const isOut = !!r.isOutOfScope;

      // Agency
      if (!agencyGroups.has(agCode)) {
        agencyGroups.set(agCode, { name: agName, count: 0, outOfScope: 0 });
      }
      const agData = agencyGroups.get(agCode)!;
      agData.count++;
      if (isOut) agData.outOfScope++;

      // Position
      if (!positionGroups.has(posCode)) {
        positionGroups.set(posCode, { agencyCode: agCode, title: posTitle, count: 0, outOfScope: 0 });
      }
      const posData = positionGroups.get(posCode)!;
      posData.count++;
      if (isOut) posData.outOfScope++;

      // Capacities (Question 4)
      if (Array.isArray(p1.capacities)) {
        for (const cap of p1.capacities) {
          capacityGroups.set(cap, (capacityGroups.get(cap) || 0) + 1);
        }
      }
    }

    const agencyRows = Array.from(agencyGroups.entries()).map(([code, d]) => ({
      agencyCode: code,
      agencyName: d.name,
      validCount: d.count,
      outOfScopeCount: d.outOfScope,
    }));

    const positionRows = Array.from(positionGroups.entries()).map(([code, d]) => ({
      positionCode: code,
      positionTitle: d.title,
      agencyCode: d.agencyCode,
      validCount: d.count,
      outOfScopeCount: d.outOfScope,
    }));

    const capacityRows = Array.from(capacityGroups.entries()).map(([cap, count]) => ({
      capacity: cap,
      count,
    }));

    const exclusionReasons = Array.from(exclusionReasonsMap.entries()).map(
      ([reason, count]) => ({ reason, count })
    );

    return {
      title: "Bảng B1. Người trả lời khảo sát",
      totalIncluded: totalValid,
      totalExcluded,
      communesCount: distinctCommunes.size,
      agencyRows,
      positionRows,
      capacityRows,
      exclusionReasons,
    };
  }

  /**
   * BẢNG B2: NHÓM CÔNG VIỆC
   * 16 Nhóm công việc x 4 Trạng thái (Tổng 4 cột = 100%)
   */
  static async generateTableB2(filter: AnalyticsFilter = {}) {
    const validResponses = await this.getValidResponses(filter);
    // Loại trừ người ngoài đối tượng theo quy cách Spec 02 & Spec 12
    const inScopeResponses = validResponses.filter((r) => !r.isOutOfScope);
    const denominator = inScopeResponses.length;

    // Load schema for workgroup titles
    const schemaPath = path.join(process.cwd(), "src/data/seed-schema-3.3.json");
    let schemaWgs: any[] = [];
    if (fs.existsSync(schemaPath)) {
      schemaWgs = JSON.parse(fs.readFileSync(schemaPath, "utf-8")).workgroups || [];
    }

    const rows = ALL_WORKGROUP_IDS.map((wgId) => {
      const def = schemaWgs.find((w: any) => w.id === wgId);
      const title = def?.title || wgId;

      let currentlyDoing = 0;
      let assignedNotYet = 0;
      let coordinatingOnly = 0;
      let notAssigned = 0;

      for (const r of inScopeResponses) {
        const statuses = r.part2?.workgroupStatuses || [];
        const item = statuses.find((s: any) => s.workgroupId === wgId);
        const st = item?.status;

        if (st === "CURRENTLY_DOING") currentlyDoing++;
        else if (st === "ASSIGNED_NOT_YET") assignedNotYet++;
        else if (st === "COORDINATING_ONLY") coordinatingOnly++;
        else notAssigned++;
      }

      const pct = (c: number) =>
        denominator > 0 ? Math.round((c / denominator) * 1000) / 10 : 0;

      return {
        workgroupId: wgId,
        workgroupTitle: title,
        denominator,
        currentlyDoing: { count: currentlyDoing, percentage: pct(currentlyDoing) },
        assignedNotYet: { count: assignedNotYet, percentage: pct(assignedNotYet) },
        coordinatingOnly: { count: coordinatingOnly, percentage: pct(coordinatingOnly) },
        notAssigned: { count: notAssigned, percentage: pct(notAssigned) },
      };
    });

    return {
      title: "Bảng B2. Phân bố cán bộ theo các nhóm công việc",
      denominator,
      rows,
    };
  }

  /**
   * BẢNG B3: KHẢ NĂNG THỰC HIỆN VÀ KHOẢNG THIẾU HỤT NĂNG LỰC
   * Nhóm công việc x 4 Vai trò (Người đang thực hiện) + Dòng người chưa có dịp
   */
  static async generateTableB3(filter: AnalyticsFilter = {}) {
    await CapacityGapService.loadBenchmarkMatrix("3.3");

    const validResponses = await this.getValidResponses(filter);
    const inScopeResponses = validResponses.filter((r) => !r.isOutOfScope);

    // Load schema for workgroup titles
    const schemaPath = path.join(process.cwd(), "src/data/seed-schema-3.3.json");
    let schemaWgs: any[] = [];
    if (fs.existsSync(schemaPath)) {
      schemaWgs = JSON.parse(fs.readFileSync(schemaPath, "utf-8")).workgroups || [];
    }

    const roles: RoleId[] = ["DIRECT", "ADVISORY", "SUPERVISORY", "APPROVAL"];
    const rows: any[] = [];

    for (const wgId of ALL_WORKGROUP_IDS) {
      const def = schemaWgs.find((w: any) => w.id === wgId);
      const title = def?.title || wgId;

      for (const rId of roles) {
        const selfLevels: number[] = [];

        for (const r of inScopeResponses) {
          const p3List = r.part3 || [];
          const wgEval = p3List.find(
            (e: any) => e.workgroupId === wgId && e.status === "CURRENTLY_DOING"
          );
          if (wgEval && Array.isArray(wgEval.evaluations)) {
            const roleEval = wgEval.evaluations.find((ev: any) => ev.roleId === rId);
            if (roleEval && roleEval.selfAssessedLevel) {
              selfLevels.push(roleEval.selfAssessedLevel);
            }
          }
        }

        const rowStats = CapacityGapService.aggregateRowGapStats(
          wgId,
          rId,
          selfLevels,
          "3.3"
        );

        rows.push({
          ...rowStats,
          workgroupTitle: title,
        });
      }

      // Dòng tính riêng cho người chưa có dịp thực hiện nhóm này
      let notYetCount = 0;
      for (const r of inScopeResponses) {
        const p3List = r.part3 || [];
        const wgEval = p3List.find(
          (e: any) => e.workgroupId === wgId && e.status === "ASSIGNED_NOT_YET"
        );
        if (wgEval) notYetCount++;
      }

      rows.push({
        workgroupId: wgId,
        workgroupTitle: title,
        roleId: "ASSIGNED_NOT_YET",
        isAssignedNotYetRow: true,
        denominator: notYetCount,
        hasBenchmark: false,
        requiredLevel: null,
        rationale: "Người được giao nhưng chưa có dịp thực hiện tính riêng",
      });
    }

    return {
      title: "Bảng B3. Khả năng thực hiện công việc và Khoảng thiếu hụt năng lực",
      subtitle:
        "khoảng thiếu hụt theo tự đánh giá - không đồng nhất với năng lực thực tế đã được kiểm chứng",
      rows,
    };
  }

  /**
   * BẢNG B4: NỘI DUNG CẦN HỌC
   * Nhóm công việc x Nội dung học x Mức độ cần học
   */
  static async generateTableB4(filter: AnalyticsFilter = {}) {
    const validResponses = await this.getValidResponses(filter);
    const inScopeResponses = validResponses.filter((r) => !r.isOutOfScope);

    const schemaPath = path.join(process.cwd(), "src/data/seed-schema-3.3.json");
    let schemaWgs: any[] = [];
    if (fs.existsSync(schemaPath)) {
      schemaWgs = JSON.parse(fs.readFileSync(schemaPath, "utf-8")).workgroups || [];
    }

    const rows: any[] = [];

    for (const wg of schemaWgs) {
      for (const topic of wg.learningTopics || []) {
        let currentlyDoingCount = 0;
        let assignedNotYetCount = 0;
        let urgent6mCount = 0;
        let withinYearCount = 0;
        let after1yCount = 0;

        for (const r of inScopeResponses) {
          const p3List = r.part3 || [];
          const wgEval = p3List.find((e: any) => e.workgroupId === wg.id);
          if (
            wgEval &&
            Array.isArray(wgEval.selectedTopics) &&
            wgEval.selectedTopics.includes(topic.topicId)
          ) {
            if (wgEval.status === "CURRENTLY_DOING") currentlyDoingCount++;
            else if (wgEval.status === "ASSIGNED_NOT_YET") assignedNotYetCount++;

            if (wgEval.urgencyLevel === "IMMEDIATE_6M") urgent6mCount++;
            else if (wgEval.urgencyLevel === "WITHIN_YEAR") withinYearCount++;
            else if (wgEval.urgencyLevel === "AFTER_1Y") after1yCount++;
          }
        }

        const totalSelected = currentlyDoingCount + assignedNotYetCount;

        rows.push({
          workgroupId: wg.id,
          workgroupTitle: wg.title,
          topicId: topic.topicId,
          topicTitle: topic.topicTitle,
          totalSelected,
          currentlyDoingCount,
          assignedNotYetCount,
          urgent6mCount,
          withinYearCount,
          after1yCount,
        });
      }
    }

    return {
      title: "Bảng B4. Nhu cầu đào tạo, bồi dưỡng theo các chuyên đề cụ thể",
      rows,
    };
  }

  /**
   * BẢNG B5: KHÓ KHĂN
   * Nhóm công việc x 6 Loại khó khăn & Không khó khăn
   */
  static async generateTableB5(filter: AnalyticsFilter = {}) {
    const validResponses = await this.getValidResponses(filter);
    const inScopeResponses = validResponses.filter((r) => !r.isOutOfScope);

    const schemaPath = path.join(process.cwd(), "src/data/seed-schema-3.3.json");
    let schemaData: any = { workgroups: [], difficulties: [] };
    if (fs.existsSync(schemaPath)) {
      schemaData = JSON.parse(fs.readFileSync(schemaPath, "utf-8"));
    }

    const rows: any[] = [];

    for (const wg of schemaData.workgroups || []) {
      // Số người đang thực hiện của nhóm
      let doingDenominator = 0;
      for (const r of inScopeResponses) {
        const p3List = r.part3 || [];
        const wgEval = p3List.find(
          (e: any) => e.workgroupId === wg.id && e.status === "CURRENTLY_DOING"
        );
        if (wgEval) doingDenominator++;
      }

      for (const diff of schemaData.difficulties || []) {
        let count = 0;
        for (const r of inScopeResponses) {
          const p3List = r.part3 || [];
          const wgEval = p3List.find(
            (e: any) => e.workgroupId === wg.id && e.status === "CURRENTLY_DOING"
          );
          if (
            wgEval &&
            Array.isArray(wgEval.difficulties) &&
            wgEval.difficulties.includes(diff.id)
          ) {
            count++;
          }
        }

        const percentage =
          doingDenominator > 0
            ? Math.round((count / doingDenominator) * 1000) / 10
            : 0;

        rows.push({
          workgroupId: wg.id,
          workgroupTitle: wg.title,
          difficultyId: diff.id,
          difficultyTitle: diff.title,
          category: diff.category || "NGOAI_DAO_TAO",
          doingDenominator,
          count,
          percentage,
        });
      }
    }

    return {
      title: "Bảng B5. Khó khăn chính gặp phải trong các nhóm công việc",
      rows,
    };
  }

  /**
   * BẢNG B6: HÌNH THỨC HỌC VÀ GIỚI HẠN DỮ LIỆU
   * 5 Hình thức học x Số người chọn và %
   */
  static async generateTableB6(filter: AnalyticsFilter = {}) {
    const validResponses = await this.getValidResponses(filter);
    const inScopeResponses = validResponses.filter((r) => !r.isOutOfScope);
    const denominator = inScopeResponses.length;

    const schemaPath = path.join(process.cwd(), "src/data/seed-schema-3.3.json");
    let formats: any[] = [];
    if (fs.existsSync(schemaPath)) {
      formats = JSON.parse(fs.readFileSync(schemaPath, "utf-8")).learningFormats || [];
    }

    const rows = formats.map((fmt) => {
      let count = 0;
      for (const r of inScopeResponses) {
        const prefs = r.part4?.preferredFormats || [];
        if (prefs.includes(fmt.id)) {
          count++;
        }
      }

      const percentage =
        denominator > 0 ? Math.round((count / denominator) * 1000) / 10 : 0;

      return {
        formatId: fmt.id,
        formatTitle: fmt.title,
        denominator,
        count,
        percentage,
      };
    });

    return {
      title: "Bảng B6. Hình thức học tập phù hợp và Giới hạn dữ liệu",
      denominator,
      rows,
      limitations: [
        "Kết quả khảo sát phản ánh năng lực và nhu cầu theo tự đánh giá của cán bộ ở cấp xã.",
        "Ma trận mức yêu cầu (Benchmark) được áp dụng thống nhất theo Bộ đặc tả 3.3 đã được Lãnh đạo Kiểm toán nhà nước phê duyệt.",
      ],
    };
  }

  /**
   * TỔNG HỢP TRỌN BỘ 6 BẢNG (B1 ĐẾN B6)
   */
  static async generateAllTables(filter: AnalyticsFilter = {}) {
    const [b1, b2, b3, b4, b5, b6] = await Promise.all([
      this.generateTableB1(filter),
      this.generateTableB2(filter),
      this.generateTableB3(filter),
      this.generateTableB4(filter),
      this.generateTableB5(filter),
      this.generateTableB6(filter),
    ]);

    return {
      schemaVersion: "3.3",
      generatedAt: new Date(),
      filter,
      b1,
      b2,
      b3,
      b4,
      b5,
      b6,
    };
  }
}
