import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { CampaignLinkService } from "@/services/campaign-link.service";
import { logActionFromRequest } from "@/lib/audit-logger";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (session.role !== "TECHNICAL_ADMIN" && session.role !== "SYSTEM_ADMIN")) {
      return NextResponse.json(
        { success: false, error: "Bạn không có quyền đổi mã bảo mật liên kết (Rotate Token)." },
        { status: 403 }
      );
    }

    const { token } = await params;
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const baseUrl = `${protocol}://${host}`;

    const rotated = await CampaignLinkService.rotateToken(token, baseUrl);

    // Ghi log kiểm toán
    await logActionFromRequest(req, {
      action: "CAMPAIGN_LINK_ROTATE",
      module: "CAMPAIGN",
      description: `Đổi mã bảo mật (Rotate Token) cho tỉnh ${rotated.provinceName}: ${token} -> ${rotated.token}`,
      targetResource: "SurveyLink",
      targetId: rotated._id,
      details: {
        oldToken: token,
        newToken: rotated.token,
        provinceCode: rotated.provinceCode,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Đổi mã bảo mật liên kết thành công. Đã sinh mã QR mới cho ${rotated.provinceName}.`,
      data: rotated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi khi đổi mã bảo mật liên kết." },
      { status: 400 }
    );
  }
}
