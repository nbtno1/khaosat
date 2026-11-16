import { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { AuditLogService } from "@/services/audit-log.service";
import { AuditLogStatus } from "@/models/AuditLog";

export async function logActionFromRequest(
  req: NextRequest,
  params: {
    action: string;
    module: string;
    description: string;
    targetResource?: string;
    targetId?: string;
    details?: Record<string, unknown>;
    status?: AuditLogStatus;
    overrideUser?: {
      userId?: string;
      username?: string;
      fullName?: string;
      role?: string;
      organization?: string;
    };
  }
): Promise<void> {
  const session = getSessionFromRequest(req);
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "";

  await AuditLogService.recordLog({
    userId: params.overrideUser?.userId || session?.userId,
    username: params.overrideUser?.username || session?.username || "anonymous",
    userFullName: params.overrideUser?.fullName || session?.fullName || "",
    userRole: params.overrideUser?.role || session?.role || "GUEST",
    organization: params.overrideUser?.organization || session?.organization || "",
    action: params.action,
    module: params.module,
    description: params.description,
    targetResource: params.targetResource,
    targetId: params.targetId,
    details: params.details,
    ipAddress: ip,
    userAgent,
    status: params.status || "SUCCESS",
  });
}
