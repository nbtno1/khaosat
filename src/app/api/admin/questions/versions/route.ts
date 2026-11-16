import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { SurveyQuestionsAdminService } from "@/services/survey-questions-admin.service";
import { CreateVersionInputSchema } from "@/lib/validations/survey-schema-admin.schema";
import { logActionFromRequest } from "@/lib/audit-logger";

export async function GET(_request: NextRequest) {
  try {
    const versions = await SurveyQuestionsAdminService.getVersionsOverview();
    return NextResponse.json({
      success: true,
      data: versions,
    });
  } catch (error: any) {
    console.error("[QUESTIONS_VERSIONS_GET_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Không thể lấy danh sách phiên bản bộ câu hỏi", details: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (
      session &&
      session.role !== "TECHNICAL_ADMIN" &&
      session.role !== "SYSTEM_ADMIN" &&
      session.role !== "CONTENT_ADMIN"
    ) {
      return NextResponse.json(
        { success: false, error: "Chỉ Quản trị viên mới có quyền tạo phiên bản bộ câu hỏi mới." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parseRes = CreateVersionInputSchema.safeParse(body);
    if (!parseRes.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Dữ liệu tạo phiên bản không hợp lệ",
          details: parseRes.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const created = await SurveyQuestionsAdminService.createOrCloneVersion(parseRes.data);

    await logActionFromRequest(request, {
      action: "CLONE_SCHEMA",
      module: "QUESTIONS",
      description: `Tạo phiên bản bộ câu hỏi mới: v${parseRes.data.newVersion} (${parseRes.data.title}) từ nguồn v${parseRes.data.sourceVersion || "mới"}`,
      targetResource: `Schema v${parseRes.data.newVersion}`,
      details: {
        newVersion: parseRes.data.newVersion,
        sourceVersion: parseRes.data.sourceVersion,
      },
    });

    return NextResponse.json({
      success: true,
      data: created,
      message: `Đã tạo thành công phiên bản bộ câu hỏi '${parseRes.data.newVersion}'!`,
    });
  } catch (error: any) {
    console.error("[QUESTIONS_VERSION_CREATE_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Lỗi khi tạo phiên bản mới" },
      { status: 500 }
    );
  }
}
