import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { SurveyResponse, ISurveyResponse, ReviewStatus } from "@/models/SurveyResponse";
import { AuditLog } from "@/models/AuditLog";

export interface DuplicateGroupItem {
  duplicateGroupId: string;
  businessHash: string;
  count: number;
  provinceCode: string;
  provinceName: string;
  communeCode: string;
  communeName: string;
  agencyCode: string;
  agencyName: string;
  positionCode: string;
  positionTitle: string;
  responses: Array<{
    _id: string;
    submittedAt: Date;
    reviewStatus: ReviewStatus;
    exclusionReason?: string | null;
    isOutOfScope: boolean;
    part1: any;
    part2: any;
    part3: any[];
    part4: any;
  }>;
}

export interface ReviewFilter {
  campaignId?: string;
  provinceCode?: string;
  reviewStatus?: ReviewStatus | "ALL";
}

export class DuplicateDetectionService {
  /**
   * Truy vấn các nhóm phản hồi bị nghi trùng theo businessHash
   */
  static async getDuplicateGroups(
    filter: ReviewFilter = {}
  ): Promise<DuplicateGroupItem[]> {
    await connectToDatabase();

    const matchQuery: Record<string, any> = {
      isSuspectedDuplicate: true,
    };

    if (filter.campaignId) {
      matchQuery.campaignId = new Types.ObjectId(filter.campaignId);
    }
    if (filter.provinceCode) {
      matchQuery["part1.provinceCode"] = filter.provinceCode;
    }
    if (filter.reviewStatus && filter.reviewStatus !== "ALL") {
      matchQuery.reviewStatus = filter.reviewStatus;
    }

    // Lấy tất cả các phản hồi nghi trùng
    const responses = await SurveyResponse.find(matchQuery)
      .sort({ submittedAt: 1 })
      .lean();

    // Nhóm theo businessHash
    const groupMap = new Map<string, any[]>();
    for (const r of responses) {
      const hash = r.businessHash;
      if (!groupMap.has(hash)) {
        groupMap.set(hash, []);
      }
      groupMap.get(hash)!.push(r);
    }

    const result: DuplicateGroupItem[] = [];

    for (const [hash, resList] of groupMap.entries()) {
      const first = resList[0];
      const gId = first.duplicateGroupId || first._id.toString();

      result.push({
        duplicateGroupId: gId,
        businessHash: hash,
        count: resList.length,
        provinceCode: first.part1?.provinceCode || "",
        provinceName: first.part1?.provinceName || "",
        communeCode: first.part1?.communeCode || "",
        communeName: first.part1?.communeName || "",
        agencyCode: first.part1?.agencyCode || "",
        agencyName: first.part1?.agencyName || "",
        positionCode: first.part1?.positionCode || "",
        positionTitle: first.part1?.positionTitle || "",
        responses: resList.map((r: any) => ({
          _id: r._id.toString(),
          submittedAt: r.submittedAt,
          reviewStatus: r.reviewStatus,
          exclusionReason: r.exclusionReason,
          isOutOfScope: r.isOutOfScope,
          part1: r.part1,
          part2: r.part2,
          part3: r.part3,
          part4: r.part4,
        })),
      });
    }

    return result;
  }

  /**
   * Ra quyết định thẩm tra cho một phiếu cụ thể (VALID hoặc EXCLUDED)
   */
  static async makeDecision(
    responseId: string,
    decision: "VALID" | "EXCLUDED",
    reason: string,
    reviewerUser?: { id: string; username: string }
  ): Promise<ISurveyResponse> {
    await connectToDatabase();

    const response = await SurveyResponse.findById(responseId);
    if (!response) {
      throw new Error(`Không tìm thấy phiếu khảo sát có ID: ${responseId}`);
    }

    const previousStatus = response.reviewStatus;
    response.reviewStatus = decision;
    response.exclusionReason = decision === "EXCLUDED" ? reason : null;
    response.reviewedAt = new Date();
    if (reviewerUser?.id) {
      response.reviewedBy = new Types.ObjectId(reviewerUser.id);
    }

    await response.save();

    // Ghi nhận Audit Log
    if (reviewerUser) {
      try {
        await AuditLog.create({
          userId: new Types.ObjectId(reviewerUser.id),
          username: reviewerUser.username,
          action: "REVIEW_DUPLICATE_DECISION",
          targetResource: `SurveyResponse/${responseId}`,
          details: {
            decision,
            reason,
            previousStatus,
            businessHash: response.businessHash,
            communeCode: response.part1?.communeCode,
          },
        });
      } catch (err) {
        console.warn("Could not write AuditLog:", err);
      }
    }

    return response;
  }

  /**
   * Xử lý giải quyết cả nhóm nghi trùng (Giữ 1 phiếu hợp lệ, loại trừ các phiếu còn lại)
   */
  static async resolveGroup(
    businessHash: string,
    keepResponseId: string,
    exclusionReason: string,
    reviewerUser?: { id: string; username: string }
  ): Promise<{ validId: string; excludedCount: number }> {
    await connectToDatabase();

    // 1. Đặt phiếu được chọn thành VALID
    await SurveyResponse.findByIdAndUpdate(keepResponseId, {
      reviewStatus: "VALID",
      exclusionReason: null,
      reviewedAt: new Date(),
      reviewedBy: reviewerUser?.id ? new Types.ObjectId(reviewerUser.id) : null,
    });

    // 2. Đặt các phiếu khác cùng businessHash thành EXCLUDED
    const excludeResult = await SurveyResponse.updateMany(
      {
        businessHash,
        _id: { $ne: new Types.ObjectId(keepResponseId) },
      },
      {
        reviewStatus: "EXCLUDED",
        exclusionReason,
        reviewedAt: new Date(),
        reviewedBy: reviewerUser?.id ? new Types.ObjectId(reviewerUser.id) : null,
      }
    );

    // Ghi Audit Log
    if (reviewerUser) {
      try {
        await AuditLog.create({
          userId: new Types.ObjectId(reviewerUser.id),
          username: reviewerUser.username,
          action: "RESOLVE_DUPLICATE_GROUP",
          targetResource: `DuplicateGroup/${businessHash}`,
          details: {
            keptResponseId: keepResponseId,
            excludedCount: excludeResult.modifiedCount,
            reason: exclusionReason,
          },
        });
      } catch (err) {
        console.warn("Could not write AuditLog:", err);
      }
    }

    return {
      validId: keepResponseId,
      excludedCount: excludeResult.modifiedCount,
    };
  }

  /**
   * Thống kê tổng hợp số liệu nghi trùng
   */
  static async getDuplicateStats(campaignId?: string): Promise<{
    totalSuspected: number;
    pendingReview: number;
    resolvedValid: number;
    resolvedExcluded: number;
  }> {
    await connectToDatabase();

    const query: Record<string, any> = { isSuspectedDuplicate: true };
    if (campaignId) {
      query.campaignId = new Types.ObjectId(campaignId);
    }

    const [totalSuspected, pendingReview, resolvedValid, resolvedExcluded] =
      await Promise.all([
        SurveyResponse.countDocuments(query),
        SurveyResponse.countDocuments({ ...query, reviewStatus: "PENDING_REVIEW" }),
        SurveyResponse.countDocuments({ ...query, reviewStatus: "VALID" }),
        SurveyResponse.countDocuments({ ...query, reviewStatus: "EXCLUDED" }),
      ]);

    return {
      totalSuspected,
      pendingReview,
      resolvedValid,
      resolvedExcluded,
    };
  }
}
