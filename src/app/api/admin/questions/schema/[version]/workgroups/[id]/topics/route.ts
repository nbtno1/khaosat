import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { SurveyQuestionsAdminService } from "@/services/survey-questions-admin.service";
import { LearningTopicInputSchema } from "@/lib/validations/survey-schema-admin.schema";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ version: string; id: string }> }
) {
  try {
    const session = getSessionFromRequest(request);
    if (session && session.role !== "TECHNICAL_ADMIN" && session.role !== "CONTENT_ADMIN") {
      return NextResponse.json({ success: false, error: "Không có quyền thực hiện." }, { status: 403 });
    }

    const { version, id } = await params;
    const body = await request.json();

    const parseRes = LearningTopicInputSchema.safeParse(body);
    if (!parseRes.success) {
      return NextResponse.json(
        { success: false, error: "Dữ liệu chuyên đề không hợp lệ", details: parseRes.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await SurveyQuestionsAdminService.addTopic(version, id, parseRes.data);
    return NextResponse.json({
      success: true,
      data: result,
      message: `Đã thêm chuyên đề '${parseRes.data.topicId}' thành công!`,
    });
  } catch (error: any) {
    console.error("[TOPIC_POST_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Lỗi khi thêm chuyên đề đào tạo" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ version: string; id: string }> }
) {
  try {
    const session = getSessionFromRequest(request);
    if (session && session.role !== "TECHNICAL_ADMIN" && session.role !== "CONTENT_ADMIN") {
      return NextResponse.json({ success: false, error: "Không có quyền thực hiện." }, { status: 403 });
    }

    const { version, id } = await params;
    const body = await request.json();

    if (!body.topicId || !body.topicTitle) {
      return NextResponse.json(
        { success: false, error: "Thiếu mã chuyên đề (topicId) hoặc tên chuyên đề (topicTitle)." },
        { status: 400 }
      );
    }

    const result = await SurveyQuestionsAdminService.updateTopic(version, id, body.topicId, body);
    return NextResponse.json({
      success: true,
      data: result,
      message: `Đã cập nhật chuyên đề '${body.topicId}' thành công!`,
    });
  } catch (error: any) {
    console.error("[TOPIC_PUT_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Lỗi khi cập nhật chuyên đề" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ version: string; id: string }> }
) {
  try {
    const session = getSessionFromRequest(request);
    if (session && session.role !== "TECHNICAL_ADMIN" && session.role !== "CONTENT_ADMIN") {
      return NextResponse.json({ success: false, error: "Không có quyền thực hiện." }, { status: 403 });
    }

    const { version, id } = await params;
    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get("topicId");

    if (!topicId) {
      return NextResponse.json({ success: false, error: "Thiếu mã chuyên đề (topicId)." }, { status: 400 });
    }

    const result = await SurveyQuestionsAdminService.deleteTopic(version, id, topicId);
    return NextResponse.json({
      success: true,
      data: result,
      message: `Đã xóa chuyên đề '${topicId}' khỏi nhóm '${id}' thành công!`,
    });
  } catch (error: any) {
    console.error("[TOPIC_DELETE_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Lỗi khi xóa chuyên đề" },
      { status: 500 }
    );
  }
}
