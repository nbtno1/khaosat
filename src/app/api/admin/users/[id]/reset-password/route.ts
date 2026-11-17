import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { UserAdminService } from "@/services/user-admin.service";
import { ResetPasswordSchema } from "@/lib/validations/user-admin.schema";
import { logActionFromRequest } from "@/lib/audit-logger";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (session.role !== "TECHNICAL_ADMIN" && session.role !== "SYSTEM_ADMIN")) {
      return NextResponse.json(
        { success: false, error: "Bạn không có quyền đặt lại mật khẩu người dùng." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = ResetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Mật khẩu không hợp lệ", details: parsed.error.format() },
        { status: 400 }
      );
    }

    await UserAdminService.resetPassword(id, parsed.data.newPassword);

    // Ghi log kiểm toán
    await logActionFromRequest(req, {
      action: "USER_RESET_PASSWORD",
      module: "USER_ADMIN",
      description: `Đặt lại mật khẩu cho tài khoản ID: ${id}`,
      targetResource: "User",
      targetId: id,
    });

    return NextResponse.json({
      success: true,
      message: "Đặt lại mật khẩu thành công",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi khi đặt lại mật khẩu." },
      { status: 400 }
    );
  }
}
