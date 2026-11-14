import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { SurveyLink } from "@/models/SurveyLink";
import { Campaign } from "@/models/Campaign";
import {
  SurveyResponse,
  WorkgroupStatus as DBWorkgroupStatus,
  RoleType as DBRoleType,
  UrgencyLevel as DBUrgencyLevel,
} from "@/models/SurveyResponse";
import {
  SurveySubmissionSchema,
  computeBusinessHash,
  isUserOutOfScope,
  ALL_WORKGROUP_IDS,
} from "@/lib/validations/survey.schema";

// Value mappers from schema enums to DB model enums
function mapExperienceYears(val: string): "LT_1" | "1_TO_3" | "GT_3" {
  if (val === "UNDER_1") return "LT_1";
  if (val === "OVER_3") return "GT_3";
  return "1_TO_3";
}

function mapWorkgroupStatus(val: string): DBWorkgroupStatus {
  if (val === "DANG_THUC_HIEN") return "CURRENTLY_DOING";
  if (val === "CHUA_CO_DIP") return "ASSIGNED_NOT_YET";
  if (val === "CHI_PHOI_HOP") return "COORDINATING_ONLY";
  return "NOT_ASSIGNED";
}

function mapUrgencyLevel(val?: string | null): DBUrgencyLevel | null {
  if (!val) return null;
  if (val === "URGENT_6M") return "IMMEDIATE_6M";
  if (val === "AFTER_YEAR") return "AFTER_1Y";
  return "WITHIN_YEAR";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Zod Validation
    const validationResult = SurveySubmissionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_FAILED",
            message: "Dữ liệu khảo sát không hợp lệ. Vui lòng kiểm tra lại.",
            details: validationResult.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // 2. Connect Database
    await connectToDatabase();

    // 3. Verify Survey Link & Campaign
    const link = await SurveyLink.findOne({ token: data.token });
    if (!link || link.status !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "LINK_INACTIVE",
            message: "Đường dẫn khảo sát này không tồn tại hoặc đã tạm dừng tiếp nhận phản hồi.",
          },
        },
        { status: 403 }
      );
    }

    const campaign = await Campaign.findById(link.campaignId);
    if (!campaign || campaign.status !== "OPEN") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CAMPAIGN_CLOSED",
            message: "Đợt khảo sát đã kết thúc. Cảm ơn sự quan tâm của đồng chí!",
          },
        },
        { status: 403 }
      );
    }

    // 4. Compute 4-point Business Hash for duplicate detection (ADR-005)
    const businessHash = computeBusinessHash(
      data.part1.communeCode,
      data.part1.agencyCode,
      data.part1.positionCode,
      data.part2.workgroupStatuses
    );

    // 5. Duplicate Detection Check
    const existingMatch = await SurveyResponse.findOne({
      campaignId: campaign._id,
      businessHash,
    });

    const isSuspectedDuplicate = !!existingMatch;
    let duplicateGroupId: string | null = null;
    let reviewStatus: "VALID" | "PENDING_REVIEW" = "VALID";
    let exclusionReason: string | null = null;

    if (isSuspectedDuplicate) {
      duplicateGroupId =
        existingMatch.duplicateGroupId || existingMatch._id.toString();
      reviewStatus = "PENDING_REVIEW";
      exclusionReason =
        "Trùng khớp 4 điểm nghiệp vụ (xã, cơ quan, vị trí, 16 trạng thái nhóm việc) với phiếu đã nộp trước đó";
    }

    // 6. Check Out-of-Scope (Early Exit)
    const isOutOfScope = isUserOutOfScope(data.part2.workgroupStatuses);

    // 7. Map to SurveyResponse DB Model
    const newResponse = new SurveyResponse({
      campaignId: campaign._id,
      linkId: link._id,
      schemaVersion: data.schemaVersion || "3.3",
      part1: {
        provinceCode: data.part1.provinceCode,
        provinceName: data.part1.provinceName,
        communeCode: data.part1.communeCode,
        communeName: data.part1.communeName,
        agencyCode: data.part1.agencyCode,
        agencyName: data.part1.agencyName,
        positionCode: data.part1.positionCode,
        positionTitle: data.part1.positionName,
        positionOtherText: data.part1.positionOtherText || null,
        capacities: data.part1.capacities,
        capacitiesOtherText: data.part1.capacityOtherText || null,
        experienceYears: mapExperienceYears(data.part1.experienceYears),
      },
      part2: {
        workgroupStatuses: ALL_WORKGROUP_IDS.map((wgId) => ({
          workgroupId: wgId,
          status: mapWorkgroupStatus(data.part2.workgroupStatuses[wgId]),
        })),
        otherWorkText: data.part2.otherWorkText || null,
      },
      part3: isOutOfScope
        ? []
        : data.part3.map((e) => ({
            workgroupId: e.workgroupId,
            status: mapWorkgroupStatus(e.status) as "CURRENTLY_DOING" | "ASSIGNED_NOT_YET",
            roles: e.roles as DBRoleType[],
            evaluations: e.selfEvaluations.map((ev) => ({
              roleId: ev.roleId as DBRoleType,
              selfAssessedLevel: ev.level,
            })),
            difficulties: e.difficulties || [],
            selectedTopics: e.learningTopics || [],
            selectedTopicsOtherText: e.topicOtherText || null,
            urgencyLevel: mapUrgencyLevel(e.urgencyLevel),
          })),
      part4: {
        preferredFormats: data.part4?.learningFormats || [],
        otherOpinions: data.part4?.generalFeedback || null,
      },
      isOutOfScope,
      businessHash,
      isSuspectedDuplicate,
      duplicateGroupId,
      reviewStatus,
      exclusionReason,
      submittedAt: new Date(),
    });

    await newResponse.save();

    // 8. Update SurveyLink Metrics
    link.totalSubmissions = (link.totalSubmissions || 0) + 1;
    link.lastSubmissionAt = new Date();
    await link.save();

    return NextResponse.json(
      {
        success: true,
        message: "Đã gửi phiếu khảo sát thành công. Cảm ơn sự phối hợp của đồng chí!",
        data: {
          responseId: newResponse._id,
          isOutOfScope,
          isSuspectedDuplicate,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in survey submit route:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Lỗi hệ thống khi lưu phiếu khảo sát. Vui lòng thử lại sau.",
        },
      },
      { status: 500 }
    );
  }
}
