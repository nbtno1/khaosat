import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { AdministrativeUnitsService } from "@/services/administrative-units.service";
import { logActionFromRequest } from "@/lib/audit-logger";

export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    const allowedRoles = ["TECHNICAL_ADMIN", "SYSTEM_ADMIN", "CONTENT_ADMIN"];
    if (session && !allowedRoles.includes(session.role)) {
      return NextResponse.json(
        { success: false, error: "Bạn không có quyền thực hiện đồng bộ danh mục ĐVHC" },
        { status: 403 }
      );
    }

    const result = await AdministrativeUnitsService.syncFromSource();

    // Ghi log thao tác
    await logActionFromRequest(request, {
      action: "SYNC_ADMIN_UNITS",
      module: "ADMIN_UNITS",
      description: `Đồng bộ hóa danh mục ĐVHC: ${result.syncedProvinces} tỉnh/thành và ${result.syncedCommunes} xã/phường`,
      targetResource: "Administrative Units Database",
      details: {
        syncedProvinces: result.syncedProvinces,
        syncedCommunes: result.syncedCommunes,
      },
      status: "SUCCESS",
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: `Đồng bộ thành công ${result.syncedProvinces} tỉnh/thành và ${result.syncedCommunes} xã/phường/đặc khu vào hệ thống!`,
    });
  } catch (error: any) {
    console.error("[DVHC_SYNC_ERROR]", error);
    await logActionFromRequest(request, {
      action: "SYNC_ADMIN_UNITS",
      module: "ADMIN_UNITS",
      description: `Đồng bộ danh mục ĐVHC thất bại: ${error?.message}`,
      targetResource: "Administrative Units Database",
      status: "FAILED",
    });

    return NextResponse.json(
      { success: false, error: "Lỗi trong quá trình đồng bộ danh mục ĐVHC", details: error?.message },
      { status: 500 }
    );
  }
}
