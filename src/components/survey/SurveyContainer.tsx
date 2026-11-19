"use client";

import React, { useState } from "react";
import { useSurveyFormState, SurveyLinkMeta, SchemaConfigData } from "@/hooks/useSurveyFormState";
import { StepGeneralInfo } from "./StepGeneralInfo";
import { StepWorkgroups } from "./StepWorkgroups";
import { StepDynamicEvaluation } from "./StepDynamicEvaluation";
import { StepLearningPreferences } from "./StepLearningPreferences";
import { SurveySuccessModal } from "./SurveySuccessModal";
import { SurveyGuideModal } from "./SurveyGuideModal";
import { AppLogo } from "@/components/common/AppLogo";
import { HelpCircle, Check } from "lucide-react";

interface SurveyContainerProps {
  linkMeta: SurveyLinkMeta;
  schemaData: SchemaConfigData;
}

const STEP_TITLES: Record<number, string> = {
  1: "Thông tin chung",
  2: "Nhóm công việc được giao",
  3: "Đánh giá năng lực theo nhóm việc",
  4: "Hình thức học & Gửi phiếu",
};

export const SurveyContainer: React.FC<SurveyContainerProps> = ({
  linkMeta,
  schemaData,
}) => {
  const {
    step,
    setStep,
    isSubmitting,
    submitSuccess,
    submitError,
    part1,
    setPart1,
    suggestedWorkgroupIds,
    commonRoleId,
    estimatedMinutes,
    workgroupStatuses,
    updateWorkgroupStatus,
    otherWorkText,
    setOtherWorkText,
    sortedWorkgroups,
    isOutOfScope,
    activeWorkgroupIds,
    part3Evaluations,
    updateWorkgroupEvaluation,
    currentPart3Index,
    setCurrentPart3Index,
    part4,
    setPart4,
    submitSurvey,
  } = useSurveyFormState(linkMeta, schemaData);

  const [isGuideOpen, setIsGuideOpen] = useState(false);

  if (submitSuccess) {
    return (
      <SurveySuccessModal
        provinceName={part1.provinceName || linkMeta.provinceName}
        communeName={part1.communeName}
      />
    );
  }

  const stepPercentage = isOutOfScope ? (step === 1 ? 50 : 100) : Math.round((step / 4) * 100);

  const scrollToTop = () => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("survey-scroll-container")?.scrollTo({ top: 0, behavior: reducedMotion ? "instant" : "smooth" });
  };

  return (
    <div className="h-full max-h-screen w-full flex flex-col overflow-hidden civic-ambient-bg">
      {/* Frosted Top Header with KTNN Identity */}
      <header className="shrink-0 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-7 py-3.5 z-20 civic-top-accent">
        <div className="max-w-[960px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <AppLogo size="md" />
            <div className="min-w-0">
              <div className="text-[12.5px] sm:text-[13.5px] font-bold uppercase tracking-[0.03em] text-[#12457a] truncate">
                Kiểm toán nhà nước · {linkMeta.provinceName}
              </div>
              <h1 className="text-[18px] sm:text-[21.5px] font-bold text-[#0e1c2e] tracking-[-0.02em] leading-snug truncate">
                Khảo sát nhu cầu đào tạo cấp xã
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsGuideOpen(true)}
            aria-label="Hướng dẫn làm bài"
            className="shrink-0 h-[44px] px-3.5 sm:px-4.5 rounded-[10px] bg-white hover:bg-[#f5f8fc] text-[#12457a] text-[15px] font-semibold border border-slate-300/90 hover:border-[#9bb2cc] inline-flex items-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
            title="Xem hướng dẫn trả lời phiếu khảo sát"
          >
            <HelpCircle className="w-[18px] h-[18px]" />
            <span className="hidden sm:inline">Hướng dẫn</span>
          </button>
        </div>
      </header>

      {/* Main Centered Elevated Survey Sheet */}
      <div className="flex-1 min-h-0 max-w-[960px] w-full mx-auto sm:px-5 sm:pt-5 flex flex-col">
        <div className="flex-1 min-h-0 bg-white sm:border sm:border-slate-200/90 sm:border-b-0 sm:rounded-t-[18px] sm:shadow-[0_2px_6px_rgba(15,23,42,0.03),0_18px_44px_-14px_rgba(15,38,68,0.12)] flex flex-col overflow-hidden">
          {/* Continuous Slim Progress Bar */}
          <div className="shrink-0 h-[4px] bg-[#e8eef5] w-full">
            <div
              className="h-full bg-gradient-to-r from-[#0f3d6e] to-[#2563eb] rounded-r-full transition-all duration-200"
              style={{ width: `${stepPercentage}%` }}
            />
          </div>

          {/* Sheet Step Header */}
          <div className="shrink-0 px-5 sm:px-9 py-4 sm:py-5 border-b border-slate-100 bg-gradient-to-b from-[#f7faff] to-white flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[13px] sm:text-[13.5px] font-bold uppercase tracking-[0.06em] text-[#1d5ca3]">
                Bước {step} / 4 · Khảo sát ẩn danh · ~{estimatedMinutes} phút
              </div>
              <h2 className="text-[20px] sm:text-[24px] font-bold text-[#0e1c2e] tracking-[-0.025em] mt-0.5">
                {STEP_TITLES[step]}
              </h2>
            </div>

            {/* Desktop Connected 4-Step Indicator */}
            <div className="hidden sm:flex items-center gap-2 shrink-0" aria-label={`Bước ${step} trên 4`}>
              {[1, 2, 3, 4].map((n, idx) => (
                <React.Fragment key={n}>
                  {idx > 0 && (
                    <span
                      className={`w-6 h-[2px] rounded-full transition-colors ${
                        n <= step ? "bg-[#157347]" : "bg-slate-200"
                      }`}
                    />
                  )}
                  <span
                    className={`w-[34px] h-[34px] rounded-full border-2 flex items-center justify-center text-[14.5px] font-bold transition-all ${
                      n < step
                        ? "bg-[#157347] border-[#157347] text-white"
                        : n === step
                        ? "bg-gradient-to-b from-[#1d5ca3] to-[#0f3d6e] border-[#0f3d6e] text-white shadow-[0_0_0_4px_rgba(29,92,163,0.16)]"
                        : "bg-white border-slate-300 text-slate-500"
                    }`}
                  >
                    {n < step ? <Check className="w-4 h-4 stroke-[2.5]" /> : n}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Independent Scrollable Form Body */}
          <main
            className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-9 py-6 sm:py-7 [overflow-wrap:anywhere]"
            id="survey-scroll-container"
          >
            {step === 1 && (
              <StepGeneralInfo
                part1={part1}
                setPart1={setPart1}
                linkMeta={linkMeta}
                onNext={() => {
                  setStep(2);
                  scrollToTop();
                }}
              />
            )}

            {step === 2 && (
              <StepWorkgroups
                workgroupStatuses={workgroupStatuses}
                updateWorkgroupStatus={updateWorkgroupStatus}
                otherWorkText={otherWorkText}
                setOtherWorkText={setOtherWorkText}
                sortedWorkgroups={sortedWorkgroups}
                suggestedWorkgroupIds={suggestedWorkgroupIds}
                isOutOfScope={isOutOfScope}
                onBack={() => {
                  setStep(1);
                  scrollToTop();
                }}
                onNext={() => {
                  setStep(3);
                  scrollToTop();
                }}
                onSubmitEarlyExit={submitSurvey}
                isSubmitting={isSubmitting}
              />
            )}

            {step === 3 && (
              <StepDynamicEvaluation
                activeWorkgroupIds={activeWorkgroupIds}
                currentPart3Index={currentPart3Index}
                setCurrentPart3Index={setCurrentPart3Index}
                part3Evaluations={part3Evaluations}
                updateWorkgroupEvaluation={updateWorkgroupEvaluation}
                workgroupStatuses={workgroupStatuses}
                schemaData={schemaData}
                commonRoleId={commonRoleId}
                onBackToPart2={() => {
                  setStep(2);
                  scrollToTop();
                }}
                onNextToPart4={() => {
                  setStep(4);
                  scrollToTop();
                }}
              />
            )}

            {step === 4 && (
              <StepLearningPreferences
                part4={part4}
                setPart4={setPart4}
                part1={part1}
                activeWorkgroupsCount={activeWorkgroupIds.length}
                schemaData={schemaData}
                onBackToPart3={() => {
                  setStep(3);
                  scrollToTop();
                }}
                onSubmit={submitSurvey}
                isSubmitting={isSubmitting}
                submitError={submitError}
              />
            )}
          </main>
        </div>
      </div>

      {/* Modal Hướng dẫn Làm bài Khảo sát */}
      <SurveyGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
};
