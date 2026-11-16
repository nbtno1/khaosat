"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Building2,
  TrendingUp,
  Download,
  ExternalLink,
  Search,
  Filter,
  RefreshCw,
  Layers,
  Table as TableIcon,
  BarChart3,
  Columns,
} from "lucide-react";
import { ProgressCharts } from "@/components/admin/ProgressCharts";
import { ProgressSummary, ProvinceProgressItem } from "@/services/progress-monitoring.service";
import { Select } from "@/components/common/Select";

export default function AdminDashboardPage() {
  const [data, setData] = useState<ProgressSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"TABLE" | "CHARTS" | "SPLIT">("TABLE");

  const fetchProgress = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/progress");
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Error fetching progress data:", err);
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

  return (
    <div className="h-full flex flex-col p-4 sm:p-5 max-w-7xl w-full mx-auto overflow-hidden gap-3.5">
      {/* 1. Page Header (Cố định ở đỉnh, không scroll) */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
            Dashboard Tổng quan & Theo dõi Tiến độ
          </h1>
          <p className="text-xs text-slate-500">
            Theo dõi diện rộng tiến độ tiếp nhận phiếu khảo sát tại 34 tỉnh, thành phố và 3.321 xã/phường trên toàn quốc.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Link
            href="/admin/campaigns"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-all"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>34 Mã QR Cấp Tỉnh</span>
          </Link>

          <button
            type="button"
            onClick={fetchProgress}
            disabled={isLoading}
            className="p-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 shadow-2xs cursor-pointer"
            title="Làm mới tiến độ"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-sky-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* 2. Bốn Thẻ KPI Tóm Tắt (Cố định ở trên, không scroll) */}
      <div className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Card 1: Tổng số phiếu */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Tổng số phiếu đã nộp
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              {(data?.totalSubmissions || 0).toLocaleString()}
            </div>
            <div className="text-[10px] font-semibold text-sky-700 mt-0.5">
              Đạt {data?.nationalCompletionRate || 0}% chỉ tiêu toàn quốc
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold shrink-0">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Phiếu hợp lệ */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Phiếu hợp lệ (Tính)
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-0.5">
              {(data?.totalValid || 0).toLocaleString()}
            </div>
            <div className="text-[10px] font-semibold text-emerald-600 mt-0.5">
              Được đưa vào tính 6 bảng tổng hợp
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Nghi trùng cần rà soát */}
        <Link
          href="/admin/reviews/duplicates"
          className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between hover:border-amber-400 hover:shadow-xs transition-all group"
        >
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Nghi trùng chờ thẩm tra
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-700 mt-0.5">
              {(data?.totalPendingReview || 0).toLocaleString()}
            </div>
            <div className="text-[10px] font-bold text-amber-600 mt-0.5 flex items-center gap-1 group-hover:underline">
              <span>Mở bàn rà soát</span>
              <span>→</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </Link>

        {/* Card 4: Số xã tham gia */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Địa bàn cấp xã đã nộp
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              {(data?.totalCommunesSurveyed || 0).toLocaleString()}
            </div>
            <div className="text-[10px] font-semibold text-slate-500 mt-0.5">
              Trên tổng số 3.321 xã cả nước
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center font-bold shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Data Workspace Card: Chiếm trọn không gian còn lại (flex-1 min-h-0), cuộn độc lập nội bộ */}
      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col overflow-hidden">
        {/* Workspace Toolbar (Cố định ở đỉnh của Card) */}
        <div className="shrink-0 px-4 py-2.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50/70">
          {/* View Mode Tabs Switcher */}
          <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode("TABLE")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "TABLE"
                  ? "bg-white text-sky-800 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Bảng Tiến độ ({filteredProvinces.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("CHARTS")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "CHARTS"
                  ? "bg-white text-sky-800 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Biểu đồ Phân tích</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("SPLIT")}
              className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "SPLIT"
                  ? "bg-white text-sky-800 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Bố cục Song song</span>
            </button>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm tỉnh hoặc mã..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              />
            </div>

            <div className="w-40 sm:w-48">
              <Select
                sizeVariant="sm"
                icon={Filter}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="COMPLETED">Đạt chỉ tiêu (&gt;=100%)</option>
                <option value="IN_PROGRESS">Đang thu thập</option>
                <option value="NOT_STARTED">Chưa có phiếu</option>
              </Select>
            </div>
          </div>
        </div>

        {/* Workspace Body: Nơi cuộn dữ liệu nội bộ (Bảng hoặc Biểu đồ) */}
        {viewMode === "TABLE" && (
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-100/95 backdrop-blur-xs z-10 text-slate-700 font-bold border-b border-slate-200 shadow-2xs">
                <tr>
                  <th className="py-2.5 px-4 w-12 text-center">STT</th>
                  <th className="py-2.5 px-4 w-20">Mã tỉnh</th>
                  <th className="py-2.5 px-4">Tên Tỉnh / Thành phố</th>
                  <th className="py-2.5 px-4 text-center">Số xã đã nộp</th>
                  <th className="py-2.5 px-4 text-center">Số phiếu thu thập</th>
                  <th className="py-2.5 px-4 text-center">Chỉ tiêu</th>
                  <th className="py-2.5 px-4 w-44">Tiến độ hoàn thành</th>
                  <th className="py-2.5 px-4 text-center">Trạng thái</th>
                  <th className="py-2.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredProvinces.map((prov, idx) => (
                  <tr key={prov.provinceCode} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4 text-center text-slate-400 font-bold">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-mono font-bold text-sky-800">{prov.provinceCode}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">{prov.provinceName}</td>
                    <td className="py-2.5 px-4 text-center font-bold text-slate-700">
                      {prov.communesSurveyed} xã
                    </td>
                    <td className="py-2.5 px-4 text-center font-bold text-sky-900">
                      {prov.totalSubmissions}
                    </td>
                    <td className="py-2.5 px-4 text-center text-slate-500 font-semibold">
                      {prov.targetRespondents}
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              prov.completionRate >= 100
                                ? "bg-emerald-500"
                                : prov.completionRate > 50
                                ? "bg-sky-500"
                                : "bg-amber-400"
                            }`}
                            style={{ width: `${Math.min(100, prov.completionRate)}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-700 w-10 text-right">
                          {prov.completionRate}%
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      {prov.status === "COMPLETED" ? (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Đạt chỉ tiêu
                        </span>
                      ) : prov.status === "IN_PROGRESS" ? (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                          Đang làm
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                          Chưa nộp
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          href={`/admin/analytics?provinceCode=${prov.provinceCode}`}
                          className="p-1.5 text-slate-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors"
                          title="Xem 6 Bảng tổng hợp của tỉnh này"
                        >
                          <Layers className="w-4 h-4" />
                        </Link>
                        <a
                          href={`/khao-sat/${prov.surveyToken}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Mở form khảo sát trực tiếp"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {viewMode === "CHARTS" && (
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5">
            {data ? (
              <ProgressCharts
                dailyTimeline={data.dailyTimeline}
                topProvinces={data.topProvinces}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                Đang tải dữ liệu biểu đồ...
              </div>
            )}
          </div>
        )}

        {viewMode === "SPLIT" && (
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 overflow-hidden">
            {/* Cột trái: Biểu đồ cuộn độc lập */}
            <div className="lg:col-span-5 h-full overflow-y-auto pr-1">
              {data && (
                <ProgressCharts
                  dailyTimeline={data.dailyTimeline}
                  topProvinces={data.topProvinces}
                />
              )}
            </div>

            {/* Cột phải: Bảng tiến độ cuộn độc lập */}
            <div className="lg:col-span-7 h-full flex flex-col border border-slate-200/80 rounded-xl overflow-hidden">
              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-slate-100 z-10 text-slate-700 font-bold border-b border-slate-200 shadow-2xs">
                    <tr>
                      <th className="py-2 px-3 w-10 text-center">STT</th>
                      <th className="py-2 px-3">Tỉnh / Thành phố</th>
                      <th className="py-2 px-3 text-center">Số phiếu</th>
                      <th className="py-2 px-3 w-32">Tiến độ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProvinces.map((prov, idx) => (
                      <tr key={prov.provinceCode} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 px-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                        <td className="py-2 px-3 font-bold text-slate-900">{prov.provinceName}</td>
                        <td className="py-2 px-3 text-center font-bold text-sky-900">
                          {prov.totalSubmissions}
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1.5">
                            <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-sky-600 h-full rounded-full"
                                style={{ width: `${Math.min(100, prov.completionRate)}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-600 w-8 text-right">
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
