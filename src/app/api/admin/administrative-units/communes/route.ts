import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { AdministrativeUnitsService } from "@/services/administrative-units.service";
import {
  CommuneInputSchema,
  CommunesQuerySchema,
} from "@/lib/validations/administrative-units.schema";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsedQuery = CommunesQuerySchema.safeParse({
      provinceCode: searchParams.get("provinceCode") || undefined,
      search: searchParams.get("search") || undefined,
      type: searchParams.get("type") || undefined,
      status: searchParams.get("status") || "ALL",
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 25,
    });

    if (!parsedQuery.success) {
      return NextResponse.json(
        { success: false, error: "Tham số truy vấn không hợp lệ", details: parsedQuery.error.format() },
        { status: 400 }
      );
    }

    const result = await AdministrativeUnitsService.getCommunes(parsedQuery.data);
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("[COMMUNES_GET_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Không thể lấy danh sách xã/phường", details: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (session && session.role !== "TECHNICAL_ADMIN" && session.role !== "CONTENT_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Bạn không có quyền quản trị danh mục xã/phường" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = CommuneInputSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Dữ liệu xã/phường không hợp lệ",
          details: validated.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "),
        },
        { status: 400 }
      );
    }

    const saved = await AdministrativeUnitsService.saveCommune(validated.data);
    return NextResponse.json({
      success: true,
      data: saved,
      message: `Đã lưu thành công: ${saved.name} (${saved.communeCode}) - ${saved.provinceName}`,
    });
  } catch (error: any) {
    console.error("[COMMUNES_POST_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Không thể lưu thông tin xã/phường", details: error?.message },
      { status: 500 }
    );
  }
}
