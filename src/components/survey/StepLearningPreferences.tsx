"use client";

import React, { useState } from "react";
import { LearningFormat, Part4Data, Part1Data } from "@/lib/validations/survey.schema";
import { SchemaConfigData } from "@/hooks/useSurveyFormState";
import {
  GraduationCap,
  MessageSquare,
  ChevronLeft,
  Send,
  AlertCircle,
  CheckCircle,
  FileText,
} from "lucide-react";

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
          return prev; // Max 2 items
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
    <div className="space-y-6">
      {/* Banner Phần IV */}
      <div className="bg-sky-50 border-l-4 border-sky-600 p-4 rounded-r-lg space-y-1">
        <h3 className="text-sm font-semibold text-sky-900 uppercase tracking-wide flex items-center gap-1.5">
          <GraduationCap className="w-4 h-4 text-sky-600" />
          <span>Phần IV — Hình thức học và Ý kiến đóng góp</span>
        </h3>
        <p className="text-xs text-sky-800">
          Bước cuối cùng: Vui lòng cho biết hình thức học tập phù hợp nhất và gửi gắm ý kiến tới Kiểm toán nhà nước.
        </p>
      </div>

      {(errorMsg || submitError) && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
          <span>{errorMsg || submitError}</span>
        </div>
      )}

      {/* CÂU 13: HÌNH THỨC HỌC (CHỌN TỐI ĐA 2) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-1">
            Câu 13: Hình thức bồi dưỡng phù hợp nhất với điều kiện của đồng chí (chọn tối đa 2) <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-slate-500 mb-3">
            Hệ thống tự động khóa khi đồng chí đã chọn đủ 2 hình thức.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {schemaData.learningFormats.map((fmt) => {
              const isSelected = selectedFormats.includes(fmt.id as LearningFormat);
              return (
                <div
                  key={fmt.id}
                  onClick={() => toggleFormat(fmt.id as LearningFormat)}
                  className={`p-3.5 rounded-xl border cursor-pointer text-xs sm:text-sm transition-all flex items-center justify-between ${
                    isSelected
                      ? "bg-sky-50 border-sky-600 text-sky-950 font-semibold"
                      : selectedFormats.length >= 2
                      ? "bg-slate-50 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span>{fmt.title}</span>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={!isSelected && selectedFormats.length >= 2}
                    onChange={() => {}}
                    className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 ml-2"
                  />
                </div>
              );
            })}
          </div>

          <div className="text-right text-xs text-slate-400 mt-2">
            Đã chọn: {selectedFormats.length}/2 hình thức
          </div>
        </div>
      </div>

      {/* CÂU 14: Ý KIẾN KHÁC */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
          <MessageSquare className="w-4 h-4 text-sky-700" />
          <span>Câu 14: Ý kiến khác về nhu cầu đào tạo, bồi dưỡng (nếu có)</span>
        </div>
        <p className="text-xs text-slate-500">
          Không bắt buộc. Tối đa 500 ký tự.
        </p>

        <textarea
          rows={3}
          maxLength={500}
          value={part4.generalFeedback || ""}
          onChange={(e) =>
            setPart4((prev) => ({ ...prev, generalFeedback: e.target.value }))
          }
          placeholder="Nhập ý kiến, đề xuất cụ thể về nội dung, phương pháp, thời gian tổ chức tập huấn..."
          className="w-full bg-white border border-slate-300 focus:border-sky-600 focus:ring-1 focus:ring-sky-600 rounded-lg p-3 text-xs sm:text-sm text-slate-800"
        />
        <div className="text-right text-xs text-slate-400">
          {(part4.generalFeedback || "").length}/500 ký tự
        </div>
      </div>

      {/* TÓM TẮT XÁC NHẬN */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
        <div className="font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
          <FileText className="w-4 h-4 text-slate-600" />
          <span>Tóm tắt thông tin khai báo</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 pt-1">
          <div>
            <span className="text-slate-500">Địa bàn: </span>
            <span className="font-medium text-slate-900">
              {part1.communeName}, {part1.provinceName}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Cơ quan: </span>
            <span className="font-medium text-slate-900">{part1.agencyName}</span>
          </div>
          <div>
            <span className="text-slate-500">Vị trí việc làm: </span>
            <span className="font-medium text-slate-900">
              {part1.positionCode?.includes("KHAC")
                ? part1.positionOtherText
                : part1.positionName}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Số nhóm công việc đánh giá: </span>
            <span className="font-medium text-emerald-700 font-bold">
              {activeWorkgroupsCount} nhóm
            </span>
          </div>
        </div>
      </div>

      {/* Nút Điều hướng & Nộp bài */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={onBackToPart3}
          className="px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium text-sm flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Quay lại Phần III</span>
        </button>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleConfirmSubmit}
          className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
          <span>{isSubmitting ? "Đang gửi phiếu..." : "XÁC NHẬN VÀ GỬI PHIẾU"}</span>
        </button>
      </div>
    </div>
  );
};
