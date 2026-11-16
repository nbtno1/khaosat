import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { SurveyQuestionsAdminService } from "@/services/survey-questions-admin.service";
import { z } from "zod";
import { DifficultyInputSchema } from "@/lib/validations/survey-schema-admin.schema";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ version: string }> }
) {
  try {
    const session = getSessionFromRequest(request);
    if (session && session.role !== "TECHNICAL_ADMIN" && session.role !== "CONTENT_ADMIN") {
      return NextResponse.json({ success: false, error: "Không có quyền thực hiện." }, { status: 403 });
    }

    const { version } = await params;
    const body = await request.json();

    const parseRes = z.array(DifficultyInputSchema).safeParse(body.difficulties || body);
    if (!parseRes.success) {
      return NextResponse.json(
        { success: false, error: "Dữ liệu danh mục khó khăn không hợp lệ", details: parseRes.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await SurveyQuestionsAdminService.updateDifficulties(version, parseRes.data);
    return NextResponse.json({
      success: true,
      data: result,
      message: "Cập nhật danh mục khó khăn thành công!",
    });
  } catch (error: any) {
    console.error("[DIFFICULTIES_PUT_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Lỗi khi cập nhật danh mục khó khăn" },
      { status: 500 }
    );
  }
}
