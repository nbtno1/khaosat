import { NextResponse } from "next/server";
import { SystemGuideService } from "@/services/system-guide.service";

export async function GET() {
  try {
    const guideData = await SystemGuideService.getDynamicGuideData();
    return NextResponse.json({
      success: true,
      data: guideData,
    });
  } catch (error: any) {
    console.error("[DYNAMIC_GUIDE_API_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Không thể lấy cẩm nang hướng dẫn động", details: error?.message },
      { status: 500 }
    );
  }
}
