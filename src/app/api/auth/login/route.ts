import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User, IUser, UserRole } from "@/models/User";
import {
  signSessionToken,
  verifyPassword,
  COOKIE_NAME,
  ROLE_LABELS,
} from "@/lib/auth";
import { logActionFromRequest } from "@/lib/audit-logger";

// Tài khoản chuẩn hóa theo yêu cầu:
// 1. Cục Công nghệ thông tin: cntt_admin (hoặc it_admin, cntt) - Quyền xem Log hệ thống
// 2. Admin (Quản trị viên): admin - Toàn quyền nghiệp vụ, không xem Log hệ thống
const FALLBACK_USERS: Record<string, {
  id: string;
  username: string;
  passwordHash: string; // bcrypt hash for 'Admin@123456'
  fullName: string;
  role: UserRole;
  organization: string;
  assignedProvinceCodes: string[];
}> = {
  // 1. TÀI KHOẢN CỤC CÔNG NGHỆ THÔNG TIN (ĐẶC QUYỀN XEM LOG)
  cntt_admin: {
    id: "usr_cntt_001",
    username: "cntt_admin",
    passwordHash: "$2a$10$wOaA3wB.qQ8W5GqH1fVvEeoWf3vE9/kGvhB14z5mNkVh4Ea9aAaeS",
    fullName: "Cán bộ Cục CNTT — Kiểm toán nhà nước",
    role: "TECHNICAL_ADMIN",
    organization: "Cục Công nghệ thông tin — Kiểm toán nhà nước",
    assignedProvinceCodes: [],
  },
  it_admin: {
    id: "usr_cntt_001",
    username: "it_admin",
    passwordHash: "$2a$10$wOaA3wB.qQ8W5GqH1fVvEeoWf3vE9/kGvhB14z5mNkVh4Ea9aAaeS",
    fullName: "Cán bộ Cục CNTT — Kiểm toán nhà nước",
    role: "TECHNICAL_ADMIN",
    organization: "Cục Công nghệ thông tin — Kiểm toán nhà nước",
    assignedProvinceCodes: [],
  },
  cntt: {
    id: "usr_cntt_001",
    username: "cntt",
    passwordHash: "$2a$10$wOaA3wB.qQ8W5GqH1fVvEeoWf3vE9/kGvhB14z5mNkVh4Ea9aAaeS",
    fullName: "Cán bộ Cục CNTT — Kiểm toán nhà nước",
    role: "TECHNICAL_ADMIN",
    organization: "Cục Công nghệ thông tin — Kiểm toán nhà nước",
    assignedProvinceCodes: [],
  },

  // 2. TÀI KHOẢN QUẢN TRỊ VIÊN HỆ THỐNG (ADMIN NGHIỆP VỤ - TOÀN QUYỀN, KHÔNG XEM LOG)
  admin: {
    id: "usr_admin_002",
    username: "admin",
    passwordHash: "$2a$10$wOaA3wB.qQ8W5GqH1fVvEeoWf3vE9/kGvhB14z5mNkVh4Ea9aAaeS",
    fullName: "Quản trị viên Hệ thống",
    role: "SYSTEM_ADMIN",
    organization: "Kiểm toán nhà nước",
    assignedProvinceCodes: [],
  },

  // Tài khoản thẩm tra & đầu mối nghiệp vụ hỗ trợ
  reviewer: {
    id: "usr_reviewer_003",
    username: "reviewer",
    passwordHash: "$2a$10$wOaA3wB.qQ8W5GqH1fVvEeoWf3vE9/kGvhB14z5mNkVh4Ea9aAaeS",
    fullName: "Thẩm tra viên Vũ Văn Nghiệp",
    role: "REVIEWER",
    organization: "Vụ Tổng hợp - Kiểm toán nhà nước",
    assignedProvinceCodes: [],
  },
  monitor: {
    id: "usr_monitor_004",
    username: "monitor",
    passwordHash: "$2a$10$wOaA3wB.qQ8W5GqH1fVvEeoWf3vE9/kGvhB14z5mNkVh4Ea9aAaeS",
    fullName: "Cán bộ Theo dõi Tiến độ",
    role: "PROGRESS_MONITOR",
    organization: "Trường Đào tạo & Bồi dưỡng nghiệp vụ kiểm toán",
    assignedProvinceCodes: [],
  },
  coordinator_tn: {
    id: "usr_coord_005",
    username: "coordinator_tn",
    passwordHash: "$2a$10$wOaA3wB.qQ8W5GqH1fVvEeoWf3vE9/kGvhB14z5mNkVh4Ea9aAaeS",
    fullName: "Đầu mối Tỉnh Thái Nguyên",
    role: "LOCAL_COORDINATOR",
    organization: "Sở Tài chính Thái Nguyên",
    assignedProvinceCodes: ["20"],
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
        // Ghi log đăng nhập thất bại
        await logActionFromRequest(request, {
          action: "LOGIN_FAILED",
          module: "AUTH",
          description: `Đăng nhập thất bại do sai mật khẩu tài khoản '${cleanUsername}'`,
          targetResource: "Session Auth",
          status: "FAILED",
          overrideUser: {
            username: cleanUsername,
            role: "UNKNOWN",
          },
        });

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
      // Ghi log đăng nhập thất bại
      await logActionFromRequest(request, {
        action: "LOGIN_FAILED",
        module: "AUTH",
        description: `Đăng nhập thất bại do tài khoản '${cleanUsername}' không tồn tại hoặc sai thông tin`,
        targetResource: "Session Auth",
        status: "FAILED",
        overrideUser: {
          username: cleanUsername,
          role: "UNKNOWN",
        },
      });

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

    // Ghi log đăng nhập thành công
    const isITAdmin = user.role === "TECHNICAL_ADMIN";
    await logActionFromRequest(request, {
      action: "LOGIN_SUCCESS",
      module: "AUTH",
      description: isITAdmin
        ? `Cán bộ Cục CNTT (${user.fullName}) đăng nhập thành công — kích hoạt quyền xem Log hệ thống`
        : `Người dùng ${user.fullName} (${user.role}) đăng nhập thành công vào Cổng Quản trị`,
      targetResource: "Session Auth",
      status: "SUCCESS",
      overrideUser: {
        userId: user._id.toString(),
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        organization: user.organization,
      },
    });

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
        canViewAuditLogs: isITAdmin,
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
