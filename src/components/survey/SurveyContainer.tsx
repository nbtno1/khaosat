"use client";

import React from "react";
import { useSurveyFormState, SurveyLinkMeta, SchemaConfigData } from "@/hooks/useSurveyFormState";
import { StepGeneralInfo } from "./StepGeneralInfo";
import { StepWorkgroups } from "./StepWorkgroups";
import { StepDynamicEvaluation } from "./StepDynamicEvaluation";
import { StepLearningPreferences } from "./StepLearningPreferences";
import { SurveySuccessModal } from "./SurveySuccessModal";
import { Clock, Shield, CheckCircle2 } from "lucide-react";

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

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Header thương hiệu Kiểm toán nhà nước */}
      <header className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
              <Shield className="w-3.5 h-3.5" />
              <span>KIỂM TOÁN NHÀ NƯỚC VIỆT NAM</span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
              Khảo sát Nhu cầu Đào tạo Cấp Xã (Phiên bản 3.3)
            </h1>
            <p className="text-xs text-slate-500">
              Địa bàn: <strong className="text-slate-800">{linkMeta.provinceName}</strong> | Đợt: {linkMeta.campaignCode}
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold self-start sm:self-center border border-slate-200 shadow-sm">
            <Clock className="w-4 h-4 text-sky-700" />
            <span>Thời gian ước tính: ~{estimatedMinutes} phút</span>
          </div>
        </div>

        {/* Thanh tiến trình (Progress Bar) */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>
              Bước {step}/4:{" "}
              {step === 1 && "Thông tin chung"}
              {step === 2 && "Nhóm công việc"}
              {step === 3 && "Đánh giá năng lực"}
              {step === 4 && "Hình thức học"}
            </span>
            <span className="text-sky-700">{stepPercentage}% hoàn thành</span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-sky-700 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${stepPercentage}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Form Content */}
      <main>
        {step === 1 && (
          <StepGeneralInfo
            part1={part1}
            setPart1={setPart1}
            linkMeta={linkMeta}
            onNext={() => {
              setStep(2);
              window.scrollTo({ top: 0, behavior: "smooth" });
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
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onNext={() => {
              setStep(3);
              window.scrollTo({ top: 0, behavior: "smooth" });
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
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onNextToPart4={() => {
              setStep(4);
              window.scrollTo({ top: 0, behavior: "smooth" });
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
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onSubmit={submitSurvey}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        )}
      </main>
    </div>
  );
};
