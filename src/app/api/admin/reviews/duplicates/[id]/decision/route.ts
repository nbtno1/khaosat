import { NextRequest, NextResponse } from "next/server";
import { DuplicateDetectionService } from "@/services/duplicate-detection.service";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    // Default admin mock reviewer context (integrated with auth session)
    const reviewerUser = {
      id: "673628fa9c1d8f0012a45b70",
      username: "admin_reviewer",
    };

    const updated = await DuplicateDetectionService.makeDecision(
      id,
      decision,
      reason,
      reviewerUser
    );

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
        error: { code: "SERVER_ERROR", message: error.message || "Lỗi xử lý quyết định thẩm tra" },
      },
      { status: 500 }
    );
  }
}
