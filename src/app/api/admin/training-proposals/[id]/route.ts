import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { TrainingProposalService } from "@/services/training-proposal.service";
import { logActionFromRequest } from "@/lib/audit-logger";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Yêu cầu đăng nhập." }, { status: 401 });
    }

    const { id } = await params;
    const proposal = await TrainingProposalService.getProposalById(id);
    if (!proposal) {
      return NextResponse.json({ success: false, error: "Không tìm thấy đề xuất." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: proposal });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi khi nạp chi tiết đề xuất." },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (session.role !== "TECHNICAL_ADMIN" && session.role !== "SYSTEM_ADMIN" && session.role !== "CONTENT_ADMIN" && session.role !== "REVIEWER")) {
      return NextResponse.json({ success: false, error: "Không có quyền sửa đề xuất." }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const updated = await TrainingProposalService.updateProposal(id, body);

    await logActionFromRequest(req, {
      action: "PROPOSAL_UPDATE",
      module: "TRAINING_PROPOSAL",
      description: `Cập nhật Bản Đề xuất Đào tạo ID: ${id} (${updated.provinceName})`,
      targetResource: "TrainingProposal",
      targetId: id,
    });

    return NextResponse.json({ success: true, message: "Cập nhật thành công", data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi khi cập nhật đề xuất." },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (session.role !== "TECHNICAL_ADMIN" && session.role !== "SYSTEM_ADMIN")) {
      return NextResponse.json({ success: false, error: "Không có quyền xóa đề xuất." }, { status: 403 });
    }

    const { id } = await params;
    await TrainingProposalService.deleteProposal(id);

    await logActionFromRequest(req, {
      action: "PROPOSAL_DELETE",
      module: "TRAINING_PROPOSAL",
      description: `Xóa Bản Đề xuất Đào tạo ID: ${id}`,
      targetResource: "TrainingProposal",
      targetId: id,
    });

    return NextResponse.json({ success: true, message: "Xóa đề xuất thành công" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi khi xóa đề xuất." },
      { status: 400 }
    );
  }
}
