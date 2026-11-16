import { NextRequest, NextResponse } from "next/server";
import { DuplicateDetectionService } from "@/services/duplicate-detection.service";
import { getSessionFromRequest } from "@/lib/auth";
import { logActionFromRequest } from "@/lib/audit-logger";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getSessionFromRequest(req);
    const { id } = await params;
    const body = await req.json();
    const { decision, reason } = body;

    if (!decision || (decision !== "VALID" && decision !== "EXCLUDED")) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_DECISION",
            message: "Quyết định phải là 'VALID' (Chấp nhận) hoặc 'EXCLUDED' (Loại trừ)",
          },
        },
        { status: 400 }
      );
    }

    if (!reason?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_REASON",
            message: "Vui lòng nhập lý do thẩm tra",
          },
        },
        { status: 400 }
      );
    }

    const reviewerUser = {
      id: session?.userId || "usr_reviewer_003",
      username: session?.username || "admin_reviewer",
    };

    const updated = await DuplicateDetectionService.makeDecision(
      id,
      decision,
      reason,
      reviewerUser
    );

    // Ghi log thẩm tra
    await logActionFromRequest(req, {
      action: "REVIEW_DUPLICATE_DECISION",
      module: "DUPLICATES",
      description: `Thẩm tra phiếu nghi trùng ${id}: Quyết định '${decision}' - Lý do: ${reason}`,
      targetResource: "SurveyResponse",
      targetId: id,
      details: { decision, reason, reviewer: reviewerUser.username },
      status: "SUCCESS",
    });

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật trạng thái phiếu thành ${decision}`,
      data: updated,
    });
  } catch (error: any) {
    console.error("Error in PATCH /api/admin/reviews/duplicates/:id/decision:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: error.message || "Lỗi xử lý thẩm tra phiếu" },
      },
      { status: 500 }
    );
  }
}
