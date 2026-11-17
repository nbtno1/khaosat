import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { UserAdminService } from "@/services/user-admin.service";
import { CreateUserSchema } from "@/lib/validations/user-admin.schema";
import { logActionFromRequest } from "@/lib/audit-logger";

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (session.role !== "TECHNICAL_ADMIN" && session.role !== "SYSTEM_ADMIN")) {
      return NextResponse.json(
        { success: false, error: "Bạn không có quyền truy cập danh sách người dùng." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || undefined;
    const role = searchParams.get("role") || undefined;
    const isActiveParam = searchParams.get("isActive");
    const isActive = isActiveParam === "true" ? true : isActiveParam === "false" ? false : undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const [result, stats] = await Promise.all([
      UserAdminService.getUsers({ query, role, isActive, page, limit }),
      UserAdminService.getUserStats(),
    ]);

    return NextResponse.json({
      success: true,
      data: result.users,
      pagination: result.pagination,
      stats,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi khi lấy danh sách người dùng." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (session.role !== "TECHNICAL_ADMIN" && session.role !== "SYSTEM_ADMIN")) {
      return NextResponse.json(
        { success: false, error: "Bạn không có quyền tạo tài khoản người dùng." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = CreateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Dữ liệu không hợp lệ", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const newUser = await UserAdminService.createUser(parsed.data);

    // Ghi log kiểm toán
    await logActionFromRequest(req, {
      action: "USER_CREATE",
      module: "USER_ADMIN",
      description: `Tạo tài khoản người dùng mới: ${newUser.username} (${newUser.fullName})`,
      targetResource: "User",
      targetId: (newUser as any)._id?.toString(),
      details: {
        username: newUser.username,
        role: newUser.role,
        organization: newUser.organization,
      },
    });

    return NextResponse.json(
      { success: true, message: "Tạo tài khoản thành công", data: newUser },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi khi tạo người dùng." },
      { status: 400 }
    );
  }
}
