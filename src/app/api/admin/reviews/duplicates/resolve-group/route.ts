import { NextRequest, NextResponse } from "next/server";
import { DuplicateDetectionService } from "@/services/duplicate-detection.service";

export async function POST(req: NextRequest) {
  try {
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
      id: "673628fa9c1d8f0012a45b70",
      username: "admin_reviewer",
    };

    const result = await DuplicateDetectionService.resolveGroup(
      businessHash,
      keepResponseId,
      defaultReason,
      reviewerUser
    );

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
