import { connectToDatabase } from "@/lib/db";
import { TrainingProposal, ITrainingProposal, IProposedTopic } from "@/models/TrainingProposal";
import { AnalyticsAggregationService } from "./analytics-aggregation.service";

export interface GenerateDraftOptions {
  provinceCode: string;
  provinceName: string;
  createdByName: string;
  campaignCode?: string;
}

export class TrainingProposalService {
  /**
   * Tự động sinh Bản thảo Đề xuất Đào tạo 12 Mục chuẩn từ dữ liệu 6 Bảng Tổng hợp
   */
  static async generateDraftFromAnalytics(options: GenerateDraftOptions) {
    await connectToDatabase();

    const provCode = options.provinceCode === "ALL" ? undefined : options.provinceCode;
    const tablesData = await AnalyticsAggregationService.generateAllTables({
      provinceCode: provCode,
    });

    const b1 = tablesData.b1;
    const b2 = tablesData.b2;
    const b3 = tablesData.b3;
    const b4 = tablesData.b4;
    const b5 = tablesData.b5;
    const b6 = tablesData.b6;

    // 1. Phân tích số liệu căn cứ (Mục 2)
    const validCount = b1?.totalIncluded || 0;
    const excludedCount = b1?.totalExcluded || 0;
    const totalCommunes = b1?.communesCount || 0;
    const outOfScopeCount = 0;
    const totalRespondents = validCount + excludedCount;

    // 2. Trích xuất chuyên đề ưu tiên từ B4 (Mục 3)
    const proposedTopics: IProposedTopic[] = [];

    if (b4?.rows && Array.isArray(b4.rows)) {
      for (const row of b4.rows) {
        const urgent6m = row.urgent6mCount || 0;
        const withinYear = row.withinYearCount || 0;
        const totalNeed = (row.totalSelected || 0);

        if (totalNeed > 0) {
          proposedTopics.push({
            workgroupId: row.workgroupId,
            workgroupTitle: row.workgroupTitle,
            topicId: row.topicId,
            topicTitle: row.topicTitle,
            targetAudience: "Cán bộ chuyên trách tài chính - kế toán và địa chính - xây dựng",
            reason: `Có ${totalNeed} cán bộ đề xuất cần học (${urgent6m} người cần bồi dưỡng ngay trong 6 tháng, ${withinYear} người trong 12 tháng).`,
            gapSummary: `Nhóm công việc có khoảng thiếu hụt năng lực cần củng cố kiến thức theo kết quả tự đánh giá Bảng B3.`,
            suggestedDuration: urgent6m >= 5 ? "3 ngày (Tập trung hoặc Trực tuyến)" : "2 ngày (Chuyên đề chuyên sâu)",
          });
        }
      }
    }

    // Sắp xếp lấy tối đa 8 chuyên đề cấp thiết nhất
    proposedTopics.sort((a, b) => b.workgroupId - a.workgroupId);
    const topProposedTopics = proposedTopics.slice(0, 8);

    // 3. Phân tích khoảng thiếu hụt năng lực (Mục 5)
    let gapSummaryText = "";
    if (b3?.rows && Array.isArray(b3.rows)) {
      const highGapRows = b3.rows.filter((r: any) => (r.belowBenchmarkCount || 0) > 0);
      gapSummaryText = `Qua đối soát tự đánh giá với Ma trận chuẩn năng lực (Phần II.B Thuyết minh), toàn địa bàn có ${highGapRows.length} vai trò công việc xuất hiện khoảng thiếu hụt so với chuẩn yêu cầu. Trong đó, các nhóm việc có tỷ lệ cán bộ dưới chuẩn tập trung tại: ${highGapRows.slice(0, 3).map((r: any) => r.workgroupTitle || `Nhóm ${r.workgroupId}`).join(", ")}.`;
    } else {
      gapSummaryText = "Đang tổng hợp số liệu khoảng thiếu hụt năng lực theo ma trận chuẩn.";
    }

    // 4. Hình thức đào tạo đề xuất từ B6 (Mục 6)
    const suggestedFormats: string[] = [];
    if (b6?.rows && Array.isArray(b6.rows)) {
      b6.rows.forEach((r: any) => {
        if (r.count > 0) {
          suggestedFormats.push(`${r.formatTitle} (${r.count} người chọn - ${r.percentage?.toFixed(1)}%)`);
        }
      });
    }
    if (suggestedFormats.length === 0) {
      suggestedFormats.push("Bồi dưỡng tập trung kết hợp e-learning trực tuyến");
    }

    // 5. Khó khăn ngoài đào tạo từ B5 (Mục 10)
    let institutionalText = "";
    if (b5?.rows && Array.isArray(b5.rows)) {
      const nonTrainingDiffs = b5.rows.filter((r: any) => r.category === "NGOAI_DAO_TAO" && r.count > 0);
      if (nonTrainingDiffs.length > 0) {
        institutionalText = nonTrainingDiffs
          .slice(0, 6)
          .map((d: any) => `• ${d.difficultyTitle} (${d.workgroupTitle}): Có ${d.count} lượt cán bộ phản ánh vướng mắc.`)
          .join("\n");
      } else {
        institutionalText = "Không có phản ánh vướng mắc thể chế đặc biệt ngoài đào tạo.";
      }
    }

    // 6. Nhóm chưa có dịp thực hiện (Mục 8)
    let noChanceSummary = "";
    if (b2?.rows && Array.isArray(b2.rows)) {
      const noChanceCount = b2.rows.reduce((acc: number, r: any) => acc + (r.assignedNotYetCount || 0), 0);
      noChanceSummary = `Có tổng cộng ${noChanceCount} lượt cán bộ được phân công nhưng 'Chưa có dịp thực hiện'. Khuyến nghị thiết kế mô-đun bồi dưỡng chuẩn bị (orientation training) nhằm trang bị kiến thức pháp lý và kỹ năng quy trình trước khi giao việc thực tế.`;
    }

    const todayStr = new Date().toLocaleDateString("vi-VN");

    return {
      provinceCode: options.provinceCode,
      provinceName: options.provinceName,
      campaignCode: options.campaignCode || "DOT-1-2026",
      schemaVersion: "3.3",
      title: `Bản Đề xuất Đào tạo Nhu cầu Bồi dưỡng Cấp Xã - ${options.provinceName}`,
      proposalDate: new Date().toISOString(),
      status: "DRAFT",

      item1_meta: {
        provinceName: options.provinceName,
        proposalDate: todayStr,
        schemaVersion: "3.3",
      },
      item2_dataBasis: {
        totalRespondents,
        totalCommunes,
        validCount,
        excludedCount,
        outOfScopeCount,
      },
      item3_proposedTopics: topProposedTopics,
      item4_selectionReasons: `Căn cứ tỷ lệ cán bộ tự đánh giá ở Mức 1 (chưa nắm vững) và Mức 2 (nắm cơ bản nhưng cần hướng dẫn) tại Bảng B3, kết hợp với ${validCount} phiếu hợp lệ đề xuất nhu cầu bồi dưỡng cấp bách. Các chuyên đề được chọn có tỷ lệ yêu cầu bồi dưỡng ngay trong 6 tháng và 12 tháng cao nhất trên địa bàn.`,
      item5_capacityGapAnalysis: gapSummaryText,
      item6_suggestedFormats: suggestedFormats,
      item7_timingAndDuration: "Tổ chức thành 2 đợt trong Quý II và Quý III năm 2026. Mỗi chuyên đề 2 - 3 ngày. Khung giờ cuối tuần hoặc các buổi trực tuyến linh hoạt tránh trùng lịch công tác cao điểm của địa phương.",
      item8_noChanceModule: noChanceSummary,
      item9_smallGroupStrategy: "Đối với các chuyên đề có dưới 5 cán bộ có nhu cầu trên phạm vi một huyện/tỉnh, áp dụng hình thức ghép lớp trực tuyến liên tỉnh hoặc xây dựng bài giảng e-learning video tương tác nhằm đảm bảo hiệu quả kinh tế và an toàn dữ liệu thống kê (<5 người).",
      item10_institutionalRecommendations: institutionalText,
      item11_legalDisclaimer:
        "Kết quả khảo sát phản ánh tự đánh giá của cán bộ tại thời điểm khảo sát, chưa qua kiểm chứng bằng trắc nghiệm hoặc sát hạch năng lực độc lập. Không sử dụng kết quả này để xếp loại, đánh giá thi đua cá nhân hoặc xếp hạng các địa phương.",
      item12_approval: {
        createdByName: options.createdByName,
        createdByTitle: "Khoa Cơ sở & Khoa Chuyên ngành",
        approvedByName: "Lãnh đạo Trường ĐT&BD nghiệp vụ kiểm toán",
        approvedByTitle: "Giám đốc Trường",
      },
    };
  }

