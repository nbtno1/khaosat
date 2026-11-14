"use client";

import React, { useState } from "react";
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
} from "lucide-react";

export default function UserGuidePage() {
  const [activeAudience, setActiveAudience] = useState<"SURVEY_RESPONDENT" | "ADMIN_OPERATOR">("ADMIN_OPERATOR");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSection, setExpandedSection] = useState<string | null>("sec_analytics");

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-900 mb-1">
            <BookOpen className="w-3.5 h-3.5 text-sky-700" />
            <span>TÀI LIỆU VẬN HÀNH & HƯỚNG DẪN SỬ DỤNG PHẦN MỀM</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Cẩm nang Hướng dẫn Vận hành Hệ thống Khảo sát
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Tài liệu hướng dẫn thao tác chuẩn hóa cho Cán bộ khảo sát cấp xã, Đầu mối địa phương và Ban Chỉ đạo Kiểm toán nhà nước.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
            <span>Dành cho Cán bộ Quản trị & Thẩm tra viên</span>
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
            <span>Dành cho Cán bộ Khảo sát Cấp Xã</span>
          </button>
        </div>

        {/* Quick Search in Manual */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm nội dung hướng dẫn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: DÀNH CHO CÁN BỘ QUẢN TRỊ & THẨM TRA VIÊN (ADMIN PORTAL)         */}
      {/* ========================================================================= */}
      {activeAudience === "ADMIN_OPERATOR" && (
        <div className="space-y-4">
          {/* Section: Phân quyền tài khoản */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection("sec_rbac")}
              className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    1. Phân quyền và Trách nhiệm 5 Nhóm Tài khoản (RBAC)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Quy định ma trận quyền hạn theo Tài liệu số 1 và Quyết định phê duyệt của Kiểm toán nhà nước
                  </p>
                </div>
              </div>
              {expandedSection === "sec_rbac" ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>

            {expandedSection === "sec_rbac" && (
              <div className="p-6 pt-0 border-t border-slate-100 space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800">
                      TECHNICAL_ADMIN
                    </span>
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Quản trị Kỹ thuật</h3>
                    <p className="text-xs text-slate-600">
                      Toàn quyền quản lý tài khoản, cấu hình mã nguồn, kiểm tra hệ thống, giám sát tài nguyên và xem Audit Logs.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                      CONTENT_ADMIN
                    </span>
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Quản trị Nội dung</h3>
                    <p className="text-xs text-slate-600">
                      Quản lý cấu hình bộ câu hỏi phiên bản 3.3, phê duyệt danh mục chuyên đề đào tạo và ma trận chuẩn năng lực.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      REVIEWER
                    </span>
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Thẩm tra viên (Khoa Cơ sở)</h3>
                    <p className="text-xs text-slate-600">
                      Vận hành Bàn rà soát phiếu nghi trùng, xem dữ liệu chi tiết, duyệt tính hợp lệ hoặc loại trừ phiếu, phân tích 6 bảng số liệu nội bộ.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-100 text-violet-800">
                      PROGRESS_MONITOR
                    </span>
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Theo dõi Tiến độ</h3>
                    <p className="text-xs text-slate-600">
                      Giám sát số lượng phiếu tiếp nhận theo ngày, tiến độ từng tỉnh/xã trên biểu đồ Dashboard và xem báo cáo tổng hợp.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1.5 col-span-1 md:col-span-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900">
                      LOCAL_COORDINATOR (Đầu mối địa phương)
                    </span>
                    <h3 className="font-bold text-amber-950 text-xs sm:text-sm">Đầu mối Cấp Tỉnh / Sở Tài chính</h3>
                    <p className="text-xs text-amber-900/90 leading-relaxed">
                      <strong>Chính sách Bảo mật Zero-PII:</strong> Đầu mối địa phương chỉ được xem số liệu tiến độ của tỉnh mình và chỉ được xem 6 bảng tổng hợp đã <strong>áp dụng triệt để thuật toán làm mờ số liệu nhỏ &lt;5 người</strong>. Tuyệt đối không được cấp quyền xem dữ liệu thô, không xem bảng nội bộ và không xuất dữ liệu chưa ẩn danh.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section: Theo dõi tiến độ & Tải 34 Mã QR */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection("sec_progress")}
              className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    2. Theo dõi Tiến độ & Phát hành Bộ 34 Mã QR Cấp Tỉnh (ADR-008)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Cách thức điều phối đợt khảo sát diện rộng trên 34 tỉnh và 3.321 xã
                  </p>
                </div>
              </div>
              {expandedSection === "sec_progress" ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>

            {expandedSection === "sec_progress" && (
              <div className="p-6 pt-0 border-t border-slate-100 space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <div className="space-y-3">
                  <h3 className="font-bold text-slate-900">Quy trình Điều phối Mã QR:</h3>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>
                      <strong>Truy cập Trang Quản lý Mã QR:</strong> Vào menu <em>"Đợt khảo sát & Mã QR"</em> tại đường dẫn <code>/admin/campaigns</code>.
                    </li>
                    <li>
                      <strong>Tải Trọn gói 34 Mã QR (ZIP):</strong> Bấm nút <em>"Tải trọn bộ 34 Mã QR (ZIP)"</em>. Hệ thống sẽ lập tức tạo file nén <code>34_Ma_QR_KhaoSat_KiemToan_2026.zip</code> chứa 34 ảnh PNG độ nét cao (512x512) kèm file hướng dẫn sử dụng.
                    </li>
                    <li>
                      <strong>Phát hành về Địa phương:</strong> Chuyên viên đính kèm file ảnh QR của từng tỉnh vào công văn hướng dẫn gửi UBND tỉnh và Sở Tài chính để triển khai đến cấp xã.
                    </li>
                    <li>
                      <strong>Giám sát trên Dashboard:</strong> Truy cập <code>/admin/dashboard</code> để theo dõi số lượng phiếu tăng trưởng theo biểu đồ diện tích thời gian thực và xếp hạng Top tỉnh tích cực.
                    </li>
                  </ol>
                </div>
              </div>
            )}
          </div>

          {/* Section: Bàn rà soát Phiếu Nghi trùng */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection("sec_duplicates")}
              className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    3. Quy trình Thẩm tra & Xử lý Phiếu Nghi trùng (Duplicate Workbench)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Thuật toán băm 4 điểm nghiệp vụ SHA-256 và quy trình ra quyết định của Thẩm tra viên
                  </p>
                </div>
              </div>
              {expandedSection === "sec_duplicates" ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>

            {expandedSection === "sec_duplicates" && (
              <div className="p-6 pt-0 border-t border-slate-100 space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-sky-600" />
                    <span>Cơ chế Nhận diện Phiếu Nghi trùng (ADR-005):</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Hệ thống tính toán mã băm nghiệp vụ 4 điểm: <code>SHA-256(Mã xã + Mã cơ quan + Mã vị trí việc làm + 16 lựa chọn nhóm việc)</code>. Khi phát hiện 2 phiếu có mã băm giống hệt nhau trong cùng một địa bàn, hệ thống tự động gắn cờ <code>isSuspectedDuplicate = true</code> và chuyển trạng thái sang <strong>PENDING_REVIEW</strong>. Phiếu không bị xóa để bảo đảm tính toàn vẹn dữ liệu.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-slate-900">Các Bước Thẩm tra trên Giao diện:</h3>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>Vào trang <code>/admin/reviews/duplicates</code>, chọn nhóm nghi trùng cần rà soát.</li>
                    <li>Sử dụng giao diện <strong>Side-by-side Diff View</strong> so sánh thời điểm nộp, các mức tự đánh giá Phần III và ý kiến Phần IV.</li>
                    <li>
                      <strong>Nếu xác nhận là gửi đúp (lần nộp sau là bổ sung hoàn thiện):</strong> Bấm <em>"Loại trừ phiếu nộp trước"</em> (hệ thống yêu cầu nhập lý do thẩm tra, ví dụ: "Người trả lời nộp lại phiếu lần 2 có điều chỉnh").
                    </li>
                    <li>
                      <strong>Nếu là 2 người cùng chức danh trong xã (ví dụ: xã có 2 kế toán viên cùng làm):</strong> Thẩm tra viên bấm <em>"Chấp nhận (Tính)"</em> để đưa cả 2 phiếu vào tính toán 6 bảng.
                    </li>
                    <li>Mọi thao tác thẩm tra đều được lưu vết thời gian thực vào bảng <code>AuditLog</code>.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Section: Phân tích 6 Bảng Tổng hợp & Công thức Khoảng thiếu hụt */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection("sec_analytics")}
              className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    4. Khai thác 6 Bảng Tổng hợp & Phương pháp Tính Khoảng Thiếu hụt
                  </h2>
                  <p className="text-xs text-slate-500">
                    Đặc tả chi tiết các bảng B1 đến B6 và công thức Gap theo Phần IV Tài liệu số 2
                  </p>
                </div>
              </div>
              {expandedSection === "sec_analytics" ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>

            {expandedSection === "sec_analytics" && (
              <div className="p-6 pt-0 border-t border-slate-100 space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-100">
                    <h3 className="font-bold text-sky-950 text-xs sm:text-sm mb-1">
                      Công thức Tính Khoảng Thiếu hụt Năng lực (Bảng B3):
                    </h3>
                    <p className="text-xs text-sky-900 leading-relaxed">
                      Khoảng thiếu hụt: <code>Δ = Mức chuẩn yêu cầu (Benchmark Matrix 3.3) - Mức tự đánh giá (Câu 9)</code>
                    </p>
                    <ul className="list-disc pl-4 text-xs text-sky-900/90 mt-1 space-y-0.5">
                      <li>Nếu <code>Δ &gt; 0</code>: Cán bộ thuộc diện <strong>Dưới chuẩn</strong> (Thiếu 1 mức, 2 mức hoặc 3 mức).</li>
                      <li>Nếu <code>Δ &le; 0</code>: Cán bộ <strong>Đạt hoặc Vượt chuẩn</strong> (Gap = 0 hoặc âm).</li>
                      <li>Người thuộc trạng thái <em>"Chưa có dịp thực hiện"</em> được thống kê ở cột riêng, không tính vào khoảng thiếu hụt.</li>
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
                    <strong>Ghi chú Bắt buộc Dưới Tiêu đề Bảng B3:</strong><br />
                    <em>"Việc đánh giá khoảng thiếu hụt năng lực căn cứ theo Ma trận chuẩn năng lực phiên bản 3.3 ban hành kèm theo Quyết định của cấp có thẩm quyền. Tỷ lệ % tính trên tổng số người có thực hiện hoặc được phân công nhóm việc tương ứng."</em>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="border border-slate-200 rounded-2xl p-3">
                      <div className="font-bold text-slate-900 text-xs">Bảng B1: Người trả lời</div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Phân loại theo cơ quan, vị trí việc làm, tư cách và lý do loại trừ phiếu.</p>
                    </div>
                    <div className="border border-slate-200 rounded-2xl p-3">
                      <div className="font-bold text-slate-900 text-xs">Bảng B2: Nhóm công việc</div>
                      <p className="text-[11px] text-slate-500 mt-0.5">16 nhóm x 4 cột trạng thái, tổng tỷ lệ 4 cột luôn bằng đúng 100%.</p>
                    </div>
                    <div className="border border-slate-200 rounded-2xl p-3">
                      <div className="font-bold text-slate-900 text-xs">Bảng B4: Nội dung cần học</div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Xếp hạng nhu cầu đào tạo theo 3 mức độ cấp thiết (6 tháng, 12 tháng, khi có điều kiện).</p>
                    </div>
                    <div className="border border-slate-200 rounded-2xl p-3">
                      <div className="font-bold text-slate-900 text-xs">Bảng B5 & B6: Khó khăn & Hình thức</div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Tách rõ khó khăn thuộc đào tạo và khó khăn ngoài đào tạo (thể chế); 5 hình thức bồi dưỡng.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section: Thuật toán Ẩn danh & Xuất Excel */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection("sec_suppression_excel")}
              className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    5. Thuật toán Ẩn danh Số liệu Nhóm nhỏ & Xuất Báo cáo ExcelJS
                  </h2>
                  <p className="text-xs text-slate-500">
                    Ngưỡng bảo vệ &lt;5 người và quy trình xuất file Excel đa sheet chuẩn kiểm toán
                  </p>
                </div>
              </div>
              {expandedSection === "sec_suppression_excel" ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>

            {expandedSection === "sec_suppression_excel" && (
              <div className="p-6 pt-0 border-t border-slate-100 space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <EyeOff className="w-4 h-4 text-amber-600" />
                      <span>Thuật toán Statistical Disclosure Limitation (Ngưỡng &lt;5):</span>
                    </div>
                    <ul className="list-disc pl-5 text-xs space-y-1 text-slate-600">
                      <li><strong>Primary Suppression:</strong> Mọi ô đếm có giá trị từ 1 đến 4 người đều được hiển thị thành <code>"dưới 5 - không công bố"</code>. Ô có giá trị 0 hoặc từ 5 trở lên được hiển thị bình thường.</li>
                      <li><strong>Row Suppression:</strong> Nếu mẫu số chung của một dòng &lt; 5, làm mờ toàn bộ dòng (kể cả tỷ lệ % và các ô khác).</li>
                      <li><strong>Secondary Suppression:</strong> Khi trong một hàng có Tổng mà chỉ có đúng 1 ô bị làm mờ sơ cấp, thuật toán tự động làm mờ thêm ô nhỏ nhất khác 0 kế tiếp để triệt tiêu hoàn toàn khả năng lấy Tổng trừ các ô còn lại để suy đoán.</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                    <div className="font-bold text-emerald-950 flex items-center gap-2">
                      <Download className="w-4 h-4 text-emerald-700" />
                      <span>Hai Chế độ Xuất File Excel Đa Sheet:</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="bg-white p-3 rounded-xl border border-emerald-100">
                        <strong className="text-emerald-800">1. Bản Nội bộ (INTERNAL):</strong>
                        <p className="text-slate-600 mt-1">Xuất toàn bộ số liệu thực tế đầy đủ 100% phục vụ chuyên gia phân tích và lãnh đạo Kiểm toán nhà nước.</p>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-emerald-100">
                        <strong className="text-emerald-800">2. Bản Địa phương (LOCAL_CONFIDENTIAL):</strong>
                        <p className="text-slate-600 mt-1">Tự động áp dụng toàn diện thuật toán bảo vệ ẩn danh số liệu nhỏ &lt;5 người để gửi cho tỉnh hoặc công bố công khai.</p>
                      </div>
                    </div>
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
      {activeAudience === "SURVEY_RESPONDENT" && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
            <div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
                DÀNH CHO CÁN BỘ CẤP XÃ
              </span>
              <h2 className="text-lg font-black text-slate-900 mt-2">
                Quy trình 4 Bước Tham gia Khảo sát Trực tuyến trên Di động
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Thời gian thực hiện ước tính khoảng 15 đến 20 phút. Hệ thống tự động lưu trữ và bảo vệ danh tính 100%.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <span className="w-6 h-6 rounded-lg bg-sky-700 text-white flex items-center justify-center text-xs">1</span>
                  <span>Bước 1: Điền Thông tin Hành chính</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Quét mã QR của tỉnh bằng điện thoại hoặc nhấp vào đường link trong công văn. Chọn Tỉnh, Xã, Cơ quan (Đảng ủy, HĐND, UBND...) và chức danh thực tế của bạn.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <span className="w-6 h-6 rounded-lg bg-sky-700 text-white flex items-center justify-center text-xs">2</span>
                  <span>Bước 2: Khai báo 16 Nhóm Công việc</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Hệ thống tự động xếp các nhóm công việc thường gặp của chức vụ bạn lên đầu. Chọn 1 trong 4 trạng thái cho từng nhóm việc (Đang làm, Chưa có dịp, Chỉ phối hợp, Không được giao).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <span className="w-6 h-6 rounded-lg bg-sky-700 text-white flex items-center justify-center text-xs">3</span>
                  <span>Bước 3: Tự Đánh giá & Chọn Nhu cầu Học</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Lần lượt trả lời từng nhóm được phân công: chọn vai trò → tự chấm điểm năng lực (Mức 1 đến 4) → chọn tối đa 2 khó khăn → chọn chuyên đề học và mức độ cấp thiết.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <span className="w-6 h-6 rounded-lg bg-sky-700 text-white flex items-center justify-center text-xs">4</span>
                  <span>Bước 4: Chọn Hình thức Học & Gửi Phiếu</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Chọn tối đa 2 hình thức học tập phù hợp (lớp tập trung, trực tuyến E-learning, tài liệu tự học...), ghi ý kiến tự do (nếu có) và nhấn nút "Gửi kết quả khảo sát".
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
