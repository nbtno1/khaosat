import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { CampaignLinkService } from "@/services/campaign-link.service";

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Yêu cầu đăng nhập." },
        { status: 401 }
      );
    }

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const baseUrl = `${protocol}://${host}`;

    const { items, stats } = await CampaignLinkService.getLinksOverview(baseUrl);

    return NextResponse.json({
      success: true,
      data: items,
      stats,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi khi nạp danh sách liên kết." },
      { status: 500 }
    );
  }
}
