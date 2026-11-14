import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { AdministrativeUnitsService } from "@/services/administrative-units.service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const session = getSessionFromRequest(request);
    if (session && session.role !== "TECHNICAL_ADMIN" && session.role !== "CONTENT_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Bạn không có quyền thay đổi trạng thái tỉnh/thành" },
        { status: 403 }
      );
    }

    const { code } = await params;
    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Trường isActive phải là kiểu boolean" },
        { status: 400 }
      );
    }

    await AdministrativeUnitsService.toggleProvinceStatus(code, isActive);
    return NextResponse.json({
      success: true,
      message: `Đã ${isActive ? "kích hoạt" : "tạm dừng"} tỉnh/thành mã ${code}`,
    });
  } catch (error: any) {
    console.error("[PROVINCE_STATUS_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Lỗi khi cập nhật trạng thái tỉnh", details: error?.message },
      { status: 500 }
    );
  }
}
