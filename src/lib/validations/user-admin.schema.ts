import { z } from "zod";

export const UserRoleEnum = z.enum([
  "TECHNICAL_ADMIN",
  "SYSTEM_ADMIN",
  "CONTENT_ADMIN",
  "REVIEWER",
  "PROGRESS_MONITOR",
  "LOCAL_COORDINATOR",
]);

export const CreateUserSchema = z.object({
  username: z
    .string()
    .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
    .max(50, "Tên đăng nhập tối đa 50 ký tự")
    .regex(/^[a-zA-Z0-9_.-]+$/, "Tên đăng nhập chỉ chứa chữ cái, số, gạch dưới, gạch ngang hoặc dấu chấm"),
  email: z
    .string()
    .email("Email không đúng định dạng")
    .max(100, "Email tối đa 100 ký tự"),
  password: z
    .string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .max(100, "Mật khẩu tối đa 100 ký tự"),
  fullName: z
    .string()
    .min(2, "Họ và tên phải có ít nhất 2 ký tự")
    .max(100, "Họ và tên tối đa 100 ký tự"),
  organization: z
    .string()
    .min(2, "Đơn vị/Cơ quan phải có ít nhất 2 ký tự")
    .max(150, "Đơn vị/Cơ quan tối đa 150 ký tự"),
  role: UserRoleEnum,
  assignedProvinceCodes: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export const UpdateUserSchema = z.object({
  fullName: z
    .string()
    .min(2, "Họ và tên phải có ít nhất 2 ký tự")
    .max(100, "Họ và tên tối đa 100 ký tự")
    .optional(),
  organization: z
    .string()
    .min(2, "Đơn vị/Cơ quan phải có ít nhất 2 ký tự")
    .max(150, "Đơn vị/Cơ quan tối đa 150 ký tự")
    .optional(),
  email: z
    .string()
    .email("Email không đúng định dạng")
    .max(100, "Email tối đa 100 ký tự")
    .optional(),
  role: UserRoleEnum.optional(),
  assignedProvinceCodes: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export const ResetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự")
    .max(100, "Mật khẩu tối đa 100 ký tự"),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
