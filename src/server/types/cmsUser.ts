import { z } from "zod";

// Zod + tipe untuk akun CMS (super_admin / editor). Dipakai di service & form.

export type CmsRole = "super_admin" | "editor";

export const CMS_ROLE_LABELS: Record<CmsRole, string> = {
  super_admin: "Super Admin",
  editor: "Editor",
};

export const cmsLoginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
});
export type CmsLoginInput = z.infer<typeof cmsLoginSchema>;

// Buat akun baru — kata sandi wajib.
export const cmsUserCreateSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(255),
  email: z.string().email("Email tidak valid").max(255),
  role: z.enum(["super_admin", "editor"]),
  password: z.string().min(6, "Kata sandi minimal 6 karakter"),
});
export type CmsUserCreateInput = z.infer<typeof cmsUserCreateSchema>;

// Sunting akun — kata sandi opsional (diisi hanya bila ingin di-reset).
export const cmsUserUpdateSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(255),
  email: z.string().email("Email tidak valid").max(255),
  role: z.enum(["super_admin", "editor"]),
  password: z
    .string()
    .min(6, "Kata sandi minimal 6 karakter")
    .optional()
    .or(z.literal("")),
});
export type CmsUserUpdateInput = z.infer<typeof cmsUserUpdateSchema>;

// DTO publik (tanpa hash kata sandi).
export type CmsUserDTO = {
  id: string;
  name: string;
  email: string;
  role: CmsRole;
  active: boolean;
  createdAt: Date | null;
};
