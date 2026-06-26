import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  resendOTPSchema,
  verifyOTPSchema,
  changeEmailSchema,
  verifyEmailChangeSchema,
  TRegisterInput,
  TLoginInput,
  TForgotPasswordInput,
  TResetPasswordInput,
  TChangePasswordInput,
  TResendOTPInput,
  TVerifyOTPInput,
  TChangeEmailInput,
  TVerifyEmailChangeInput,
} from "../types/auth";
import { userRepository } from "../repositories/user.repository";
import { hashPassword, comparePassword } from "../utils/hash";
import { signToken } from "../utils/jwt";
import { generateOTP, getOTPExpiration } from "../utils/otp";
import {
  generateResetToken,
  getResetTokenExpiration,
} from "../utils/reset-token";
import { sendOTPEmail, sendPasswordResetEmail } from "./email.service";
import { db } from "../db";
import { userTokens } from "../db/schema";
import { eq, and } from "drizzle-orm";

export const authService = {
  async register(input: TRegisterInput) {
    const validatedData = registerSchema.parse(input);

    await userRepository.resolveSoftDeletedConflicts(
      validatedData.email,
      validatedData.nik,
    );

    const existingUser = await userRepository.findByEmailOrNik(
      validatedData.email,
      validatedData.nik,
    );

    if (existingUser) {
      if (existingUser.email === validatedData.email) {
        throw Object.assign(new Error("Email sudah terdaftar"), {
          field: "email" as const,
        });
      }
      if (existingUser.nik === validatedData.nik) {
        throw Object.assign(new Error("NIK sudah terdaftar"), {
          field: "nik" as const,
        });
      }
    }

    const passwordHash = await hashPassword(validatedData.password);

    const newUser = await userRepository.createUser({
      ...validatedData,
      passwordHash,
    });

    // Generate dan kirim OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiration();

    await userRepository.createOTPToken(newUser.id, otp, expiresAt);

    // Fire-and-forget: kirim email OTP di background agar response tidak
    // tertahan oleh SMTP yang lambat. Kalau gagal, user bisa pakai "Kirim Ulang OTP".
    sendOTPEmail(newUser.email, otp)
      .then(() => console.log(`✅ OTP email sent successfully to ${newUser.email}`))
      .catch((err: Error) =>
        console.error(`❌ Failed to send OTP email to ${newUser.email}:`, err.message),
      );

    return {
      success: true,
      message: "Registrasi berhasil. Kode OTP sedang dikirim ke email Anda.",
      data: {
        userId: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
    };
  },

  async verifyOTP(input: TVerifyOTPInput) {
    const validatedData = verifyOTPSchema.parse(input);

    const token = await userRepository.findValidOTPToken(
      validatedData.userId,
      validatedData.otp,
    );

    if (!token) {
      throw new Error("Kode OTP tidak valid atau sudah expired");
    }

    // Mark token as used
    await userRepository.markTokenAsUsed(token.id);

    // Mark user as verified
    await userRepository.verifyUserEmail(validatedData.userId);

    // Ambil data user untuk menerbitkan JWT — user langsung login setelah
    // verifikasi, tanpa harus ke halaman login lagi.
    const user = await userRepository.findById(validatedData.userId);
    if (!user) {
      throw new Error("User tidak ditemukan");
    }

    const jwt = await signToken({
      id: user.id,
      email: user.email,
      nik: user.nik,
    });

    return {
      success: true,
      message: "Email berhasil diaktifkan",
      token: jwt,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        nik: user.nik,
      },
    };
  },

  async resendOTP(input: TResendOTPInput) {
    const validatedData = resendOTPSchema.parse(input);

    // Find user
    const user = await userRepository.findByEmail(validatedData.email);
    if (!user) {
      throw new Error("Email tidak terdaftar");
    }

    // Check if email already verified
    if (user.emailVerifiedAt) {
      throw new Error("Email sudah diaktifkan. Silakan login.");
    }

    // Delete old OTP token
    await db
      .delete(userTokens)
      .where(and(eq(userTokens.userId, user.id), eq(userTokens.type, "OTP")));

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiration();

    await userRepository.createOTPToken(user.id, otp, expiresAt);

    // Send OTP email
    try {
      await sendOTPEmail(user.email, otp);
    } catch (error) {
      console.error("Failed to send OTP email:", error);
      throw new Error("Gagal mengirim email OTP");
    }

    return {
      success: true,
      message: "Kode OTP baru telah dikirim ke email Anda",
      data: {
        userId: user.id,
        email: user.email,
      },
    };
  },

  async forgotPassword(input: TForgotPasswordInput) {
    const validatedData = forgotPasswordSchema.parse(input);

    // Find user by email
    const user = await userRepository.findByEmail(validatedData.email);

    if (!user) {
      // SECURITY: Jangan beri tahu apakah email exist atau tidak
      // Return success response untuk prevent email enumeration
      return {
        success: true,
        message: "Jika email terdaftar, Anda akan menerima link reset password",
        _shouldNotExist: true,
      };
    }

    // Check if email is verified
    if (!user.emailVerifiedAt) {
      throw new Error(
        "Email belum diaktifkan. Silakan verifikasi email terlebih dahulu.",
      );
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const expiresAt = getResetTokenExpiration();

    // Save reset token to database
    await userRepository.createPasswordResetToken(
      user.id,
      resetToken,
      expiresAt,
    );

    // Build reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/esurat/reset-password?userId=${user.id}&token=${resetToken}`;

    // Send email
    try {
      await sendPasswordResetEmail(user.email, resetToken, resetUrl);
    } catch (error) {
      console.error("Failed to send password reset email:", error);
      throw new Error("Gagal mengirim email reset password");
    }

    return {
      success: true,
      message: "Jika email terdaftar, Anda akan menerima link reset password",
      // Dev mode info
      ...(process.env.NODE_ENV === "development" && {
        _dev: {
          userId: user.id,
          resetToken,
          resetUrl,
        },
      }),
    };
  },

  async resetPassword(input: TResetPasswordInput) {
    const validatedData = resetPasswordSchema.parse(input);

    // Find valid reset token
    const resetToken = await userRepository.findValidPasswordResetToken(
      validatedData.userId,
      validatedData.token,
    );

    if (!resetToken) {
      throw new Error("Token tidak valid atau sudah expired");
    }

    // Get user
    const user = await userRepository.findById(validatedData.userId);

    if (!user) {
      throw new Error("User tidak ditemukan");
    }

    // Hash new password
    const passwordHash = await hashPassword(validatedData.newPassword);

    // Update user password
    await userRepository.updateUserPassword(validatedData.userId, passwordHash);

    // Mark token as used
    await userRepository.markTokenAsUsed(resetToken.id);

    return {
      success: true,
      message:
        "Password berhasil direset. Silakan login dengan password baru Anda.",
    };
  },

  async changePassword(input: TChangePasswordInput & { userId: string }) {
    const validatedData = changePasswordSchema.parse(input);

    const user = await userRepository.findById(input.userId);
    if (!user) {
      throw new Error("User tidak ditemukan");
    }

    const isOldValid = await comparePassword(
      validatedData.oldPassword,
      user.password,
    );
    if (!isOldValid) {
      throw Object.assign(new Error("Password lama salah"), {
        field: "oldPassword" as const,
      });
    }

    const passwordHash = await hashPassword(validatedData.newPassword);
    await userRepository.updateUserPassword(input.userId, passwordHash);

    return {
      success: true,
      message: "Password berhasil diubah",
    };
  },

  async login(input: TLoginInput) {
    const validatedData = loginSchema.parse(input);

    const user = await userRepository.findByEmail(validatedData.email);
    if (!user) {
      throw new Error("Email atau password salah");
    }

    // Verifikasi password lebih dulu — status akun (nonaktif / belum verifikasi)
    // baru diungkap setelah kredensial terbukti benar, agar tidak bocor ke publik.
    const isPasswordValid = await comparePassword(
      validatedData.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new Error("Email atau password salah");
    }

    if (user.deletedAt) {
      throw new Error("Akun ini telah dinonaktifkan. Hubungi administrator.");
    }

    // Email belum diaktifkan → tandai supaya pemanggil bisa mengarahkan ke
    // halaman verifikasi OTP (bukan sekadar menampilkan error).
    if (!user.emailVerifiedAt) {
      throw Object.assign(
        new Error("Email belum diaktifkan. Silakan verifikasi email Anda."),
        { code: "EMAIL_NOT_VERIFIED" as const, userId: user.id },
      );
    }

    const token = await signToken({
      id: user.id,
      email: user.email,
      nik: user.nik,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        nik: user.nik,
      },
      token,
    };
  },

  async changeEmail(input: TChangeEmailInput) {
    const validatedData = changeEmailSchema.parse(input);

    // Get user
    const user = await userRepository.findById(validatedData.userId);

    if (!user) {
      throw new Error("User tidak ditemukan");
    }

    // Resolve soft-deleted users holding this email
    await userRepository.resolveSoftDeletedConflicts(validatedData.newEmail);

    // Check if new email already registered
    const existingUser = await userRepository.findByEmail(
      validatedData.newEmail,
    );
    if (existingUser && existingUser.id !== validatedData.userId) {
      throw new Error("Email baru sudah terdaftar");
    }

    // Delete old email change tokens
    await db
      .delete(userTokens)
      .where(
        and(
          eq(userTokens.userId, validatedData.userId),
          eq(userTokens.type, "EmailChange"),
        ),
      );

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiration();

    // Create email change token dengan meta berisi email baru
    await userRepository.createEmailChangeToken(
      validatedData.userId,
      otp,
      validatedData.newEmail,
      expiresAt,
    );

    // Send OTP email ke new email
    try {
      await sendOTPEmail(validatedData.newEmail, otp);
    } catch (error) {
      console.error("Failed to send OTP email:", error);
      throw new Error("Gagal mengirim OTP ke email baru");
    }

    return {
      success: true,
      message: "Kode OTP telah dikirim ke email baru Anda",
      data: {
        userId: validatedData.userId,
        newEmail: validatedData.newEmail,
      },
    };
  },

  async verifyEmailChange(input: TVerifyEmailChangeInput) {
    const validatedData = verifyEmailChangeSchema.parse(input);

    // Find valid email change token
    const emailChangeToken = await userRepository.findValidEmailChangeToken(
      validatedData.userId,
      validatedData.otp,
    );

    if (!emailChangeToken) {
      throw new Error("Kode OTP tidak valid atau sudah expired");
    }

    // Get meta dengan email baru - handle both string dan object
    let meta: { newEmail: string } | null = null;

    if (emailChangeToken.meta) {
      if (typeof emailChangeToken.meta === "string") {
        try {
          meta = JSON.parse(emailChangeToken.meta);
        } catch (error) {
          console.error("Failed to parse meta JSON:", error);
          throw new Error("Data email baru tidak valid");
        }
      } else {
        meta = emailChangeToken.meta as { newEmail: string };
      }
    }

    console.log(`Email change token meta:`, {
      raw: emailChangeToken.meta,
      parsed: meta,
    });

    if (!meta || !meta.newEmail) {
      throw new Error("Data email baru tidak ditemukan");
    }

    // Update user email
    await userRepository.updateUserEmail(validatedData.userId, meta.newEmail);

    // Mark token as used
    await userRepository.markTokenAsUsed(emailChangeToken.id);

    return {
      success: true,
      message: "Email berhasil diubah",
      data: {
        newEmail: meta.newEmail,
      },
    };
  },
};
