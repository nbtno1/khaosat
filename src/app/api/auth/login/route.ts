import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User, IUser, UserRole } from "@/models/User";
import { AuditLog } from "@/models/AuditLog";
import {
  signSessionToken,
  verifyPassword,
  COOKIE_NAME,
  ROLE_LABELS,
} from "@/lib/auth";

// Tài khoản dự phòng / demo phục vụ kiểm thử và môi trường offline
const FALLBACK_USERS: Record<string, {
  id: string;
  username: string;
  passwordHash: string; // bcrypt hash for default passwords
  fullName: string;
  role: UserRole;
  organization: string;
  assignedProvinceCodes: string[];
}> = {
  admin: {
    id: "usr_admin_001",
    username: "admin",
    // bcrypt hash of 'Admin@123456'
    passwordHash: "$2a$10$wOaA3wB.qQ8W5GqH1fVvEeoWf3vE9/kGvhB14z5mNkVh4Ea9aAaeS",
    fullName: "Quản trị viên Hệ thống",
    role: "TECHNICAL_ADMIN",
    organization: "Kiểm toán nhà nước",
    assignedProvinceCodes: [],
  },
  reviewer: {
    id: "usr_reviewer_002",
    username: "reviewer",
    passwordHash: "$2a$10$wOaA3wB.qQ8W5GqH1fVvEeoWf3vE9/kGvhB14z5mNkVh4Ea9aAaeS",
    fullName: "Thẩm tra viên Vũ Văn Nghiệp",
    role: "REVIEWER",
    organization: "Vụ Tổng hợp - Kiểm toán nhà nước",
    assignedProvinceCodes: [],
  },
  monitor: {
    id: "usr_monitor_003",
    username: "monitor",
    passwordHash: "$2a$10$wOaA3wB.qQ8W5GqH1fVvEeoWf3vE9/kGvhB14z5mNkVh4Ea9aAaeS",
    fullName: "Cán bộ Theo dõi Tiến độ",
    role: "PROGRESS_MONITOR",
    organization: "Trường Đào tạo & Bồi dưỡng nghiệp vụ kiểm toán",
    assignedProvinceCodes: [],
  },
  coordinator_tn: {
    id: "usr_coord_004",
    username: "coordinator_tn",
    passwordHash: "$2a$10$wOaA3wB.qQ8W5GqH1fVvEeoWf3vE9/kGvhB14z5mNkVh4Ea9aAaeS",
    fullName: "Đầu mối Tỉnh Thái Nguyên",
    role: "LOCAL_COORDINATOR",
    organization: "Sở Tài chính Thái Nguyên",
    assignedProvinceCodes: ["20"], // Mã tỉnh Thái Nguyên
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập tên đăng nhập và mật khẩu" },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();
    let user: any = null;

    try {
      await connectToDatabase();
      user = await User.findOne({ username: cleanUsername });
    } catch {
      // Offline fallback
    }

    // Nếu không tìm thấy trong MongoDB hoặc DB offline, dùng danh sách fallback
    if (!user && FALLBACK_USERS[cleanUsername]) {
      const fb = FALLBACK_USERS[cleanUsername];
      // Mật khẩu mặc định: 'Admin@123456' cho tất cả demo users
      if (password === "Admin@123456" || (await verifyPassword(password, fb.passwordHash))) {
        user = {
          _id: fb.id,
          username: fb.username,
          fullName: fb.fullName,
          role: fb.role,
          organization: fb.organization,
          assignedProvinceCodes: fb.assignedProvinceCodes,
          isActive: true,
        };
      }
    } else if (user) {
      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: "Tên đăng nhập hoặc mật khẩu không chính xác" },
          { status: 401 }
        );
      }
      if (!user.isActive) {
        return NextResponse.json(
          { success: false, error: "Tài khoản của bạn đã bị vô hiệu hóa" },
          { status: 403 }
        );
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Tên đăng nhập hoặc mật khẩu không chính xác" },
        { status: 401 }
      );
    }

    // Tạo JWT Session Token
    const sessionToken = signSessionToken({
      userId: user._id.toString(),
      username: user.username,
      fullName: user.fullName,
      email: user.email || `${user.username}@kiemtoannn.gov.vn`,
      role: user.role,
      organization: user.organization,
      assignedProvinceCodes: user.assignedProvinceCodes || [],
    });

    // Ghi log đăng nhập (nếu kết nối được DB)
    try {
      await AuditLog.create({
        actorId: user._id.toString(),
        actorName: user.fullName,
        actorRole: user.role,
        action: "USER_LOGIN",
        targetCollection: "users",
        targetId: user._id.toString(),
        description: `Người dùng ${user.username} đăng nhập thành công`,
        ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
        userAgent: request.headers.get("user-agent") || "",
      });
    } catch {
      // Non-blocking log
    }

    const response = NextResponse.json({
      success: true,
      message: "Đăng nhập thành công",
      user: {
        id: user._id.toString(),
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        roleLabel: ROLE_LABELS[user.role as UserRole] || user.role,
        organization: user.organization,
        assignedProvinceCodes: user.assignedProvinceCodes || [],
      },
    });

    // Thiết lập HttpOnly Cookie an toàn
    response.cookies.set({
      name: COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 24 * 3600, // 24 giờ
    });

    return response;
  } catch (error: any) {
    console.error("[LOGIN_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Lỗi hệ thống khi đăng nhập", details: error?.message },
      { status: 500 }
    );
  }
}
