"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Printer,
  Search,
  Smartphone,
  ShieldCheck,
  Users,
  QrCode,
  FileCheck2,
  Layers,
  FileSpreadsheet,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  EyeOff,
  HelpCircle,
  Server,
  Lock,
  Sparkles,
  Edit3,
  Save,
  RefreshCw,
  ExternalLink,
  Code,
  Check,
} from "lucide-react";
import { DynamicGuideData, SoftwareModuleGuide } from "@/services/system-guide.service";

export default function UserGuidePage() {
  const [guideData, setGuideData] = useState<DynamicGuideData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeAudience, setActiveAudience] = useState<"ADMIN_OPERATOR" | "SURVEY_RESPONDENT">("ADMIN_OPERATOR");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSection, setExpandedSection] = useState<string | null>("sec_modules");
  const [selectedModuleId, setSelectedModuleId] = useState<string>("public_survey");
  
  // Note editing state for admins
  const [editingSectionKey, setEditingSectionKey] = useState<string | null>(null);
  const [editNoteText, setEditNoteText] = useState<string>("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const fetchGuideData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/public/guide");
      const json = await res.json();
      if (json.success && json.data) {
        setGuideData(json.data);
      }
    } catch (err) {
      console.error("Lỗi tải hướng dẫn động:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGuideData();
  }, []);

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleStartEdit = (key: string, currentText: string) => {
    setEditingSectionKey(key);
    setEditNoteText(currentText || "");
    setSaveSuccessMsg(null);
  };

  const handleSaveNote = async (key: string) => {
    setIsSavingNote(true);
    try {
      const res = await fetch(`/api/admin/guide/sections/${key}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: editNoteText }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccessMsg("Đã lưu ghi chú thành công!");
        setEditingSectionKey(null);
        fetchGuideData();
        setTimeout(() => setSaveSuccessMsg(null), 3000);
      } else {
        alert(data.error || "Không thể lưu ghi chú");
      }
    } catch {
      alert("Lỗi kết nối khi lưu ghi chú");
    } finally {
      setIsSavingNote(false);
    }
  };

  const filteredModules = (guideData?.modules || []).filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.route.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-900 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-sky-700" />
            <span>CẨM NANG VẬN HÀNH CẬP NHẬT ĐỘNG THEO PHẦN MỀM (ADR-010)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Hướng dẫn Sử dụng & Vận hành Phần mềm
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Nội dung được hệ thống tự động đồng bộ hóa thời gian thực theo cấu hình Schema {guideData?.schemaMeta.version || "3.3"} và các chức năng đang kích hoạt.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchGuideData}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 shadow-sm transition-all"
            title="Đồng bộ hóa dữ liệu hướng dẫn mới nhất từ hệ thống"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-sky-600" : ""}`} />
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-sm transition-all"
            title="In cẩm nang hoặc lưu dưới dạng file PDF"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>In / Lưu PDF</span>
          </button>
        </div>
      </div>

      {/* Dynamic Status Meta Banner */}
      {guideData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 p-4 rounded-3xl text-white shadow-md">
          <div className="border-r border-slate-800 pr-3">
            <div className="text-[10px] uppercase font-bold text-sky-400">Bộ tiêu chuẩn</div>
            <div className="text-base font-black text-white mt-0.5">
              Phiên bản {guideData.schemaMeta.version}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">
              {guideData.schemaMeta.totalWorkgroups} nhóm việc · {guideData.schemaMeta.totalRoles} vai trò
            </div>
          </div>

          <div className="border-r border-slate-800 pr-3">
            <div className="text-[10px] uppercase font-bold text-sky-400">Đợt khảo sát</div>
            <div className="text-base font-black text-white mt-0.5 truncate">
              {guideData.campaignMeta.code}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {guideData.campaignMeta.participatingProvincesCount} tỉnh · Mục tiêu {guideData.campaignMeta.totalNationalTarget.toLocaleString()}
            </div>
          </div>

          <div className="border-r border-slate-800 pr-3">
            <div className="text-[10px] uppercase font-bold text-sky-400">Phân hệ chức năng</div>
            <div className="text-base font-black text-emerald-400 mt-0.5">
              {guideData.modules.length} Modules
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Đang trực tuyến 100%</div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-sky-400">Trạng thái đồng bộ</div>
            <div className="text-base font-black text-sky-200 mt-0.5">Thời gian thực</div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {new Date(guideData.lastGeneratedAt).toLocaleTimeString("vi-VN")}
            </div>
          </div>
        </div>
      )}

      {saveSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2 text-xs font-bold animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Role / Audience Switcher */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveAudience("ADMIN_OPERATOR")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeAudience === "ADMIN_OPERATOR"
                ? "bg-sky-700 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Phân hệ Quản trị & Thao tác Chức năng (Admin)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAudience("SURVEY_RESPONDENT")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeAudience === "SURVEY_RESPONDENT"
                ? "bg-sky-700 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Hướng dẫn Điền Phiếu Khảo sát (Cấp Xã)</span>
          </button>
        </div>

        {/* Quick Search in Manual */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm module hoặc chức năng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: PHÂN HỆ QUẢN TRỊ & THAO TÁC CHỨC NĂNG (ADMIN PORTAL)           */}
      {/* ========================================================================= */}
      {activeAudience === "ADMIN_OPERATOR" && guideData && (
        <div className="space-y-6">
          {/* 1. Dynamic Modules Explorer (Cập nhật động theo phần mềm) */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 text-sky-800">
                  DYNAMIC MODULES DISCOVERY
                </span>
                <h2 className="text-base font-extrabold text-slate-900 mt-1">
                  1. Hướng dẫn Thao tác Từng Chức năng Đang Vận hành ({filteredModules.length} Modules)
                </h2>
                <p className="text-xs text-slate-500">
                  Mỗi chức năng được hệ thống tự động bóc tách phạm vi quyền hạn, đường dẫn và quy tắc vận hành
                </p>
              </div>

              {/* Module Quick Pill Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1">
                {guideData.modules.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedModuleId(m.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedModuleId === m.id
                        ? "bg-sky-700 text-white shadow-sm"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {m.name.split("(")[0].trim()}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Module Detail View */}
            {(() => {
              const activeMod = guideData.modules.find((m) => m.id === selectedModuleId) || guideData.modules[0];
              if (!activeMod) return null;

              return (
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200">
                          {activeMod.route}
                        </span>
                        <a
                          href={activeMod.route.replace("[token]", "pilot_dot-1-2026_p20")}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-sky-600 hover:text-sky-800 font-semibold"
                        >
                          <span>Mở trực tiếp</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      <h3 className="text-lg font-black text-slate-900">{activeMod.name}</h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {activeMod.description}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 lg:w-80 shrink-0 space-y-2">
                      <div className="text-[10px] font-bold uppercase text-slate-400">
                        Vai trò được phép truy cập
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {activeMod.allowedRoles.map((role, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-800 shadow-2xs"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {/* Key capabilities */}
                    <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-2">
                      <div className="font-bold text-sky-950 text-xs sm:text-sm flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-sky-700" />
                        <span>Các Thao tác & Năng lực Cốt lõi</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {activeMod.keyCapabilities.map((cap, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-600 shrink-0 mt-1.5" />
                            <span>{cap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Operational rules */}
                    <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 space-y-2">
                      <div className="font-bold text-amber-950 text-xs sm:text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>Ràng buộc Nghiệp vụ & Cảnh báo</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {activeMod.operationalRules.map((rule, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 mt-1.5" />
                            <span>{rule}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* API Endpoints */}
                  <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      Giao diện Lập trình (REST API Endpoints):
                    </div>
                    {activeMod.apiEndpoints.map((ep, i) => (
                      <div key={i} className="text-sky-400">{ep}</div>
                    ))}
                  </div>

                  {/* In-app Note Editing Section */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-800 text-xs flex items-center gap-2">
                        <Edit3 className="w-4 h-4 text-slate-600" />
                        <span>Ghi chú Bổ sung của Ban Chỉ đạo cho Chức năng này</span>
                      </div>
                      {editingSectionKey !== activeMod.id && (
                        <button
                          type="button"
                          onClick={() =>
                            handleStartEdit(
                              activeMod.id,
                              guideData.adminCustomNotes[activeMod.id] || ""
                            )
                          }
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
                        >
                          Sửa ghi chú
                        </button>
                      )}
                    </div>

                    {editingSectionKey === activeMod.id ? (
                      <div className="space-y-2 pt-2">
                        <textarea
                          rows={3}
                          value={editNoteText}
                          onChange={(e) => setEditNoteText(e.target.value)}
                          placeholder="Nhập ghi chú hướng dẫn riêng biệt cho cán bộ sử dụng chức năng này..."
                          className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 bg-white"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSaveNote(activeMod.id)}
                            disabled={isSavingNote}
                            className="px-3.5 py-1.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>{isSavingNote ? "Đang lưu..." : "Lưu vào Database"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingSectionKey(null)}
                            className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors"
                          >
                            Hủy bỏ
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-600 italic">
                        {guideData.adminCustomNotes[activeMod.id] ? (
                          <div className="p-2.5 bg-white rounded-xl border border-slate-200 not-italic text-slate-800 leading-relaxed">
                            {guideData.adminCustomNotes[activeMod.id]}
                          </div>
                        ) : (
                          "Chưa có ghi chú tùy biến từ quản trị viên. Bấm 'Sửa ghi chú' để nhập hướng dẫn bổ sung."
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* 2. Dynamic Schema Explorer (Tự động cập nhật theo cấu hình DB) */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection("sec_schema")}
              className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                  <Code className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    2. Cấu trúc Nghiệp vụ Động: 16 Nhóm Công việc & 4 Vai trò (Phiên bản {guideData.schemaMeta.version})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Cập nhật thời gian thực từ cơ sở dữ liệu SurveySchemaConfig
                  </p>
                </div>
              </div>
              {expandedSection === "sec_schema" ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>

            {expandedSection === "sec_schema" && (
              <div className="p-6 pt-0 border-t border-slate-100 space-y-6 text-xs sm:text-sm">
                <div>
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm mb-3">
                    Danh sách 16 Nhóm Công việc Cấp Xã & Số Chuyên đề Đào tạo:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {guideData.schemaMeta.workgroups.map((wg) => (
                      <div
                        key={wg.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-sky-800 text-xs bg-sky-50 px-1.5 py-0.5 rounded">
                            {wg.id}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500">
                            {wg.topicsCount} chuyên đề
                          </span>
                        </div>
                        <div className="font-bold text-slate-900 text-xs line-clamp-1">
                          {wg.title}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm mb-3">
                    Mô tả 4 Cấp độ Năng lực theo Ngữ cảnh Từng Vai trò:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {guideData.schemaMeta.roles.map((role) => (
                      <div
                        key={role.id}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2 text-xs"
                      >
                        <div className="font-bold text-slate-900 flex items-center justify-between">
                          <span className="text-sm font-extrabold text-sky-900">{role.title}</span>
                          <span className="font-mono text-[10px] text-slate-400 font-bold bg-white px-2 py-0.5 rounded border">
                            {role.id}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{role.description}</p>
                        <div className="space-y-1 pt-1 font-medium">
                          <div><strong className="text-slate-700">Mức 1:</strong> {role.level1}</div>
                          <div><strong className="text-slate-700">Mức 2:</strong> {role.level2}</div>
                          <div><strong className="text-slate-700">Mức 3:</strong> {role.level3}</div>
                          <div><strong className="text-slate-700">Mức 4:</strong> {role.level4}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: DÀNH CHO CÁN BỘ KHẢO SÁT CẤP XÃ (PUBLIC SURVEY PORTAL)         */}
      {/* ========================================================================= */}
      {activeAudience === "SURVEY_RESPONDENT" && guideData && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
            <div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
                CẨM NANG NGƯỜI TRẢ LỜI CẤP XÃ
              </span>
              <h2 className="text-lg font-black text-slate-900 mt-2">
                Quy trình 4 Bước Tham gia Khảo sát Trực tuyến trên Di động
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Bộ phiếu phiên bản {guideData.schemaMeta.version} gồm {guideData.schemaMeta.totalWorkgroups} nhóm công việc chuẩn hóa. Hệ thống tự động lưu trữ và bảo vệ danh tính 100%.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <span className="w-6 h-6 rounded-lg bg-sky-700 text-white flex items-center justify-center text-xs">1</span>
                  <span>Bước 1: Điền Thông tin Hành chính (Phần I)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Quét mã QR của tỉnh bằng điện thoại hoặc nhấp vào đường link trong công văn. Chọn Tỉnh, Xã, Cơ quan (Đảng ủy, HĐND, UBND...) và chức danh thực tế của bạn.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <span className="w-6 h-6 rounded-lg bg-sky-700 text-white flex items-center justify-center text-xs">2</span>
                  <span>Bước 2: Khai báo {guideData.schemaMeta.totalWorkgroups} Nhóm Công việc (Phần II)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Hệ thống tự động xếp các nhóm công việc thường gặp của chức vụ bạn lên đầu. Chọn 1 trong 4 trạng thái cho từng nhóm việc (Đang làm, Chưa có dịp, Chỉ phối hợp, Không được giao).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <span className="w-6 h-6 rounded-lg bg-sky-700 text-white flex items-center justify-center text-xs">3</span>
                  <span>Bước 3: Tự Đánh giá & Chọn Nhu cầu Học (Phần III)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Lần lượt trả lời từng nhóm được phân công: chọn vai trò → tự chấm điểm năng lực (Mức 1 đến 4) → chọn tối đa 2 khó khăn → chọn chuyên đề học và mức độ cấp thiết.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <span className="w-6 h-6 rounded-lg bg-sky-700 text-white flex items-center justify-center text-xs">4</span>
                  <span>Bước 4: Chọn Hình thức Học & Gửi Phiếu (Phần IV)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Chọn tối đa 2 hình thức học tập phù hợp (trong {guideData.schemaMeta.learningFormats.length} hình thức cho phép), ghi ý kiến tự do (nếu có) và nhấn nút "Gửi kết quả khảo sát".
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1 text-xs">
              <strong className="flex items-center gap-2 text-emerald-800 text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Cam kết Không Thu thập Dữ liệu Nhận dạng Cá nhân (Zero-PII):
              </strong>
              <p className="leading-relaxed text-emerald-900/90">
                Phiếu khảo sát tuyệt đối không yêu cầu khai báo Họ tên, Số điện thoại, Email hay CCCD. Số liệu chỉ phục vụ mục đích xây dựng chương trình bồi dưỡng năng lực công vụ của Kiểm toán nhà nước.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
