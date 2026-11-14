import { z } from "zod";
import crypto from "crypto";

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export const WorkgroupStatusEnum = z.enum([
  "DANG_THUC_HIEN",   // Đang thực hiện
  "CHUA_CO_DIP",       // Được giao nhưng chưa có dịp thực hiện
  "CHI_PHOI_HOP",     // Chỉ phối hợp
  "KHONG_DUOC_GIAO",  // Không được giao
]);
export type WorkgroupStatus = z.infer<typeof WorkgroupStatusEnum>;

export const RoleIdEnum = z.enum([
  "DIRECT",       // Trực tiếp thực hiện
  "ADVISORY",     // Tham mưu
  "SUPERVISORY",  // Kiểm tra, giám sát
  "APPROVAL",     // Quyết định, phê duyệt
]);
export type RoleId = z.infer<typeof RoleIdEnum>;

export const CapacityEnum = z.enum([
  "CAN_BO",
  "CONG_CHUC",
  "VIEN_CHUC",
  "DAI_BIEU_HDND",
  "KHONG_CHUYEN_TRACH",
  "NGUOI_LAO_DONG",
  "KHAC",
]);
export type Capacity = z.infer<typeof CapacityEnum>;

export const ExperienceYearsEnum = z.enum([
  "UNDER_1",      // Dưới 1 năm
  "FROM_1_TO_3",  // Từ 1 đến 3 năm
  "OVER_3",       // Trên 3 năm
]);
export type ExperienceYears = z.infer<typeof ExperienceYearsEnum>;

export const UrgencyLevelEnum = z.enum([
  "URGENT_6M",    // Cần học ngay (trong 6 tháng tới)
  "WITHIN_YEAR",  // Cần học trong năm
  "AFTER_YEAR",   // Có thể học sau một năm
]);
export type UrgencyLevel = z.infer<typeof UrgencyLevelEnum>;

export const LearningFormatEnum = z.enum([
  "F1", // Lớp tập trung ngắn ngày
  "F2", // Học trực tuyến
  "F3", // Kết hợp trực tuyến và tập trung
  "F4", // Hướng dẫn tại chỗ, theo hồ sơ thực tế
  "F5", // Tài liệu, sổ tay tự học
]);
export type LearningFormat = z.infer<typeof LearningFormatEnum>;

export const ALL_WORKGROUP_IDS = [
  "N01", "N02", "N03", "N04", "N05", "N06", "N07", "N08",
  "N09", "N10", "N11", "N12", "N13", "N14", "N15", "N16",
] as const;

// ============================================================================
// PART I SCHEMA: THÔNG TIN CHUNG
// ============================================================================

export const Part1Schema = z
  .object({
    provinceCode: z.string().min(1, "Vui lòng chọn Tỉnh/Thành phố"),
    provinceName: z.string().min(1, "Thiếu tên Tỉnh/Thành phố"),
    districtCode: z.string().optional(),
    districtName: z.string().min(1, "Thiếu Quận/Huyện/Thị xã"),
    communeCode: z.string().min(1, "Vui lòng chọn Xã/Phường/Thị trấn"),
    communeName: z.string().min(1, "Thiếu tên Xã/Phường/Thị trấn"),
    agencyCode: z.string().min(1, "Vui lòng chọn Cơ quan, đơn vị"),
    agencyName: z.string().min(1, "Thiếu tên Cơ quan, đơn vị"),
    positionCode: z.string().min(1, "Vui lòng chọn Vị trí việc làm"),
    positionName: z.string().min(1, "Thiếu tên Vị trí việc làm"),
    positionOtherText: z.string().max(255).optional(),
    capacities: z.array(CapacityEnum).min(1, "Vui lòng chọn ít nhất một tư cách làm việc"),
    capacityOtherText: z.string().max(255).optional(),
    experienceYears: ExperienceYearsEnum,
  })
  .refine(
    (data) => {
      if (data.positionCode.includes("KHAC") && !data.positionOtherText?.trim()) {
        return false;
      }
      return true;
    },
    {
      message: "Vui lòng ghi rõ vị trí việc làm khác",
      path: ["positionOtherText"],
    }
  )
  .refine(
    (data) => {
      if (data.capacities.includes("KHAC") && !data.capacityOtherText?.trim()) {
        return false;
      }
      return true;
    },
    {
      message: "Vui lòng ghi rõ tư cách làm việc khác",
      path: ["capacityOtherText"],
    }
  );

