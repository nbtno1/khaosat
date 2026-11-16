"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useProgressiveItems } from "@/hooks/useProgressiveItems";
import {
  Users,
  Briefcase,
  AlertOctagon,
  BookOpen,
  GraduationCap,
  Layers,
  RefreshCw,
  Eye,
  EyeOff,
  Download,
  MapPin,
} from "lucide-react";
import { Select } from "@/components/common/Select";

const PROVINCES_34 = [
  { code: "01", name: "TP. Hà Nội" },
  { code: "02", name: "Hà Giang" },
  { code: "04", name: "Cao Bằng" },
  { code: "06", name: "Bắc Kạn" },
  { code: "08", name: "Tuyên Quang" },
  { code: "10", name: "Lào Cai" },
  { code: "11", name: "Điện Biên" },
  { code: "12", name: "Lai Châu" },
  { code: "14", name: "Sơn La" },
  { code: "15", name: "Yên Bái" },
  { code: "17", name: "Hoà Bình" },
  { code: "19", name: "Thái Nguyên" },
  { code: "20", name: "Lạng Sơn" },
  { code: "22", name: "Quảng Ninh" },
  { code: "24", name: "Bắc Giang" },
  { code: "25", name: "Phú Thọ" },
  { code: "26", name: "Vĩnh Phúc" },
  { code: "27", name: "Bắc Ninh" },
  { code: "30", name: "Hải Dương" },
  { code: "31", name: "TP. Hải Phòng" },
  { code: "33", name: "Hưng Yên" },
  { code: "34", name: "Thái Bình" },
  { code: "35", name: "Hà Nam" },
  { code: "36", name: "Nam Định" },
  { code: "37", name: "Ninh Bình" },
  { code: "38", name: "Thanh Hóa" },
  { code: "40", name: "Nghệ An" },
  { code: "42", name: "Hà Tĩnh" },
  { code: "44", name: "Quảng Bình" },
  { code: "45", name: "Quảng Trị" },
  { code: "46", name: "Thừa Thiên Huế" },
  { code: "48", name: "TP. Đà Nẵng" },
  { code: "49", name: "Quảng Nam" },
  { code: "51", name: "Quảng Ngãi" },
];

