import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { CampaignLinkService } from "@/services/campaign-link.service";
import { SurveyLinkStatus } from "@/models/SurveyLink";
import { logActionFromRequest } from "@/lib/audit-logger";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (session.role !== "TECHNICAL_ADMIN" && session.role !== "SYSTEM_ADMIN" && session.role !== "CONTENT_ADMIN")) {
      return NextResponse.json(
        { success: false, error: "Bạn không có quyền thay đổi trạng thái liên kết khảo sát." },
        { status: 403 }
      );
    }

    const { token } = await params;
    const body = await req.json();
    const newStatus = body.status as SurveyLinkStatus;

    if (!newStatus || !["ACTIVE", "PAUSED", "EXPIRED"].includes(newStatus)) {
      return NextResponse.json(
        { success: false, error: "Trạng thái không hợp lệ. Chỉ chấp nhận ACTIVE, PAUSED, EXPIRED." },
        { status: 400 }
      );
    }

    const updated = await CampaignLinkService.updateLinkStatus(token, newStatus);

    // Ghi log kiểm toán
    await logActionFromRequest(req, {
      action: "CAMPAIGN_LINK_STATUS",
      module: "CAMPAIGN",
      description: `Đổi trạng thái liên kết tỉnh ${updated.provinceName} sang: ${newStatus}`,
      targetResource: "SurveyLink",
      targetId: updated._id.toString(),
      details: { token, provinceCode: updated.provinceCode, status: newStatus },
    });

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật trạng thái liên kết sang ${newStatus}`,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi khi cập nhật trạng thái liên kết." },
      { status: 400 }
    );
  }
}
