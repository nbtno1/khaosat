"use client";

import React, { useState, useEffect } from "react";
import {
  QrCode,
  Download,
  Copy,
  Check,
  ExternalLink,
  Calendar,
  Building2,
  FileCheck,
  Search,
  Sparkles,
  RefreshCw,
  KeyRound,
  PauseCircle,
  PlayCircle,
  Filter,
  AlertTriangle,
  X,
  CheckCircle2,
} from "lucide-react";
import { useProgressiveItems } from "@/hooks/useProgressiveItems";

interface ProvinceLinkItem {
  _id: string;
  provinceCode: string;
  provinceName: string;
  token: string;
  status: "ACTIVE" | "PAUSED" | "EXPIRED";
  qrCodeDataUrl?: string;
  surveyUrl: string;
  totalSubmissions: number;
  lastSubmissionAt?: string | null;
  updatedAt: string;
}

interface CampaignStats {
  totalLinks: number;
  activeLinks: number;
  pausedLinks: number;
  expiredLinks: number;
  totalSubmissions: number;
}

export default function CampaignsPage() {
  const [links, setLinks] = useState<ProvinceLinkItem[]>([]);
  const [stats, setStats] = useState<CampaignStats>({
    totalLinks: 0,
    activeLinks: 0,
    pausedLinks: 0,
    expiredLinks: 0,
    totalSubmissions: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rotatingLink, setRotatingLink] = useState<ProvinceLinkItem | null>(null);
  const [actionSuccess, setActionSuccess] = useState("");
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  const fetchLinks = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/campaigns/links");
      const data = await res.json();
      if (data.success) {
        setLinks(data.data || []);
        if (data.stats) setStats(data.stats);
      }
    } catch {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleCopy = (token: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleDownloadSingleQR = (qrDataUrl: string, name: string, code: string) => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `QR_${code}_${name.replace(/[^a-zA-Z0-9]/g, "_")}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadZip = async () => {
    try {
      setIsDownloadingZip(true);
      const res = await fetch("/api/admin/campaigns/qr-zip");
      if (!res.ok) throw new Error("Không thể tải file ZIP");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Ma_QR_34_Tinh_Khao_Sat_KTNN.zip";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      alert("Lỗi khi tải gói file ZIP.");
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const handleToggleStatus = async (item: ProvinceLinkItem) => {
    const nextStatus = item.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    try {
      const res = await fetch(`/api/admin/campaigns/links/${item.token}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Không thể đổi trạng thái liên kết.");
        return;
      }
      setActionSuccess(`Đã chuyển trạng thái ${item.provinceName} sang: ${nextStatus === "ACTIVE" ? "Đang nhận phiếu" : "Tạm dừng"}`);
      fetchLinks();
      setTimeout(() => setActionSuccess(""), 4000);
    } catch {
      alert("Lỗi kết nối máy chủ.");
    }
  };

  const handleRotateToken = async () => {
    if (!rotatingLink) return;
    try {
      const res = await fetch(`/api/admin/campaigns/links/${rotatingLink.token}/rotate`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Không thể đổi mã bảo mật.");
        return;
      }
      setRotatingLink(null);
      setActionSuccess(`Đã đổi mã bảo mật và sinh mã QR mới cho ${rotatingLink.provinceName}.`);
      fetchLinks();
      setTimeout(() => setActionSuccess(""), 4000);
    } catch {
      alert("Lỗi kết nối máy chủ.");
    }
  };

  // Filtered links
  const filteredLinks = links.filter((p) => {
    const matchesSearch =
      p.provinceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.provinceCode.includes(searchQuery) ||
      p.token.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Progressive rendering: initial 8 items, step 8
  const { visibleItems } = useProgressiveItems(filteredLinks, {
    initialCount: 8,
    step: 8,
    interval: 16,
    resetKey: `${statusFilter}_${searchQuery}`,
  });

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50">
      {/* 1. HEADER (FIXED, NO SCROLL) */}
      <div className="shrink-0 bg-white border-b border-slate-200/80 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <QrCode className="w-6 h-6 text-blue-600" />
              Sổ Quản lý Đường dẫn Khảo sát & Mã QR Cấp Tỉnh
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Quản lý vòng đời liên kết độc lập từng tỉnh: Đóng/Mở nhận phiếu, Gia hạn và Đổi mã bảo mật (Rotate Token)
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fetchLinks()}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-blue-600" : ""}`} />
              Làm mới
            </button>

            <button
              onClick={handleDownloadZip}
              disabled={isDownloadingZip}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Download className={`w-4 h-4 ${isDownloadingZip ? "animate-bounce" : ""}`} />
              {isDownloadingZip ? "Đang nén file..." : "Tải gói 34 QR (.ZIP)"}
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {actionSuccess && (
          <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* 2. STATS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-lg p-3">
            <div className="text-xs text-slate-500 font-medium">Tổng số địa bàn</div>
            <div className="text-xl font-bold text-slate-800 mt-1">{stats.totalLinks} Tỉnh/Thành</div>
          </div>
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-lg p-3">
            <div className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
              <PlayCircle className="w-3.5 h-3.5 text-emerald-600" />
              Đang mở nhận phiếu
            </div>
            <div className="text-xl font-bold text-emerald-800 mt-1">{stats.activeLinks}</div>
          </div>
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-lg p-3">
            <div className="text-xs text-amber-700 font-medium flex items-center gap-1.5">
              <PauseCircle className="w-3.5 h-3.5 text-amber-600" />
              Đang tạm dừng
            </div>
            <div className="text-xl font-bold text-amber-800 mt-1">{stats.pausedLinks}</div>
          </div>
          <div className="bg-blue-50/60 border border-blue-200/80 rounded-lg p-3">
            <div className="text-xs text-blue-700 font-medium flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-blue-600" />
              Tổng phiếu toàn quốc
            </div>
            <div className="text-xl font-bold text-blue-800 mt-1">{stats.totalSubmissions}</div>
          </div>
        </div>

        {/* 3. TOOLBAR */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên tỉnh, mã số hoặc token..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <span>Trạng thái:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="ALL">Tất cả địa bàn</option>
              <option value="ACTIVE">Đang nhận phiếu</option>
              <option value="PAUSED">Đang tạm dừng</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. MAIN CARDS GRID (SCROLLS INTERNALLY) */}
      <div className="flex-1 min-h-0 overflow-y-auto p-6">
        {isLoading && links.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mb-2" />
            <span className="text-xs font-medium">Đang nạp dữ liệu liên kết và mã QR...</span>
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            Không tìm thấy địa bàn nào phù hợp với bộ lọc.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {visibleItems.map((p) => {
              const isCopied = copiedToken === p.token;
              const isActive = p.status === "ACTIVE";

              return (
                <div
                  key={p.provinceCode}
                  className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                    isActive
                      ? "border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300"
                      : "border-amber-200 bg-amber-50/20 shadow-2xs opacity-90"
                  }`}
                >
                  <div className="p-4">
                    {/* Top Header */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {p.provinceCode}
                        </span>
                        <h3 className="font-bold text-slate-800 text-sm truncate" title={p.provinceName}>
                          {p.provinceName}
                        </h3>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-amber-500"}`} />
                        {isActive ? "Đang mở" : "Tạm dừng"}
                      </span>
                    </div>

                    {/* QR Code and Stats */}
                    <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-3">
                      <div className="relative group shrink-0 bg-white p-1 rounded-md border border-slate-200 shadow-2xs">
                        {p.qrCodeDataUrl ? (
                          <img
                            src={p.qrCodeDataUrl}
                            alt={`QR ${p.provinceName}`}
                            className="w-20 h-20 object-contain rounded"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-slate-100 flex items-center justify-center">
                            <QrCode className="w-8 h-8 text-slate-300" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDownloadSingleQR(p.qrCodeDataUrl || "", p.provinceName, p.provinceCode)}
                          className="absolute inset-0 bg-slate-900/60 text-white flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-medium"
                          title="Tải ảnh QR này"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Tải ảnh
                        </button>
                      </div>

                      <div className="flex-1 min-w-0 text-[11px] space-y-1">
                        <div className="flex items-center justify-between text-slate-500">
                          <span>Phiếu đã nộp:</span>
                          <span className="font-bold text-slate-800 text-xs">{p.totalSubmissions}</span>
                        </div>
                        <div className="text-slate-400 text-[10px] truncate">
                          Mã: <code className="text-slate-600 font-mono">{p.token}</code>
                        </div>
                        {p.lastSubmissionAt && (
                          <div className="text-[10px] text-slate-400 truncate">
                            Nộp gần nhất: {new Date(p.lastSubmissionAt).toLocaleDateString("vi-VN")}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="px-4 py-2.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-1 text-xs">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleCopy(p.token, p.surveyUrl)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                          isCopied
                            ? "bg-emerald-600 text-white"
                            : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                        }`}
                        title="Sao chép đường dẫn khảo sát"
                      >
                        {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {isCopied ? "Đã chép" : "Chép link"}
                      </button>

                      <a
                        href={p.surveyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 text-slate-500 hover:text-blue-600 hover:bg-white rounded border border-transparent hover:border-slate-200 transition-colors"
                        title="Mở biểu mẫu khảo sát trong tab mới"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Đóng / Mở nút */}
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(p)}
                        className={`p-1 rounded transition-colors cursor-pointer ${
                          isActive
                            ? "text-amber-600 hover:bg-amber-100"
                            : "text-emerald-600 hover:bg-emerald-100"
                        }`}
                        title={isActive ? "Tạm dừng nhận phiếu tỉnh này" : "Tiếp tục nhận phiếu tỉnh này"}
                      >
                        {isActive ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                      </button>

                      {/* Đổi mã bảo mật (Rotate) */}
                      <button
                        type="button"
                        onClick={() => setRotatingLink(p)}
                        className="p-1 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors cursor-pointer"
                        title="Đổi mã bảo mật (Rotate Token) khi liên kết bị lộ"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: XÁC NHẬN ROTATE TOKEN */}
      {rotatingLink && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-200">
            <div className="p-5 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 mx-auto flex items-center justify-center">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Đổi mã bảo mật liên kết (Rotate Token)</h3>
              <p className="text-xs text-slate-600 text-left">
                Bạn sắp tạo mã bảo mật mới cho <strong className="text-slate-900">{rotatingLink.provinceName}</strong>:
              </p>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-left text-[11px] font-mono text-slate-700">
                Token cũ: {rotatingLink.token}
              </div>
              <p className="text-[11px] text-amber-700 text-left bg-amber-50 p-2 rounded border border-amber-200">
                ⚠️ Lưu ý: Đường dẫn và mã QR cũ sẽ bị vô hiệu hóa ngay lập tức. Toàn bộ {rotatingLink.totalSubmissions} phiếu đã nộp trước đó vẫn được bảo toàn nguyên vẹn.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRotatingLink(null)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleRotateToken}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-2xs cursor-pointer"
                >
                  Đổi mã ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
