import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { AdministrativeUnitsService } from "@/services/administrative-units.service";
import { logActionFromRequest } from "@/lib/audit-logger";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const session = getSessionFromRequest(request);
    const allowedRoles = ["TECHNICAL_ADMIN", "SYSTEM_ADMIN", "CONTENT_ADMIN"];
    if (session && !allowedRoles.includes(session.role)) {
      return NextResponse.json(
        { success: false, error: "Bạn không có quyền xóa xã/phường" },
        { status: 403 }
      );
    }

    const { code } = await params;
    const success = await AdministrativeUnitsService.deleteCommune(code);

    if (!success) {
      return NextResponse.json(
        { success: false, error: `Không tìm thấy xã/phường có mã ${code}` },
        { status: 404 }
      );
    }

    await logActionFromRequest(request, {
      action: "DELETE_COMMUNE",
      module: "ADMIN_UNITS",
      description: `Đã xóa xã/phường có mã ${code}`,
      targetResource: "Commune",
      targetId: code,
      status: "SUCCESS",
    });

    return NextResponse.json({
      success: true,
      message: `Đã xóa xã/phường mã ${code}`,
    });
  } catch (error: any) {
    console.error("[COMMUNE_DELETE_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Lỗi khi xóa xã/phường", details: error?.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const session = getSessionFromRequest(request);
    const allowedRoles = ["TECHNICAL_ADMIN", "SYSTEM_ADMIN", "CONTENT_ADMIN"];
    if (session && !allowedRoles.includes(session.role)) {
      return NextResponse.json(
        { success: false, error: "Bạn không có quyền cập nhật trạng thái xã/phường" },
        { status: 403 }
      );
    }

    const { code } = await params;
    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Trường isActive phải là boolean" },
        { status: 400 }
      );
    }

    const updated = await AdministrativeUnitsService.toggleCommuneStatus(code, isActive);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: `Không tìm thấy xã/phường có mã ${code}` },
        { status: 404 }
      );
    }

    await logActionFromRequest(request, {
      action: "UPDATE_COMMUNE_STATUS",
      module: "ADMIN_UNITS",
      description: `Đã ${isActive ? "kích hoạt" : "vô hiệu hóa"} xã/phường (mã ${code})`,
      targetResource: "Commune",
      targetId: code,
      details: { communeCode: code, isActive },
      status: "SUCCESS",
    });

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật trạng thái xã/phường mã ${code}`,
      data: { code, isActive },
    });
  } catch (error: any) {
    console.error("[COMMUNE_PATCH_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Lỗi khi cập nhật xã/phường", details: error?.message },
      { status: 500 }
    );
  }
}
