import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { SurveyQuestionsAdminService } from "@/services/survey-questions-admin.service";
import { UpdateSchemaMetaInputSchema } from "@/lib/validations/survey-schema-admin.schema";
import { logActionFromRequest } from "@/lib/audit-logger";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ version: string }> }
) {
  try {
    const { version } = await params;
    const schema = await SurveyQuestionsAdminService.getSchemaByVersion(version);

    if (!schema) {
      return NextResponse.json(
        { success: false, error: `Không tìm thấy cấu hình bộ câu hỏi phiên bản '${version}'.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: schema,
    });
  } catch (error: any) {
    console.error("[QUESTIONS_SCHEMA_GET_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Lỗi khi lấy thông tin bộ câu hỏi", details: error?.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ version: string }> }
) {
  try {
    const session = getSessionFromRequest(request);
    if (
      session &&
      session.role !== "TECHNICAL_ADMIN" &&
      session.role !== "SYSTEM_ADMIN" &&
      session.role !== "CONTENT_ADMIN"
    ) {
      return NextResponse.json(
        { success: false, error: "Chỉ Quản trị viên mới có quyền cập nhật bộ câu hỏi." },
        { status: 403 }
      );
    }

    const { version } = await params;
    const body = await request.json();

    // Check if updating meta only or full schema
    if (body.action === "update-meta") {
      const parseRes = UpdateSchemaMetaInputSchema.safeParse(body);
      if (!parseRes.success) {
        return NextResponse.json(
          { success: false, error: "Dữ liệu cập nhật không hợp lệ", details: parseRes.error.flatten().fieldErrors },
          { status: 400 }
        );
      }
      const updated = await SurveyQuestionsAdminService.updateSchemaMeta(version, parseRes.data);

      await logActionFromRequest(request, {
        action: "UPDATE_SCHEMA_META",
        module: "QUESTIONS",
        description: `Cập nhật thông tin tiêu chuẩn của bộ câu hỏi phiên bản v${version}`,
        targetResource: `Schema v${version}`,
      });

      return NextResponse.json({
        success: true,
        data: updated,
        message: "Cập nhật thông tin phiên bản thành công!",
      });
    }

    // Otherwise, bulk save full schema
    const updated = await SurveyQuestionsAdminService.saveFullSchema(version, body);

    await logActionFromRequest(request, {
      action: "UPDATE_QUESTION",
      module: "QUESTIONS",
      description: `Lưu thay đổi toàn bộ cấu hình 14 câu hỏi, nhóm việc & chuyên đề phiên bản v${version}`,
      targetResource: `Schema v${version}`,
      details: {
        questionsCount: body.questions?.length,
        workgroupsCount: body.workgroups?.length,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Đã lưu toàn bộ cấu hình bộ câu hỏi phiên bản '${version}' thành công!`,
    });
  } catch (error: any) {
    console.error("[QUESTIONS_SCHEMA_PUT_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Lỗi khi lưu bộ câu hỏi" },
      { status: 500 }
    );
  }
}
