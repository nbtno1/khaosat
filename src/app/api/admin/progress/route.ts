import { NextRequest, NextResponse } from "next/server";
import { ProgressMonitoringService } from "@/services/progress-monitoring.service";

export async function GET(_request: NextRequest) {
  try {
    const summary = await ProgressMonitoringService.getSummary();
    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    console.error("[PROGRESS_API_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Không thể lấy báo cáo tiến độ", details: error?.message },
      { status: 500 }
    );
  }
}