export type Part1Data = z.infer<typeof Part1Schema>;

// ============================================================================
// PART II SCHEMA: NHÓM CÔNG VIỆC (CÂU 6 & CÂU 7)
// ============================================================================

export const Part2Schema = z
  .object({
    workgroupStatuses: z.record(z.string(), WorkgroupStatusEnum),
    otherWorkText: z.string().max(500, "Ý kiến không được vượt quá 500 ký tự").optional(),
  })
  .refine(
    (data) => {
      // Must contain all 16 workgroups
      for (const wgId of ALL_WORKGROUP_IDS) {
        if (!data.workgroupStatuses[wgId]) {
          return false;
        }
      }
      return true;
    },
    {
      message: "Vui lòng trả lời đầy đủ tất cả 16 nhóm công việc",
      path: ["workgroupStatuses"],
    }
  );

export type Part2Data = z.infer<typeof Part2Schema>;

// Helper to check if a user is completely out-of-scope (Early Exit)
export function isUserOutOfScope(workgroupStatuses: Record<string, WorkgroupStatus>): boolean {
  return ALL_WORKGROUP_IDS.every((wgId) => {
    const status = workgroupStatuses[wgId];
    return status === "CHI_PHOI_HOP" || status === "KHONG_DUOC_GIAO";
  });
}

// Helper to filter which workgroups require Part III evaluation
export function getActiveWorkgroupsForPart3(workgroupStatuses: Record<string, WorkgroupStatus>): string[] {
  return ALL_WORKGROUP_IDS.filter((wgId) => {
    const status = workgroupStatuses[wgId];
    return status === "DANG_THUC_HIEN" || status === "CHUA_CO_DIP";
  });
}

// ============================================================================
// PART III SCHEMA: ĐÁNH GIÁ CHI TIẾT THEO NHÓM CÔNG VIỆC
// ============================================================================

export const SelfEvaluationItemSchema = z.object({
  roleId: RoleIdEnum,
  level: z.number().int().min(1).max(4),
});
export type SelfEvaluationItem = z.infer<typeof SelfEvaluationItemSchema>;

export const WorkgroupEvaluationSchema = z
  .object({
    workgroupId: z.string().min(1, "Thiếu mã nhóm công việc"),
    status: WorkgroupStatusEnum,
    roles: z.array(RoleIdEnum).min(1, "Vui lòng chọn ít nhất một vai trò thực hiện"),
    selfEvaluations: z.array(SelfEvaluationItemSchema).min(1, "Vui lòng tự đánh giá mức năng lực"),
    difficulties: z.array(z.string()).default([]),
    learningTopics: z.array(z.string()).default([]),
    topicOtherText: z.string().max(255).optional(),
    urgencyLevel: UrgencyLevelEnum.optional(),
  })
  // Validate that for each role in roles, there is a matching selfEvaluation
  .refine(
    (data) => {
      const evalRoleIds = new Set(data.selfEvaluations.map((e) => e.roleId));
      return data.roles.every((r) => evalRoleIds.has(r));
    },
    {
      message: "Vui lòng tự đánh giá cho tất cả các vai trò đã chọn",
      path: ["selfEvaluations"],
    }
  )
  // Validate Question 10 (Difficulties) constraints
  .refine(
    (data) => {
      if (data.status === "CHUA_CO_DIP") {
        // Must be empty for CHUA_CO_DIP
        return data.difficulties.length === 0;
      }
      if (data.status === "DANG_THUC_HIEN") {
        // Max 2 items
        if (data.difficulties.length > 2) return false;
        // Exclusive rule: KHONG_KHO_KHAN cannot be combined
        if (data.difficulties.includes("KHONG_KHO_KHAN") && data.difficulties.length > 1) {
          return false;
        }
      }
      return true;
    },
    {
      message: "Khó khăn chọn tối đa 2 mục; 'Không gặp khó khăn đáng kể' không được chọn cùng mục khác",
      path: ["difficulties"],
    }
  )
  // Validate Question 12 (Urgency level required if learningTopics selected)
  .refine(
    (data) => {
      if (data.learningTopics.length > 0 && !data.urgencyLevel) {
        return false;
      }
      return true;
    },
    {
      message: "Vui lòng chọn mức độ cần học cho nhóm công việc này",
      path: ["urgencyLevel"],
    }
  );

