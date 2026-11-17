import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { UserAdminService } from "@/services/user-admin.service";
import { UpdateUserSchema } from "@/lib/validations/user-admin.schema";
import { logActionFromRequest } from "@/lib/audit-logger";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (session.role !== "TECHNICAL_ADMIN" && session.role !== "SYSTEM_ADMIN")) {
      return NextResponse.json(
        { success: false, error: "Bạn không có quyền cập nhật tài khoản người dùng." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = UpdateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Dữ liệu không hợp lệ", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const updatedUser = await UserAdminService.updateUser(id, parsed.data);

    // Ghi log kiểm toán
    await logActionFromRequest(req, {
      action: "USER_UPDATE",
      module: "USER_ADMIN",
      description: `Cập nhật thông tin tài khoản: ${updatedUser.username} (${updatedUser.fullName})`,
      targetResource: "User",
      targetId: id,
      details: parsed.data as Record<string, unknown>,
    });

    return NextResponse.json({
      success: true,
      message: "Cập nhật tài khoản thành công",
      data: updatedUser,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi khi cập nhật người dùng." },
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
      return NextResponse.json(
        { success: false, error: "Bạn không có quyền xóa tài khoản người dùng." },
        { status: 403 }
      );
    }

    const { id } = await params;
    await UserAdminService.deleteUser(id, session.userId);

    // Ghi log kiểm toán
    await logActionFromRequest(req, {
      action: "USER_DELETE",
      module: "USER_ADMIN",
      description: `Xóa tài khoản người dùng ID: ${id}`,
      targetResource: "User",
      targetId: id,
    });

    return NextResponse.json({
      success: true,
      message: "Xóa tài khoản thành công",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi khi xóa người dùng." },
      { status: 400 }
    );
  }
}
