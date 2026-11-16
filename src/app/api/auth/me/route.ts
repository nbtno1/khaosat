import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest, ROLE_LABELS } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json(
      { success: false, error: "Chưa đăng nhập hoặc phiên làm việc đã hết hạn" },
      { status: 401 }
    );
  }

  const isITAdmin = session.role === "TECHNICAL_ADMIN";

  return NextResponse.json({
    success: true,
    user: {
      id: session.userId,
      username: session.username,
      fullName: session.fullName,
      email: session.email,
      role: session.role,
      roleLabel: ROLE_LABELS[session.role] || session.role,
      organization: session.organization,
      assignedProvinceCodes: session.assignedProvinceCodes,
      canViewAuditLogs: isITAdmin,
    },
  });
}
