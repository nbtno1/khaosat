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
        try {
          const qrDataUrl = await QRCode.toDataURL(surveyUrl, {
            width: 256,
            margin: 2,
            errorCorrectionLevel: "M",
          });
          cards.push({
            code: p.code,
            name: p.name,
            token,
            surveyUrl,
            qrDataUrl,
          });
        } catch {
          // Fallback
        }
      }

      setProvinces(cards);
      setIsGenerating(false);
    }

    loadQRs();
  }, []);

  const handleCopyLink = (token: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleDownloadSingleQR = (qrDataUrl: string, provName: string, provCode: string) => {
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `QR_KhaoSat_${provCode}_${provName.replace(/\s+/g, "_")}.png`;
    a.click();
  };

  const filtered = provinces.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.includes(searchQuery)
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-900 mb-1">
            <QrCode className="w-3.5 h-3.5 text-sky-700" />
            <span>QUẢN LÝ ĐỢT KHẢO SÁT & MÃ QR CẤP TỈNH (ADR-008)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Đợt Khảo sát Năm 2026 & Bộ 34 Mã QR
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Mỗi tỉnh, thành phố sử dụng duy nhất một mã QR đại diện để cán bộ cấp xã quét bằng thiết bị di động.
          </p>
        </div>

        {/* Download All 34 QRs ZIP Button */}
        <a
          href="/api/admin/campaigns/qr-zip"
          download="34_Ma_QR_KhaoSat_KiemToan_2026.zip"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs shadow-md shadow-sky-700/20 transition-all"
          title="Tải toàn bộ 34 ảnh PNG mã QR độ nét cao trong 1 file nén ZIP"
        >
          <Download className="w-4 h-4" />
          <span>Tải trọn bộ 34 Mã QR (ZIP)</span>
        </a>
      </div>

      {/* Campaign Details Banner Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800">
                ĐANG MỞ KHẢO SÁT
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                Mã đợt: DOT-1-2026
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                Bộ tiêu chuẩn: Phiên bản 3.3
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
              Khảo sát Năng lực Quản lý Tài chính, Tài sản công cấp xã năm 2026
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Triển khai khảo sát diện rộng theo Quyết định và Phương án phê duyệt của Kiểm toán nhà nước. Toàn bộ 3.321 xã/phường/thị trấn thuộc 34 tỉnh, thành phố tự đánh giá năng lực theo 16 nhóm công việc và 4 vai trò nhiệm vụ.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:w-72 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Thời gian bắt đầu</div>
              <div className="text-xs font-bold text-slate-800 mt-0.5">01/01/2026</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Thời gian kết thúc</div>
              <div className="text-xs font-bold text-slate-800 mt-0.5">31/12/2026</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Phạm vi địa bàn</div>
              <div className="text-xs font-bold text-slate-800 mt-0.5">34 Tỉnh / Thành</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Chỉ tiêu mỗi tỉnh</div>
              <div className="text-xs font-bold text-slate-800 mt-0.5">100 Cán bộ</div>
            </div>
          </div>
        </div>
      </div>

      {/* 34 Province QR Cards Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Danh mục 34 Đường dẫn & Mã QR Cấp Tỉnh
            </h2>
            <p className="text-xs text-slate-500">
              Có thể sao chép link công khai hoặc tải mã QR riêng biệt để in vào công văn hướng dẫn
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm tỉnh hoặc mã..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            />
          </div>
        </div>

        {isGenerating ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-100">
            <div className="inline-block w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mb-2" />
            <div className="text-xs font-bold text-slate-500">Đang khởi tạo mã QR cho 34 tỉnh...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((item) => (
              <div
                key={item.code}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded">
                      Mã {item.code}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">Cấp Tỉnh</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1 mb-3">
                    {item.name}
                  </h3>

                  {/* QR Image */}
                  <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-center border border-slate-100 mb-3">
                    {item.qrDataUrl ? (
                      <img
                        src={item.qrDataUrl}
                        alt={`Mã QR ${item.name}`}
                        className="w-36 h-36 object-contain"
                      />
                    ) : (
                      <div className="w-36 h-36 bg-slate-200 animate-pulse rounded" />
                    )}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="text-[10px] text-slate-400 font-mono truncate">
                    {item.token}
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopyLink(item.token, item.surveyUrl)}
                      className="py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors"
                      title="Sao chép URL khảo sát"
                    >
                      {copiedToken === item.token ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Chép link</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDownloadSingleQR(item.qrDataUrl, item.name, item.code)
                      }
                      className="py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors"
                      title="Tải ảnh PNG"
                    >
                      <Download className="w-3 h-3" />
                      <span>Tải PNG</span>
                    </button>

                    <a
                      href={item.surveyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="py-1.5 px-2 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors"
                      title="Mở biểu mẫu khảo sát trực tiếp"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Mở</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
