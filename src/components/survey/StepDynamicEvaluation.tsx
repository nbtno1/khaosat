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
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-center gap-3 text-[15.5px] font-medium">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Header nhóm công việc hiện tại */}
      <div className="pb-6 border-b border-slate-100 space-y-2.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span
            className={`px-3 py-1 rounded-full text-[13.5px] font-semibold ${
              currentStatus === "DANG_THUC_HIEN"
                ? "bg-[#edf9f2] text-[#12633c]"
                : "bg-[#fef6eb] text-[#a14a07]"
            }`}
          >
            {currentStatus === "DANG_THUC_HIEN"
              ? "Đang thực hiện"
              : "Được giao, chưa có dịp"}
          </span>
          <span className="text-[14.5px] font-medium text-slate-500">
            Nhóm {currentPart3Index + 1} / {totalActive}
          </span>
        </div>
        <h3 className="text-[21px] sm:text-[22px] font-bold text-[#0e1c2e] leading-snug">
          {currentWgDef?.title}
        </h3>
        {currentWgDef?.description && (
          <p className="text-[15.5px] text-slate-600 leading-relaxed">
            {currentWgDef.description}
          </p>
        )}
      </div>

      {/* CÂU 8: VAI TRÒ THỰC HIỆN (CHỌN NHIỀU) */}
      <div className="pb-7 border-b border-slate-100 space-y-4">
        <div>
          <label className="block text-[20px] font-bold text-[#0e1c2e] mb-1">
            Câu 8. Vai trò của đồng chí đối với nhóm công việc này <span className="text-rose-600">*</span>
          </label>
          <p className="text-[15px] text-slate-500">
            Có thể chọn nhiều vai trò nếu kiêm nhiệm hoặc tham gia nhiều công đoạn.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {schemaData.roles.map((r) => {
            const isSelected = selectedRoles.includes(r.roleId);
            return (
              <div
                key={r.roleId}
                onClick={() => toggleRole(r.roleId)}
                className={`p-4 rounded-[11px] border-[1.5px] cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? "bg-gradient-to-b from-[#f0f6fe] to-[#e8f2fc] border-[#12457a] shadow-xs"
                    : "bg-white border-slate-300/90 hover:border-[#12457a]/60 hover:bg-[#f8fbfe]"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="mt-1 w-[20px] h-[20px] accent-[#12457a] rounded shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="text-[17.5px] font-semibold text-[#0e1c2e]">{r.title}</div>
                    <div className="text-[14.5px] text-slate-600 leading-relaxed">{r.description}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CÂU 9: THANG TỰ ĐÁNH GIÁ 4 MỨC THEO VAI TRÒ (HIỂN THỊ ĐẦY ĐỦ, KHÔNG LINE-CLAMP) */}
      {selectedRoles.length > 0 && (
        <div className="pb-7 border-b border-slate-100 space-y-5">
          <div>
            <label className="block text-[20px] font-bold text-[#0e1c2e] mb-1">
              Câu 9. Mức tự đánh giá khả năng thực hiện theo từng vai trò <span className="text-rose-600">*</span>
            </label>
            <p className="text-[15px] text-slate-500">
              Chọn mức phản ánh đúng nhất năng lực thực tế hiện nay.
            </p>
          </div>

          <div className="space-y-5">
            {selectedRoles.map((rId) => {
              const roleDef = schemaData.roles.find((ro) => ro.roleId === rId);
              const curLevel = selfEvals.find((e) => e.roleId === rId)?.level;

              return (
                <div key={rId} className="space-y-3">
                  <h5 className="text-[17px] font-bold text-[#12457a]">
                    Vai trò: {roleDef?.title}
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((lvl) => {
                      const isSelected = curLevel === lvl;
                      const lvlKey = String(lvl) as "1" | "2" | "3" | "4";
                      const desc = roleDef?.levelDescriptions[lvlKey];

                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setSelfAssessedLevel(rId, lvl)}
                          className={`p-4 rounded-[12px] text-left flex flex-col justify-start gap-1.5 transition-all duration-150 cursor-pointer ${
                            isSelected
                              ? "bg-gradient-to-b from-[#f0f6fe] to-[#e8f2fc] border-2 border-[#12457a] text-[#0b2d52] shadow-xs"
                              : "bg-white border-[1.5px] border-slate-300/90 hover:border-[#12457a]/60 hover:bg-[#f8fbfe] text-[#0e1c2e]"
                          }`}
                        >
                          <div className="text-[16.5px] font-bold">Mức {lvl}</div>
                          <div className="text-[14.5px] text-slate-600 leading-relaxed">
                            {desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CÂU 10: KHÓ KHĂN CHÍNH (TỐI ĐA 2 & ĐỘC QUYỀN) */}
      {currentStatus === "DANG_THUC_HIEN" && (
        <div className="pb-7 border-b border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <label className="block text-[20px] font-bold text-[#0e1c2e] mb-1">
                Câu 10. Khó khăn chính gặp phải (Chọn tối đa 2) <span className="text-rose-600">*</span>
              </label>
              <p className="text-[15px] text-slate-500">
                Mục &ldquo;Không gặp khó khăn đáng kể&rdquo; không chọn cùng các mục khác.
              </p>
            </div>
            <span className="text-[15px] font-semibold text-[#12457a] shrink-0">
              Đã chọn: {selectedDiffs.length} / 2
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {schemaData.difficulties.map((d) => {
              const isSelected = selectedDiffs.includes(d.id);
              return (
                <label
                  key={d.id}
                  onClick={() => toggleDifficulty(d.id, d.isExclusive)}
                  className={`flex items-center gap-3.5 min-h-[54px] px-4 py-3 rounded-[11px] border-[1.5px] text-[17.5px] cursor-pointer transition-all duration-150 select-none ${
                    isSelected
                      ? "bg-gradient-to-b from-[#f0f6fe] to-[#e8f2fc] border-[#12457a] text-[#0b2d52] font-semibold shadow-xs"
                      : "bg-white border-slate-300/90 text-[#111b27] hover:border-[#12457a]/60 hover:bg-[#f8fbfe]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="w-[20px] h-[20px] accent-[#12457a] rounded shrink-0"
                  />
                  <span>{d.title}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* CÂU 11: NỘI DUNG CẦN HỌC */}
      <div className="pb-7 border-b border-slate-100 space-y-4">
        <div>
          <label className="block text-[20px] font-bold text-[#0e1c2e] mb-1">
            Câu 11. Nội dung cần được đào tạo, bồi dưỡng trong nhóm này
          </label>
          <p className="text-[15px] text-slate-500">
            Chọn các chuyên đề cụ thể đồng chí có nhu cầu nâng cao kiến thức, kỹ năng.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentWgDef?.learningTopics.map((top) => {
            const isSelected = selectedTopics.includes(top.topicId);
            return (
              <label
                key={top.topicId}
                onClick={() => toggleLearningTopic(top.topicId)}
                className={`flex items-start gap-3.5 min-h-[54px] px-4 py-3 rounded-[11px] border-[1.5px] text-[17.5px] cursor-pointer transition-all duration-150 select-none ${
                  isSelected
                    ? "bg-gradient-to-b from-[#f0f6fe] to-[#e8f2fc] border-[#12457a] text-[#0b2d52] font-semibold shadow-xs"
                    : "bg-white border-slate-300/90 text-[#111b27] hover:border-[#12457a]/60 hover:bg-[#f8fbfe]"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  className="mt-1 w-[20px] h-[20px] accent-[#12457a] rounded shrink-0"
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
              className="w-full min-h-[52px] bg-white border-[1.5px] border-slate-300 focus:border-[#12457a] focus:ring-4 focus:ring-[#12457a]/12 rounded-[11px] px-4 text-[17.5px] text-[#0e1c2e] outline-none"
            />
          </div>
        )}
      </div>

      {/* CÂU 12: MỨC ĐỘ CẦN HỌC */}
      {selectedTopics.length > 0 && (
        <div className="pb-7 border-b border-slate-100 space-y-4">
          <label className="block text-[20px] font-bold text-[#0e1c2e]">
            Câu 12. Mức độ cấp thiết cần học đối với nhóm này <span className="text-rose-600">*</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {[
              { id: "URGENT_6M", label: "Cần học ngay (trong 6 tháng)" },
              { id: "WITHIN_YEAR", label: "Cần học trong năm" },
              { id: "AFTER_YEAR", label: "Có thể học sau 1 năm" },
            ].map((urg) => {
              const isSelected = evalData.urgencyLevel === urg.id;
              return (
                <button
                  key={urg.id}
                  type="button"
                  onClick={() => setUrgency(urg.id as UrgencyLevel)}
                  className={`min-h-[52px] px-4 py-3 rounded-[11px] text-[17px] text-center transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-b from-[#f0f6fe] to-[#e8f2fc] border-2 border-[#12457a] text-[#0b2d52] font-semibold shadow-xs"
                      : "bg-white border-[1.5px] border-slate-300/90 text-slate-700 font-medium hover:border-[#12457a]/60 hover:bg-[#f8fbfe]"
                  }`}
                >
                  {urg.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Điều hướng giữa các nhóm */}
      <div className="flex items-center justify-between gap-4 pt-4">
        <button
          type="button"
          onClick={handlePrevGroup}
          className="h-[50px] px-5 rounded-[11px] border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[16.5px] inline-flex items-center gap-2 transition-all cursor-pointer active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>{currentPart3Index === 0 ? "Quay lại" : "Nhóm trước"}</span>
        </button>

        <button
          type="button"
          onClick={handleNextGroup}
          className="h-[52px] px-7 rounded-[11px] civic-btn-primary font-semibold text-[17.5px] inline-flex items-center gap-2 cursor-pointer"
        >
          <span>
            {currentPart3Index < totalActive - 1
              ? `Nhóm tiếp theo (${currentPart3Index + 2}/${totalActive})`
              : "Tiếp tục sang Bước 4"}
          </span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
