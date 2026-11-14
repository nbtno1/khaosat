"use client";

import React, { useState } from "react";
import {
  HelpCircle,
  X,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  ShieldCheck,
  ChevronRight,
  BookOpen,
} from "lucide-react";

interface SurveyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SurveyGuideModal: React.FC<SurveyGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"STEPS" | "RULES" | "FAQ">("STEPS");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-sky-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-700/60 flex items-center justify-center text-sky-200 border border-sky-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-sky-300 tracking-wider">
                CẨM NANG NGƯỜI THAM GIA KHẢO SÁT
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                Hướng dẫn Điền Phiếu Khảo sát (Phiên bản 3.3)
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 bg-slate-50 px-4 pt-2 gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("STEPS")}
            className={`pb-2.5 px-3 border-b-2 transition-all ${
              activeTab === "STEPS"
                ? "border-sky-700 text-sky-800"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            4 Bước Thực hiện
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("RULES")}
            className={`pb-2.5 px-3 border-b-2 transition-all ${
              activeTab === "RULES"
                ? "border-sky-700 text-sky-800"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Quy tắc Lưu ý Quan trọng
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("FAQ")}
            className={`pb-2.5 px-3 border-b-2 transition-all ${
              activeTab === "FAQ"
                ? "border-sky-700 text-sky-800"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Câu hỏi Thường gặp (FAQ)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          {activeTab === "STEPS" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-100 flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-sky-700 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                    Bước 1: Khai báo Thông tin Chung (Phần I)
                  </h3>
                  <p className="text-slate-600 text-xs mt-0.5">
                    Chọn chính xác Tỉnh/Thành phố, Xã/Phường, Cơ quan (Đảng ủy, HĐND, UBND...) và Vị trí việc làm thực tế của bạn. Hệ thống sẽ căn cứ vị trí này để gợi ý các nhóm công việc tương ứng.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-100 flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-sky-700 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                    Bước 2: Xác định Tình trạng 16 Nhóm Công việc (Phần II)
                  </h3>
                  <p className="text-slate-600 text-xs mt-0.5">
                    Xem 16 nhóm công việc chuẩn cấp xã. Với từng nhóm, chọn 1 trong 4 trạng thái:
                    <strong className="text-slate-800"> Đang thực hiện</strong>, 
                    <strong className="text-slate-800"> Chưa có dịp</strong>, 
                    <strong className="text-slate-800"> Chỉ phối hợp</strong> hoặc 
                    <strong className="text-slate-800"> Không được phân công</strong>.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-100 flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-sky-700 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                    Bước 3: Tự Đánh giá Năng lực & Nhu cầu Học (Phần III)
                  </h3>
                  <p className="text-slate-600 text-xs mt-0.5">
                    Hệ thống tự động lặp qua các nhóm bạn được phân công:
                    chọn vai trò đảm nhận → tự chấm điểm năng lực (Mức 1 đến 4) → chọn khó khăn (tối đa 2 mục) → chọn các chuyên đề cần bồi dưỡng và mức độ cấp thiết.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-100 flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-sky-700 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                    Bước 4: Đề xuất Hình thức Học & Gửi Phiếu (Phần IV)
                  </h3>
                  <p className="text-slate-600 text-xs mt-0.5">
                    Chọn tối đa 2 hình thức bồi dưỡng phù hợp nhất, ghi ý kiến đóng góp tự do (nếu có), kiểm tra lại bảng tóm tắt và nhấn nút <strong className="text-emerald-700">"Gửi kết quả khảo sát"</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "RULES" && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Quy tắc Kết thúc Sớm (Ngoài phạm vi)</span>
                </div>
                <p className="text-xs leading-relaxed text-amber-900/90">
                  Nếu bạn chọn toàn bộ 16 nhóm công việc đều là <em>"Không được phân công"</em> hoặc <em>"Chỉ phối hợp"</em>, hệ thống sẽ xác định bạn thuộc diện ngoài đối tượng và kết thúc khảo sát ngay sau Bước 2 (không cần làm Bước 3 và Bước 4).
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-900">
                  <Lightbulb className="w-4 h-4 text-sky-600" />
                  <span>Ràng buộc chọn Khó khăn tại Câu 10</span>
                </div>
                <ul className="list-disc pl-4 text-xs space-y-1 text-slate-600">
                  <li>Chỉ được chọn <strong>tối đa 2 mục</strong> khó khăn cho mỗi nhóm công việc.</li>
                  <li>Nếu chọn mục <em>"Không gặp khó khăn đáng kể"</em> thì không được chọn kèm bất kỳ mục nào khác.</li>
                  <li>Nếu nhóm công việc ở trạng thái <em>"Chưa có dịp thực hiện"</em>, Câu 10 khó khăn sẽ tự động được ẩn.</li>
                </ul>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Chính sách Bảo mật Quyền riêng tư (Zero-PII)</span>
                </div>
                <p className="text-xs leading-relaxed text-emerald-900/90">
                  Phiếu khảo sát <strong>hoàn toàn ẩn danh</strong>. Hệ thống tuyệt đối không thu thập Họ và tên, Số điện thoại, Email cá nhân hay Số Căn cước công dân. Cán bộ hoàn toàn yên tâm phản ánh trung thực năng lực và khó khăn thực tế.
                </p>
              </div>
            </div>
          )}

          {activeTab === "FAQ" && (
            <div className="space-y-3">
              <div className="border border-slate-200 rounded-2xl p-3.5">
                <div className="font-bold text-slate-900 text-xs sm:text-sm">
                  1. Tôi có thể quay lại sửa câu trả lời trước đó không?
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Được. Bạn có thể bấm nút "Quay lại" ở bất kỳ bước nào. Khi bạn thay đổi trạng thái của một nhóm công việc, hệ thống sẽ tự động dọn dẹp các câu trả lời không còn phù hợp để bảo đảm tính nhất quán dữ liệu.
                </p>
              </div>

              <div className="border border-slate-200 rounded-2xl p-3.5">
                <div className="font-bold text-slate-900 text-xs sm:text-sm">
                  2. Mức 1, 2, 3, 4 trong tự đánh giá có ý nghĩa gì?
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Mức 1: Chưa nắm vững, cần có người hướng dẫn kèm cặp; Mức 2: Thực hiện được các công việc cơ bản; Mức 3: Độc lập thực hiện thành thạo và giải quyết được vấn đề phức tạp; Mức 4: Năng lực chuyên sâu, có thể hướng dẫn, đào tạo cho người khác.
                </p>
              </div>

              <div className="border border-slate-200 rounded-2xl p-3.5">
                <div className="font-bold text-slate-900 text-xs sm:text-sm">
                  3. Nếu lỡ gửi đúp phiếu thì hệ thống xử lý ra sao?
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Hệ thống có thuật toán phát hiện phiếu nghi trùng tự động. Thẩm tra viên của Kiểm toán nhà nước sẽ xem xét đối chiếu trên Bàn rà soát và phê duyệt giữ lại phiếu hợp lệ có điều chỉnh của bạn.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Hỗ trợ nghiệp vụ: Trường Đào tạo & Bồi dưỡng nghiệp vụ kiểm toán
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs transition-colors"
          >
            Đã hiểu, tiếp tục làm bài
          </button>
        </div>
      </div>
    </div>
  );
};
