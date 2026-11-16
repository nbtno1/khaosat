import { NextRequest, NextResponse } from "next/server";
import { DuplicateDetectionService } from "@/services/duplicate-detection.service";
import { getSessionFromRequest } from "@/lib/auth";
import { logActionFromRequest } from "@/lib/audit-logger";

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    const body = await req.json();
    const { businessHash, keepResponseId, reason } = body;

    if (!businessHash || !keepResponseId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_FIELDS",
            message: "Thiếu businessHash hoặc keepResponseId",
          },
        },
        { status: 400 }
      );
    }

    const defaultReason = reason || "Cùng một cán bộ gửi lại phiếu / gửi đúp nhiều lần";

    const reviewerUser = {
      id: session?.userId || "usr_reviewer_003",
      username: session?.username || "admin_reviewer",
    };

    const result = await DuplicateDetectionService.resolveGroup(
      businessHash,
      keepResponseId,
      defaultReason,
      reviewerUser
    );

    // Ghi log xử lý hàng loạt nhóm trùng
    await logActionFromRequest(req, {
      action: "RESOLVE_DUPLICATE_GROUP",
      module: "DUPLICATES",
      description: `Giải quyết nhóm nghi trùng (hash: ${businessHash.substring(0, 10)}...): Giữ lại phiếu ${keepResponseId}, loại trừ ${result.excludedCount} phiếu đúp`,
      targetResource: "SurveyResponseGroup",
      targetId: keepResponseId,
      details: {
        businessHash,
        keepResponseId,
        excludedCount: result.excludedCount,
        reason: defaultReason,
      },
      status: "SUCCESS",
    });

    return NextResponse.json({
      success: true,
      message: `Đã giải quyết nhóm nghi trùng: Giữ 1 phiếu hợp lệ, loại trừ ${result.excludedCount} phiếu đúp.`,
      data: result,
    });
  } catch (error: any) {
    console.error("Error in POST /api/admin/reviews/duplicates/resolve-group:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: error.message || "Lỗi giải quyết nhóm nghi trùng" },
      },
      { status: 500 }
    );
  }
}
