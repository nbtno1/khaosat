"use client";

import React, { useState } from "react";
import { WorkgroupStatus, ALL_WORKGROUP_IDS } from "@/lib/validations/survey.schema";
import {
  Info,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Send,
  Sparkles,
} from "lucide-react";

interface StepWorkgroupsProps {
  workgroupStatuses: Record<string, WorkgroupStatus>;
  updateWorkgroupStatus: (wgId: string, status: WorkgroupStatus) => void;
  otherWorkText: string;
  setOtherWorkText: (val: string) => void;
  sortedWorkgroups: Array<{
    id: string;
    order: number;
    title: string;
    description: string;
  }>;
  suggestedWorkgroupIds: string[];
  isOutOfScope: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmitEarlyExit: () => void;
  isSubmitting: boolean;
}

const STATUS_OPTIONS: Array<{
  id: WorkgroupStatus;
  label: string;
  activeClass: string;
}> = [
    {
      id: "DANG_THUC_HIEN",
      label: "Đang thực hiện",
      activeClass: "bg-[#12633c] text-white border-2 border-[#12633c] font-semibold shadow-sm",
    },
    {
      id: "CHUA_CO_DIP",
      label: "Được giao, chưa có dịp",
      activeClass: "bg-[#b45309] text-white border-2 border-[#b45309] font-semibold shadow-sm",
    },
    {
      id: "CHI_PHOI_HOP",
      label: "Chỉ phối hợp",
      activeClass: "bg-[#12457a] text-white border-2 border-[#12457a] font-semibold shadow-sm",
    },
    {
      id: "KHONG_DUOC_GIAO",
      label: "Không được giao",
      activeClass: "bg-[#334155] text-white border-2 border-[#334155] font-semibold shadow-sm",
    },
  ];

