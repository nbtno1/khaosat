import { connectToDatabase } from "@/lib/db";
import { AuditLog, IAuditLog, AuditLogStatus } from "@/models/AuditLog";

export interface RecordLogDto {
  userId?: string;
  username: string;
  userFullName?: string;
  userRole?: string;
  organization?: string;
  action: string;
  module: string;
  description: string;
  targetResource?: string;
  targetId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  status?: AuditLogStatus;
}

export interface QueryAuditLogsDto {
  page?: number;
  limit?: number;
  search?: string;
  module?: string;
  action?: string;
  status?: string;
  username?: string;
  startDate?: string;
  endDate?: string;
}

export interface AuditLogStats {
  totalLogs: number;
  totalLoginsToday: number;
  totalMutations: number;
  failedActions: number;
  successRate: number;
}

export class AuditLogService {
  /**
   * Ghi log an toàn vào MongoDB (không bao giờ throw error làm hỏng luồng chính)
   */
  static async recordLog(dto: RecordLogDto): Promise<void> {
    try {
      await connectToDatabase();
      await AuditLog.create({
        userId: dto.userId || null,
        username: dto.username || "anonymous",
        userFullName: dto.userFullName || "",
        userRole: dto.userRole || "",
        organization: dto.organization || "",
        action: dto.action,
        module: dto.module,
        description: dto.description,
        targetResource: dto.targetResource || null,
        targetId: dto.targetId || null,
        details: dto.details || {},
        ipAddress: dto.ipAddress || "127.0.0.1",
        userAgent: dto.userAgent || "",
        status: dto.status || "SUCCESS",
        createdAt: new Date(),
      });
    } catch (err) {
      console.error("[AuditLogService.recordLog] Failed to persist audit log:", err);
    }
  }

