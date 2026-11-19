"use client";

import React, { useState } from "react";
import { LearningFormat, Part4Data, Part1Data } from "@/lib/validations/survey.schema";
import { SchemaConfigData } from "@/hooks/useSurveyFormState";
import { ArrowLeft, Send, AlertCircle } from "lucide-react";

interface StepLearningPreferencesProps {
  part4: Partial<Part4Data>;
  setPart4: React.Dispatch<React.SetStateAction<Partial<Part4Data>>>;
  part1: Partial<Part1Data>;
  activeWorkgroupsCount: number;
  schemaData: SchemaConfigData;
  onBackToPart3: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitError: string | null;
}

export const StepLearningPreferences: React.FC<StepLearningPreferencesProps> = ({
  part4,
  setPart4,
  part1,
  activeWorkgroupsCount,
  schemaData,
  onBackToPart3,
  onSubmit,
  isSubmitting,
  submitError,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedFormats = part4.learningFormats || [];

  const toggleFormat = (fId: LearningFormat) => {
    setPart4((prev) => {
      const existing = prev.learningFormats || [];
      if (existing.includes(fId)) {
        return {
          ...prev,
          learningFormats: existing.filter((f) => f !== fId),
        };
      } else {
        if (existing.length >= 2) {
          return prev;
        }
        return {
          ...prev,
          learningFormats: [...existing, fId],
        };
      }
    });
  };

  const handleConfirmSubmit = () => {
    if (selectedFormats.length === 0) {
      setErrorMsg("Vui lòng chọn ít nhất một hình thức học ở Câu 13.");
      return;
    }
    setErrorMsg(null);
    onSubmit();
  };

  return (
    <div className="divide-y divide-slate-100">
      {(errorMsg || submitError) && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-center gap-3 text-[15.5px] font-medium">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMsg || submitError}</span>
        </div>
      )}

      {/* Câu 13: Hình thức học */}
      <section className="pb-7">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-4">
          <h3 className="text-[20px] sm:text-[21px] font-bold text-[#0e1c2e] leading-snug">
            Câu 13. Hình thức bồi dưỡng phù hợp nhất (Chọn tối đa 2) <span className="text-rose-600">*</span>
          </h3>
          <span className="text-[15px] font-semibold text-[#12457a] shrink-0">
            Đã chọn: {selectedFormats.length} / 2
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {schemaData.learningFormats.map((fmt) => {
            const isSelected = selectedFormats.includes(fmt.id as LearningFormat);
            const isDisabled = !isSelected && selectedFormats.length >= 2;
            return (
              <label
                key={fmt.id}
                className={`flex items-center gap-3.5 min-h-[54px] px-4 py-3 rounded-[11px] text-[18px] transition-all duration-150 select-none ${
                  isSelected
                    ? "bg-[#e0edfc] border-2 border-[#0f3d6e] text-[#0a2747] font-semibold shadow-xs cursor-pointer"
                    : isDisabled
                    ? "bg-slate-50 border-[1.5px] border-slate-200 text-slate-400 opacity-60 cursor-not-allowed"
                    : "bg-white border-[1.5px] border-slate-300/90 text-[#111b27] hover:border-[#12457a]/60 hover:bg-[#f8fbfe] cursor-pointer"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={isDisabled}
                  onChange={() => !isDisabled && toggleFormat(fmt.id as LearningFormat)}
                  className="w-[21px] h-[21px] accent-[#0f3d6e] rounded shrink-0 cursor-pointer"
                />
                <span>{fmt.title}</span>
              </label>
            );
          })}
        </div>
      </section>

      {/* Câu 14: Ý kiến khác */}
      <section className="py-7">
        <h3 className="text-[20px] sm:text-[21px] font-bold text-[#0e1c2e] leading-snug mb-1.5">
          Câu 14. Ý kiến đề xuất khác (Không bắt buộc)
        </h3>
        <p className="text-[15px] text-slate-500 mb-3.5">
          Đề xuất cụ thể về nội dung, phương pháp hoặc thời gian tổ chức tập huấn (tối đa 500 ký tự).
        </p>

        <textarea
          rows={3}
          maxLength={500}
          value={part4.generalFeedback || ""}
          onChange={(e) =>
            setPart4((prev) => ({ ...prev, generalFeedback: e.target.value }))
          }
          placeholder="Nhập ý kiến, đề xuất của đồng chí..."
          className="w-full bg-[#f8fafc] hover:bg-white focus:bg-white border-[1.5px] border-slate-300 focus:border-[#12457a] focus:ring-4 focus:ring-[#12457a]/12 rounded-[11px] p-4 text-[17.5px] text-[#0e1c2e] outline-none transition-all"
        />
        <div className="text-right text-[14px] text-slate-400 mt-1.5">
          {(part4.generalFeedback || "").length} / 500 ký tự
        </div>
      </section>

      {/* Tóm tắt thông tin khai báo */}
      <section className="py-7">
        <div className="bg-gradient-to-r from-[#f2f7fd] to-[#f8fafc] border border-[#d4e1f0] rounded-[12px] p-5 text-[15.5px] text-slate-700 space-y-2">
          <div className="font-bold text-[#0e1c2e] text-[16.5px] mb-1">
            Tóm tắt thông tin khai báo
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            <div>
              <span className="text-slate-500">Địa bàn: </span>
              <strong className="font-semibold text-[#0e1c2e]">
                {part1.communeName}, {part1.provinceName}
              </strong>
            </div>
            <div>
              <span className="text-slate-500">Cơ quan: </span>
              <strong className="font-semibold text-[#0e1c2e]">{part1.agencyName}</strong>
            </div>
            <div>
              <span className="text-slate-500">Vị trí việc làm: </span>
              <strong className="font-semibold text-[#0e1c2e]">
                {part1.positionCode?.includes("KHAC")
                  ? part1.positionOtherText
                  : part1.positionName}
              </strong>
            </div>
            <div>
              <span className="text-slate-500">Số nhóm đánh giá sâu: </span>
              <strong className="font-semibold text-[#12633c]">
                {activeWorkgroupsCount} nhóm công việc
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation & Submit */}
      <div className="survey-actions pt-7 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBackToPart3}
          className="h-[50px] px-5 rounded-[11px] border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[16.5px] inline-flex items-center gap-2 transition-all cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại</span>
        </button>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleConfirmSubmit}
          className="h-[52px] px-7 sm:px-8 rounded-[11px] bg-gradient-to-b from-[#18804e] to-[#12633c] hover:from-[#157347] hover:to-[#0f5132] text-white font-semibold text-[17.5px] shadow-[0_6px_16px_-4px_rgba(18,99,60,0.38)] inline-flex items-center gap-2.5 transition-all disabled:opacity-50 cursor-pointer active:scale-95"
        >
          <Send className="w-5 h-5" />
          <span>{isSubmitting ? "Đang gửi phiếu..." : "Xác nhận & Gửi phiếu"}</span>
        </button>
      </div>
    </div>
  );
};
