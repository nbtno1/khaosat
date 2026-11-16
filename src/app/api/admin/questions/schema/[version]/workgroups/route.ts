import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { SurveyQuestionsAdminService } from "@/services/survey-questions-admin.service";
import { WorkgroupInputSchema } from "@/lib/validations/survey-schema-admin.schema";

export async function POST(
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

    const parseRes = WorkgroupInputSchema.safeParse(body);
    if (!parseRes.success) {
      return NextResponse.json(
        { success: false, error: "Dữ liệu nhóm việc không hợp lệ", details: parseRes.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await SurveyQuestionsAdminService.addWorkgroup(version, parseRes.data);
    return NextResponse.json({
      success: true,
      data: result,
      message: `Đã thêm nhóm công việc '${parseRes.data.id}' thành công!`,
    });
  } catch (error: any) {
    console.error("[WORKGROUP_POST_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Lỗi khi thêm nhóm công việc" },
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
    if (session && session.role !== "TECHNICAL_ADMIN" && session.role !== "CONTENT_ADMIN") {
      return NextResponse.json({ success: false, error: "Không có quyền thực hiện." }, { status: 403 });
    }

    const { version } = await params;
    const body = await request.json();

    if (body.action === "reorder" && Array.isArray(body.orderedIds)) {
      const result = await SurveyQuestionsAdminService.reorderWorkgroups(version, body.orderedIds);
      return NextResponse.json({
        success: true,
        data: result,
        message: "Cập nhật thứ tự sắp xếp các nhóm việc thành công!",
      });
    }

    if (!body.id) {
      return NextResponse.json({ success: false, error: "Thiếu mã nhóm công việc (id)." }, { status: 400 });
    }

    const result = await SurveyQuestionsAdminService.updateWorkgroup(version, body.id, body);
    return NextResponse.json({
      success: true,
      data: result,
      message: `Đã cập nhật nhóm công việc '${body.id}' thành công!`,
    });
  } catch (error: any) {
    console.error("[WORKGROUP_PUT_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Lỗi khi cập nhật nhóm công việc" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ version: string }> }
) {
  try {
    const session = getSessionFromRequest(request);
    if (session && session.role !== "TECHNICAL_ADMIN" && session.role !== "CONTENT_ADMIN") {
      return NextResponse.json({ success: false, error: "Không có quyền thực hiện." }, { status: 403 });
    }

    const { version } = await params;
    const { searchParams } = new URL(request.url);
    const workgroupId = searchParams.get("id");

    if (!workgroupId) {
      return NextResponse.json({ success: false, error: "Thiếu mã nhóm công việc (id)." }, { status: 400 });
    }

    const result = await SurveyQuestionsAdminService.deleteWorkgroup(version, workgroupId);
    return NextResponse.json({
      success: true,
      data: result,
      message: `Đã xóa nhóm công việc '${workgroupId}' thành công!`,
    });
  } catch (error: any) {
    console.error("[WORKGROUP_DELETE_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Lỗi khi xóa nhóm công việc" },
      { status: 500 }
    );
  }
}
