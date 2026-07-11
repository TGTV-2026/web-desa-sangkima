import { z } from "zod";

// Zod + tipe untuk akun CMS (super_admin / editor / rt). Dipakai di service & form.

export type CmsRole = "super_admin" | "editor" | "rt";

export const CMS_ROLE_LABELS: Record<CmsRole, string> = {
  super_admin: "Super Admin",
  editor: "Editor",
  rt: "Ketua RT",
};

export const cmsLoginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
});
export type CmsLoginInput = z.infer<typeof cmsLoginSchema>;

// Buat akun baru — selalu sebagai editor (super_admin tidak bisa dibuat lewat UI).
export const cmsUserCreateSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(255),
  email: z.string().email("Email tidak valid").max(255),
  password: z.string().min(6, "Kata sandi minimal 6 karakter"),
});
export type CmsUserCreateInput = z.infer<typeof cmsUserCreateSchema>;

// Sunting akun — peran tidak diubah lewat UI; kata sandi opsional (reset).
export const cmsUserUpdateSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(255),
  email: z.string().email("Email tidak valid").max(255),
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
  /** false = akun hanya bisa melihat isi CMS, semua aksi tulis ditolak. */
  emailVerified: boolean;
  /** hanya terisi untuk role "rt" */
  dusun: string | null;
  rt: string | null;
  createdAt: Date | null;
};

// === Bulk-create akun Ketua RT lewat CSV (super_admin) ===

// Satu baris CSV: nama,email,dusun,rt,sandi. Sandi bersifat SEMENTARA — akun
// dibuat dengan mustChangePassword=true sehingga wajib ganti saat login pertama.
export const rtCsvRowSchema = z.object({
  nama: z.string().trim().min(2, "Nama minimal 2 karakter").max(255),
  email: z.string().trim().email("Email tidak valid").max(255),
  dusun: z.string().trim().min(1, "Dusun wajib diisi").max(100),
  rt: z.string().trim().min(1, "Nomor RT wajib diisi").max(10),
  sandi: z.string().min(6, "Sandi minimal 6 karakter"),
});
export type RtCsvRow = z.infer<typeof rtCsvRowSchema>;

/** Hasil bulk-create: baris sukses & gagal dilaporkan per-baris ke super_admin. */
export type BulkRtResult = {
  dibuat: { nama: string; email: string; dusun: string; rt: string }[];
  gagal: { baris: number; alasan: string }[];
};

// === Kelola akun sendiri (berlaku untuk super_admin maupun editor) ===

const otpSchema = z
  .string()
  .trim()
  .regex(/^\d{4}$/, "Kode OTP terdiri dari 4 angka");

// Ganti kata sandi: wajib kata sandi saat ini agar akun tak bisa dibajak lewat
// perangkat admin yang ditinggal dalam keadaan masih login.
export const cmsChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Kata sandi saat ini wajib diisi"),
    newPassword: z.string().min(6, "Kata sandi baru minimal 6 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi kata sandi wajib diisi"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["confirmPassword"],
  });
export type CmsChangePasswordInput = z.infer<typeof cmsChangePasswordSchema>;

// Ganti email tahap 1: OTP dikirim ke email BARU (membuktikan email itu memang
// bisa diakses pemiliknya sebelum ditukar).
export const cmsRequestEmailChangeSchema = z.object({
  currentPassword: z.string().min(1, "Kata sandi saat ini wajib diisi"),
  newEmail: z.string().email("Email tidak valid").max(255),
});
export type CmsRequestEmailChangeInput = z.infer<
  typeof cmsRequestEmailChangeSchema
>;

// Ganti email tahap 2: verifikasi OTP yang dikirim ke email baru.
export const cmsVerifyEmailChangeSchema = z.object({ otp: otpSchema });
export type CmsVerifyEmailChangeInput = z.infer<
  typeof cmsVerifyEmailChangeSchema
>;

// Verifikasi email akun (editor baru): OTP dikirim ke email akun itu sendiri.
export const cmsVerifyEmailSchema = z.object({ otp: otpSchema });
export type CmsVerifyEmailInput = z.infer<typeof cmsVerifyEmailSchema>;

// Lupa kata sandi tahap 1: OTP dikirim ke email terdaftar.
export const cmsRequestPasswordResetSchema = z.object({
  email: z.string().email("Email tidak valid").max(255),
});
export type CmsRequestPasswordResetInput = z.infer<
  typeof cmsRequestPasswordResetSchema
>;

// Lupa kata sandi tahap 2: OTP + kata sandi baru.
export const cmsResetPasswordSchema = z
  .object({
    email: z.string().email("Email tidak valid").max(255),
    otp: otpSchema,
    newPassword: z.string().min(6, "Kata sandi baru minimal 6 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi kata sandi wajib diisi"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["confirmPassword"],
  });
export type CmsResetPasswordInput = z.infer<typeof cmsResetPasswordSchema>;
