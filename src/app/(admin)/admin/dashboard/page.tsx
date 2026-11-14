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
} from "lucide-react";
import { ProgressCharts } from "@/components/admin/ProgressCharts";
import { ProgressSummary, ProvinceProgressItem } from "@/services/progress-monitoring.service";
import { Select } from "@/components/common/Select";

export default function AdminDashboardPage() {
  const [data, setData] = useState<ProgressSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

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
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-900 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-sky-700" />
            <span>TIẾN ĐỘ THỜI GIAN THỰC — BỘ TIÊU CHUẨN 3.3</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Dashboard Tổng quan & Theo dõi Tiến độ
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Theo dõi diện rộng tiến độ tiếp nhận phiếu khảo sát tại 34 tỉnh, thành phố và 3.321 xã/phường trên toàn quốc.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/campaigns"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-sm transition-all"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>34 Mã QR Cấp Tỉnh</span>
          </Link>

          <button
            type="button"
            onClick={fetchProgress}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 shadow-sm"
            title="Làm mới tiến độ"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-sky-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng số phiếu */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tổng số phiếu đã nộp
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {(data?.totalSubmissions || 0).toLocaleString()}
            </div>
            <div className="text-[11px] font-semibold text-sky-700 mt-1">
              Đạt {data?.nationalCompletionRate || 0}% chỉ tiêu toàn quốc
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Phiếu hợp lệ */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Phiếu hợp lệ (Tính)
            </div>
            <div className="text-2xl font-black text-emerald-700 mt-1">
              {(data?.totalValid || 0).toLocaleString()}
            </div>
            <div className="text-[11px] font-semibold text-emerald-600 mt-1">
              Được đưa vào tính 6 bảng tổng hợp
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Nghi trùng cần rà soát */}
        <Link
          href="/admin/reviews/duplicates"
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between hover:border-amber-400 hover:shadow-md transition-all group"
        >
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Nghi trùng chờ thẩm tra
            </div>
            <div className="text-2xl font-black text-amber-700 mt-1">
              {(data?.totalPendingReview || 0).toLocaleString()}
            </div>
            <div className="text-[11px] font-bold text-amber-600 mt-1 flex items-center gap-1 group-hover:underline">
              <span>Mở bàn rà soát ngay</span>
              <span>→</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </Link>

        {/* Card 4: Số xã tham gia */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Địa bàn cấp xã đã nộp
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {(data?.totalCommunesSurveyed || 0).toLocaleString()}
            </div>
            <div className="text-[11px] font-semibold text-slate-500 mt-1">
              Trên tổng số 3.321 xã cả nước
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-700 flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recharts Analytics Charts */}
      {data && (
        <ProgressCharts
          dailyTimeline={data.dailyTimeline}
          topProvinces={data.topProvinces}
        />
      )}

      {/* Detailed Province Progress Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Chi tiết Tiến độ 34 Tỉnh / Thành phố
            </h2>
            <p className="text-xs text-slate-500">
              Theo dõi số lượng phiếu thu thập, số xã tham gia và chỉ tiêu của từng địa phương
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm tỉnh hoặc mã..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Status Filter */}
            <div className="w-48 sm:w-56">
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

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200">
                <th className="py-3.5 px-4 w-12 text-center">STT</th>
                <th className="py-3.5 px-4 w-20">Mã tỉnh</th>
                <th className="py-3.5 px-4">Tên Tỉnh / Thành phố</th>
                <th className="py-3.5 px-4 text-center">Số xã đã nộp</th>
                <th className="py-3.5 px-4 text-center">Số phiếu thu thập</th>
                <th className="py-3.5 px-4 text-center">Chỉ tiêu</th>
                <th className="py-3.5 px-4 w-48">Tiến độ hoàn thành</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredProvinces.map((prov, idx) => (
                <tr key={prov.provinceCode} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 text-center text-slate-400 font-bold">{idx + 1}</td>
                  <td className="py-3 px-4 font-mono font-bold text-sky-800">{prov.provinceCode}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{prov.provinceName}</td>
                  <td className="py-3 px-4 text-center font-bold text-slate-700">
                    {prov.communesSurveyed} xã
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-sky-900">
                    {prov.totalSubmissions}
                  </td>
                  <td className="py-3 px-4 text-center text-slate-500 font-semibold">
                    {prov.targetRespondents}
                  </td>
                  <td className="py-3 px-4">
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
                  <td className="py-3 px-4 text-center">
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
                  <td className="py-3 px-4 text-right">
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
      </div>
    </div>
  );
}
