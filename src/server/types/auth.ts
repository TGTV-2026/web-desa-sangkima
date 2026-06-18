// server/types/auth.ts
import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(3, "Nama minimal 3 karakter"),
    email: z.string().email("Format email tidak valid"),
    nik: z
      .string()
      .length(16, "NIK harus tepat 16 digit angka")
      .regex(/^\d+$/, "NIK hanya boleh berisi angka"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    confirmPassword: z
      .string()
      .min(1, "Konfirmasi password tidak boleh kosong"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password dan konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password tidak boleh kosong"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Format email tidak valid"),
});

export const resetPasswordSchema = z
  .object({
    userId: z.string().min(1, "User ID tidak boleh kosong"),
    token: z.string().min(1, "Token tidak boleh kosong"),
    newPassword: z.string().min(8, "Password minimal 8 karakter"),
    confirmPassword: z
      .string()
      .min(1, "Konfirmasi password tidak boleh kosong"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password dan konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export const resendOTPSchema = z.object({
  email: z.string().email("Format email tidak valid"),
});

export const verifyOTPSchema = z.object({
  userId: z.string().min(1, "User ID tidak boleh kosong"),
  otp: z
    .string()
    .length(4, "OTP harus tepat 4 digit")
    .regex(/^\d+$/, "OTP hanya boleh berisi angka"),
});

export const changeEmailSchema = z.object({
  userId: z.string().min(1, "User ID tidak boleh kosong"),
  newEmail: z.string().email("Format email baru tidak valid"),
});

export const verifyEmailChangeSchema = z.object({
  userId: z.string().min(1, "User ID tidak boleh kosong"),
  otp: z
    .string()
    .length(4, "OTP harus tepat 4 digit")
    .regex(/^\d+$/, "OTP hanya boleh berisi angka"),
});

export type TRegisterInput = z.infer<typeof registerSchema>;
export type TLoginInput = z.infer<typeof loginSchema>;
export type TForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type TResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type TResendOTPInput = z.infer<typeof resendOTPSchema>;
export type TVerifyOTPInput = z.infer<typeof verifyOTPSchema>;
export type TChangeEmailInput = z.infer<typeof changeEmailSchema>;
export type TVerifyEmailChangeInput = z.infer<typeof verifyEmailChangeSchema>;
