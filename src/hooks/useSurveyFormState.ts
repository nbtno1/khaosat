"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  ALL_WORKGROUP_IDS,
  WorkgroupStatus,
  RoleId,
  Capacity,
  ExperienceYears,
  UrgencyLevel,
  LearningFormat,
  isUserOutOfScope,
  getActiveWorkgroupsForPart3,
  Part1Data,
  Part2Data,
  WorkgroupEvaluation,
  Part4Data,
} from "@/lib/validations/survey.schema";

export interface SurveyLinkMeta {
  token?: string;
  linkId: string;
  campaignId: string;
  campaignCode: string;
  campaignTitle: string;
  schemaVersion: string;
  provinceCode: string;
  provinceName: string;
  communes: Array<{ code: string; name: string; districtName?: string }>;
  isPilot: boolean;
  status: string;
}

export interface SchemaConfigData {
  version: string;
  workgroups: Array<{
    id: string;
    order: number;
    title: string;
    description: string;
    learningTopics: Array<{ topicId: string; topicTitle: string }>;
  }>;
  roles: Array<{
    roleId: RoleId;
    title: string;
    description: string;
    levelDescriptions: { "1": string; "2": string; "3": string; "4": string };
  }>;
  difficulties: Array<{ id: string; title: string; isExclusive?: boolean; category?: string }>;
  urgencyLevels: Array<{ id: string; title: string }>;
  learningFormats: Array<{ id: string; title: string }>;
}

