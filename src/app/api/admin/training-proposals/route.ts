import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { TrainingProposalService } from "@/services/training-proposal.service";
import { logActionFromRequest } from "@/lib/audit-logger";

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Yêu cầu đăng nhập." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const provinceCode = searchParams.get("provinceCode") || undefined;
    const status = searchParams.get("status") || undefined;

    const proposals = await TrainingProposalService.getProposals({ provinceCode, status });

    return NextResponse.json({
      success: true,
      data: proposals,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi khi nạp danh sách đề xuất đào tạo." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (session.role !== "TECHNICAL_ADMIN" && session.role !== "SYSTEM_ADMIN" && session.role !== "CONTENT_ADMIN" && session.role !== "REVIEWER")) {
      return NextResponse.json(
        { success: false, error: "Bạn không có quyền lập hoặc lưu đề xuất đào tạo." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const created = await TrainingProposalService.createProposal(body);

    await logActionFromRequest(req, {
      action: "PROPOSAL_CREATE",
      module: "TRAINING_PROPOSAL",
      description: `Lập Bản Đề xuất Đào tạo 12 mục cho địa bàn: ${created.provinceName}`,
      targetResource: "TrainingProposal",
      targetId: created._id.toString(),
      details: {
        provinceCode: created.provinceCode,
        title: created.title,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Lưu bản đề xuất đào tạo thành công",
      data: created,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi khi lưu đề xuất đào tạo." },
      { status: 400 }
    );
  }
}
