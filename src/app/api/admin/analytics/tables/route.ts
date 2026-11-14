import { NextRequest, NextResponse } from "next/server";
import { AnalyticsAggregationService } from "@/services/analytics-aggregation.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get("campaignId") || undefined;
    const provinceCode = searchParams.get("provinceCode") || undefined;
    const agencyCode = searchParams.get("agencyCode") || undefined;

    const data = await AnalyticsAggregationService.generateAllTables({
      campaignId,
      provinceCode,
      agencyCode,
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("Error in GET /api/admin/analytics/tables:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: error.message || "Lỗi tổng hợp số liệu 6 bảng" },
      },
      { status: 500 }
    );
  }
}
