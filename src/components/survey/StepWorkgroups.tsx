"use client";

import React, { useState } from "react";
import { WorkgroupStatus, ALL_WORKGROUP_IDS } from "@/lib/validations/survey.schema";
import {
  Briefcase,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Send,
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
  colorClass: string;
  activeClass: string;
}> = [
  {
    id: "DANG_THUC_HIEN",
    label: "Đang thực hiện",
    colorClass: "hover:border-emerald-500 hover:bg-emerald-50 text-emerald-800",
    activeClass: "bg-emerald-600 text-white border-emerald-600 shadow-sm",
  },
  {
    id: "CHUA_CO_DIP",
    label: "Được giao nhưng chưa có dịp",
    colorClass: "hover:border-amber-500 hover:bg-amber-50 text-amber-800",
    activeClass: "bg-amber-600 text-white border-amber-600 shadow-sm",
  },
  {
    id: "CHI_PHOI_HOP",
    label: "Chỉ phối hợp",
    colorClass: "hover:border-blue-400 hover:bg-blue-50 text-blue-800",
    activeClass: "bg-blue-600 text-white border-blue-600 shadow-sm",
  },
  {
    id: "KHONG_DUOC_GIAO",
    label: "Không được giao",
    colorClass: "hover:border-slate-400 hover:bg-slate-100 text-slate-700",
    activeClass: "bg-slate-700 text-white border-slate-700 shadow-sm",
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
    // Verify all 16 workgroups are answered
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
      {/* Banner hướng dẫn sắp xếp theo vị trí */}
      <div className="bg-sky-50 border-l-4 border-sky-600 p-4 rounded-r-lg space-y-2">
        <div className="flex items-center gap-2 text-sky-900 font-semibold text-sm uppercase">
          <Sparkles className="w-4 h-4 text-sky-600" />
          <span>Phần II — Các nhóm công việc về tài chính, tài sản công</span>
        </div>
        <p className="text-xs text-sky-800 leading-relaxed">
          Các nhóm công việc gắn với vị trí của đồng chí đã được tự động xếp lên đầu danh sách để thuận tiện lựa chọn. Đồng chí vui lòng xem hết cả 16 nhóm và chọn đúng thực tế công việc được phân công.
        </p>
        <div className="text-xs font-medium text-slate-600 pt-1">
          Đã chọn: <span className="text-sky-700 font-bold">{answeredCount}/16</span> nhóm công việc
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Danh sách 16 nhóm công việc */}
      <div className="space-y-4">
        {sortedWorkgroups.map((wg, idx) => {
          const isSuggested = suggestedSet.has(wg.id);
          const currentStatus = workgroupStatuses[wg.id];
          const isExpanded = expandedWgId === wg.id;

          return (
            <div
              key={wg.id}
              className={`bg-white rounded-xl border transition-all shadow-sm overflow-hidden ${
                currentStatus
                  ? "border-slate-300"
                  : isSuggested
                  ? "border-sky-300 ring-1 ring-sky-200"
                  : "border-slate-200"
              }`}
            >
              {/* Header của thẻ nhóm */}
              <div className="p-4 sm:p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-800">
                        {wg.id}
                      </span>
                      {isSuggested && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-sky-100 text-sky-800">
                          <Sparkles className="w-3 h-3 text-sky-600" />
                          Gợi ý theo vị trí
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-semibold text-slate-900 leading-snug">
                      {wg.title}
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleExpand(wg.id)}
                    className="text-slate-400 hover:text-slate-600 p-1 flex-shrink-0"
                    title="Xem chi tiết ví dụ công việc"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Mô tả chi tiết (Expander) */}
                {isExpanded && (
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-1">
                    <div className="font-semibold text-slate-800">Gồm những việc như:</div>
                    <p>{wg.description}</p>
                  </div>
                )}

                {/* 4 Lựa chọn loại trừ lẫn nhau */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {STATUS_OPTIONS.map((opt) => {
                    const isSelected = currentStatus === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => updateWorkgroupStatus(wg.id, opt.id)}
                        className={`min-h-[44px] px-2.5 py-2 rounded-lg border text-xs sm:text-sm font-medium transition-all text-center flex items-center justify-center ${
                          isSelected
                            ? opt.activeClass
                            : `bg-slate-50 border-slate-200 ${opt.colorClass}`
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Câu 7: Việc khác */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <label className="block text-sm font-semibold text-slate-800">
          Câu 7: Những công việc tài chính, tài sản công khác đồng chí đang làm nhưng chưa có trong 16 nhóm trên (nếu có)
        </label>
        <p className="text-xs text-slate-500">
          Không bắt buộc. Tối đa 500 ký tự.
        </p>
        <textarea
          rows={3}
          maxLength={500}
          value={otherWorkText}
          onChange={(e) => setOtherWorkText(e.target.value)}
          placeholder="Nhập nội dung công việc khác nếu có..."
          className="w-full bg-white border border-slate-300 focus:border-sky-600 focus:ring-1 focus:ring-sky-600 rounded-lg p-3 text-sm text-slate-800"
        />
        <div className="text-right text-xs text-slate-400">
          {otherWorkText.length}/500 ký tự
        </div>
      </div>

      {/* Thông báo Ngoài đối tượng (Early Exit - Rule 8) */}
      {isOutOfScope && answeredCount === 16 && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-2 text-emerald-900">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <Info className="w-5 h-5 text-emerald-600" />
            <span>Xác nhận hoàn thành khảo sát sớm</span>
          </div>
          <p className="text-xs leading-relaxed">
            Đồng chí không trực tiếp thực hiện hoặc tham mưu các nhóm công việc trong danh mục này (toàn bộ 16 nhóm đều là Chỉ phối hợp hoặc Không được giao). Sau khi bấm nút bên dưới, phiếu sẽ kết thúc và ghi nhận thành công. Trân trọng cảm ơn sự phối hợp của đồng chí!
          </p>
        </div>
      )}

      {/* Nút Điều hướng */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium text-sm flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Quay lại Phần I</span>
        </button>

        {isOutOfScope && answeredCount === 16 ? (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onSubmitEarlyExit}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? "Đang gửi phiếu..." : "Gửi phiếu kết thúc"}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-3 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-medium text-sm shadow flex items-center gap-1 transition-colors"
          >
            <span>Tiếp tục sang Phần III: Đánh giá chi tiết</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