export function useSurveyFormState(linkMeta: SurveyLinkMeta, schemaData: SchemaConfigData) {
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // PART 1 STATE
  const [part1, setPart1] = useState<Partial<Part1Data>>({
    provinceCode: linkMeta.provinceCode,
    provinceName: linkMeta.provinceName,
    districtName: "",
    communeCode: "",
    communeName: "",
    agencyCode: "",
    agencyName: "",
    positionCode: "",
    positionName: "",
    positionOtherText: "",
    capacities: [],
    capacityOtherText: "",
    experienceYears: undefined,
  });

  // POSITION MAPPING DATA
  const [suggestedWorkgroupIds, setSuggestedWorkgroupIds] = useState<string[]>([]);
  const [commonRoleId, setCommonRoleId] = useState<RoleId | null>(null);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(15);

  // Fetch position mapping when agencyCode or positionCode changes
  useEffect(() => {
    if (part1.agencyCode && part1.positionCode) {
      fetch(
        `/api/public/survey/position-mapping?agencyCode=${part1.agencyCode}&positionCode=${part1.positionCode}&version=${schemaData.version || "3.3"}`
      )
        .then((r) => r.json())
        .then((res) => {
          if (res.success && res.data) {
            setSuggestedWorkgroupIds(res.data.suggestedWorkgroupIds || []);
            setCommonRoleId(res.data.commonRoleId || null);
            setEstimatedMinutes(res.data.estimatedMinutes || 15);
          }
        })
        .catch((err) => console.error("Error fetching position mapping:", err));
    } else {
      setSuggestedWorkgroupIds([]);
    }
  }, [part1.agencyCode, part1.positionCode, schemaData.version]);

  // PART 2 STATE: 16 Workgroups (default empty, NO default selection per Rule 1)
  const [workgroupStatuses, setWorkgroupStatuses] = useState<Record<string, WorkgroupStatus>>({});
  const [otherWorkText, setOtherWorkText] = useState<string>("");

  // PART 3 STATE: Active workgroups dynamic evaluations
  const [part3Evaluations, setPart3Evaluations] = useState<Record<string, Partial<WorkgroupEvaluation>>>({});
  const [currentPart3Index, setCurrentPart3Index] = useState<number>(0);

  // PART 4 STATE: Learning Preferences & General Feedback
  const [part4, setPart4] = useState<Partial<Part4Data>>({
    learningFormats: [],
    generalFeedback: "",
  });

  // Helper: Is User completely Out-of-Scope (Early Exit)
  const isOutOfScope = useMemo(() => {
    return isUserOutOfScope(workgroupStatuses);
  }, [workgroupStatuses]);

  // Helper: List of workgroups that require Part III evaluation
  const activeWorkgroupIds = useMemo(() => {
    return getActiveWorkgroupsForPart3(workgroupStatuses);
  }, [workgroupStatuses]);

  // Sorted workgroups list for Step 2 (Suggested workgroups at top per Rule 1)
  const sortedWorkgroups = useMemo(() => {
    const suggestedSet = new Set(suggestedWorkgroupIds);
    return [...schemaData.workgroups].sort((a, b) => {
      const aSuggested = suggestedSet.has(a.id);
      const bSuggested = suggestedSet.has(b.id);
      if (aSuggested && !bSuggested) return -1;
      if (!aSuggested && bSuggested) return 1;
      return a.order - b.order;
    });
  }, [schemaData.workgroups, suggestedWorkgroupIds]);

  // Rule 9: Backward Navigation State Cleanup
  const updateWorkgroupStatus = useCallback(
    (wgId: string, newStatus: WorkgroupStatus) => {
      setWorkgroupStatuses((prev) => {
        const next = { ...prev, [wgId]: newStatus };
        return next;
      });

      // Cleanup Part 3 if status changed to CHI_PHOI_HOP or KHONG_DUOC_GIAO
      if (newStatus === "CHI_PHOI_HOP" || newStatus === "KHONG_DUOC_GIAO") {
        setPart3Evaluations((prev) => {
          const next = { ...prev };
          delete next[wgId];
          return next;
        });
      } else if (newStatus === "CHUA_CO_DIP") {
        // Clear difficulties if changed to CHUA_CO_DIP (Rule 5 & 9)
        setPart3Evaluations((prev) => {
          const existing = prev[wgId];
          if (!existing) return prev;
          return {
            ...prev,
            [wgId]: {
              ...existing,
              status: "CHUA_CO_DIP",
              difficulties: [],
            },
          };
        });
      }
    },
    []
  );

  // Update Part 3 evaluation for a specific workgroup
  const updateWorkgroupEvaluation = useCallback(
    (wgId: string, updater: (prev: Partial<WorkgroupEvaluation>) => Partial<WorkgroupEvaluation>) => {
      setPart3Evaluations((prev) => {
        const current = prev[wgId] || {
          workgroupId: wgId,
          status: workgroupStatuses[wgId] || "DANG_THUC_HIEN",
          roles: commonRoleId ? [commonRoleId] : [],
          selfEvaluations: [],
          difficulties: [],
          learningTopics: [],
          topicOtherText: "",
          urgencyLevel: undefined,
        };
        return {
          ...prev,
          [wgId]: updater(current),
        };
      });
    },
    [workgroupStatuses, commonRoleId]
  );

  // Submit Handler
  const submitSurvey = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Build Part 3 array
      const part3Array: WorkgroupEvaluation[] = activeWorkgroupIds.map((wgId) => {
        const e = part3Evaluations[wgId] || {};
        return {
          workgroupId: wgId,
          status: workgroupStatuses[wgId] || "DANG_THUC_HIEN",
          roles: e.roles || (commonRoleId ? [commonRoleId] : ["DIRECT"]),
          selfEvaluations: e.selfEvaluations || [],
          difficulties: e.difficulties || [],
          learningTopics: e.learningTopics || [],
          topicOtherText: e.topicOtherText || undefined,
          urgencyLevel: e.urgencyLevel,
        };
      });

      const payload = {
        token: linkMeta.token || (linkMeta as any).token,
        schemaVersion: schemaData.version || "3.3",
        part1: {
          provinceCode: part1.provinceCode,
          provinceName: part1.provinceName,
          districtName: part1.districtName || "Quận/Huyện",
          communeCode: part1.communeCode,
          communeName: part1.communeName,
          agencyCode: part1.agencyCode,
          agencyName: part1.agencyName,
          positionCode: part1.positionCode,
          positionName: part1.positionName,
          positionOtherText: part1.positionOtherText || undefined,
          capacities: part1.capacities || [],
          capacityOtherText: part1.capacityOtherText || undefined,
          experienceYears: part1.experienceYears,
        },
        part2: {
          workgroupStatuses,
          otherWorkText: otherWorkText || undefined,
        },
        part3: isOutOfScope ? [] : part3Array,
        part4: isOutOfScope
          ? undefined
          : {
              learningFormats: part4.learningFormats || [],
              generalFeedback: part4.generalFeedback || undefined,
            },
      };

      const res = await fetch("/api/public/survey/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Gửi phiếu thất bại. Vui lòng thử lại.");
      }

      setSubmitSuccess(true);
    } catch (err: any) {
      setSubmitError(err.message || "Lỗi mạng hoặc máy chủ khi gửi phiếu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
  };
}
