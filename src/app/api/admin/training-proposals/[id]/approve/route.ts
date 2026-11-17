import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { TrainingProposalService } from "@/services/training-proposal.service";
import { logActionFromRequest } from "@/lib/audit-logger";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (session.role !== "TECHNICAL_ADMIN" && session.role !== "SYSTEM_ADMIN" && session.role !== "CONTENT_ADMIN")) {
      return NextResponse.json({ success: false, error: "Bạn không có thẩm quyền phê duyệt đề xuất đào tạo." }, { status: 403 });
    }

    const { id } = await params;
    const approverName = session.fullName || session.username;
    const approved = await TrainingProposalService.approveProposal(id, approverName);

    await logActionFromRequest(req, {
      action: "PROPOSAL_APPROVE",
      module: "TRAINING_PROPOSAL",
      description: `Phê duyệt Bản Đề xuất Đào tạo cho tỉnh: ${approved.provinceName}`,
      targetResource: "TrainingProposal",
      targetId: id,
      details: {
        provinceCode: approved.provinceCode,
        approvedByName: approverName,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Phê duyệt Bản Đề xuất Đào tạo thành công",
      data: approved,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi khi phê duyệt đề xuất." },
      { status: 400 }
    );
  }
}