export const StepWorkgroups: React.FC<StepWorkgroupsProps> = ({
  workgroupStatuses,
  updateWorkgroupStatus,
  otherWorkText,
  setOtherWorkText,
  sortedWorkgroups,
  suggestedWorkgroupIds,
  isOutOfScope,
  onBack,
  onNext,
  onSubmitEarlyExit,
  isSubmitting,
}) => {
  const [expandedWgId, setExpandedWgId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const answeredCount = Object.keys(workgroupStatuses).length;
  const suggestedSet = new Set(suggestedWorkgroupIds);

  const toggleExpand = (id: string) => {
    setExpandedWgId((prev) => (prev === id ? null : id));
  };

  const handleNext = () => {
    const unanswered = ALL_WORKGROUP_IDS.filter((id) => !workgroupStatuses[id]);
    if (unanswered.length > 0) {
      setErrorMsg(
        `Đồng chí còn ${unanswered.length} nhóm công việc chưa chọn trạng thái (Ví dụ: nhóm ${unanswered[0]}). Vui lòng xem xét đủ 16 nhóm.`
      );
      return;
    }

    setErrorMsg(null);
    if (isOutOfScope) {
      onSubmitEarlyExit();
    } else {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <p className="text-[16px] text-slate-600 leading-relaxed">
          Các nhóm công việc gắn với vị trí của đồng chí đã được xếp lên đầu danh sách. Vui lòng chọn đúng thực tế cho đủ 16 nhóm.
        </p>
        <span className="shrink-0 text-[15px] font-semibold text-[#12457a] bg-[#eaf2fc] px-3.5 py-1.5 rounded-full self-start sm:self-center">
          Đã chọn: {answeredCount} / 16
        </span>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-center gap-3 text-[15.5px] font-medium">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 16 Workgroups List - Highlighted Suggested Groups, Same Clean Layout */}
      <div className="space-y-3">
        {sortedWorkgroups.map((wg, idx) => {
          const isSuggested = suggestedSet.has(wg.id);
          const currentStatus = workgroupStatuses[wg.id];
          const isExpanded = expandedWgId === wg.id;

          return (
            <div
              key={wg.id}
              className={`space-y-3.5 transition-all ${
                isSuggested
                  ? "bg-gradient-to-r from-[#f1f7fe] to-[#f9fbff] border border-[#c8dcf4] border-l-4 border-l-[#12457a] rounded-[12px] px-4 sm:px-5 py-4 shadow-[0_2px_10px_-4px_rgba(18,69,122,0.12)]"
                  : "py-4 px-1 border-b border-slate-100 last:border-b-0"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  {isSuggested && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[13px] font-semibold bg-[#e2eefb] text-[#0f3d6e]">
                      <Sparkles className="w-3.5 h-3.5 text-[#1d5ca3]" />
                      <span>Gợi ý theo vị trí của đồng chí</span>
                    </span>
                  )}
                  <h4
                    className={`text-[19px] sm:text-[20px] font-bold leading-snug ${
                      isSuggested ? "text-[#0c2d52]" : "text-[#0e1c2e]"
                    }`}
                  >
                    {idx + 1}. {wg.title}
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={() => toggleExpand(wg.id)}
                  className="shrink-0 inline-flex items-center gap-1 text-[14.5px] font-medium text-slate-500 hover:text-[#12457a] px-2.5 py-1.5 rounded-lg hover:bg-white/80 transition-colors cursor-pointer"
                  title="Xem mô tả ví dụ công việc"
                >
                  <span className="hidden sm:inline">{isExpanded ? "Thu gọn" : "Chi tiết"}</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {isExpanded && (
                <div className="bg-white/90 px-4 py-3 rounded-xl border border-slate-200/80 text-[15px] text-slate-600 leading-relaxed">
                  {wg.description}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                {STATUS_OPTIONS.map((opt) => {
                  const isSelected = currentStatus === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => updateWorkgroupStatus(wg.id, opt.id)}
                      aria-pressed={isSelected}
                      className={`min-h-[50px] px-3.5 py-2.5 rounded-[10px] text-[16px] text-center flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-[0.985] ${
                        isSelected
                          ? opt.activeClass
                          : "bg-white border-[1.5px] border-slate-300/90 text-slate-700 font-medium hover:border-[#12457a]/60 hover:bg-[#f8fbfe]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Câu 7: Việc khác */}
      <div className="pt-6 border-t border-slate-200/80 space-y-2.5">
        <label className="block text-[19px] font-bold text-[#0e1c2e]">
          Câu 7. Công việc tài chính, tài sản công khác (nếu có)
        </label>
        <p className="text-[15px] text-slate-500">Không bắt buộc. Tối đa 500 ký tự.</p>
        <textarea
          rows={3}
          maxLength={500}
          value={otherWorkText}
          onChange={(e) => setOtherWorkText(e.target.value)}
          placeholder="Nhập nội dung công việc khác nếu có..."
          className="w-full bg-[#f8fafc] hover:bg-white focus:bg-white border-[1.5px] border-slate-300 focus:border-[#12457a] focus:ring-4 focus:ring-[#12457a]/12 rounded-[11px] p-4 text-[17px] text-[#0e1c2e] outline-none transition-all"
        />
        <div className="text-right text-[14px] text-slate-400">
          {otherWorkText.length} / 500 ký tự
        </div>
      </div>

      {/* Early Exit Notice */}
      {isOutOfScope && answeredCount === 16 && (
        <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-xl space-y-2 text-emerald-900">
          <div className="flex items-center gap-2 font-bold text-[17px]">
            <Info className="w-5 h-5 text-emerald-600" />
            <span>Xác nhận hoàn thành khảo sát sớm</span>
          </div>
          <p className="text-[15.5px] leading-relaxed">
            Đồng chí không trực tiếp thực hiện hoặc tham mưu các nhóm công việc trong danh mục này. Sau khi bấm nút bên dưới, phiếu sẽ kết thúc và ghi nhận thành công.
          </p>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="survey-actions flex items-center justify-between gap-4 pt-6 border-t border-slate-100">
        <button
          type="button"
          onClick={onBack}
          className="h-[50px] px-5 rounded-[11px] border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[16.5px] inline-flex items-center gap-2 transition-all cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại</span>
        </button>

        {isOutOfScope && answeredCount === 16 ? (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onSubmitEarlyExit}
            className="h-[52px] px-7 rounded-[11px] bg-gradient-to-b from-[#18804e] to-[#12633c] text-white font-semibold text-[17.5px] shadow-md inline-flex items-center gap-2.5 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-5 h-5" />
            <span>{isSubmitting ? "Đang gửi phiếu..." : "Gửi phiếu kết thúc"}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="h-[52px] px-7 rounded-[11px] civic-btn-primary font-semibold text-[17.5px] inline-flex items-center gap-2.5 cursor-pointer"
          >
            <span>Tiếp tục</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
