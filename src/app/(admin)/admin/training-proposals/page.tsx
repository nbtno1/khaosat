"use client";

import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Sparkles,
  FileText,
  Printer,
  CheckCircle2,
  Clock,
  Building,
  User,
  Shield,
  Search,
  Filter,
  Plus,
  ArrowRight,
  RefreshCw,
  Save,
  Check,
  AlertTriangle,
  ChevronRight,
  BookOpen,
  Calendar,
  Layers,
  MapPin,
  Trash2,
} from "lucide-react";

const PROVINCE_OPTIONS = [
  { code: "ALL", name: "Toàn quốc (Tổng hợp chung)" },
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

export default function TrainingProposalsPage() {
  const [activeTab, setActiveTab] = useState<"LIST" | "EDITOR">("LIST");
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState("ALL");
  const [actionSuccess, setActionSuccess] = useState("");

  // Editor Proposal State
  const [currentProposal, setCurrentProposal] = useState<any>(null);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/training-proposals");
      const data = await res.json();
      if (data.success) {
        setProposals(data.data || []);
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const handleGenerateDraft = async (provCode?: string) => {
    const code = provCode || selectedProvince;
    const provObj = PROVINCE_OPTIONS.find((p) => p.code === code);
    const provName = provObj ? provObj.name : "Toàn quốc";

    try {
      setGenerating(true);
      const res = await fetch("/api/admin/training-proposals/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provinceCode: code,
          provinceName: provName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentProposal(data.data);
        setActiveTab("EDITOR");
        setActionSuccess(`Đã tự động trích xuất Đề xuất Đào tạo 12 mục cho ${provName}`);
        setTimeout(() => setActionSuccess(""), 4000);
      }
    } catch {
      alert("Lỗi khi tự động trích xuất đề xuất từ 6 bảng.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveProposal = async () => {
    if (!currentProposal) return;
    try {
      const isExisting = Boolean(currentProposal._id);
      const url = isExisting
        ? `/api/admin/training-proposals/${currentProposal._id}`
        : "/api/admin/training-proposals";
      const method = isExisting ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentProposal),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Không thể lưu đề xuất.");
        return;
      }

      setCurrentProposal(data.data);
      setActionSuccess("Đã lưu Bản Đề xuất Đào tạo vào hệ thống.");
      fetchProposals();
      setTimeout(() => setActionSuccess(""), 4000);
    } catch {
      alert("Lỗi kết nối máy chủ.");
    }
  };

  const handleApproveProposal = async () => {
    if (!currentProposal?._id) {
      alert("Vui lòng lưu bản nháp trước khi duyệt.");
      return;
    }
    try {
      const res = await fetch(`/api/admin/training-proposals/${currentProposal._id}/approve`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Không thể phê duyệt đề xuất.");
        return;
      }

      setCurrentProposal(data.data);
      setActionSuccess("Đã phê duyệt Bản Đề xuất Đào tạo thành công!");
      fetchProposals();
      setTimeout(() => setActionSuccess(""), 4000);
    } catch {
      alert("Lỗi kết nối máy chủ.");
    }
  };

  const handleDeleteProposal = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Bạn có chắc chắn muốn xóa bản đề xuất này?")) return;
    try {
      const res = await fetch(`/api/admin/training-proposals/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchProposals();
        if (currentProposal?._id === id) {
          setCurrentProposal(null);
          setActiveTab("LIST");
        }
      }
    } catch {
      alert("Lỗi khi xóa đề xuất.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50">
      {/* 1. HEADER (FIXED, NO SCROLL) */}
      <div className="shrink-0 bg-white border-b border-slate-200/80 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-blue-600" />
              Lập & Quản lý Bản Đề xuất Đào tạo cho Địa phương
            </h1>
            <p className="text-[15px] text-slate-500 mt-1">
              Quy chuẩn 12 Mục tiêu chí theo Thuyết minh Phần V Mục 3 (Căn cứ số liệu 6 bảng, khoảng thiếu hụt và ma trận chuẩn)
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fetchProposals()}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-[15px] font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-600" : ""}`} />
              Làm mới
            </button>

            <button
              onClick={() => handleGenerateDraft()}
              disabled={generating}
              className="inline-flex items-center gap-2 px-4 py-2 text-[15px] font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 ${generating ? "animate-spin" : ""}`} />
              {generating ? "Đang trích xuất 6 bảng..." : "Tự động sinh Đề xuất Mới"}
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {actionSuccess && (
          <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-[15px] text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Navigation Tabs & Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-4">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("LIST")}
              className={`px-3 py-1.5 text-[15px] font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === "LIST"
                  ? "bg-white text-blue-600 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Danh sách Đề xuất ({proposals.length})
            </button>
            <button
              onClick={() => {
                if (!currentProposal) handleGenerateDraft();
                else setActiveTab("EDITOR");
              }}
              className={`px-3 py-1.5 text-[15px] font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "EDITOR"
                  ? "bg-white text-blue-600 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Văn bản 12 Mục Chuẩn</span>
              {currentProposal && (
                <span className="w-2 h-2 rounded-full bg-blue-600" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[15px] text-slate-500 font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Địa bàn:
            </span>
            <select
              value={selectedProvince}
              onChange={(e) => {
                setSelectedProvince(e.target.value);
                if (activeTab === "EDITOR") {
                  handleGenerateDraft(e.target.value);
                }
              }}
              className="text-[15px] bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer font-medium text-slate-700"
            >
              {PROVINCE_OPTIONS.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT (SCROLLS INTERNALLY) */}
      <div className="flex-1 min-h-0 overflow-y-auto p-6">
        {activeTab === "LIST" ? (
          /* TAB 1: DANH SÁCH ĐỀ XUẤT ĐÃ LẬP */
          <div className="bg-white border border-slate-200/80 rounded-xl shadow-2xs overflow-hidden">
            <table className="w-full text-left border-collapse text-[15px]">
              <thead className="bg-slate-50/90 border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="py-3 px-4 font-semibold text-slate-600">Địa bàn / Tiêu đề Bản Đề xuất</th>
                  <th className="py-3 px-4 font-semibold text-slate-600">Căn cứ số liệu</th>
                  <th className="py-3 px-4 font-semibold text-slate-600">Số chuyên đề đề xuất</th>
                  <th className="py-3 px-4 font-semibold text-slate-600">Người lập / Ngày lập</th>
                  <th className="py-3 px-4 font-semibold text-slate-600 text-center">Trạng thái</th>
                  <th className="py-3 px-4 font-semibold text-slate-600 text-right">Tác vụ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && proposals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto text-blue-600 mb-2" />
                      Đang nạp danh sách đề xuất...
                    </td>
                  </tr>
                ) : proposals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Chưa có Bản đề xuất đào tạo nào được lưu. Bấm &quot;Tự động sinh Đề xuất Mới&quot; để tạo ngay.
                    </td>
                  </tr>
                ) : (
                  proposals.map((item) => (
                    <tr
                      key={item._id}
                      onClick={() => {
                        setCurrentProposal(item);
                        setActiveTab("EDITOR");
                      }}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-[16px]">{item.title}</div>
                        <div className="text-[14px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="font-semibold text-blue-600">{item.provinceName}</span>
                          <span>•</span>
                          <span>Bộ phiếu v{item.schemaVersion || "3.3"}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <div>
                          <strong>{item.item2_dataBasis?.validCount || 0}</strong> phiếu hợp lệ /{" "}
                          <strong>{item.item2_dataBasis?.totalCommunes || 0}</strong> xã
                        </div>
                        <div className="text-[13.5px] text-slate-400 mt-0.5">
                          {item.item2_dataBasis?.outOfScopeCount || 0} ngoài phạm vi
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {item.item3_proposedTopics?.length || 0} chuyên đề
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 text-[14px]">
                        <div>{item.item12_approval?.createdByName || "Chuyên viên"}</div>
                        <div className="text-[13.5px] text-slate-400">
                          {new Date(item.proposalDate).toLocaleDateString("vi-VN")}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[14px] font-medium border ${
                            item.status === "APPROVED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.status === "APPROVED" ? "bg-emerald-500" : "bg-slate-500"
                            }`}
                          />
                          {item.status === "APPROVED" ? "Đã duyệt" : "Bản thảo (Draft)"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentProposal(item);
                              setActiveTab("EDITOR");
                            }}
                            className="px-2.5 py-1 text-[15px] font-semibold text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            Xem & Sửa
                          </button>
                          <button
                            onClick={(e) => handleDeleteProposal(item._id, e)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            title="Xóa đề xuất"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* TAB 2: SOẠN THẢO & XEM TRƯỚC VĂN BẢN 12 MỤC CHUẨN */
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Editor Action Bar (Fixed on top of document) */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-2 sticky top-0 z-20 print:hidden">
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-semibold text-slate-700">Trạng thái văn bản:</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[14px] font-bold border ${
                    currentProposal?.status === "APPROVED"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {currentProposal?.status === "APPROVED" ? "ĐÃ PHÊ DUYỆT" : "BẢN THẢO (DRAFT)"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[15px] font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-2xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  In / Xuất PDF
                </button>

                <button
                  type="button"
                  onClick={handleSaveProposal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[15px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  Lưu Đề xuất
                </button>

                {currentProposal?.status !== "APPROVED" && (
                  <button
                    type="button"
                    onClick={handleApproveProposal}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[15px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Ký duyệt Đề xuất
                  </button>
                )}
              </div>
            </div>

            {/* FORM / DOCUMENT 12 MỤC TIÊU CHUẨN */}
            {currentProposal ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 shadow-md text-slate-800 print:shadow-none print:border-none print:p-0">
                {/* Header Hành chính */}
                <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-6 mb-6">
                  <div className="text-center font-bold text-[15px] uppercase leading-relaxed">
                    <div>KIỂM TOÁN NHÀ NƯỚC</div>
                    <div className="font-semibold text-blue-900">
                      TRƯỜNG ĐÀO TẠO VÀ BỒI DƯỠNG NGHIỆP VỤ KIỂM TOÁN
                    </div>
                    <div className="text-[13.5px] font-normal text-slate-500 mt-1">
                      Số: ..... /ĐX-ĐTBD
                    </div>
                  </div>

                  <div className="text-center font-bold text-[15px] uppercase leading-relaxed">
                    <div>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                    <div className="font-semibold text-slate-700 underline underline-offset-4">
                      Độc lập - Tự do - Hạnh phúc
                    </div>
                    <div className="text-[14px] font-normal italic text-slate-500 mt-1 capitalize">
                      Hà Nội, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
                    </div>
                  </div>
                </div>

                {/* Tiêu đề Văn bản */}
                <div className="text-center my-6">
                  <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-slate-900">
                    BẢN ĐỀ XUẤT ĐÀO TẠO CHO ĐỊA PHƯƠNG
                  </h2>
                  <p className="text-[15px] font-semibold text-blue-700 mt-1">
                    (Phục vụ Đợt khảo sát nhu cầu bồi dưỡng năng lực cấp xã/phường - Bộ phiếu v{currentProposal.schemaVersion || "3.3"})
                  </p>
                </div>

                {/* NỘI DUNG 12 MỤC CHUẨN */}
                <div className="space-y-6 text-[15px] leading-relaxed">
                  {/* MỤC 1 */}
                  <div className="bg-slate-50/70 p-3.5 rounded-lg border border-slate-200">
                    <h4 className="font-bold text-slate-900 text-[15px] uppercase mb-1">
                      1. Địa phương, Ngày lập, Phiên bản bộ phiếu
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-700">
                      <div>
                        <strong>Địa phương thụ hưởng:</strong> {currentProposal.provinceName}
                      </div>
                      <div>
                        <strong>Ngày lập văn bản:</strong> {currentProposal.item1_meta?.proposalDate}
                      </div>
                      <div>
                        <strong>Phiên bản khảo sát:</strong> Phiên bản {currentProposal.schemaVersion || "3.3"}
                      </div>
                    </div>
                  </div>

                  {/* MỤC 2 */}
                  <div className="bg-slate-50/70 p-3.5 rounded-lg border border-slate-200">
                    <h4 className="font-bold text-slate-900 text-[15px] uppercase mb-1">
                      2. Căn cứ số liệu khảo sát (từ Bảng B1, B6)
                    </h4>
                    <p className="text-slate-700">
                      Tổng số phiếu thu thập: <strong>{currentProposal.item2_dataBasis?.totalRespondents}</strong> cán bộ từ <strong>{currentProposal.item2_dataBasis?.totalCommunes}</strong> xã/phường/đặc khu.
                      Trong đó: <strong>{currentProposal.item2_dataBasis?.validCount}</strong> phiếu hợp lệ đủ điều kiện phân tích nghiệp vụ,{" "}
                      <strong>{currentProposal.item2_dataBasis?.outOfScopeCount}</strong> cán bộ ngoài phạm vi công việc tài chính/tài sản công (kết thúc sớm).
                    </p>
                  </div>

                  {/* MỤC 3 */}
                  <div>
                    <h4 className="font-bold text-slate-900 text-[15px] uppercase mb-2">
                      3. Danh mục Nội dung / Chuyên đề đào tạo đề xuất (Mỗi dòng một nội dung)
                    </h4>
                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                      <table className="w-full text-left border-collapse text-[14px]">
                        <thead className="bg-slate-100 border-b border-slate-200">
                          <tr>
                            <th className="p-2 font-semibold text-slate-700">Nhóm công việc</th>
                            <th className="p-2 font-semibold text-slate-700">Chuyên đề bồi dưỡng</th>
                            <th className="p-2 font-semibold text-slate-700">Đối tượng cán bộ</th>
                            <th className="p-2 font-semibold text-slate-700">Lý do lựa chọn</th>
                            <th className="p-2 font-semibold text-slate-700 text-center">Thời lượng</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {currentProposal.item3_proposedTopics?.map((top: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50/70">
                              <td className="p-2 font-semibold text-slate-800">
                                Nhóm {top.workgroupId}: {top.workgroupTitle}
                              </td>
                              <td className="p-2 font-bold text-blue-900">{top.topicTitle}</td>
                              <td className="p-2 text-slate-600">{top.targetAudience}</td>
                              <td className="p-2 text-slate-600">{top.reason}</td>
                              <td className="p-2 text-center font-medium text-slate-700">
                                {top.suggestedDuration}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* MỤC 4 */}
                  <div>
                    <h4 className="font-bold text-slate-900 text-[15px] uppercase mb-1">
                      4. Lý do lựa chọn chuyên đề
                    </h4>
                    <textarea
                      rows={3}
                      value={currentProposal.item4_selectionReasons}
                      onChange={(e) =>
                        setCurrentProposal({ ...currentProposal, item4_selectionReasons: e.target.value })
                      }
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-[15px]"
                    />
                  </div>

                  {/* MỤC 5 */}
                  <div>
                    <h4 className="font-bold text-slate-900 text-[15px] uppercase mb-1">
                      5. Khoảng thiếu hụt theo tự đánh giá so với Ma trận chuẩn (Bảng B3)
                    </h4>
                    <textarea
                      rows={3}
                      value={currentProposal.item5_capacityGapAnalysis}
                      onChange={(e) =>
                        setCurrentProposal({ ...currentProposal, item5_capacityGapAnalysis: e.target.value })
                      }
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-[15px]"
                    />
                  </div>

                  {/* MỤC 6 */}
                  <div>
                    <h4 className="font-bold text-slate-900 text-[15px] uppercase mb-1">
                      6. Hình thức đào tạo đề xuất (Căn cứ Bảng B6)
                    </h4>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 space-y-1">
                      {currentProposal.item6_suggestedFormats?.map((fmt: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                          <span>{fmt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* MỤC 7 */}
                  <div>
                    <h4 className="font-bold text-slate-900 text-[15px] uppercase mb-1">
                      7. Thời lượng và Thời gian tổ chức đề xuất
                    </h4>
                    <input
                      type="text"
                      value={currentProposal.item7_timingAndDuration}
                      onChange={(e) =>
                        setCurrentProposal({ ...currentProposal, item7_timingAndDuration: e.target.value })
                      }
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-[15px]"
                    />
                  </div>

                  {/* MỤC 8 */}
                  <div>
                    <h4 className="font-bold text-slate-900 text-[15px] uppercase mb-1">
                      8. Phương án bồi dưỡng cho nhóm cán bộ &quot;Chưa có dịp thực hiện&quot;
                    </h4>
                    <textarea
                      rows={2}
                      value={currentProposal.item8_noChanceModule}
                      onChange={(e) =>
                        setCurrentProposal({ ...currentProposal, item8_noChanceModule: e.target.value })
                      }
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-[15px]"
                    />
                  </div>

                  {/* MỤC 9 */}
                  <div>
                    <h4 className="font-bold text-slate-900 text-[15px] uppercase mb-1">
                      9. Phương án xử lý nhóm đối tượng nhỏ (Dưới 5 người)
                    </h4>
                    <textarea
                      rows={2}
                      value={currentProposal.item9_smallGroupStrategy}
                      onChange={(e) =>
                        setCurrentProposal({ ...currentProposal, item9_smallGroupStrategy: e.target.value })
                      }
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-[15px]"
                    />
                  </div>

                  {/* MỤC 10 */}
                  <div>
                    <h4 className="font-bold text-slate-900 text-[15px] uppercase mb-1">
                      10. Kiến nghị ngoài đào tạo (Cơ chế, văn bản, công cụ - từ Bảng B5)
                    </h4>
                    <textarea
                      rows={3}
                      value={currentProposal.item10_institutionalRecommendations}
                      onChange={(e) =>
                        setCurrentProposal({
                          ...currentProposal,
                          item10_institutionalRecommendations: e.target.value,
                        })
                      }
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-[15px] font-mono"
                    />
                  </div>

                  {/* MỤC 11 */}
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[14px] leading-relaxed">
                    <h4 className="font-bold uppercase text-amber-800 mb-1">
                      11. Giới hạn pháp lý bắt buộc
                    </h4>
                    <p>{currentProposal.item11_legalDisclaimer}</p>
                  </div>

                  {/* MỤC 12: CHỮ KÝ PHÊ DUYỆT */}
                  <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-center text-[15px]">
                    <div>
                      <div className="font-bold uppercase text-slate-700">NGƯỜI LẬP ĐỀ XUẤT</div>
                      <div className="text-[14px] text-slate-500 mb-16">
                        {currentProposal.item12_approval?.createdByTitle || "Khoa Cơ sở / Chuyên ngành"}
                      </div>
                      <div className="font-bold text-slate-900">
                        {currentProposal.item12_approval?.createdByName || "Chuyên viên"}
                      </div>
                    </div>

                    <div>
                      <div className="font-bold uppercase text-slate-700">LÃNH ĐẠO TRƯỜNG PHÊ DUYỆT</div>
                      <div className="text-[14px] text-slate-500 mb-16">
                        {currentProposal.item12_approval?.approvedByTitle || "Giám đốc"}
                      </div>
                      <div className="font-bold text-slate-900 flex items-center justify-center gap-1.5">
                        {currentProposal.status === "APPROVED" && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" />
                        )}
                        <span>{currentProposal.item12_approval?.approvedByName || "(Chưa phê duyệt)"}</span>
                      </div>
                      {currentProposal.item12_approval?.approvedAt && (
                        <div className="text-[13.5px] text-emerald-700 font-medium mt-1">
                          Đã ký duyệt ngày {new Date(currentProposal.item12_approval.approvedAt).toLocaleDateString("vi-VN")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 bg-white border border-slate-200 rounded-xl">
                Vui lòng bấm &quot;Tự động sinh Đề xuất Mới&quot; để tạo bản thảo từ số liệu 6 bảng.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
