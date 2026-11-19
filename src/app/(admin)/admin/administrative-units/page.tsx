"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useProgressiveItems } from "@/hooks/useProgressiveItems";
import {
  MapPin,
  Building2,
  Landmark,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Download,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  X,
  FileSpreadsheet,
  Globe,
  SlidersHorizontal,
} from "lucide-react";
import { Select } from "@/components/common/Select";
import {
  AdministrativeOverviewStats,
  ProvinceListItem,
  CommuneListItem,
} from "@/services/administrative-units.service";

export default function AdministrativeUnitsPage() {
  const [activeTab, setActiveTab] = useState<"provinces" | "communes">("provinces");

  // Stats
  const [stats, setStats] = useState<AdministrativeOverviewStats | null>(null);

  // Provinces State
  const [provinces, setProvinces] = useState<ProvinceListItem[]>([]);
  const [provinceSearch, setProvinceSearch] = useState("");
  const [provinceTypeFilter, setProvinceTypeFilter] = useState("ALL");
  const [provinceStatusFilter, setProvinceStatusFilter] = useState("ALL");
  const [isProvincesLoading, setIsProvincesLoading] = useState(false);

  // Progressive rendering hook cho danh sách Tỉnh/Thành
  const { visibleItems: visibleProvinces, renderedCount: provCount, totalCount: provTotal } = useProgressiveItems(provinces, {
    initialCount: 8,
    step: 8,
    interval: 16,
    resetKey: `${activeTab}-${provinceSearch}-${provinceTypeFilter}-${provinceStatusFilter}`,
  });

  // Communes State
  const [communes, setCommunes] = useState<CommuneListItem[]>([]);
  const [selectedProvinceForCommunes, setSelectedProvinceForCommunes] = useState<string>("");
  const [communeSearch, setCommuneSearch] = useState("");
  const [communeTypeFilter, setCommuneTypeFilter] = useState("ALL");
  const [communeStatusFilter, setCommuneStatusFilter] = useState("ALL");
  const [communePage, setCommunePage] = useState(1);
  const [communeTotal, setCommuneTotal] = useState(0);
  const [communeTotalPages, setCommuneTotalPages] = useState(1);
  const [isCommunesLoading, setIsCommunesLoading] = useState(false);

  // Global feedback / toast
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [isSyncing, setIsSyncing] = useState(false);

  // Modal States
  const [editingProvince, setEditingProvince] = useState<Partial<ProvinceListItem> | null>(null);
  const [isProvinceModalOpen, setIsProvinceModalOpen] = useState(false);

  const [editingCommune, setEditingCommune] = useState<Partial<CommuneListItem> | null>(null);
  const [isCommuneModalOpen, setIsCommuneModalOpen] = useState(false);

  // 1. Fetch Stats
  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/administrative-units/stats");
      const json = await res.json();
      if (json.success && json.data) {
        setStats(json.data);
      }
    } catch {
      // Ignored
    }
  };

  // 2. Fetch Provinces
  const fetchProvinces = async () => {
    setIsProvincesLoading(true);
    try {
      const params = new URLSearchParams();
      if (provinceSearch) params.set("search", provinceSearch);
      if (provinceTypeFilter !== "ALL") params.set("type", provinceTypeFilter);
      if (provinceStatusFilter !== "ALL") params.set("status", provinceStatusFilter);

      const res = await fetch(`/api/admin/administrative-units/provinces?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setProvinces(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProvincesLoading(false);
    }
  };

  // 3. Fetch Communes
  const fetchCommunes = async () => {
    setIsCommunesLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedProvinceForCommunes) params.set("provinceCode", selectedProvinceForCommunes);
      if (communeSearch) params.set("search", communeSearch);
      if (communeTypeFilter !== "ALL") params.set("type", communeTypeFilter);
      if (communeStatusFilter !== "ALL") params.set("status", communeStatusFilter);
      params.set("page", communePage.toString());
      params.set("limit", "25");

      const res = await fetch(`/api/admin/administrative-units/communes?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setCommunes(json.data.items);
        setCommuneTotal(json.data.total);
        setCommuneTotalPages(json.data.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCommunesLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchProvinces();
  }, []);

  useEffect(() => {
    fetchProvinces();
  }, [provinceSearch, provinceTypeFilter, provinceStatusFilter]);

  useEffect(() => {
    fetchCommunes();
  }, [selectedProvinceForCommunes, communeSearch, communeTypeFilter, communeStatusFilter, communePage]);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handlers
  const handleSyncSource = async () => {
    if (!confirm("Bạn có chắc chắn muốn đồng bộ lại danh mục gốc từ nguồn chuẩn 34 tỉnh và 3.321 xã/phường?")) {
      return;
    }
    setIsSyncing(true);
    try {
      const res = await fetch("/api/admin/administrative-units/sync", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        showToast(json.message);
        fetchStats();
        fetchProvinces();
        fetchCommunes();
      } else {
        showToast(json.error || "Đồng bộ thất bại", "error");
      }
    } catch {
      showToast("Lỗi kết nối khi đồng bộ danh mục", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleToggleProvinceStatus = async (code: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/administrative-units/provinces/${code}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message);
        fetchProvinces();
        fetchStats();
      } else {
        showToast(json.error || "Không thể cập nhật trạng thái", "error");
      }
    } catch {
      showToast("Lỗi kết nối máy chủ", "error");
    }
  };

  const handleToggleCommuneStatus = async (code: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/administrative-units/communes/${code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message);
        fetchCommunes();
        fetchStats();
      } else {
        showToast(json.error || "Không thể cập nhật trạng thái", "error");
      }
    } catch {
      showToast("Lỗi kết nối máy chủ", "error");
    }
  };

  const handleDeleteCommune = async (code: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa xã/phường: "${name}" (${code})?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/administrative-units/communes/${code}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message);
        fetchCommunes();
        fetchProvinces();
        fetchStats();
      } else {
        showToast(json.error || "Không thể xóa xã/phường", "error");
      }
    } catch {
      showToast("Lỗi kết nối máy chủ", "error");
    }
  };

  const handleSaveProvince = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProvince?.provinceCode || !editingProvince?.name || !editingProvince?.fullName) {
      showToast("Vui lòng điền đủ mã tỉnh, tên và tên đầy đủ", "error");
      return;
    }

    try {
      const res = await fetch("/api/admin/administrative-units/provinces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editingProvince,
          targetRespondents: Number(editingProvince.targetRespondents || 100),
          isActive: editingProvince.isActive ?? true,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message);
        setIsProvinceModalOpen(false);
        setEditingProvince(null);
        fetchProvinces();
        fetchStats();
      } else {
        showToast(json.error || "Không thể lưu tỉnh/thành", "error");
      }
    } catch {
      showToast("Lỗi kết nối máy chủ", "error");
    }
  };

  const handleSaveCommune = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !editingCommune?.communeCode ||
      !editingCommune?.name ||
      !editingCommune?.provinceCode ||
      !editingCommune?.provinceName
    ) {
      showToast("Vui lòng nhập đủ mã xã, tên xã và tỉnh/thành", "error");
      return;
    }

    try {
      const res = await fetch("/api/admin/administrative-units/communes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editingCommune,
          isActive: editingCommune.isActive ?? true,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message);
        setIsCommuneModalOpen(false);
        setEditingCommune(null);
        fetchCommunes();
        fetchProvinces();
        fetchStats();
      } else {
        showToast(json.error || "Không thể lưu xã/phường", "error");
      }
    } catch {
      showToast("Lỗi kết nối máy chủ", "error");
    }
  };

  return (
    <div className="h-full flex flex-col p-4 sm:p-5 max-w-7xl w-full mx-auto overflow-hidden gap-3">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-[15px] font-bold text-white transition-all animate-in slide-in-from-bottom duration-200 ${
            toastMessage.type === "success" ? "bg-emerald-600" : "bg-rose-600"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Page Header (Cố định) */}
      <div className="shrink-0 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] sm:text-[28px] font-bold text-[#0e1c2e] tracking-[-0.03em] leading-snug">
            Quản lý Danh mục Đơn vị Hành chính
          </h1>
          <p className="text-[15px] text-slate-500">
            Cấu hình, tìm kiếm, hiệu chỉnh và phân loại danh mục 34 tỉnh/thành phố và 3.321 xã, phường, đặc khu theo chuẩn Cục Thống kê hiệu lực 2026.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sync Button */}
          <button
            type="button"
            onClick={handleSyncSource}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-[15px] shadow-sm transition-all"
            title="Đồng bộ lại danh mục gốc từ real-provinces.json và real-communes.json"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-sky-600" : "text-slate-500"}`} />
            <span>{isSyncing ? "Đang đồng bộ..." : "Đồng bộ nguồn"}</span>
          </button>

          {/* Export Excel Button */}
          <a
            href={`/api/admin/administrative-units/export?format=excel${
              selectedProvinceForCommunes ? `&provinceCode=${selectedProvinceForCommunes}` : ""
            }`}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[15px] shadow-sm transition-all"
            title="Xuất danh mục ĐVHC ra file Excel .xlsx"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Xuất Excel</span>
          </a>

          {/* Add Province Button */}
          <button
            type="button"
            onClick={() => {
              setEditingProvince({
                provinceCode: "",
                name: "",
                fullName: "",
                type: "Tỉnh",
                targetRespondents: 100,
                isActive: true,
              });
              setIsProvinceModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl civic-btn-primary font-bold text-[15px] shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Tỉnh</span>
          </button>

          {/* Add Commune Button */}
          <button
            type="button"
            onClick={() => {
              const defaultProv = provinces[0];
              setEditingCommune({
                communeCode: "",
                name: "",
                type: "Xã",
                provinceCode: defaultProv?.provinceCode || "01",
                provinceName: defaultProv?.name || "Hà Nội",
                isActive: true,
              });
              setIsCommuneModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[15px] shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Xã/Phường</span>
          </button>
        </div>
      </div>

      {/* 4 Stats Cards (Cố định) */}
      <div className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Card 1: Tổng số Tỉnh */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[15px] font-bold text-slate-500 uppercase tracking-wider">
              Tổng số Tỉnh / Thành phố
            </div>
            <div className="text-[30px] font-bold tabular-nums tracking-[-0.025em] text-slate-900 mt-1">
              {(stats?.totalProvinces || 34).toLocaleString()}
            </div>
            <div className="text-[14px] font-semibold text-sky-700 mt-1">
              {stats?.activeProvinces || 34} tỉnh đang kích hoạt khảo sát
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
            <Landmark className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Tổng số Xã */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[15px] font-bold text-slate-500 uppercase tracking-wider">
              Xã / Phường / Đặc khu
            </div>
            <div className="text-[30px] font-bold tabular-nums tracking-[-0.025em] text-emerald-700 mt-1">
              {(stats?.totalCommunes || 3321).toLocaleString()}
            </div>
            <div className="text-[14px] font-semibold text-emerald-600 mt-1">
              100% địa bàn cấp cơ sở được quản lý
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <MapPin className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Phân loại cấp xã */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[15px] font-bold text-slate-500 uppercase tracking-wider">
              Cơ cấu Đơn vị cấp xã
            </div>
            <div className="text-[15px] font-bold text-slate-800 mt-1 space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Phường: <strong>{stats?.communesByType?.phuong || 709}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Xã: <strong>{stats?.communesByType?.xa || 2599}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Đặc khu: <strong>{stats?.communesByType?.dacKhu || 13}</strong></span>
              </div>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Cơ sở pháp lý & Hiệu lực */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[15px] font-bold text-slate-500 uppercase tracking-wider">
              Căn cứ Pháp lý & Hiệu lực
            </div>
            <div className="text-[16px] font-extrabold text-slate-900 mt-1">
              Hiệu lực năm 2026
            </div>
            <div className="text-[14px] text-slate-500 mt-1 line-clamp-2">
              QĐ 19/2025/QĐ-TTg & các nghị quyết UBTVQH về sắp xếp ĐVHC
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Globe className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tab Navigation Controls (Cố định) */}
      <div className="shrink-0 flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("provinces")}
          className={`flex items-center gap-2 pb-2.5 px-3.5 text-[15px] sm:text-[16px] font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "provinces"
              ? "border-sky-700 text-sky-800"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>Danh mục 34 Tỉnh / Thành phố</span>
          <span className="px-2 py-0.5 rounded-full text-[13.5px] bg-sky-100 text-sky-800 font-extrabold">
            {provinces.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("communes")}
          className={`flex items-center gap-2 pb-2.5 px-3.5 text-[15px] sm:text-[16px] font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "communes"
              ? "border-sky-700 text-sky-800"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Danh mục Xã / Phường / Đặc khu</span>
          <span className="px-2 py-0.5 rounded-full text-[13.5px] bg-emerald-100 text-emerald-800 font-extrabold">
            {communeTotal || 3321}
          </span>
        </button>
      </div>

      {/* ======================= TAB 1: PROVINCES ======================= */}
      {activeTab === "provinces" && (
        <div className="flex-1 min-h-0 bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
          {/* Table Toolbar */}
          <div className="shrink-0 p-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
            <div>
              <h2 className="text-[16px] font-extrabold text-slate-900">
                Danh mục 34 Tỉnh / Thành phố Khảo sát
              </h2>
              <p className="text-[14px] text-slate-500">
                Bấm vào một tỉnh để xem toàn bộ danh sách xã/phường hoặc hiệu chỉnh chỉ tiêu
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tên hoặc mã tỉnh..."
                  value={provinceSearch}
                  onChange={(e) => setProvinceSearch(e.target.value)}
                  className="pl-9 pr-3 min-h-[42px] py-2 rounded-[10px] border-[1.5px] border-slate-300 text-[15px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 w-52 bg-white"
                />
              </div>

              {/* Type filter */}
              <div className="w-36">
                <Select
                  sizeVariant="sm"
                  value={provinceTypeFilter}
                  onChange={(e) => setProvinceTypeFilter(e.target.value)}
                >
                  <option value="ALL">Tất cả loại</option>
                  <option value="Thành phố">Thành phố</option>
                  <option value="Tỉnh">Tỉnh</option>
                </Select>
              </div>

              {/* Status filter */}
              <div className="w-36">
                <Select
                  sizeVariant="sm"
                  value={provinceStatusFilter}
                  onChange={(e) => setProvinceStatusFilter(e.target.value)}
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="ACTIVE">Đang hoạt động</option>
                  <option value="INACTIVE">Tạm dừng</option>
                </Select>
              </div>
            </div>
          </div>

          {/* Provinces Table (Cuộn nội bộ với header sticky) */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
            <table className="w-full text-left text-[15px] border-collapse">
              <thead className="sticky top-0 bg-[#f4f7fb] z-10 text-slate-700 font-bold border-b border-slate-200 shadow-2xs">
                <tr className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200">
                  <th className="py-3.5 px-4 w-12 text-center">STT</th>
                  <th className="py-3.5 px-4 w-20">Mã tỉnh</th>
                  <th className="py-3.5 px-4">Tên Tỉnh / Thành phố</th>
                  <th className="py-3.5 px-4">Tên đầy đủ</th>
                  <th className="py-3.5 px-4 text-center">Phân loại</th>
                  <th className="py-3.5 px-4 text-center">Số Xã/Phường</th>
                  <th className="py-3.5 px-4 text-center">Chỉ tiêu (Phiếu)</th>
                  <th className="py-3.5 px-4 text-center">Trạng thái</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {visibleProvinces.map((prov, idx) => (
                  <tr key={prov.provinceCode} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-center text-slate-400 font-bold">{idx + 1}</td>
                    <td className="py-3 px-4 font-mono font-bold text-sky-800">{prov.provinceCode}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{prov.name}</td>
                    <td className="py-3 px-4 text-slate-600">{prov.fullName}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[13.5px] font-bold ${
                          prov.type.includes("Thành phố")
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {prov.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-700">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProvinceForCommunes(prov.provinceCode);
                          setActiveTab("communes");
                        }}
                        className="hover:underline flex items-center justify-center gap-1 mx-auto"
                        title="Bấm để xem danh sách xã của tỉnh này"
                      >
                        <span>{prov.communeCount} xã</span>
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-700">
                      {prov.targetRespondents}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleProvinceStatus(prov.provinceCode, prov.isActive)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[13.5px] font-bold cursor-pointer transition-colors ${
                          prov.isActive
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                        }`}
                        title="Bấm để chuyển trạng thái"
                      >
                        {prov.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{prov.isActive ? "Hoạt động" : "Tạm dừng"}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProvince(prov);
                            setIsProvinceModalOpen(true);
                          }}
                          className="p-1.5 text-slate-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors"
                          title="Sửa thông tin tỉnh"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProvinceForCommunes(prov.provinceCode);
                            setActiveTab("communes");
                          }}
                          className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Xem toàn bộ xã của tỉnh này"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {provCount < provTotal && (
                  <tr>
                    <td colSpan={9} className="py-2.5 text-center text-[15px] font-semibold text-slate-400 bg-slate-50/60 animate-pulse">
                      Đang hiển thị {provCount} / {provTotal} tỉnh thành...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================= TAB 2: COMMUNES ======================= */}
      {activeTab === "communes" && (
        <div className="flex-1 min-h-0 bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
          {/* Table Toolbar */}
          <div className="shrink-0 p-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[16px] font-extrabold text-slate-900">
                  Danh mục Xã / Phường / Đặc khu
                </h2>
                {selectedProvinceForCommunes && (
                  <button
                    type="button"
                    onClick={() => setSelectedProvinceForCommunes("")}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[13.5px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                  >
                    <span>Lọc: Mã {selectedProvinceForCommunes}</span>
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <p className="text-[14px] text-slate-500">
                Tìm kiếm, lọc theo loại đơn vị hành chính và chỉnh sửa thông tin cấp xã
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Province Selector */}
              <div className="w-48 sm:w-56">
                <Select
                  sizeVariant="sm"
                  icon={Landmark}
                  value={selectedProvinceForCommunes}
                  onChange={(e) => {
                    setSelectedProvinceForCommunes(e.target.value);
                    setCommunePage(1);
                  }}
                >
                  <option value="">Toàn quốc (34 Tỉnh/Thành)</option>
                  {provinces.map((p) => (
                    <option key={p.provinceCode} value={p.provinceCode}>
                      {p.provinceCode} - {p.name}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tên hoặc mã 5 số..."
                  value={communeSearch}
                  onChange={(e) => {
                    setCommuneSearch(e.target.value);
                    setCommunePage(1);
                  }}
                  className="pl-9 pr-3 min-h-[42px] py-2 rounded-[10px] border-[1.5px] border-slate-300 text-[15px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 w-48 bg-white"
                />
              </div>

              {/* Type filter */}
              <div className="w-32">
                <Select
                  sizeVariant="sm"
                  value={communeTypeFilter}
                  onChange={(e) => {
                    setCommuneTypeFilter(e.target.value);
                    setCommunePage(1);
                  }}
                >
                  <option value="ALL">Tất cả loại</option>
                  <option value="Phường">Phường</option>
                  <option value="Xã">Xã</option>
                  <option value="Đặc khu">Đặc khu</option>
                  <option value="Thị trấn">Thị trấn</option>
                </Select>
              </div>

              {/* Status filter */}
              <div className="w-32">
                <Select
                  sizeVariant="sm"
                  value={communeStatusFilter}
                  onChange={(e) => {
                    setCommuneStatusFilter(e.target.value);
                    setCommunePage(1);
                  }}
                >
                  <option value="ALL">Trạng thái</option>
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="INACTIVE">Tạm dừng</option>
                </Select>
              </div>
            </div>
          </div>

          {/* Communes Table (Cuộn nội bộ với header sticky) */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
            <table className="w-full text-left text-[15px] border-collapse">
              <thead className="sticky top-0 bg-[#f4f7fb] z-10 text-slate-700 font-bold border-b border-slate-200 shadow-2xs">
                <tr className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200">
                  <th className="py-3.5 px-4 w-12 text-center">STT</th>
                  <th className="py-3.5 px-4 w-20">Mã xã</th>
                  <th className="py-3.5 px-4">Tên Xã / Phường / Đặc khu</th>
                  <th className="py-3.5 px-4 text-center">Phân loại</th>
                  <th className="py-3.5 px-4">Tỉnh / Thành phố</th>
                  <th className="py-3.5 px-4">Căn cứ / Nghị quyết</th>
                  <th className="py-3.5 px-4 text-center">Dân số / Diện tích</th>
                  <th className="py-3.5 px-4 text-center">Trạng thái</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {communes.map((com, idx) => (
                  <tr key={com.communeCode} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-center text-slate-400 font-bold">
                      {(communePage - 1) * 25 + idx + 1}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-sky-800">{com.communeCode}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{com.name}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[13.5px] font-bold ${
                          com.type === "Phường"
                            ? "bg-blue-100 text-blue-800"
                            : com.type === "Đặc khu"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {com.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {com.provinceName} ({com.provinceCode})
                    </td>
                    <td className="py-3 px-4 text-[14px] text-slate-500 max-w-[200px] truncate" title={com.resolution}>
                      {com.resolution || "—"}
                    </td>
                    <td className="py-3 px-4 text-center text-[14px] text-slate-500">
                      {com.population ? `${com.population.toLocaleString()} người` : "—"}
                      {com.areaKm2 ? ` • ${com.areaKm2} km²` : ""}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleCommuneStatus(com.communeCode, com.isActive)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[13.5px] font-bold cursor-pointer transition-colors ${
                          com.isActive
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                        }`}
                        title="Bấm để chuyển trạng thái"
                      >
                        {com.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{com.isActive ? "Hoạt động" : "Tạm dừng"}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCommune(com);
                            setIsCommuneModalOpen(true);
                          }}
                          className="p-1.5 text-slate-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors"
                          title="Sửa thông tin xã"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCommune(com.communeCode, com.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xóa xã"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls (Cố định ở đáy card) */}
          <div className="shrink-0 p-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[15px] text-slate-500 bg-slate-50/70">
            <div>
              Hiển thị từ <strong>{Math.min(communeTotal, (communePage - 1) * 25 + 1)}</strong> đến{" "}
              <strong>{Math.min(communeTotal, communePage * 25)}</strong> trong tổng số{" "}
              <strong>{communeTotal.toLocaleString()}</strong> đơn vị cấp xã
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setCommunePage((p) => Math.max(1, p - 1))}
                disabled={communePage <= 1}
                className="px-3 min-h-[42px] py-2 rounded-[10px] border-[1.5px] border-slate-300 font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Trước</span>
              </button>

              <span className="px-3 py-1 font-bold text-slate-800">
                Trang {communePage} / {communeTotalPages || 1}
              </span>

              <button
                type="button"
                onClick={() => setCommunePage((p) => Math.min(communeTotalPages, p + 1))}
                disabled={communePage >= communeTotalPages}
                className="px-3 min-h-[42px] py-2 rounded-[10px] border-[1.5px] border-slate-300 font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <span>Sau</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL: EDIT/ADD PROVINCE ======================= */}
      {isProvinceModalOpen && editingProvince && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <Landmark className="w-5 h-5 text-sky-700" />
                <h3 className="text-base font-extrabold text-slate-900">
                  {editingProvince.provinceCode ? "Hiệu chỉnh Tỉnh / Thành phố" : "Thêm mới Tỉnh / Thành phố"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsProvinceModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProvince} className="space-y-4 text-[15px]">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã Tỉnh (2 số) *</label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    placeholder="VD: 01, 19, 79"
                    value={editingProvince.provinceCode || ""}
                    onChange={(e) => setEditingProvince({ ...editingProvince, provinceCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phân loại *</label>
                  <Select
                    sizeVariant="sm"
                    value={editingProvince.type || "Tỉnh"}
                    onChange={(e) => setEditingProvince({ ...editingProvince, type: e.target.value })}
                  >
                    <option value="Tỉnh">Tỉnh</option>
                    <option value="Thành phố">Thành phố trực thuộc TW</option>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên Tỉnh / Thành phố ngắn gọn *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Hà Nội, Thái Nguyên, TP. Hồ Chí Minh"
                  value={editingProvince.name || ""}
                  onChange={(e) => setEditingProvince({ ...editingProvince, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên Đầy Đủ Pháp Lý *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Thành phố Hà Nội, Tỉnh Thái Nguyên"
                  value={editingProvince.fullName || ""}
                  onChange={(e) => setEditingProvince({ ...editingProvince, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chỉ tiêu thu thập (Phiếu)</label>
                  <input
                    type="number"
                    min={10}
                    max={10000}
                    value={editingProvince.targetRespondents || 100}
                    onChange={(e) =>
                      setEditingProvince({ ...editingProvince, targetRespondents: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vùng miền</label>
                  <Select
                    sizeVariant="sm"
                    value={editingProvince.region || "Miền Bắc"}
                    onChange={(e) => setEditingProvince({ ...editingProvince, region: e.target.value })}
                  >
                    <option value="Miền Bắc">Miền Bắc</option>
                    <option value="Miền Trung">Miền Trung</option>
                    <option value="Miền Nam">Miền Nam</option>
                    <option value="Tây Nguyên">Tây Nguyên</option>
                  </Select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProvinceModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl civic-btn-primary font-bold shadow-sm"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: EDIT/ADD COMMUNE ======================= */}
      {isCommuneModalOpen && editingCommune && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-extrabold text-slate-900">
                  {editingCommune.communeCode ? "Hiệu chỉnh Xã / Phường" : "Thêm mới Xã / Phường / Đặc khu"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCommuneModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCommune} className="space-y-4 text-[15px]">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Thuộc Tỉnh / Thành phố *</label>
                <Select
                  sizeVariant="sm"
                  value={editingCommune.provinceCode || ""}
                  onChange={(e) => {
                    const prov = provinces.find((p) => p.provinceCode === e.target.value);
                    setEditingCommune({
                      ...editingCommune,
                      provinceCode: e.target.value,
                      provinceName: prov?.name || "",
                    });
                  }}
                >
                  {provinces.map((p) => (
                    <option key={p.provinceCode} value={p.provinceCode}>
                      {p.provinceCode} - {p.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã Xã (5 số duy nhất) *</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="VD: 00004, 05977"
                    value={editingCommune.communeCode || ""}
                    onChange={(e) => setEditingCommune({ ...editingCommune, communeCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phân loại *</label>
                  <Select
                    sizeVariant="sm"
                    value={editingCommune.type || "Xã"}
                    onChange={(e) => setEditingCommune({ ...editingCommune, type: e.target.value })}
                  >
                    <option value="Phường">Phường</option>
                    <option value="Xã">Xã</option>
                    <option value="Đặc khu">Đặc khu</option>
                    <option value="Thị trấn">Thị trấn</option>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên Xã / Phường / Đặc khu *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Phường Ba Đình, Xã An Khánh"
                  value={editingCommune.name || ""}
                  onChange={(e) => setEditingCommune({ ...editingCommune, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Căn cứ / Nghị quyết sắp xếp</label>
                <input
                  type="text"
                  placeholder="VD: Nghị quyết số 1656/NQ-UBTVQH15"
                  value={editingCommune.resolution || ""}
                  onChange={(e) => setEditingCommune({ ...editingCommune, resolution: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dân số (người)</label>
                  <input
                    type="number"
                    placeholder="VD: 45000"
                    value={editingCommune.population || ""}
                    onChange={(e) =>
                      setEditingCommune({
                        ...editingCommune,
                        population: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Diện tích (km²)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="VD: 3.45"
                    value={editingCommune.areaKm2 || ""}
                    onChange={(e) =>
                      setEditingCommune({
                        ...editingCommune,
                        areaKm2: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCommuneModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-sm"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
