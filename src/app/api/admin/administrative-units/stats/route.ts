import { NextRequest, NextResponse } from "next/server";
import { AdministrativeUnitsService } from "@/services/administrative-units.service";

export async function GET(_request: NextRequest) {
  try {
    const stats = await AdministrativeUnitsService.getOverviewStats();
    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error("[DVHC_STATS_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Không thể lấy thống kê đơn vị hành chính", details: error?.message },
      { status: 500 }
    );
  }
}