  /**
   * Lưu Bản Đề xuất Đào tạo mới
   */
  static async createProposal(data: any): Promise<ITrainingProposal> {
    await connectToDatabase();
    return await TrainingProposal.create(data);
  }

  /**
   * Cập nhật Bản Đề xuất Đào tạo
   */
  static async updateProposal(id: string, data: any): Promise<ITrainingProposal> {
    await connectToDatabase();
    const updated = await TrainingProposal.findByIdAndUpdate(id, data, { new: true });
    if (!updated) {
      throw new Error("Không tìm thấy đề xuất đào tạo.");
    }
    return updated;
  }

  /**
   * Lấy danh sách Đề xuất Đào tạo
   */
  static async getProposals(filter: { provinceCode?: string; status?: string } = {}) {
    await connectToDatabase();
    const query: Record<string, any> = {};
    if (filter.provinceCode && filter.provinceCode !== "ALL") {
      query.provinceCode = filter.provinceCode;
    }
    if (filter.status && filter.status !== "ALL") {
      query.status = filter.status;
    }

    return await TrainingProposal.find(query).sort({ updatedAt: -1 }).lean();
  }

  /**
   * Lấy chi tiết Đề xuất Đào tạo
   */
  static async getProposalById(id: string): Promise<any | null> {
    await connectToDatabase();
    return await TrainingProposal.findById(id).lean();
  }

  /**
   * Phê duyệt Đề xuất Đào tạo
   */
  static async approveProposal(id: string, approverName: string): Promise<ITrainingProposal> {
    await connectToDatabase();
    const proposal = await TrainingProposal.findById(id);
    if (!proposal) {
      throw new Error("Không tìm thấy đề xuất đào tạo.");
    }

    proposal.status = "APPROVED";
    proposal.item12_approval.approvedByName = approverName;
    proposal.item12_approval.approvedAt = new Date();
    await proposal.save();

    return proposal;
  }

  /**
   * Xóa Đề xuất Đào tạo
   */
  static async deleteProposal(id: string): Promise<void> {
    await connectToDatabase();
    await TrainingProposal.findByIdAndDelete(id);
  }
}
