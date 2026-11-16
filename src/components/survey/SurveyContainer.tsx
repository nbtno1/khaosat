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
import { Clock, Shield, CheckCircle2, HelpCircle } from "lucide-react";

interface SurveyContainerProps {
  linkMeta: SurveyLinkMeta;
  schemaData: SchemaConfigData;
}

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

  // Calculate step percentage
  const stepPercentage = isOutOfScope ? (step === 1 ? 50 : 100) : Math.round((step / 4) * 100);

  const scrollToTop = () => {
    document.getElementById("survey-scroll-container")?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="h-full max-h-screen w-full flex flex-col overflow-hidden bg-slate-50">
      {/* Header thương hiệu Kiểm toán nhà nước - CỐ ĐỊNH Ở TRÊN CÙNG */}
      <header className="shrink-0 bg-white border-b border-slate-200/90 shadow-xs px-4 sm:px-6 py-3.5 z-20">
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* VỊ TRÍ ĐẶT LOGO (LOGO SLOT) */}
              <AppLogo size="md" />

              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                  <Shield className="w-3 h-3" />
                  <span>KIỂM TOÁN NHÀ NƯỚC VIỆT NAM</span>
                </div>
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-snug">
                  Khảo sát Nhu cầu Đào tạo Cấp Xã
                </h1>
                <p className="text-[11px] text-slate-500">
                  Địa bàn: <strong className="text-slate-800">{linkMeta.provinceName}</strong> | Đợt: {linkMeta.campaignCode}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                onClick={() => setIsGuideOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-800 hover:bg-sky-100 text-xs font-bold border border-sky-200 transition-colors shadow-2xs cursor-pointer"
                title="Xem hướng dẫn làm bài và các lưu ý"
              >
                <HelpCircle className="w-3.5 h-3.5 text-sky-700" />
                <span>Hướng dẫn làm bài</span>
              </button>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-sky-700" />
                <span>~{estimatedMinutes} phút</span>
              </div>
            </div>
          </div>

          {/* Thanh tiến trình (Progress Bar) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
              <span>
                Bước {step}/4:{" "}
                {step === 1 && "Thông tin chung"}
                {step === 2 && "Nhóm công việc"}
                {step === 3 && "Đánh giá năng lực"}
                {step === 4 && "Hình thức học"}
              </span>
              <span className="text-sky-700 font-bold">{stepPercentage}% hoàn thành</span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-sky-700 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stepPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Form Content - SCROLL ĐỘC LẬP TRONG VÙNG NÀY, TOÀN TRANG KHÔNG SCROLL */}
      <main className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-6" id="survey-scroll-container">
        <div className="max-w-3xl mx-auto space-y-6">
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
        </div>
      </main>

      {/* Modal Hướng dẫn Làm bài Khảo sát */}
      <SurveyGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
};
