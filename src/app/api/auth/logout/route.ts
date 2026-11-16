import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth";
import { logActionFromRequest } from "@/lib/audit-logger";

export async function POST(request: NextRequest) {
  // Ghi log đăng xuất
  await logActionFromRequest(request, {
    action: "LOGOUT",
    module: "AUTH",
    description: "Người dùng đăng xuất phiên làm việc",
    targetResource: "Session Auth",
    status: "SUCCESS",
  });

  const response = NextResponse.json({
    success: true,
    message: "Đăng xuất thành công",
  });

  response.cookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
    maxAge: 0,
  });

  return response;
}
