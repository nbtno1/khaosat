import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { AdministrativeUnitsService } from "@/services/administrative-units.service";
import {
  ProvinceInputSchema,
  ProvincesQuerySchema,
} from "@/lib/validations/administrative-units.schema";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsedQuery = ProvincesQuerySchema.safeParse({
      search: searchParams.get("search") || undefined,
      type: searchParams.get("type") || undefined,
      status: searchParams.get("status") || "ALL",
      sort: searchParams.get("sort") || "code",
    });

    if (!parsedQuery.success) {
      return NextResponse.json(
        { success: false, error: "Tham số truy vấn không hợp lệ", details: parsedQuery.error.format() },
        { status: 400 }
      );
    }

    const provinces = await AdministrativeUnitsService.getProvinces(parsedQuery.data);
    return NextResponse.json({
      success: true,
      data: provinces,
      total: provinces.length,
    });
  } catch (error: any) {
    console.error("[PROVINCES_GET_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Không thể lấy danh sách tỉnh/thành", details: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    // Cho phép nếu có role quản trị, hoặc trong demo mode
    if (session && session.role !== "TECHNICAL_ADMIN" && session.role !== "CONTENT_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Bạn không có quyền quản trị danh mục tỉnh/thành" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = ProvinceInputSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Dữ liệu tỉnh/thành không hợp lệ",
          details: validated.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "),
        },
        { status: 400 }
      );
    }

    const saved = await AdministrativeUnitsService.saveProvince(validated.data);
    return NextResponse.json({
      success: true,
      data: saved,
      message: `Đã lưu thành công tỉnh/thành: ${saved.name} (${saved.provinceCode})`,
    });
  } catch (error: any) {
    console.error("[PROVINCES_POST_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Không thể lưu thông tin tỉnh/thành", details: error?.message },
      { status: 500 }
    );
  }
}