  /**
   * Truy vấn danh sách log có phân trang, bộ lọc và thống kê
   */
  static async queryLogs(query: QueryAuditLogsDto): Promise<{
    logs: IAuditLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    stats: AuditLogStats;
  }> {
    await connectToDatabase();

    // Tự động seed một số log mẫu nếu DB hoàn toàn trống để giao diện Cục CNTT trực quan
    await this.seedInitialLogsIfEmpty();

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 25));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (query.module && query.module !== "ALL") {
      filter.module = query.module;
    }

    if (query.action && query.action !== "ALL") {
      filter.action = query.action;
    }

    if (query.status && query.status !== "ALL") {
      filter.status = query.status;
    }

    if (query.username) {
      filter.username = { $regex: query.username, $options: "i" };
    }

    if (query.search) {
      const s = query.search.trim();
      filter.$or = [
        { description: { $regex: s, $options: "i" } },
        { username: { $regex: s, $options: "i" } },
        { userFullName: { $regex: s, $options: "i" } },
        { ipAddress: { $regex: s, $options: "i" } },
        { targetResource: { $regex: s, $options: "i" } },
      ];
    }

    if (query.startDate || query.endDate) {
      filter.createdAt = {};
      if (query.startDate) {
        filter.createdAt.$gte = new Date(query.startDate);
      }
      if (query.endDate) {
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    // Thống kê tổng hợp
    const totalAllLogs = await AuditLog.countDocuments({});
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [loginsToday, totalFailed, totalMutations] = await Promise.all([
      AuditLog.countDocuments({
        action: { $in: ["LOGIN_SUCCESS", "USER_LOGIN"] },
        createdAt: { $gte: startOfToday },
      }),
      AuditLog.countDocuments({ status: "FAILED" }),
      AuditLog.countDocuments({
        action: {
          $in: [
            "UPDATE_QUESTION",
            "CLONE_SCHEMA",
            "CREATE_WORKGROUP",
            "UPDATE_WORKGROUP",
            "SYNC_ADMIN_UNITS",
            "TOGGLE_PROVINCE_STATUS",
            "RESOLVE_DUPLICATE",
            "EXPORT_EXCEL",
          ],
        },
      }),
    ]);

    const successRate =
      totalAllLogs > 0
        ? Math.round(((totalAllLogs - totalFailed) / totalAllLogs) * 100)
        : 100;

    return {
      logs: logs as unknown as IAuditLog[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      stats: {
        totalLogs: totalAllLogs,
        totalLoginsToday: loginsToday,
        totalMutations,
        failedActions: totalFailed,
        successRate,
      },
    };
  }

  /**
   * Tạo sẵn lịch sử log khởi tạo nếu database chưa có log nào
   */
  private static async seedInitialLogsIfEmpty(): Promise<void> {
    const count = await AuditLog.countDocuments();
    if (count > 0) return;

    const now = new Date();
    const demoLogs = [
      {
        username: "system",
        userFullName: "Hệ thống Khảo sát KTNN",
        userRole: "SYSTEM",
        organization: "Kiểm toán nhà nước",
        action: "SYSTEM_INIT",
        module: "SYSTEM",
        description: "Khởi tạo hệ thống Khảo sát Năng lực cấp xã phiên bản Bộ tiêu chuẩn 3.3",
        targetResource: "Core Platform",
        status: "SUCCESS",
        ipAddress: "127.0.0.1",
        userAgent: "Server Daemon",
        createdAt: new Date(now.getTime() - 24 * 3600 * 1000 * 2),
      },
      {
        username: "cntt_admin",
        userFullName: "Cán bộ Cục CNTT — Kiểm toán nhà nước",
        userRole: "TECHNICAL_ADMIN",
        organization: "Cục Công nghệ thông tin — Kiểm toán nhà nước",
        action: "SYNC_ADMIN_UNITS",
        module: "ADMIN_UNITS",
        description: "Đồng bộ hóa danh mục gốc 34 tỉnh/thành phố và 3.321 xã/phường hiệu lực 2026",
        targetResource: "real-provinces.json & real-communes.json",
        details: { totalProvinces: 34, totalCommunes: 3321 },
        status: "SUCCESS",
        ipAddress: "10.0.1.15",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0",
        createdAt: new Date(now.getTime() - 24 * 3600 * 1000 * 1.5),
      },
      {
        username: "cntt_admin",
        userFullName: "Cán bộ Cục CNTT — Kiểm toán nhà nước",
        userRole: "TECHNICAL_ADMIN",
        organization: "Cục Công nghệ thông tin — Kiểm toán nhà nước",
        action: "UPDATE_QUESTION",
        module: "QUESTIONS",
        description: "Cấu hình chuẩn hóa 14 câu hỏi khảo sát và 16 nhóm công việc",
        targetResource: "SurveySchemaConfig v3.3",
        details: { questionsCount: 14, workgroupsCount: 16 },
        status: "SUCCESS",
        ipAddress: "10.0.1.15",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0",
        createdAt: new Date(now.getTime() - 24 * 3600 * 1000 * 1),
      },
      {
        username: "admin",
        userFullName: "Quản trị viên Hệ thống",
        userRole: "SYSTEM_ADMIN",
        organization: "Kiểm toán nhà nước",
        action: "LOGIN_SUCCESS",
        module: "AUTH",
        description: "Quản trị viên đăng nhập thành công vào Cổng Quản trị Hệ thống",
        targetResource: "Session Auth",
        status: "SUCCESS",
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0",
        createdAt: new Date(now.getTime() - 4 * 3600 * 1000),
      },
      {
        username: "admin",
        userFullName: "Quản trị viên Hệ thống",
        userRole: "SYSTEM_ADMIN",
        organization: "Kiểm toán nhà nước",
        action: "EXPORT_EXCEL",
        module: "ANALYTICS",
        description: "Xuất dữ liệu 6 Bảng tổng hợp ra file Excel định dạng nội bộ",
        targetResource: "6_Bang_TongHop_KhaoSat_NoiBo.xlsx",
        details: { mode: "INTERNAL" },
        status: "SUCCESS",
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0",
        createdAt: new Date(now.getTime() - 2 * 3600 * 1000),
      },
      {
        username: "guest_unknown",
        userFullName: "Chưa xác thực",
        userRole: "UNKNOWN",
        organization: "Không xác định",
        action: "LOGIN_FAILED",
        module: "AUTH",
        description: "Đăng nhập thất bại do sai mật khẩu tài khoản 'admin'",
        targetResource: "Session Auth",
        details: { attemptedUsername: "admin" },
        status: "FAILED",
        ipAddress: "113.190.23.45",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        createdAt: new Date(now.getTime() - 1 * 3600 * 1000),
      },
      {
        username: "cntt_admin",
        userFullName: "Cán bộ Cục CNTT — Kiểm toán nhà nước",
        userRole: "TECHNICAL_ADMIN",
        organization: "Cục Công nghệ thông tin — Kiểm toán nhà nước",
        action: "LOGIN_SUCCESS",
        module: "AUTH",
        description: "Cán bộ Cục CNTT đăng nhập phiên làm việc với đặc quyền xem Log hệ thống",
        targetResource: "Session Auth",
        status: "SUCCESS",
        ipAddress: "10.0.1.15",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0",
        createdAt: new Date(now.getTime() - 30 * 60 * 1000),
      },
    ];

    await AuditLog.insertMany(demoLogs);
  }
}
