import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { UserAdminService } from "@/services/user-admin.service";
import { logActionFromRequest } from "@/lib/audit-logger";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (session.role !== "TECHNICAL_ADMIN" && session.role !== "SYSTEM_ADMIN")) {
      return NextResponse.json(
        { success: false, error: "Bạn không có quyền thay đổi trạng thái tài khoản." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const newStatus = await UserAdminService.toggleUserStatus(id, session.userId);

    // Ghi log kiểm toán
    await logActionFromRequest(req, {
      action: newStatus ? "USER_UNLOCK" : "USER_LOCK",
      module: "USER_ADMIN",
      description: `${newStatus ? "Mở khóa" : "Khóa tạm thời"} tài khoản ID: ${id}`,
      targetResource: "User",
      targetId: id,
      details: { isActive: newStatus },
    });

    return NextResponse.json({
      success: true,
      message: newStatus ? "Mở khóa tài khoản thành công" : "Đã khóa tài khoản",
      data: { isActive: newStatus },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi khi đổi trạng thái tài khoản." },
      { status: 400 }
    );
  }
}
