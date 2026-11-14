import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { AdministrativeUnitsService } from "@/services/administrative-units.service";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const session = getSessionFromRequest(request);
    if (session && session.role !== "TECHNICAL_ADMIN" && session.role !== "CONTENT_ADMIN") {
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
    if (session && session.role !== "TECHNICAL_ADMIN" && session.role !== "CONTENT_ADMIN") {
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

    await AdministrativeUnitsService.toggleCommuneStatus(code, isActive);
    return NextResponse.json({
      success: true,
      message: `Đã ${isActive ? "kích hoạt" : "tạm dừng"} xã/phường mã ${code}`,
    });
  } catch (error: any) {
    console.error("[COMMUNE_STATUS_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Lỗi khi cập nhật trạng thái xã", details: error?.message },
      { status: 500 }
    );
  }
}
