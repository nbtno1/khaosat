import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { AuditLogService } from "@/services/audit-log.service";
import { logActionFromRequest } from "@/lib/audit-logger";

/**
 * GET /api/admin/audit-logs
 * ĐẶC QUYỀN DUY NHẤT: Chỉ tài khoản Cục Công nghệ thông tin (role TECHNICAL_ADMIN) mới có quyền truy cập
 */
export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Vui lòng đăng nhập để tiếp tục" },
        { status: 401 }
      );
    }

    // Kiểm tra đặc quyền Cục CNTT
    if (session.role !== "TECHNICAL_ADMIN") {
      // Ghi log cảnh báo truy cập trái quyền
      await logActionFromRequest(request, {
        action: "UNAUTHORIZED_LOG_ACCESS",
        module: "SYSTEM",
        description: `Tài khoản '${session.username}' (${session.role}) cố gắng truy cập Nhật ký Hệ thống nhưng bị chặn do không thuộc Cục CNTT`,
        targetResource: "AuditLogs API",
        status: "WARNING",
      });

      return NextResponse.json(
        {
          success: false,
          error:
            "Quyền truy cập bị từ chối. Chỉ tài khoản Cục Công nghệ thông tin mới có quyền xem Nhật ký hệ thống.",
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 25;
    const search = searchParams.get("search") || "";
    const moduleFilter = searchParams.get("module") || "ALL";
    const actionFilter = searchParams.get("action") || "ALL";
    const statusFilter = searchParams.get("status") || "ALL";
    const usernameFilter = searchParams.get("username") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    const result = await AuditLogService.queryLogs({
      page,
      limit,
      search,
      module: moduleFilter,
      action: actionFilter,
      status: statusFilter,
      username: usernameFilter,
      startDate,
      endDate,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("[AUDIT_LOGS_GET_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: "Không thể tải danh sách nhật ký hệ thống",
        details: error?.message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/audit-logs
 * Cho phép ghi nhận sự kiện thao tác hoặc truy cập trang từ frontend
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, module, description, targetResource, targetId, details, status } = body;

    if (!action || !module || !description) {
      return NextResponse.json(
        { success: false, error: "Thiếu thông tin nhật ký bắt buộc (action, module, description)" },
        { status: 400 }
      );
    }

    await logActionFromRequest(request, {
      action,
      module,
      description,
      targetResource,
      targetId,
      details,
      status: status || "SUCCESS",
    });

    return NextResponse.json({ success: true, message: "Ghi nhật ký thành công" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Lỗi ghi nhật ký", details: error?.message },
      { status: 500 }
    );
  }
}
