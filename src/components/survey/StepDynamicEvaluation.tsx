"use client";

import React, { useState } from "react";
import {
  RoleId,
  WorkgroupEvaluation,
  UrgencyLevel,
} from "@/lib/validations/survey.schema";
import { SchemaConfigData } from "@/hooks/useSurveyFormState";
import {
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Calendar,
  Layers,
} from "lucide-react";

interface StepDynamicEvaluationProps {
  activeWorkgroupIds: string[];
  currentPart3Index: number;
  setCurrentPart3Index: React.Dispatch<React.SetStateAction<number>>;
  part3Evaluations: Record<string, Partial<WorkgroupEvaluation>>;
  updateWorkgroupEvaluation: (
    wgId: string,
    updater: (prev: Partial<WorkgroupEvaluation>) => Partial<WorkgroupEvaluation>
  ) => void;
  workgroupStatuses: Record<string, any>;
  schemaData: SchemaConfigData;
  commonRoleId: RoleId | null;
  onBackToPart2: () => void;
  onNextToPart4: () => void;
}

export const StepDynamicEvaluation: React.FC<StepDynamicEvaluationProps> = ({
  activeWorkgroupIds,
  currentPart3Index,
  setCurrentPart3Index,
  part3Evaluations,
  updateWorkgroupEvaluation,
  workgroupStatuses,
  schemaData,
  commonRoleId,
  onBackToPart2,
  onNextToPart4,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentWgId = activeWorkgroupIds[currentPart3Index];
  const totalActive = activeWorkgroupIds.length;

  const currentWgDef = schemaData.workgroups.find((w) => w.id === currentWgId);
  const currentStatus = workgroupStatuses[currentWgId]; // DANG_THUC_HIEN or CHUA_CO_DIP
  const evalData = part3Evaluations[currentWgId] || {
    workgroupId: currentWgId,
    status: currentStatus,
    roles: commonRoleId ? [commonRoleId] : [],
    selfEvaluations: [],
    difficulties: [],
    learningTopics: [],
    topicOtherText: "",
    urgencyLevel: undefined,
  };

  const selectedRoles: RoleId[] = evalData.roles || [];
  const selfEvals = evalData.selfEvaluations || [];
  const selectedDiffs: string[] = evalData.difficulties || [];
  const selectedTopics: string[] = evalData.learningTopics || [];

  // Toggle Role in Question 8
  const toggleRole = (rId: RoleId) => {
    updateWorkgroupEvaluation(currentWgId, (prev) => {
      const existing = prev.roles || [];
      const updated = existing.includes(rId)
        ? existing.filter((r) => r !== rId)
        : [...existing, rId];

      // Cleanup Question 9: remove selfEvaluations for deselected role (Rule 9)
      const existingEvals = prev.selfEvaluations || [];
      const updatedEvals = existingEvals.filter((ev) => updated.includes(ev.roleId));

      return {
        ...prev,
        roles: updated,
        selfEvaluations: updatedEvals,
      };
    });
  };

  // Set Level in Question 9
  const setSelfAssessedLevel = (rId: RoleId, level: number) => {
    updateWorkgroupEvaluation(currentWgId, (prev) => {
      const existingEvals = prev.selfEvaluations || [];
      const filtered = existingEvals.filter((ev) => ev.roleId !== rId);
      return {
        ...prev,
        selfEvaluations: [...filtered, { roleId: rId, level }],
      };
    });
  };

  // Toggle Difficulty in Question 10 (Rule 6: Max 2 & Exclusive Option)
  const toggleDifficulty = (dId: string, isExclusive?: boolean) => {
    updateWorkgroupEvaluation(currentWgId, (prev) => {
      const existing = prev.difficulties || [];

      if (isExclusive) {
        // Exclusive option clicked: deselect all others
        const next = existing.includes(dId) ? [] : [dId];
        return { ...prev, difficulties: next };
      } else {
        // Non-exclusive option clicked: remove exclusive if present
        let next = existing.filter((id) => id !== "KHONG_KHO_KHAN");
        if (next.includes(dId)) {
          next = next.filter((id) => id !== dId);
        } else {
          if (next.length >= 2) {
            // Already 2 selected: ignore or replace
            return prev;
          }
          next.push(dId);
        }
        return { ...prev, difficulties: next };
      }
    });
  };

  // Toggle Learning Topic in Question 11
  const toggleLearningTopic = (tId: string) => {
    updateWorkgroupEvaluation(currentWgId, (prev) => {
      const existing = prev.learningTopics || [];
      const updated = existing.includes(tId)
        ? existing.filter((id) => id !== tId)
        : [...existing, tId];

      return {
        ...prev,
        learningTopics: updated,
        // Reset Question 12 if no topics left (Rule 7)
        urgencyLevel: updated.length === 0 ? undefined : prev.urgencyLevel,
      };
    });
  };

  // Set Urgency in Question 12
  const setUrgency = (urg: UrgencyLevel) => {
    updateWorkgroupEvaluation(currentWgId, (prev) => ({
      ...prev,
      urgencyLevel: urg,
    }));
  };

  // Validate current group before navigating
  const validateCurrentGroup = (): boolean => {
    if (selectedRoles.length === 0) {
      setErrorMsg("Vui lòng chọn ít nhất một vai trò ở Câu 8.");
      return false;
    }

    const evaluatedRoleIds = new Set(selfEvals.map((e) => e.roleId));
    for (const r of selectedRoles) {
      if (!evaluatedRoleIds.has(r)) {
        const roleDef = schemaData.roles.find((ro) => ro.roleId === r);
        setErrorMsg(
          `Vui lòng chọn mức tự đánh giá ở Câu 9 cho vai trò "${roleDef?.title}".`
        );
        return false;
      }
    }

    if (currentStatus === "DANG_THUC_HIEN" && selectedDiffs.length === 0) {
      setErrorMsg(
        "Vui lòng chọn khó khăn chính ở Câu 10 (chọn tối đa 2 mục hoặc 'Không gặp khó khăn đáng kể')."
      );
      return false;
    }

    if (selectedTopics.length > 0 && !evalData.urgencyLevel) {
      setErrorMsg(
        "Đồng chí đã chọn nội dung học ở Câu 11, vui lòng chọn mức độ cần học ở Câu 12."
      );
      return false;
    }

    setErrorMsg(null);
    return true;
  };

  const handleNextGroup = () => {
    if (!validateCurrentGroup()) return;

    if (currentPart3Index < totalActive - 1) {
      setCurrentPart3Index((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      onNextToPart4();
    }
  };

  const handlePrevGroup = () => {
    setErrorMsg(null);
    if (currentPart3Index > 0) {
      setCurrentPart3Index((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      onBackToPart2();
    }
  };

  return (
    <div className="space-y-6">
      {/* Thanh tiến trình lặp Phần III */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-sky-800 uppercase tracking-wide flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-sky-600" />
            <span>Phần III — Đánh giá chi tiết năng lực và nhu cầu</span>
          </div>
          <div className="text-sm font-bold text-slate-800">
            Nhóm {currentPart3Index + 1} / {totalActive} nhóm được giao
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeWorkgroupIds.map((wgId, idx) => (
            <button
              key={wgId}
              type="button"
              onClick={() => {
                if (validateCurrentGroup()) {
                  setCurrentPart3Index(idx);
                }
              }}
              className={`w-7 h-7 rounded-full text-xs font-bold transition-all flex items-center justify-center ${
                idx === currentPart3Index
                  ? "bg-sky-700 text-white ring-2 ring-sky-300"
                  : idx < currentPart3Index
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-200 text-slate-600 hover:bg-slate-300"
              }`}
              title={`Chuyển tới nhóm ${wgId}`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Header nhóm công việc hiện tại */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-sky-100 text-sky-800">
            {currentWgId}
          </span>
          <span
            className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
              currentStatus === "DANG_THUC_HIEN"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {currentStatus === "DANG_THUC_HIEN"
              ? "Đang thực hiện"
              : "Được giao nhưng chưa có dịp"}
          </span>
        </div>
        <h3 className="text-lg font-bold text-slate-900 leading-snug">
          {currentWgDef?.title}
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <span className="font-semibold text-slate-700">Phạm vi công việc: </span>
          {currentWgDef?.description}
        </p>
      </div>

      {/* CÂU 8: VAI TRÒ THỰC HIỆN (CHỌN NHIỀU) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-1">
            Câu 8: Vai trò của đồng chí đối với nhóm công việc này <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-slate-500 mb-3">
            Có thể chọn nhiều vai trò nếu đồng chí kiêm nhiệm hoặc tham gia nhiều công đoạn.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {schemaData.roles.map((r) => {
              const isSelected = selectedRoles.includes(r.roleId);
              return (
                <div
                  key={r.roleId}
                  onClick={() => toggleRole(r.roleId)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-sky-50 border-sky-600 ring-1 ring-sky-500"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="mt-1 w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                    />
                    <div className="space-y-0.5">
                      <div className="text-sm font-bold text-slate-900">{r.title}</div>
                      <div className="text-xs text-slate-600">{r.description}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CÂU 9: THANG TỰ ĐÁNH GIÁ 4 MỨC THEO VAI TRÒ (RULE 4) */}
      {selectedRoles.length > 0 && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-1">
              Câu 9: Mức tự đánh giá khả năng thực hiện đối với từng vai trò đã chọn <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-slate-500">
              Chọn mức phản ánh đúng nhất năng lực thực tế. Bấm vào từng mức để xem mô tả chuẩn.
            </p>
          </div>

          <div className="space-y-4">
            {selectedRoles.map((rId) => {
              const roleDef = schemaData.roles.find((ro) => ro.roleId === rId);
              const curLevel = selfEvals.find((e) => e.roleId === rId)?.level;

              return (
                <div
                  key={rId}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                    <h5 className="text-sm font-bold text-slate-900">
                      Vai trò: {roleDef?.title}
                    </h5>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((lvl) => {
                      const isSelected = curLevel === lvl;
                      const lvlKey = String(lvl) as "1" | "2" | "3" | "4";
                      const desc = roleDef?.levelDescriptions[lvlKey];

                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setSelfAssessedLevel(rId, lvl)}
                          className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all min-h-[90px] ${
                            isSelected
                              ? "bg-sky-700 text-white border-sky-700 shadow"
                              : "bg-white border-slate-200 hover:border-sky-300 text-slate-800"
                          }`}
                        >
                          <div className="text-xs font-bold uppercase mb-1">
                            Mức {lvl}
                          </div>
                          <div
                            className={`text-xs line-clamp-3 leading-tight ${
                              isSelected ? "text-sky-100" : "text-slate-600"
                            }`}
                          >
                            {desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {curLevel && (
                    <div className="text-xs text-sky-800 bg-sky-50 p-2.5 rounded-lg border border-sky-200">
                      <span className="font-semibold">Mô tả Mức {curLevel}: </span>
                      {roleDef?.levelDescriptions[String(curLevel) as "1" | "2" | "3" | "4"]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CÂU 10: KHÓ KHĂN CHÍNH (CHỈ HIỂN THỊ KHI ĐANG THỰC HIỆN - RULE 5 & 6) */}
      {currentStatus === "DANG_THUC_HIEN" && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-1">
              Câu 10: Khó khăn chính gặp phải trong nhóm công việc này (chọn tối đa 2) <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-slate-500 mb-3">
              Mục "Không gặp khó khăn đáng kể" là lựa chọn độc quyền (không chọn cùng các mục khác).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {schemaData.difficulties.map((d) => {
                const isSelected = selectedDiffs.includes(d.id);
                return (
                  <div
                    key={d.id}
                    onClick={() => toggleDifficulty(d.id, d.isExclusive)}
                    className={`p-3 rounded-lg border cursor-pointer text-xs sm:text-sm transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-sky-50 border-sky-600 text-sky-950 font-semibold"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span>{d.title}</span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 ml-2"
                    />
                  </div>
                );
              })}
            </div>
            <div className="text-right text-xs text-slate-400 mt-1">
              Đã chọn: {selectedDiffs.length}/2 khó khăn
            </div>
          </div>
        </div>
      )}

      {/* CÂU 11: NỘI DUNG CẦN HỌC (RULE 3) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-1">
            Câu 11: Nội dung cần được đào tạo, bồi dưỡng trong nhóm này
          </label>
          <p className="text-xs text-slate-500 mb-3">
            Chọn các chuyên đề cụ thể đồng chí có nhu cầu nâng cao kiến thức, kỹ năng.
          </p>

          <div className="space-y-2">
            {currentWgDef?.learningTopics.map((top) => {
              const isSelected = selectedTopics.includes(top.topicId);
              return (
                <label
                  key={top.topicId}
                  onClick={() => toggleLearningTopic(top.topicId)}
                  className={`flex items-start gap-3 p-3 rounded-lg border text-xs sm:text-sm cursor-pointer transition-all ${
                    isSelected
                      ? "bg-sky-50 border-sky-600 text-sky-950 font-medium"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="mt-0.5 w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 flex-shrink-0"
                  />
                  <span>{top.topicTitle}</span>
                </label>
              );
            })}
          </div>

          {selectedTopics.some((t) => t.toLowerCase().includes("khac")) && (
            <div className="mt-3">
              <input
                type="text"
                placeholder="Ghi rõ nội dung học khác..."
                value={evalData.topicOtherText || ""}
                onChange={(e) =>
                  updateWorkgroupEvaluation(currentWgId, (prev) => ({
                    ...prev,
                    topicOtherText: e.target.value,
                  }))
                }
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs sm:text-sm text-slate-800"
              />
            </div>
          )}
        </div>
      </div>

      {/* CÂU 12: MỨC ĐỘ CẦN HỌC (CHỈ HIỂN THỊ KHI CÂU 11 ĐƯỢC CHỌN - RULE 7) */}
      {selectedTopics.length > 0 && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-1">
              Câu 12: Mức độ cấp thiết cần học đối với nhóm này <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-slate-500 mb-3">
              Chọn một mức thời gian mong muốn tổ chức bồi dưỡng.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: "URGENT_6M", label: "Cần học ngay (trong 6 tháng tới)" },
                { id: "WITHIN_YEAR", label: "Cần học trong năm" },
                { id: "AFTER_YEAR", label: "Có thể học sau một năm" },
              ].map((urg) => {
                const isSelected = evalData.urgencyLevel === urg.id;
                return (
                  <button
                    key={urg.id}
                    type="button"
                    onClick={() => setUrgency(urg.id as UrgencyLevel)}
                    className={`p-3 rounded-lg border text-xs sm:text-sm font-medium transition-all text-center ${
                      isSelected
                        ? "bg-sky-700 text-white border-sky-700 shadow"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {urg.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Điều hướng giữa các nhóm */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={handlePrevGroup}
          className="px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium text-sm flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{currentPart3Index === 0 ? "Quay lại Phần II" : "Nhóm trước"}</span>
        </button>

        <button
          type="button"
          onClick={handleNextGroup}
          className="px-6 py-3 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-medium text-sm shadow flex items-center gap-1 transition-colors"
        >
          <span>
            {currentPart3Index < totalActive - 1
              ? `Đánh giá nhóm tiếp theo (${currentPart3Index + 2}/${totalActive})`
              : "Tiếp tục sang Phần IV: Hình thức học"}
          </span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
