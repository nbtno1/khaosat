import { z } from "zod";
import { RoleIdEnum } from "./survey.schema";

// 1. Question Config Validation
export const QuestionConfigInputSchema = z.object({
  id: z.string().min(1, "Mã câu hỏi không được để trống"),
  order: z.number().int().min(1, "Thứ tự phải lớn hơn 0"),
  section: z.enum(["PART_I", "PART_II", "PART_III", "PART_IV"]),
  title: z.string().min(1, "Tiêu đề câu hỏi không được để trống"),
  description: z.string().optional(),
  instruction: z.string().optional(),
  isRequired: z.boolean().optional().default(true),
  maxSelect: z.number().int().min(1).optional(),
  isExclusiveSupported: z.boolean().optional().default(false),
});
export type QuestionConfigInput = z.infer<typeof QuestionConfigInputSchema>;

// 2. Learning Topic Validation
export const LearningTopicInputSchema = z.object({
  topicId: z.string().min(1, "Mã chuyên đề không được để trống"),
  topicTitle: z.string().min(1, "Tên chuyên đề không được để trống"),
});
export type LearningTopicInput = z.infer<typeof LearningTopicInputSchema>;

// 3. Workgroup Config Validation
export const WorkgroupInputSchema = z.object({
  id: z.string().min(1, "Mã nhóm công việc không được để trống"),
  order: z.number().int().min(1, "Thứ tự nhóm việc phải lớn hơn 0"),
  title: z.string().min(1, "Tên nhóm công việc không được để trống"),
  description: z.string().optional(),
  learningTopics: z.array(LearningTopicInputSchema).default([]),
});
export type WorkgroupInput = z.infer<typeof WorkgroupInputSchema>;

// 4. Role Config Validation
export const RoleInputSchema = z.object({
  roleId: RoleIdEnum,
  title: z.string().min(1, "Tên vai trò không được để trống"),
  description: z.string().optional().default(""),
  levelDescriptions: z.object({
    "1": z.string().min(1, "Mô tả Mức 1 không được để trống"),
    "2": z.string().min(1, "Mô tả Mức 2 không được để trống"),
    "3": z.string().min(1, "Mô tả Mức 3 không được để trống"),
    "4": z.string().min(1, "Mô tả Mức 4 không được để trống"),
  }),
});
export type RoleInput = z.infer<typeof RoleInputSchema>;

// 5. Difficulty Config Validation
export const DifficultyInputSchema = z.object({
  id: z.string().min(1, "Mã khó khăn không được để trống"),
  title: z.string().min(1, "Nội dung khó khăn không được để trống"),
  isExclusive: z.boolean().optional().default(false),
  category: z.string().optional(),
});
export type DifficultyInput = z.infer<typeof DifficultyInputSchema>;

// 6. Learning Format Config Validation
export const LearningFormatInputSchema = z.object({
  id: z.string().min(1, "Mã hình thức học không được để trống"),
  title: z.string().min(1, "Tên hình thức học không được để trống"),
});
export type LearningFormatInput = z.infer<typeof LearningFormatInputSchema>;

// 7. Versioning Validation
export const CreateVersionInputSchema = z.object({
  newVersion: z
    .string()
    .min(1, "Số hiệu phiên bản không được để trống")
    .regex(/^v?[0-9]+(\.[0-9]+)*$/, "Định dạng phiên bản phải là dạng số (ví dụ: 3.4, 4.0)"),
  sourceVersion: z.string().optional(),
  title: z.string().min(1, "Tiêu đề bộ phiếu không được để trống"),
  description: z.string().optional().default(""),
  approvedBy: z.string().optional(),
});
export type CreateVersionInput = z.infer<typeof CreateVersionInputSchema>;

// 8. Schema Metadata Update Validation
export const UpdateSchemaMetaInputSchema = z.object({
  title: z.string().min(1, "Tiêu đề bộ phiếu không được để trống").optional(),
  description: z.string().optional(),
  isApproved: z.boolean().optional(),
  approvedBy: z.string().optional(),
  approvedAt: z.string().datetime().optional().nullable(),
});
export type UpdateSchemaMetaInput = z.infer<typeof UpdateSchemaMetaInputSchema>;
