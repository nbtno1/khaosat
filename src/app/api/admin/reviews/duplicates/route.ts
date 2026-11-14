import { NextRequest, NextResponse } from "next/server";
import { DuplicateDetectionService } from "@/services/duplicate-detection.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get("campaignId") || undefined;
    const provinceCode = searchParams.get("provinceCode") || undefined;
    const reviewStatus = (searchParams.get("status") as any) || undefined;

    const [groups, stats] = await Promise.all([
      DuplicateDetectionService.getDuplicateGroups({
        campaignId,
        provinceCode,
        reviewStatus,
      }),
      DuplicateDetectionService.getDuplicateStats(campaignId),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        groups,
        stats,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/admin/reviews/duplicates:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Lỗi tải danh sách phiếu nghi trùng" },
      },
      { status: 500 }
    );
  }
}
