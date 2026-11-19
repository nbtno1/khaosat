"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Download, Search, RefreshCw } from "lucide-react";
import { ProgressCharts } from "@/components/admin/ProgressCharts";
import { ProgressSummary } from "@/services/progress-monitoring.service";
import { Select } from "@/components/common/Select";

export default function AdminDashboardPage() {
  const [data, setData] = useState<ProgressSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"TABLE" | "CHARTS" | "SPLIT">("TABLE");

  const fetchProgress = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/admin/progress");
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        setErrorMsg(json.error || "Không thể tải dữ liệu tiến độ.");
      }
    } catch (err) {
      console.error("Error fetching progress data:", err);
      setErrorMsg("Lỗi kết nối máy chủ khi tải dữ liệu tiến độ.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const filteredProvinces = (data?.provinces || []).filter((p) => {
    const matchSearch =
      p.provinceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.provinceCode.includes(searchQuery);

    if (statusFilter === "ALL") return matchSearch;
    return matchSearch && p.status === statusFilter;
  });

  const validRate =
    data && data.totalSubmissions > 0
      ? Math.round((data.totalValid / data.totalSubmissions) * 100)
      : 0;
  const ringDash = Math.round((validRate / 100) * 126);

  return (
    <div className="h-full flex flex-col px-5 sm:px-8 pt-5 pb-4 max-w-[1440px] w-full mx-auto overflow-hidden gap-4 sm:gap-5">
      {/* 1. Page Header */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-[24px] sm:text-[28px] font-bold text-[#0e1c2e] tracking-[-0.03em] leading-tight">
            Tổng quan tiến độ khảo sát
          </h1>
          <p className="text-[15px] text-slate-500 mt-1">
            Theo dõi tiếp nhận phiếu tại 34 tỉnh, thành phố và 3.321 xã, phường trên toàn quốc.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-end">
          <Link
            href="/admin/campaigns"
            className="h-[44px] px-4.5 rounded-[10px] civic-btn-primary inline-flex items-center gap-2 text-[15px] font-semibold"
          >
            <Download className="w-[17px] h-[17px]" />
            <span>Tải 34 Mã QR</span>
          </Link>

          <button
            type="button"
            onClick={fetchProgress}
            disabled={isLoading}
            className="w-[44px] h-[44px] rounded-[10px] bg-white border border-slate-300/90 hover:border-slate-400 hover:bg-slate-50 text-slate-700 inline-flex items-center justify-center shadow-xs transition-all cursor-pointer active:scale-95"
            title="Làm mới tiến độ"
            aria-label="Làm mới tiến độ"
          >
            <RefreshCw className={`w-[18px] h-[18px] ${isLoading ? "animate-spin text-[#12457a]" : ""}`} />
          </button>
        </div>
      </div>

      {/* 2. Four Executive KPI Cards with Sleek Micro-Data Visuals */}
      <div className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Phiếu đã tiếp nhận */}
        <div className="civic-kpi relative rounded-[14px] px-5 py-4 flex items-center justify-between gap-3 overflow-hidden">
          <span className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#12457a] to-[#3b82f6]" />
          <div>
            <div className="text-[14.5px] font-semibold text-slate-500">Phiếu đã tiếp nhận</div>
            <div className="text-[32px] sm:text-[36px] font-bold text-[#0e1c2e] leading-tight mt-1 tabular-nums tracking-[-0.03em]">
              {(data?.totalSubmissions || 0).toLocaleString()}
            </div>
          </div>
          <svg className="hidden sm:block shrink-0" width="72" height="40" viewBox="0 0 78 42" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="kpiSpark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M2 34 C14 30, 22 26, 32 22 C44 17, 54 14, 76 6 L76 40 L2 40 Z" fill="url(#kpiSpark)" />
            <path d="M2 34 C14 30, 22 26, 32 22 C44 17, 54 14, 76 6" stroke="#1d4ed8" strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="75" cy="6.5" r="3" fill="#1d4ed8" />
          </svg>
        </div>

        {/* Card 2: Phiếu hợp lệ */}
        <div className="civic-kpi relative rounded-[14px] px-5 py-4 flex items-center justify-between gap-3 overflow-hidden">
          <span className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#157347] to-[#22c55e]" />
          <div>
            <div className="text-[14.5px] font-semibold text-slate-500">Phiếu hợp lệ</div>
            <div className="text-[32px] sm:text-[36px] font-bold text-[#12633c] leading-tight mt-1 tabular-nums tracking-[-0.03em]">
              {(data?.totalValid || 0).toLocaleString()}
            </div>
          </div>
          <svg className="hidden sm:block shrink-0" width="48" height="48" viewBox="0 0 50 50" aria-hidden="true">
            <circle cx="25" cy="25" r="20" fill="none" stroke="#e2f3ea" strokeWidth="5" />
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="#16a34a"
              strokeWidth="5"
              strokeDasharray={`${ringDash} 126`}
              strokeLinecap="round"
              transform="rotate(-90 25 25)"
            />
            <text x="25" y="29" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#12633c">
              {validRate}%
            </text>
          </svg>
        </div>

        {/* Card 3: Cần rà soát trùng */}
        <Link
          href="/admin/reviews/duplicates"
          className="civic-kpi relative rounded-[14px] px-5 py-4 flex items-center justify-between gap-3 overflow-hidden hover:border-amber-400 group"
        >
          <span className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#b45309] to-[#f59e0b]" />
          <div>
            <div className="text-[14.5px] font-semibold text-slate-500 group-hover:text-amber-800 transition-colors">
              Cần rà soát trùng
            </div>
            <div className="text-[32px] sm:text-[36px] font-bold text-[#a14a07] leading-tight mt-1 tabular-nums tracking-[-0.03em]">
              {(data?.totalPendingReview || 0).toLocaleString()}
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-[13px] font-semibold shrink-0">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            {(data?.totalPendingReview || 0) > 0 ? "Chờ duyệt" : "Ổn định"}
          </span>
        </Link>

        {/* Card 4: Xã đã có phiếu */}
        <div className="civic-kpi relative rounded-[14px] px-5 py-4 flex items-center justify-between gap-3 overflow-hidden">
          <span className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#3730a3] to-[#6366f1]" />
          <div>
            <div className="text-[14.5px] font-semibold text-slate-500">Xã đã có phiếu</div>
            <div className="text-[32px] sm:text-[36px] font-bold text-[#0e1c2e] leading-tight mt-1 tabular-nums tracking-[-0.03em]">
              {(data?.totalCommunesSurveyed || 0).toLocaleString()}
              <span className="text-[15px] font-medium text-slate-400 ml-1">/ 3.321</span>
            </div>
          </div>
          <svg className="hidden sm:block shrink-0" width="54" height="34" viewBox="0 0 58 36" aria-hidden="true">
            <rect x="2" y="22" width="7" height="14" rx="2.5" fill="#c7d2fe" />
            <rect x="13" y="16" width="7" height="20" rx="2.5" fill="#a5b4fc" />
            <rect x="24" y="19" width="7" height="17" rx="2.5" fill="#818cf8" />
            <rect x="35" y="10" width="7" height="26" rx="2.5" fill="#6366f1" />
            <rect x="46" y="4" width="7" height="32" rx="2.5" fill="#4338ca" />
          </svg>
        </div>
      </div>

      {/* 3. Data Workspace Panel (Zero-Page-Scroll, internal table scroll) */}
      <div className="flex-1 min-h-0 civic-panel rounded-[16px] flex flex-col overflow-hidden">
        {/* Toolbar with Modern Underline Tabs */}
        <div className="shrink-0 px-5 sm:px-6 min-h-[62px] border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3 py-2 md:py-0 bg-gradient-to-b from-white to-[#fbfcfe]">
          <div className="flex items-center gap-6 h-[46px] md:h-[62px]">
            <button
              type="button"
              onClick={() => setViewMode("TABLE")}
              className={`relative h-full inline-flex items-center text-[15.5px] transition-colors cursor-pointer whitespace-nowrap ${
                viewMode === "TABLE" ? "text-[#0f3d6e] font-bold" : "text-slate-500 font-semibold hover:text-slate-800"
              }`}
            >
              Bảng tiến độ ({filteredProvinces.length})
              {viewMode === "TABLE" && (
                <span className="absolute left-0 right-0 bottom-0 h-[3px] rounded-t-full bg-gradient-to-r from-[#0f3d6e] to-[#2563eb]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setViewMode("CHARTS")}
              className={`relative h-full inline-flex items-center text-[15.5px] transition-colors cursor-pointer whitespace-nowrap ${
                viewMode === "CHARTS" ? "text-[#0f3d6e] font-bold" : "text-slate-500 font-semibold hover:text-slate-800"
              }`}
            >
              Biểu đồ
              {viewMode === "CHARTS" && (
                <span className="absolute left-0 right-0 bottom-0 h-[3px] rounded-t-full bg-gradient-to-r from-[#0f3d6e] to-[#2563eb]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setViewMode("SPLIT")}
              className={`hidden md:inline-flex relative h-full items-center text-[15.5px] transition-colors cursor-pointer whitespace-nowrap ${
                viewMode === "SPLIT" ? "text-[#0f3d6e] font-bold" : "text-slate-500 font-semibold hover:text-slate-800"
              }`}
            >
              Song song
              {viewMode === "SPLIT" && (
                <span className="absolute left-0 right-0 bottom-0 h-[3px] rounded-t-full bg-gradient-to-r from-[#0f3d6e] to-[#2563eb]" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 sm:w-[270px]">
              <Search className="w-[18px] h-[18px] absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm tỉnh, thành phố..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[42px] pl-10 pr-3.5 rounded-[10px] border-[1.5px] border-slate-300 bg-[#f8fafc] hover:bg-white focus:bg-white text-[15px] text-[#0e1c2e] focus:outline-none focus:border-[#12457a] focus:ring-4 focus:ring-[#12457a]/12 transition-all"
              />
            </div>

            <div className="w-48 sm:w-52">
              <Select
                sizeVariant="sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="COMPLETED">Đạt chỉ tiêu</option>
                <option value="IN_PROGRESS">Đang thu thập</option>
                <option value="NOT_STARTED">Chưa có phiếu</option>
              </Select>
            </div>
          </div>
        </div>

        {/* Error / Loading states */}
        {errorMsg && (
          <div className="p-6 text-center text-[15.5px] text-rose-700 bg-rose-50/70 border-b border-rose-200 flex items-center justify-center gap-3">
            <span>{errorMsg}</span>
            <button
              type="button"
              onClick={fetchProgress}
              className="px-3.5 py-1.5 rounded-lg bg-white border border-rose-300 text-rose-800 font-semibold text-[14px] hover:bg-rose-50 cursor-pointer"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* TABLE VIEW */}
        {viewMode === "TABLE" && (
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#f4f7fb] z-10 text-slate-600 text-[14.5px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6 whitespace-nowrap">Tỉnh, thành phố</th>
                  <th className="py-3.5 px-5 text-right whitespace-nowrap">Số xã nộp</th>
                  <th className="py-3.5 px-5 text-right whitespace-nowrap">Phiếu / Chỉ tiêu</th>
                  <th className="py-3.5 px-6 whitespace-nowrap">Tiến độ thu thập</th>
                  <th className="py-3.5 px-5 whitespace-nowrap">Trạng thái</th>
                  <th className="py-3.5 px-6 text-right whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[16px]">
                {filteredProvinces.length === 0 && !isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 text-[15.5px]">
                      Không tìm thấy địa phương nào phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                ) : (
                  filteredProvinces.map((prov) => (
                    <tr
                      key={prov.provinceCode}
                      className="hover:bg-[#f5f9ff] transition-colors duration-150"
                    >
                      <td className="py-3.5 px-6 font-semibold text-[#0e1c2e] whitespace-nowrap">
                        {prov.provinceName}
                      </td>
                      <td className="py-3.5 px-5 text-right tabular-nums text-slate-700 whitespace-nowrap">
                        {prov.communesSurveyed}
                      </td>
                      <td className="py-3.5 px-5 text-right tabular-nums whitespace-nowrap">
                        <strong className="font-semibold text-[#0e1c2e]">{prov.totalSubmissions}</strong>
                        <span className="text-slate-400"> / {prov.targetRespondents}</span>
                      </td>
                      <td className="py-3.5 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-28 bg-[#e8eef5] rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                prov.completionRate >= 100
                                  ? "bg-emerald-600"
                                  : "bg-gradient-to-r from-[#0f3d6e] to-[#2563eb]"
                              }`}
                              style={{ width: `${Math.min(100, prov.completionRate)}%` }}
                            />
                          </div>
                          <span className="text-[15px] font-semibold text-slate-700 w-11 text-right tabular-nums">
                            {prov.completionRate}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        {prov.status === "COMPLETED" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[14px] font-semibold bg-emerald-50 text-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            Đạt chỉ tiêu
                          </span>
                        ) : prov.status === "IN_PROGRESS" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[14px] font-semibold bg-[#e8f2fc] text-[#0f3d6e]">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                            Đang thu thập
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[14px] font-medium bg-slate-100 text-slate-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Chưa có phiếu
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-right whitespace-nowrap text-[15px] font-semibold">
                        <Link
                          href={`/admin/analytics?provinceCode=${prov.provinceCode}`}
                          className="text-[#12457a] hover:underline"
                        >
                          Báo cáo
                        </Link>
                        <span className="mx-2.5 text-slate-300">·</span>
                        <a
                          href={`/khao-sat/${prov.surveyToken}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#12457a] hover:underline"
                        >
                          Mở phiếu
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* CHARTS VIEW */}
        {viewMode === "CHARTS" && (
          <div className="flex-1 min-h-0 overflow-y-auto p-6">
            {data ? (
              <ProgressCharts
                dailyTimeline={data.dailyTimeline}
                topProvinces={data.topProvinces}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-[15.5px]">
                Đang tải dữ liệu biểu đồ...
              </div>
            )}
          </div>
        )}

        {/* SPLIT VIEW */}
        {viewMode === "SPLIT" && (
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-5 p-5 overflow-hidden">
            <div className="lg:col-span-5 h-full overflow-y-auto pr-1">
              {data && (
                <ProgressCharts
                  dailyTimeline={data.dailyTimeline}
                  topProvinces={data.topProvinces}
                />
              )}
            </div>

            <div className="lg:col-span-7 h-full flex flex-col border border-slate-200 rounded-xl overflow-hidden">
              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-[#f4f7fb] z-10 text-slate-600 text-[14.5px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Tỉnh, thành phố</th>
                      <th className="py-3 px-4 text-right">Phiếu</th>
                      <th className="py-3 px-4 w-44">Tiến độ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[15.5px]">
                    {filteredProvinces.map((prov) => (
                      <tr key={prov.provinceCode} className="hover:bg-[#f5f9ff] transition-colors">
                        <td className="py-3 px-4 font-semibold text-[#0e1c2e]">{prov.provinceName}</td>
                        <td className="py-3 px-4 text-right font-semibold text-[#12457a] tabular-nums">
                          {prov.totalSubmissions}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="flex-1 bg-[#e8eef5] rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-[#0f3d6e] to-[#2563eb] h-full rounded-full"
                                style={{ width: `${Math.min(100, prov.completionRate)}%` }}
                              />
                            </div>
                            <span className="text-[14px] font-semibold text-slate-600 w-10 text-right tabular-nums">
                              {prov.completionRate}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
