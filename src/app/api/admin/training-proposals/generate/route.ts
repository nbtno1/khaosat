import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { TrainingProposalService } from "@/services/training-proposal.service";

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Yêu cầu đăng nhập." }, { status: 401 });
    }

    const body = await req.json();
    const provinceCode = body.provinceCode || "ALL";
    const provinceName = body.provinceName || (provinceCode === "ALL" ? "Toàn quốc" : `Tỉnh mã ${provinceCode}`);

    const draft = await TrainingProposalService.generateDraftFromAnalytics({
      provinceCode,
      provinceName,
      createdByName: session.fullName || session.username,
      campaignCode: body.campaignCode || "DOT-1-2026",
    });

    return NextResponse.json({
      success: true,
      data: draft,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi khi tự động trích xuất đề xuất đào tạo." },
      { status: 500 }
    );
  }
}
