"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  LogIn,
  Layers,
  Database,
  Calendar,
  Lock,
  ChevronLeft,
  ChevronRight,
  User,
  Activity,
  Globe,
  Clock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface AuditLogItem {
  _id: string;
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
  status: "SUCCESS" | "FAILED" | "WARNING";
  createdAt: string;
}

interface AuditLogStats {
  totalLogs: number;
  totalLoginsToday: number;
  totalMutations: number;
  failedActions: number;
  successRate: number;
}

export default function AuditLogsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAccessDenied, setIsAccessDenied] = useState(false);

  // Data states
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [stats, setStats] = useState<AuditLogStats>({
    totalLogs: 0,
    totalLoginsToday: 0,
    totalMutations: 0,
    failedActions: 0,
    successRate: 100,
  });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [isLoading, setIsLoading] = useState(false);

  // Filter states
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Detail Modal state
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  // 1. Kiểm tra quyền tài khoản Cục CNTT
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Chưa xác thực");
        return res.json();
      })
      .then((data) => {
        if (data.success && data.user) {
          setCurrentUser(data.user);
          if (data.user.role !== "TECHNICAL_ADMIN") {
            setIsAccessDenied(true);
          }
        } else {
          setIsAccessDenied(true);
        }
      })
      .catch(() => {
        setIsAccessDenied(true);
      })
      .finally(() => {
        setIsCheckingAuth(false);
      });
  }, []);

  // 2. Fetch danh sách log
  const fetchLogs = useCallback(
    async (currentPage = page) => {
      if (isAccessDenied) return;
      setIsLoading(true);
      try {
        const query = new URLSearchParams({
          page: String(currentPage),
          limit: String(limit),
          search: search.trim(),
          module: moduleFilter,
          status: statusFilter,
        });

        const res = await fetch(`/api/admin/audit-logs?${query.toString()}`);
        if (res.status === 403) {
          setIsAccessDenied(true);
          return;
        }

        const json = await res.json();
        if (json.success && json.data) {
          setLogs(json.data.logs || []);
          setTotal(json.data.total || 0);
          setTotalPages(json.data.totalPages || 1);
          if (json.data.stats) {
            setStats(json.data.stats);
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải nhật ký:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [isAccessDenied, page, limit, search, moduleFilter, statusFilter]
  );

  useEffect(() => {
    if (!isCheckingAuth && !isAccessDenied) {
      fetchLogs(1);
      setPage(1);
    }
  }, [isCheckingAuth, isAccessDenied, moduleFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      fetchLogs(newPage);
    }
  };

  // Xuất file CSV nhật ký
  const handleExportCSV = () => {
    if (!logs.length) return;
    const headers = [
      "ID",
      "Thời gian",
      "Tài khoản",
      "Họ tên",
      "Vai trò",
      "Đơn vị",
      "Phân hệ",
      "Thao tác",
      "Mô tả",
      "Tài nguyên đích",
      "Địa chỉ IP",
      "Trạng thái",
    ];

    const rows = logs.map((l) => [
      l._id,
      new Date(l.createdAt).toLocaleString("vi-VN"),
      l.username,
      l.userFullName || "",
      l.userRole || "",
      l.organization || "",
      l.module,
      l.action,
      `"${(l.description || "").replace(/"/g, '""')}"`,
      l.targetResource || "",
      l.ipAddress || "",
      l.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `NhatKy_HeThong_KTNN_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trạng thái đang kiểm tra phiên
  if (isCheckingAuth) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">
            Đang xác thực quyền truy cập Cục CNTT...
          </p>
        </div>
      </div>
    );
  }

  // Trạng thái BỊ CHẶN: Chỉ dành riêng cho Cục CNTT
  if (isAccessDenied) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-5 shadow-xs">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Quyền Truy Cập Bị Từ Chối
          </h2>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold mb-4">
            <Lock className="w-3.5 h-3.5" />
            <span>Đặc quyền Cục Công nghệ thông tin</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-6">
            Phân hệ <strong>Nhật ký Hệ thống (Audit Logs)</strong> lưu trữ toàn bộ lịch sử truy cập,
            đăng nhập và các thao tác thay đổi dữ liệu nhạy cảm. Theo chính sách phân quyền, chỉ tài khoản
            đại diện của <strong>Cục Công nghệ thông tin — Kiểm toán nhà nước</strong> mới có thẩm quyền
            truy cập phân hệ này.
          </p>
          <div className="w-full space-y-2">
            <Link
              href="/admin/dashboard"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs shadow-md transition-colors"
            >
              Quay lại Bàn làm việc Quản trị
            </Link>
            <p className="text-[11px] text-slate-400">
              Hiện bạn đang đăng nhập với vai trò:{" "}
              <span className="font-semibold text-slate-700">
                {currentUser?.roleLabel || currentUser?.role || "Admin Nghiệp vụ"}
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getModuleBadge = (mod: string) => {
    switch (mod) {
      case "AUTH":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "QUESTIONS":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "ADMIN_UNITS":
        return "bg-sky-50 text-sky-700 border-sky-200";
      case "DUPLICATES":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "ANALYTICS":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "CAMPAIGN":
        return "bg-cyan-50 text-cyan-700 border-cyan-200";
      case "SYSTEM":
        return "bg-slate-100 text-slate-700 border-slate-300";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
            <CheckCircle2 className="w-3 h-3" /> Thành công
          </span>
        );
      case "WARNING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold">
            <AlertTriangle className="w-3 h-3" /> Cảnh báo
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold">
            <XCircle className="w-3 h-3" /> Thất bại
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="h-full flex flex-col p-4 sm:p-5 max-w-7xl w-full mx-auto overflow-hidden gap-3.5">
      {/* 1. HEADER (FIXED SHRINK-0) */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-purple-100 text-purple-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Nhật ký Hệ thống (Audit Logs)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ghi nhận toàn diện lịch sử đăng nhập, truy cập và các thao tác thay đổi dữ liệu trên hệ thống
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchLogs(page)}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-2xs cursor-pointer"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Làm mới</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={!logs.length}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Xuất CSV</span>
          </button>
        </div>
      </div>

      {/* 2. 4 STAT CARDS (FIXED SHRINK-0) */}
      <div className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Tổng số bản ghi log
            </div>
            <div className="text-lg font-black text-slate-900 truncate">
              {stats.totalLogs.toLocaleString("vi-VN")}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 shrink-0">
            <LogIn className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Đăng nhập hôm nay
            </div>
            <div className="text-lg font-black text-purple-800 truncate">
              {stats.totalLoginsToday.toLocaleString("vi-VN")}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Thao tác thay đổi
            </div>
            <div className="text-lg font-black text-indigo-800 truncate">
              {stats.totalMutations.toLocaleString("vi-VN")}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Độ tin cậy & Thành công
            </div>
            <div className="text-lg font-black text-emerald-700 truncate">
              {stats.successRate}%
            </div>
          </div>
        </div>
      </div>

      {/* 3. FILTER TOOLBAR (FIXED SHRINK-0) */}
      <div className="shrink-0 bg-white rounded-2xl border border-slate-200/80 p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px] flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tài khoản, người dùng, IP, nội dung thao tác..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent bg-slate-50/50"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Tìm kiếm
          </button>
        </form>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-400 uppercase font-bold">Phân hệ:</span>
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-600"
            >
              <option value="ALL">Tất cả phân hệ</option>
              <option value="AUTH">Xác thực & Phiên làm việc (AUTH)</option>
              <option value="QUESTIONS">Bộ Câu hỏi (QUESTIONS)</option>
              <option value="ADMIN_UNITS">Đơn vị hành chính (ADMIN_UNITS)</option>
              <option value="DUPLICATES">Rà soát nghi trùng (DUPLICATES)</option>
              <option value="ANALYTICS">Báo cáo & Xuất Excel (ANALYTICS)</option>
              <option value="CAMPAIGN">Đợt khảo sát & QR (CAMPAIGN)</option>
              <option value="SYSTEM">Hệ thống (SYSTEM)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <span className="text-[11px] text-slate-400 uppercase font-bold">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-600"
            >
              <option value="ALL">Tất cả</option>
              <option value="SUCCESS">Thành công</option>
              <option value="WARNING">Cảnh báo</option>
              <option value="FAILED">Thất bại</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. MAIN DATA WORKSPACE (FLEX-1 MIN-H-0 OVERFLOW-HIDDEN) */}
      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col overflow-hidden">
        {/* Scrollable Table Area */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-100/95 backdrop-blur-xs text-slate-700 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200 z-10">
              <tr>
                <th className="py-2.5 px-3 whitespace-nowrap">Thời gian</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Người thao tác</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Phân hệ</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Hành động</th>
                <th className="py-2.5 px-3">Chi tiết & Mô tả</th>
                <th className="py-2.5 px-3 whitespace-nowrap">IP & Thiết bị</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-center">Trạng thái</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Xem chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mb-2" />
                    <div>Đang nạp nhật ký hệ thống...</div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <div className="font-semibold text-slate-600">Không tìm thấy bản ghi nhật ký phù hợp</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Thử điều chỉnh lại bộ lọc hoặc từ khóa tìm kiếm</div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Thời gian */}
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-600">
                      <div className="font-mono text-[11px] font-semibold text-slate-800">
                        {new Date(log.createdAt).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(log.createdAt).toLocaleDateString("vi-VN")}
                      </div>
                    </td>

                    {/* Người thao tác */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{log.userFullName || log.username}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-slate-400 font-mono">@{log.username}</span>
                        {log.userRole && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-extrabold bg-slate-100 text-slate-600">
                            {log.userRole}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Phân hệ */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${getModuleBadge(
                          log.module
                        )}`}
                      >
                        {log.module}
                      </span>
                    </td>

                    {/* Hành động */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="font-mono text-[11px] font-bold text-slate-700">
                        {log.action}
                      </div>
                      {log.targetResource && (
                        <div className="text-[10px] text-slate-400 truncate max-w-[140px]" title={log.targetResource}>
                          Mục tiêu: {log.targetResource}
                        </div>
                      )}
                    </td>

                    {/* Mô tả */}
                    <td className="py-2.5 px-3 text-slate-700">
                      <p className="line-clamp-2 text-xs leading-relaxed max-w-md">
                        {log.description}
                      </p>
                    </td>

                    {/* IP & Thiết bị */}
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      <div>{log.ipAddress || "127.0.0.1"}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[120px]" title={log.userAgent}>
                        {log.userAgent ? log.userAgent.substring(0, 24) + "..." : "Web Client"}
                      </div>
                    </td>

                    {/* Trạng thái */}
                    <td className="py-2.5 px-3 whitespace-nowrap text-center">
                      {getStatusBadge(log.status)}
                    </td>

                    {/* Nút Xem chi tiết */}
                    <td className="py-2.5 px-3 whitespace-nowrap text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-sky-700 hover:bg-sky-50 transition-colors cursor-pointer"
                        title="Xem toàn văn bản ghi"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 5. FIXED PAGINATION FOOTER (SHRINK-0) */}
        <div className="shrink-0 p-3 bg-slate-50/90 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
          <div className="text-slate-500">
            Hiển thị <span className="font-bold text-slate-800">{logs.length}</span> /{" "}
            <span className="font-bold text-slate-800">{total}</span> bản ghi (Trang {page} / {totalPages})
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1 || isLoading}
              onClick={() => handlePageChange(page - 1)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 cursor-pointer"
              title="Trang trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 font-bold text-slate-700">
              {page}
            </span>

            <button
              type="button"
              disabled={page >= totalPages || isLoading}
              onClick={() => handlePageChange(page + 1)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 cursor-pointer"
              title="Trang sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 6. MODAL CHI TIẾT BẢN GHI NHẬT KÝ */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="shrink-0 p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Chi tiết Bản ghi Nhật ký</h3>
                  <p className="text-[11px] text-slate-400 font-mono">ID: {selectedLog._id}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Thời gian:</span>
                  <div className="font-semibold text-slate-800 mt-0.5">
                    {new Date(selectedLog.createdAt).toLocaleString("vi-VN")}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Trạng thái:</span>
                  <div className="mt-0.5">{getStatusBadge(selectedLog.status)}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Người thực hiện:</span>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {selectedLog.userFullName || selectedLog.username} (@{selectedLog.username})
                  </div>
                  <div className="text-[10px] text-slate-400">{selectedLog.userRole || "Chưa gán vai trò"}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Đơn vị công tác:</span>
                  <div className="font-semibold text-slate-800 mt-0.5">
                    {selectedLog.organization || "Kiểm toán nhà nước"}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Phân hệ:</span>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedLog.module}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Thao tác:</span>
                  <div className="font-mono font-bold text-indigo-700 mt-0.5">{selectedLog.action}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Địa chỉ IP:</span>
                  <div className="font-mono text-slate-700 mt-0.5">{selectedLog.ipAddress || "127.0.0.1"}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Tài nguyên đích:</span>
                  <div className="font-semibold text-slate-800 mt-0.5">
                    {selectedLog.targetResource || "Không xác định"}
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mô tả đầy đủ:</span>
                <div className="mt-1 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-800 leading-relaxed font-medium">
                  {selectedLog.description}
                </div>
              </div>

              {selectedLog.userAgent && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">User-Agent Thiết bị:</span>
                  <div className="mt-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 font-mono text-[10px] text-slate-600 break-all">
                    {selectedLog.userAgent}
                  </div>
                </div>
              )}

              {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dữ liệu chi tiết (Metadata Payload):</span>
                  <pre className="mt-1 p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="shrink-0 p-4 border-t border-slate-100 bg-slate-50/60 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
