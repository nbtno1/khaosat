import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { AdministrativeUnitsService } from "@/services/administrative-units.service";

export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (session && session.role !== "TECHNICAL_ADMIN" && session.role !== "CONTENT_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Bạn không có quyền thực hiện đồng bộ danh mục ĐVHC" },
        { status: 403 }
      );
    }

    const result = await AdministrativeUnitsService.syncFromSource();
    return NextResponse.json({
      success: true,
      data: result,
      message: `Đồng bộ thành công ${result.syncedProvinces} tỉnh/thành và ${result.syncedCommunes} xã/phường/đặc khu vào hệ thống!`,
    });
  } catch (error: any) {
    console.error("[DVHC_SYNC_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Lỗi trong quá trình đồng bộ danh mục ĐVHC", details: error?.message },
      { status: 500 }
    );
  }
}
