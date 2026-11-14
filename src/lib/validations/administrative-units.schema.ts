import { z } from "zod";

/**
 * Zod Schema xác thực dữ liệu Tỉnh / Thành phố
 */
export const ProvinceInputSchema = z.object({
  provinceCode: z
    .string()
    .trim()
    .regex(/^\d{2}$/, "Mã tỉnh phải gồm đúng 2 chữ số (ví dụ: 01, 19, 79)"),
  name: z
    .string()
    .trim()
    .min(2, "Tên tỉnh tối thiểu 2 ký tự")
    .max(100, "Tên tỉnh tối đa 100 ký tự"),
  fullName: z
    .string()
    .trim()
    .min(2, "Tên đầy đủ tối thiểu 2 ký tự")
    .max(150, "Tên đầy đủ tối đa 150 ký tự"),
  type: z
    .enum(["Tỉnh", "Thành phố", "Thành phố trực thuộc TW", "Thành phố trực thuộc Trung ương"])
    .default("Tỉnh"),
  region: z
    .enum(["Miền Bắc", "Miền Trung", "Miền Nam", "Tây Nguyên"])
    .optional(),
  targetRespondents: z
    .number()
    .int()
    .min(10, "Chỉ tiêu tối thiểu 10 phiếu")
    .max(10000, "Chỉ tiêu tối đa 10.000 phiếu")
    .default(100),
  communeCount: z.number().int().min(0).optional(),
  url: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export type ProvinceInput = z.infer<typeof ProvinceInputSchema>;

/**
 * Zod Schema xác thực dữ liệu Xã / Phường / Thị trấn / Đặc khu
 */
export const CommuneInputSchema = z.object({
  communeCode: z
    .string()
    .trim()
    .regex(/^\d{5}$/, "Mã xã phải gồm đúng 5 chữ số (ví dụ: 00004, 05977)"),
  name: z
    .string()
    .trim()
    .min(2, "Tên xã/phường tối thiểu 2 ký tự")
    .max(100, "Tên xã/phường tối đa 100 ký tự"),
  type: z
    .enum(["Phường", "Xã", "Thị trấn", "Đặc khu"])
    .default("Xã"),
  provinceCode: z
    .string()
    .trim()
    .regex(/^\d{2}$/, "Mã tỉnh phải gồm đúng 2 chữ số"),
  provinceName: z.string().trim().min(2, "Tên tỉnh không được để trống"),
  districtName: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
  areaKm2: z.number().positive("Diện tích phải là số dương").optional(),
  population: z.number().int().positive("Dân số phải là số dương").optional(),
  resolution: z.string().trim().optional(),
  url: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export type CommuneInput = z.infer<typeof CommuneInputSchema>;

/**
 * Filter query parameters schema
 */
export const ProvincesQuerySchema = z.object({
  search: z.string().optional(),
  type: z.string().optional(),
  status: z.enum(["ALL", "ACTIVE", "INACTIVE"]).optional().default("ALL"),
  sort: z.enum(["code", "name", "communeCount"]).optional().default("code"),
});

export const CommunesQuerySchema = z.object({
  provinceCode: z.string().trim().optional(),
  search: z.string().optional(),
  type: z.string().optional(),
  status: z.enum(["ALL", "ACTIVE", "INACTIVE"]).optional().default("ALL"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(5).max(100).default(25),
});