export const AnalyticsTablesViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("b3");
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSuppressed, setIsSuppressed] = useState<boolean>(false);
  const [selectedProvince, setSelectedProvince] = useState<string>("");

  const fetchTables = async () => {
    setIsLoading(true);
    try {
      const url = `/api/admin/analytics/tables${
        selectedProvince ? `?provinceCode=${selectedProvince}` : ""
      }`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Error loading analytics tables:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, [selectedProvince]);

  // Helper to format cell with suppression (< 5 rule)
  const renderCell = (val: number) => {
    if (isSuppressed && val >= 1 && val < 5) {
      return (
        <span className="text-amber-700 font-semibold italic text-xs">
          dưới 5 - không công bố
        </span>
      );
    }
    return <span>{val}</span>;
  };

  // Progressive rendering hooks: Render tăng dần từng hàng giúp chuyển Tab B1-B6 tức thì (<16ms)
  const b1Rows = useMemo(() => data?.b1?.agencyRows || [], [data?.b1?.agencyRows]);
  const { visibleItems: visibleB1Rows, renderedCount: b1Count, totalCount: b1Total } = useProgressiveItems(b1Rows, {
    initialCount: 6,
    step: 8,
    interval: 16,
    resetKey: activeTab,
  });

  const b2Rows = useMemo(() => data?.b2?.rows || [], [data?.b2?.rows]);
  const { visibleItems: visibleB2Rows, renderedCount: b2Count, totalCount: b2Total } = useProgressiveItems(b2Rows, {
    initialCount: 5,
    step: 6,
    interval: 16,
    resetKey: activeTab,
  });

  const b3Rows = useMemo(() => data?.b3?.rows || [], [data?.b3?.rows]);
  const { visibleItems: visibleB3Rows, renderedCount: b3Count, totalCount: b3Total } = useProgressiveItems(b3Rows, {
    initialCount: 8,
    step: 12,
    interval: 16,
    resetKey: activeTab,
  });

  const b4Rows = useMemo(() => data?.b4?.rows || [], [data?.b4?.rows]);
  const { visibleItems: visibleB4Rows, renderedCount: b4Count, totalCount: b4Total } = useProgressiveItems(b4Rows, {
    initialCount: 10,
    step: 15,
    interval: 16,
    resetKey: activeTab,
  });

  const b5Rows = useMemo(() => data?.b5?.rows || [], [data?.b5?.rows]);
  const { visibleItems: visibleB5Rows, renderedCount: b5Count, totalCount: b5Total } = useProgressiveItems(b5Rows, {
    initialCount: 6,
    step: 8,
    interval: 16,
    resetKey: activeTab,
  });

  const b6Rows = useMemo(() => data?.b6?.rows || [], [data?.b6?.rows]);
  const { visibleItems: visibleB6Rows, renderedCount: b6Count, totalCount: b6Total } = useProgressiveItems(b6Rows, {
    initialCount: 4,
    step: 4,
    interval: 16,
    resetKey: activeTab,
  });

  return (
    <div className="h-full flex flex-col overflow-hidden gap-3.5">
      {/* Header (Cố định ở đỉnh) */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
            6 Bảng Tổng hợp Kết quả Khảo sát
          </h1>
          <p className="text-xs text-slate-500">
            Hệ thống tự động tổng hợp số liệu từ các phản hồi hợp lệ, tính toán khoảng thiếu hụt năng lực theo ma trận chuẩn.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          {/* Lọc theo Tỉnh */}
          <div className="w-44 sm:w-52">
            <Select
              sizeVariant="sm"
              icon={MapPin}
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
            >
              <option value="">Toàn quốc (34 Tỉnh)</option>
              {PROVINCES_34.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Toggle Suppression Mode */}
          <button
            type="button"
            onClick={() => setIsSuppressed(!isSuppressed)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isSuppressed
                ? "bg-amber-50 border-amber-300 text-amber-900 shadow-2xs"
                : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
            }`}
            title="Áp dụng quy tắc bảo vệ dữ liệu nhóm nhỏ (ngưỡng < 5 người)"
          >
            {isSuppressed ? (
              <>
                <EyeOff className="w-4 h-4 text-amber-600" />
                <span>Quy tắc ẩn (&lt;5): BẬT</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 text-slate-500" />
                <span>Quy tắc ẩn (&lt;5): TẮT</span>
              </>
            )}
          </button>

          {/* Export Excel Buttons */}
          <div className="relative inline-flex items-center gap-1.5">
            <a
              href={`/api/admin/export/excel?mode=INTERNAL${selectedProvince ? `&provinceCode=${selectedProvince}` : ""}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-2xs transition-all"
              title="Xuất trọn bộ 6 Sheet Excel bản số liệu đầy đủ cho Kiểm toán nhà nước"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất Excel (Nội bộ)</span>
            </a>
            <a
              href={`/api/admin/export/excel?mode=LOCAL_CONFIDENTIAL${selectedProvince ? `&provinceCode=${selectedProvince}` : ""}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-emerald-600 text-emerald-800 hover:bg-emerald-50 text-xs font-bold shadow-2xs transition-all"
              title="Xuất trọn bộ 6 Sheet Excel đã áp dụng quy tắc ẩn danh số liệu nhỏ <5 người cho địa phương"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất Excel (Địa phương)</span>
            </a>
          </div>

          <button
            type="button"
            onClick={fetchTables}
            disabled={isLoading}
            className="p-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 shadow-2xs cursor-pointer"
            title="Làm mới số liệu"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-sky-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* Tabs Switcher for 6 Tables (Cố định ở đỉnh) */}
      <div className="shrink-0 bg-white p-1.5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-1 overflow-x-auto">
        {[
          { id: "b1", label: "B1. Người trả lời", icon: Users },
          { id: "b2", label: "B2. Nhóm công việc", icon: Briefcase },
          { id: "b3", label: "B3. Khoảng thiếu hụt năng lực", icon: Layers },
          { id: "b4", label: "B4. Nội dung cần học", icon: BookOpen },
          { id: "b5", label: "B5. Khó khăn", icon: AlertOctagon },
          { id: "b6", label: "B6. Hình thức học", icon: GraduationCap },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-sky-700 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area - CUỘN ĐỘC LẬP NỘI BỘ TRONG CONTAINER */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin text-sky-600 mx-auto mb-2" />
            <div>Đang tính toán tổng hợp dữ liệu...</div>
          </div>
        ) : !data ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
            Chưa có dữ liệu khảo sát.
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            {/* BẢNG B1: NGƯỜI TRẢ LỜI */}
            {activeTab === "b1" && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden p-4 sm:p-5 space-y-3">
                <div className="border-b border-slate-100 pb-2.5">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    {data.b1?.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tổng số người được tổng hợp: <strong>{data.b1?.totalIncluded}</strong> | Số phiếu loại: <strong>{data.b1?.totalExcluded}</strong> | Số xã có người trả lời: <strong>{data.b1?.communesCount}</strong>
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                        <th className="p-2.5 border-b">Cơ quan, đơn vị / Vị trí việc làm</th>
                        <th className="p-2.5 border-b text-center">Số người tổng hợp</th>
                        <th className="p-2.5 border-b text-center">Ngoài đối tượng</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {visibleB1Rows.map((ag: any) => (
                        <tr key={ag.agencyCode} className="hover:bg-slate-50">
                          <td className="p-2.5 font-semibold text-slate-900">
                            {ag.agencyName}
                          </td>
                          <td className="p-2.5 text-center font-bold text-sky-800">
                            {renderCell(ag.validCount)}
                          </td>
                          <td className="p-2.5 text-center text-slate-500">
                            {renderCell(ag.outOfScopeCount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {b1Count < b1Total && (
                    <div className="py-2 text-center text-[11px] font-semibold text-slate-400 animate-pulse bg-slate-50/60 border-t border-slate-100">
                      Đang tải {b1Count} / {b1Total} cơ quan...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* BẢNG B2: NHÓM CÔNG VIỆC */}
            {activeTab === "b2" && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden p-4 sm:p-5 space-y-3">
                <div className="border-b border-slate-100 pb-2.5">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    {data.b2?.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mẫu số dòng: Tổng người trong đối tượng = <strong>{data.b2?.denominator}</strong> người. Tổng 4 cột = 100%.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                        <th className="p-2.5 border-b">Nhóm công việc (N01 - N16)</th>
                        <th className="p-2.5 border-b text-center bg-emerald-50 text-emerald-900">
                          Đang thực hiện
                        </th>
                        <th className="p-2.5 border-b text-center bg-amber-50 text-amber-900">
                          Chưa có dịp
                        </th>
                        <th className="p-2.5 border-b text-center bg-blue-50 text-blue-900">
                          Chỉ phối hợp
                        </th>
                        <th className="p-2.5 border-b text-center bg-slate-50 text-slate-800">
                          Không được giao
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {visibleB2Rows.map((row: any) => (
                        <tr key={row.workgroupId} className="hover:bg-slate-50">
                          <td className="p-2.5">
                            <span className="font-bold text-sky-800 mr-2">
                              {row.workgroupId}
                            </span>
                            <span className="text-slate-800 font-medium">
                              {row.workgroupTitle}
                            </span>
                          </td>
                          <td className="p-2.5 text-center bg-emerald-50/40 font-semibold text-emerald-900">
                            {renderCell(row.currentlyDoing.count)} ({row.currentlyDoing.percentage}%)
                          </td>
                          <td className="p-2.5 text-center bg-amber-50/40 text-amber-900">
                            {renderCell(row.assignedNotYet.count)} ({row.assignedNotYet.percentage}%)
                          </td>
                          <td className="p-2.5 text-center bg-blue-50/40 text-blue-900">
                            {renderCell(row.coordinatingOnly.count)} ({row.coordinatingOnly.percentage}%)
                          </td>
                          <td className="p-2.5 text-center bg-slate-50/40 text-slate-700">
                            {renderCell(row.notAssigned.count)} ({row.notAssigned.percentage}%)
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {b2Count < b2Total && (
                    <div className="py-2 text-center text-[11px] font-semibold text-slate-400 animate-pulse bg-slate-50/60 border-t border-slate-100">
                      Đang tải {b2Count} / {b2Total} nhóm công việc...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* BẢNG B3: KHOẢNG THIẾU HỤT NĂNG LỰC (TRỌNG TÂM) */}
            {activeTab === "b3" && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden p-4 sm:p-5 space-y-3">
                <div className="border-b border-slate-100 pb-2.5 space-y-1">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    {data.b3?.title}
                  </h3>
                  <p className="text-xs text-sky-800 font-semibold italic bg-sky-50 p-2 rounded-lg border border-sky-100">
                    *{data.b3?.subtitle}*
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                        <th className="p-2.5 border-b">Nhóm x Vai trò</th>
                        <th className="p-2.5 border-b text-center">Mẫu số</th>
                        <th className="p-2.5 border-b text-center">Mức 1</th>
                        <th className="p-2.5 border-b text-center">Mức 2</th>
                        <th className="p-2.5 border-b text-center">Mức 3</th>
                        <th className="p-2.5 border-b text-center">Mức 4</th>
                        <th className="p-2.5 border-b text-center bg-sky-100 text-sky-900">
                          Mức chuẩn (Req)
                        </th>
                        <th className="p-2.5 border-b text-center bg-rose-100 text-rose-900">
                          Dưới chuẩn
                        </th>
                        <th className="p-2.5 border-b text-center">Thiếu 1 mức</th>
                        <th className="p-2.5 border-b text-center">Thiếu 2 mức</th>
                        <th className="p-2.5 border-b text-center">Thiếu 3 mức</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {visibleB3Rows.map((row: any, rIdx: number) => {
                        if (row.isAssignedNotYetRow) {
                          return (
                            <tr key={rIdx} className="bg-amber-50/50 italic text-amber-900">
                              <td className="p-2.5 font-medium pl-6">
                                — Người chưa có dịp thực hiện
                              </td>
                              <td className="p-2.5 text-center font-bold">
                                {renderCell(row.denominator)}
                              </td>
                              <td colSpan={9} className="p-2.5 text-center text-slate-400">
                                (Tính riêng theo quy cách B3)
                              </td>
                            </tr>
                          );
                        }

                        return (
                          <tr key={rIdx} className="hover:bg-slate-50">
                            <td className="p-2.5">
                              <span className="font-bold text-sky-800 mr-1.5">
                                {row.workgroupId}
                              </span>
                              <span className="font-semibold text-slate-800">
                                {row.roleId === "DIRECT" && "Trực tiếp thực hiện"}
                                {row.roleId === "ADVISORY" && "Tham mưu"}
                                {row.roleId === "SUPERVISORY" && "Kiểm tra, giám sát"}
                                {row.roleId === "APPROVAL" && "Quyết định, phê duyệt"}
                              </span>
                            </td>
                            <td className="p-2.5 text-center font-bold">
                              {renderCell(row.denominator)}
                            </td>
                            <td className="p-2.5 text-center">
                              {renderCell(row.level1.count)} ({row.level1.percentage}%)
                            </td>
                            <td className="p-2.5 text-center">
                              {renderCell(row.level2.count)} ({row.level2.percentage}%)
                            </td>
                            <td className="p-2.5 text-center">
                              {renderCell(row.level3.count)} ({row.level3.percentage}%)
                            </td>
                            <td className="p-2.5 text-center">
                              {renderCell(row.level4.count)} ({row.level4.percentage}%)
                            </td>
                            <td className="p-2.5 text-center bg-sky-50 font-bold text-sky-900">
                              {row.requiredLevel ? `Mức ${row.requiredLevel}` : "—"}
                            </td>
                            <td className="p-2.5 text-center bg-rose-50 font-bold text-rose-700">
                              {row.hasBenchmark ? (
                                <>
                                  {renderCell(row.deficient.count)} ({row.deficient.percentage}%)
                                </>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className="p-2.5 text-center text-slate-600">
                              {row.hasBenchmark ? renderCell(row.gap1.count) : "—"}
                            </td>
                            <td className="p-2.5 text-center text-slate-600">
                              {row.hasBenchmark ? renderCell(row.gap2.count) : "—"}
                            </td>
                            <td className="p-2.5 text-center text-slate-600">
                              {row.hasBenchmark ? renderCell(row.gap3.count) : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {b3Count < b3Total && (
                    <div className="py-2 text-center text-[11px] font-semibold text-slate-400 animate-pulse bg-slate-50/60 border-t border-slate-100">
                      Đang tải {b3Count} / {b3Total} hàng chỉ số...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* BẢNG B4: NỘI DUNG CẦN HỌC */}
            {activeTab === "b4" && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden p-4 sm:p-5 space-y-3">
                <div className="border-b border-slate-100 pb-2.5">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    {data.b4?.title}
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-100 text-slate-700 font-bold uppercase text-[10px] shadow-2xs">
                      <tr>
                        <th className="p-2.5 border-b">Nhóm & Chuyên đề học</th>
                        <th className="p-2.5 border-b text-center">Tổng người chọn</th>
                        <th className="p-2.5 border-b text-center bg-emerald-50">Đang làm</th>
                        <th className="p-2.5 border-b text-center bg-amber-50">Chưa có dịp</th>
                        <th className="p-2.5 border-b text-center bg-rose-50">Cần học ngay (6T)</th>
                        <th className="p-2.5 border-b text-center">Trong năm</th>
                        <th className="p-2.5 border-b text-center">Sau 1 năm</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {visibleB4Rows.map((row: any) => (
                        <tr key={row.topicId} className="hover:bg-slate-50">
                          <td className="p-2.5">
                            <span className="font-bold text-sky-800 mr-2">
                              {row.workgroupId}
                            </span>
                            <span className="text-slate-800">{row.topicTitle}</span>
                          </td>
                          <td className="p-2.5 text-center font-bold text-sky-900">
                            {renderCell(row.totalSelected)}
                          </td>
                          <td className="p-2.5 text-center bg-emerald-50/40">
                            {renderCell(row.currentlyDoingCount)}
                          </td>
                          <td className="p-2.5 text-center bg-amber-50/40">
                            {renderCell(row.assignedNotYetCount)}
                          </td>
                          <td className="p-2.5 text-center bg-rose-50/40 font-bold text-rose-700">
                            {renderCell(row.urgent6mCount)}
                          </td>
                          <td className="p-2.5 text-center">{renderCell(row.withinYearCount)}</td>
                          <td className="p-2.5 text-center">{renderCell(row.after1yCount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {b4Count < b4Total && (
                    <div className="py-2 text-center text-[11px] font-semibold text-slate-400 animate-pulse bg-slate-50/60 border-t border-slate-100">
                      Đang tải {b4Count} / {b4Total} chuyên đề...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* BẢNG B5: KHÓ KHĂN */}
            {activeTab === "b5" && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden p-4 sm:p-5 space-y-3">
                <div className="border-b border-slate-100 pb-2.5">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    {data.b5?.title}
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-100 text-slate-700 font-bold uppercase text-[10px] shadow-2xs">
                      <tr>
                        <th className="p-2.5 border-b">Nhóm công việc</th>
                        <th className="p-2.5 border-b">Khó khăn</th>
                        <th className="p-2.5 border-b text-center">Phân loại</th>
                        <th className="p-2.5 border-b text-center">Số người chọn</th>
                        <th className="p-2.5 border-b text-center">Tỷ lệ (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {visibleB5Rows.map((row: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-semibold text-sky-800">
                            {row.workgroupId} - {row.workgroupTitle}
                          </td>
                          <td className="p-2.5 text-slate-800">{row.difficultyTitle}</td>
                          <td className="p-2.5 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                row.category === "DAO_TAO"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : row.category === "NGOAI_DAO_TAO"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {row.category === "DAO_TAO"
                                ? "Đào tạo"
                                : row.category === "NGOAI_DAO_TAO"
                                ? "Ngoài đào tạo"
                                : "Không khó khăn"}
                            </span>
                          </td>
                          <td className="p-2.5 text-center font-bold">
                            {renderCell(row.count)}
                          </td>
                          <td className="p-2.5 text-center font-semibold text-slate-700">
                            {row.percentage}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {b5Count < b5Total && (
                    <div className="py-2 text-center text-[11px] font-semibold text-slate-400 animate-pulse bg-slate-50/60 border-t border-slate-100">
                      Đang tải {b5Count} / {b5Total} mục khó khăn...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* BẢNG B6: HÌNH THỨC HỌC */}
            {activeTab === "b6" && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden p-4 sm:p-5 space-y-3">
                <div className="border-b border-slate-100 pb-2.5">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    {data.b6?.title}
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                        <th className="p-2.5 border-b">Hình thức đào tạo, bồi dưỡng</th>
                        <th className="p-2.5 border-b text-center">Mẫu số tổng hợp</th>
                        <th className="p-2.5 border-b text-center">Số người lựa chọn</th>
                        <th className="p-2.5 border-b text-center">Tỷ lệ (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {visibleB6Rows.map((row: any) => (
                        <tr key={row.formatId} className="hover:bg-slate-50">
                          <td className="p-2.5 font-semibold text-slate-800">
                            {row.formatTitle}
                          </td>
                          <td className="p-2.5 text-center font-medium text-slate-500">
                            {renderCell(row.denominator)}
                          </td>
                          <td className="p-2.5 text-center font-bold text-sky-800">
                            {renderCell(row.count)}
                          </td>
                          <td className="p-2.5 text-center font-bold text-slate-700">
                            {row.percentage}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {b6Count < b6Total && (
                    <div className="py-2 text-center text-[11px] font-semibold text-slate-400 animate-pulse bg-slate-50/60 border-t border-slate-100">
                      Đang tải {b6Count} / {b6Total} hình thức học...
                    </div>
                  )}
                </div>

                {/* Giới hạn dữ liệu cố định */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                  <div className="font-bold text-slate-800 uppercase tracking-wide text-[10px]">
                    Giới hạn dữ liệu cố định (Spec 02):
                  </div>
                  {data.b6?.limitations?.map((lim: string, idx: number) => (
                    <p key={idx} className="text-[11px]">• {lim}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
