import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { SystemGuideService } from "@/services/system-guide.service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Vui lòng đăng nhập để cập nhật hướng dẫn" },
        { status: 401 }
      );
    }

    if (session.role !== "TECHNICAL_ADMIN" && session.role !== "CONTENT_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Chỉ Quản trị viên mới có quyền cập nhật cẩm nang hướng dẫn" },
        { status: 403 }
      );
    }

    const { key } = await params;
    const body = await request.json();
    const { notes } = body;

    if (typeof notes !== "string") {
      return NextResponse.json(
        { success: false, error: "Nội dung ghi chú không hợp lệ" },
        { status: 400 }
      );
    }

    const success = await SystemGuideService.updateSectionNote(
      key,
      notes,
      session.fullName || session.username
    );

    return NextResponse.json({
      success,
      message: `Đã cập nhật hướng dẫn động cho mục ${key}`,
    });
  } catch (error: any) {
    console.error("[GUIDE_UPDATE_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Lỗi máy chủ khi cập nhật hướng dẫn", details: error?.message },
      { status: 500 }
    );
  }
}
