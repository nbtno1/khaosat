"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
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
} from "lucide-react";
import { ProgressMonitoringService } from "@/services/progress-monitoring.service";

interface ProvinceCardItem {
  code: string;
  name: string;
  token: string;
  surveyUrl: string;
  qrDataUrl: string;
}

export default function CampaignsPage() {
  const [provinces, setProvinces] = useState<ProvinceCardItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    async function loadQRs() {
      setIsGenerating(true);
      const origin = window.location.origin;
      const provList = [
        { code: "01", name: "Thành phố Hà Nội" },
        { code: "02", name: "Tỉnh Hà Giang" },
        { code: "04", name: "Tỉnh Cao Bằng" },
        { code: "06", name: "Tỉnh Bắc Kạn" },
        { code: "08", name: "Tỉnh Tuyên Quang" },
        { code: "10", name: "Tỉnh Lào Cai" },
        { code: "11", name: "Tỉnh Điện Biên" },
        { code: "12", name: "Tỉnh Lai Châu" },
        { code: "14", name: "Tỉnh Sơn La" },
        { code: "15", name: "Tỉnh Yên Bái" },
        { code: "17", name: "Tỉnh Hoà Bình" },
        { code: "19", name: "Tỉnh Thái Nguyên" },
        { code: "20", name: "Tỉnh Lạng Sơn" },
        { code: "22", name: "Tỉnh Quảng Ninh" },
        { code: "24", name: "Tỉnh Bắc Giang" },
        { code: "25", name: "Tỉnh Phú Thọ" },
        { code: "26", name: "Tỉnh Vĩnh Phúc" },
        { code: "27", name: "Tỉnh Bắc Ninh" },
        { code: "30", name: "Thành phố Hải Phòng" },
        { code: "31", name: "Tỉnh Hải Dương" },
        { code: "33", name: "Tỉnh Hưng Yên" },
        { code: "34", name: "Tỉnh Thái Bình" },
        { code: "35", name: "Tỉnh Hà Nam" },
        { code: "36", name: "Tỉnh Nam Định" },
        { code: "37", name: "Tỉnh Ninh Bình" },
        { code: "38", name: "Tỉnh Thanh Hóa" },
        { code: "40", name: "Tỉnh Nghệ An" },
        { code: "42", name: "Tỉnh Hà Tĩnh" },
        { code: "44", name: "Tỉnh Quảng Bình" },
        { code: "45", name: "Tỉnh Quảng Trị" },
        { code: "46", name: "Tỉnh Thừa Thiên Huế" },
        { code: "48", name: "Thành phố Đà Nẵng" },
        { code: "49", name: "Tỉnh Quảng Nam" },
        { code: "51", name: "Tỉnh Quảng Ngãi" },
      ];

      const cards: ProvinceCardItem[] = [];

      for (const p of provList) {
        const token = `pilot_dot-1-2026_p${p.code}`;
        const surveyUrl = `${origin}/khao-sat/${token}`;
        let qrDataUrl = "";
        try {
          qrDataUrl = await QRCode.toDataURL(surveyUrl, {
            width: 280,
            margin: 2,
            color: {
              dark: "#0369a1", // sky-700
              light: "#ffffff",
            },
          });
        } catch (e) {
          console.error("QR gen error:", e);
        }

        cards.push({
          code: p.code,
          name: p.name,
          token,
          surveyUrl,
          qrDataUrl,
        });
      }

      setProvinces(cards);
      setIsGenerating(false);
    }

    loadQRs();
  }, []);

  const handleCopyLink = (url: string, token: string) => {
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleDownloadQR = (qrDataUrl: string, provName: string, code: string) => {
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `QR_KhaoSat_${code}_${provName.replace(/\s+/g, "_")}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const filtered = provinces.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.includes(searchQuery)
  );

  return (
    <div className="h-full flex flex-col p-4 sm:p-5 max-w-7xl w-full mx-auto overflow-hidden gap-3.5">
      {/* 1. Page Header (Cố định ở đỉnh) */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
            Đợt Khảo sát Năm 2026 & Bộ 34 Mã QR
          </h1>
          <p className="text-xs text-slate-500">
            Mỗi tỉnh, thành phố sử dụng duy nhất một mã QR đại diện để cán bộ cấp xã quét bằng thiết bị di động.
          </p>
        </div>

        {/* Download All 34 QRs ZIP Button */}
        <a
          href="/api/admin/campaigns/qr-zip"
          download="34_Ma_QR_KhaoSat_KiemToan_2026.zip"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs shadow-2xs shadow-sky-700/20 transition-all self-start sm:self-center"
          title="Tải toàn bộ 34 ảnh PNG mã QR độ nét cao trong 1 file nén ZIP"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Tải trọn bộ 34 Mã QR (ZIP)</span>
        </a>
      </div>

      {/* 2. Campaign Details Banner Card (Cố định) */}
      <div className="shrink-0 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                ĐANG MỞ KHẢO SÁT
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                Mã đợt: DOT-1-2026
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
              Khảo sát Năng lực Quản lý Tài chính, Tài sản công cấp xã năm 2026
            </h2>

            <p className="text-xs text-slate-600 leading-relaxed">
              Áp dụng cơ chế đường dẫn công khai kết hợp mã QR tĩnh cấp tỉnh. Cán bộ cấp xã quét mã bằng camera điện thoại để truy cập trực tiếp form khảo sát mà không cần tạo tài khoản.
            </p>
          </div>

          <div className="flex flex-wrap lg:flex-col gap-2 shrink-0 text-xs">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/70">
              <Calendar className="w-3.5 h-3.5 text-sky-700" />
              <span>Thời gian: <strong>15/01/2026 — 30/03/2026</strong></span>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/70">
              <Building2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Phạm vi: <strong>34 Tỉnh / Thành phố</strong></span>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/70">
              <FileCheck className="w-3.5 h-3.5 text-indigo-700" />
              <span>Đối tượng: <strong>3.321 Xã, Phường, Thị trấn</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Danh mục 34 QR Cards: Chiếm toàn bộ phần còn lại (flex-1 min-h-0), cuộn nội bộ */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
        {/* Toolbar Header */}
        <div className="shrink-0 p-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">
              Danh mục 34 Đường dẫn & Mã QR Cấp Tỉnh ({filtered.length})
            </h2>
            <p className="text-[11px] text-slate-500">
              Sao chép link công khai hoặc tải mã QR riêng biệt để in vào công văn hướng dẫn
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm tỉnh hoặc mã..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            />
          </div>
        </div>

        {/* Content Body: Cuộn lưới thẻ QR nội bộ */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4">
          {isGenerating ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mb-2" />
              <div className="text-xs font-bold text-slate-500">Đang khởi tạo mã QR cho 34 tỉnh...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {filtered.map((item) => (
                <div
                  key={item.code}
                  className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs hover:border-sky-300 hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded">
                        Mã {item.code}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">Cấp Tỉnh</span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-1 mb-2.5">
                      {item.name}
                    </h3>

                    {/* QR Preview Box */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-center mb-2.5 group-hover:bg-sky-50/50 transition-colors">
                      {item.qrDataUrl ? (
                        <img
                          src={item.qrDataUrl}
                          alt={`QR Code ${item.name}`}
                          className="w-28 h-28 object-contain rounded-lg"
                        />
                      ) : (
                        <div className="w-28 h-28 flex items-center justify-center text-[10px] text-slate-400">
                          Chưa tạo mã
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-100/70 p-2 rounded-lg font-mono text-[10px] text-slate-600 break-all select-all mb-2.5 line-clamp-2">
                      {item.surveyUrl}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-1.5 pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleCopyLink(item.surveyUrl, item.token)}
                      className={`w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        copiedToken === item.token
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {copiedToken === item.token ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Đã sao chép link</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Sao chép link</span>
                        </>
                      )}
                    </button>

                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDownloadQR(item.qrDataUrl, item.name, item.code)}
                        className="inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-bold bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors cursor-pointer"
                        title="Tải ảnh PNG về máy"
                      >
                        <Download className="w-3 h-3" />
                        <span>Tải ảnh QR</span>
                      </button>

                      <a
                        href={item.surveyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-bold bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
                        title="Mở biểu mẫu làm bài trên tab mới"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Mở form</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