export type WorkgroupEvaluation = z.infer<typeof WorkgroupEvaluationSchema>;

// ============================================================================
// PART IV SCHEMA: HÌNH THỨC HỌC VÀ Ý KIẾN KHÁC (CÂU 13 & CÂU 14)
// ============================================================================

export const Part4Schema = z.object({
  learningFormats: z
    .array(LearningFormatEnum)
    .min(1, "Vui lòng chọn ít nhất một hình thức học")
    .max(2, "Vui lòng chọn tối đa 2 hình thức học phù hợp nhất"),
  generalFeedback: z.string().max(500, "Ý kiến khác không được vượt quá 500 ký tự").optional(),
});
export type Part4Data = z.infer<typeof Part4Schema>;

// ============================================================================
// FULL SUBMISSION SCHEMA (COMPLETE AUDIT / SURVEY ENGINE PAYLOAD)
// ============================================================================

export const SurveySubmissionSchema = z
  .object({
    token: z.string().min(1, "Thiếu token liên kết khảo sát"),
    schemaVersion: z.string().default("3.3"),
    part1: Part1Schema,
    part2: Part2Schema,
    part3: z.array(WorkgroupEvaluationSchema).default([]),
    part4: Part4Schema.optional(),
  })
  .superRefine((data, ctx) => {
    const isOutOfScope = isUserOutOfScope(data.part2.workgroupStatuses);

    if (isOutOfScope) {
      // Early exit: Part 3 and Part 4 are not required
      return;
    }

    // Normal flow:
    // Check Part 3 completeness: all active workgroups must have an evaluation
    const activeWgIds = getActiveWorkgroupsForPart3(data.part2.workgroupStatuses);
    const evalWgIds = new Set(data.part3.map((e) => e.workgroupId));

    for (const wgId of activeWgIds) {
      if (!evalWgIds.has(wgId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Chưa hoàn thành đánh giá cho nhóm công việc ${wgId}`,
          path: ["part3"],
        });
      }
    }

    // Part 4 is required for in-scope respondents
    if (!data.part4) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Vui lòng hoàn thành Phần IV (Hình thức học)",
        path: ["part4"],
      });
    }
  });

export type SurveySubmissionInput = z.infer<typeof SurveySubmissionSchema>;

// ============================================================================
// BUSINESS HASH COMPUTATION (4-POINT HASH FOR DUPLICATE DETECTION)
// ADR-005: sha256(communeCode + "|" + agencyCode + "|" + positionCode + "|" + sorted16Statuses)
// ============================================================================

export function computeBusinessHash(
  communeCode: string,
  agencyCode: string,
  positionCode: string,
  workgroupStatuses: Record<string, string>
): string {
  const sortedStatuses = ALL_WORKGROUP_IDS.map(
    (wgId) => `${wgId}:${workgroupStatuses[wgId] || "NONE"}`
  ).join(",");

  const rawString = `${communeCode}|${agencyCode}|${positionCode}|${sortedStatuses}`;
  return crypto.createHash("sha256").update(rawString).digest("hex");
}
