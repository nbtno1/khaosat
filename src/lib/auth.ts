import { NextRequest } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { UserRole, IUser } from "@/models/User";

const AUTH_SECRET = process.env.AUTH_SECRET || "khaosat-kiemtoannn-jwt-secret-key-2026-production";
const COOKIE_NAME = "auth_session_token";

export interface SessionPayload {
  userId: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  organization: string;
  assignedProvinceCodes: string[];
  exp: number; // Timestamp seconds
}

// Role labels for display
export const ROLE_LABELS: Record<UserRole, string> = {
  TECHNICAL_ADMIN: "Cục Công nghệ thông tin",
  SYSTEM_ADMIN: "Quản trị viên Hệ thống (Admin)",
  CONTENT_ADMIN: "Quản trị Nội dung",
  REVIEWER: "Thẩm tra viên (Rà soát)",
  PROGRESS_MONITOR: "Theo dõi Tiến độ",
  LOCAL_COORDINATOR: "Đầu mối Địa phương",
};

/**
 * Tạo token phiên làm việc HMAC SHA-256 an toàn
 */
export function signSessionToken(payload: Omit<SessionPayload, "exp">, expiresInHours = 24): string {
  const exp = Math.floor(Date.now() / 1000) + expiresInHours * 3600;
  const fullPayload: SessionPayload = { ...payload, exp };
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(encodedPayload)
    .digest("base64url");
  return `${encodedPayload}.${signature}`;
}

/**
 * Giải mã và xác thực token phiên
 */
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const [encodedPayload, signature] = token.split(".");
    if (!encodedPayload || !signature) return null;

    const expectedSignature = crypto
      .createHmac("sha256", AUTH_SECRET)
      .update(encodedPayload)
      .digest("base64url");

    if (signature !== expectedSignature) {
      return null;
    }

    const payloadStr = Buffer.from(encodedPayload, "base64url").toString("utf-8");
    const payload: SessionPayload = JSON.parse(payloadStr);

    // Kiểm tra hết hạn
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Trích xuất phiên làm việc từ Request Cookie hoặc Authorization Header
 */
export function getSessionFromRequest(req: NextRequest): SessionPayload | null {
  const cookieToken = req.cookies.get(COOKIE_NAME)?.value;
  if (cookieToken) {
    const session = verifySessionToken(cookieToken);
    if (session) return session;
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const bearerToken = authHeader.substring(7);
    return verifySessionToken(bearerToken);
  }

  return null;
}

/**
 * Băm mật khẩu bằng bcrypt
 */
export async function hashPassword(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainText, salt);
}

/**
 * So sánh mật khẩu bằng bcrypt
 */
export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

/**
 * Kiểm tra phân quyền RBAC dựa trên Matrix tại Spec 05
 */
export type PermissionKey =
  | "VIEW_AUDIT_LOGS"
  | "MANAGE_USERS"
  | "MANAGE_SCHEMA"
  | "MANAGE_CAMPAIGNS"
  | "VIEW_RAW_DATA"
  | "REVIEW_DUPLICATES"
  | "VIEW_INTERNAL_TABLES"
  | "VIEW_SUPPRESSED_TABLES"
  | "EXPORT_INTERNAL_EXCEL"
  | "EXPORT_LOCAL_EXCEL"
  | "VIEW_PROGRESS_NATIONWIDE"
  | "VIEW_PROGRESS_LOCAL";

export function hasPermission(role: UserRole, permission: PermissionKey): boolean {
  switch (permission) {
    case "VIEW_AUDIT_LOGS":
      // ĐẶC QUYỀN DUY NHẤT: Chỉ tài khoản Cục Công nghệ thông tin mới có quyền xem Log hệ thống
      return role === "TECHNICAL_ADMIN";

    case "MANAGE_USERS":
      return role === "TECHNICAL_ADMIN" || role === "SYSTEM_ADMIN";

    case "MANAGE_SCHEMA":
    case "MANAGE_CAMPAIGNS":
      return (
        role === "TECHNICAL_ADMIN" ||
        role === "SYSTEM_ADMIN" ||
        role === "CONTENT_ADMIN"
      );

    case "REVIEW_DUPLICATES":
      return (
        role === "TECHNICAL_ADMIN" ||
        role === "SYSTEM_ADMIN" ||
        role === "CONTENT_ADMIN" ||
        role === "REVIEWER"
      );

    case "VIEW_RAW_DATA":
    case "VIEW_INTERNAL_TABLES":
    case "EXPORT_INTERNAL_EXCEL":
      // Tuyệt đối cấm Đầu mối địa phương xem dữ liệu thô và bảng nội bộ
      return (
        role === "TECHNICAL_ADMIN" ||
        role === "SYSTEM_ADMIN" ||
        role === "CONTENT_ADMIN" ||
        role === "REVIEWER"
      );

    case "VIEW_SUPPRESSED_TABLES":
    case "EXPORT_LOCAL_EXCEL":
      // Tất cả vai trò đều xem được số liệu đã ẩn danh
      return true;

    case "VIEW_PROGRESS_NATIONWIDE":
      return role !== "LOCAL_COORDINATOR";

    case "VIEW_PROGRESS_LOCAL":
      return true;

    default:
      return false;
  }
}

export { COOKIE_NAME };
