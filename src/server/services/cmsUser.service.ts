import { createId } from "@paralleldrive/cuid2";
import { cmsUserRepository } from "../repositories/cmsUser.repository";
import { cmsUserTokenRepository } from "../repositories/cmsUserToken.repository";
import { sendOTPEmail } from "./email.service";
import { comparePassword, hashPassword } from "../utils/hash";
import { generateOTP, getOTPExpiration } from "../utils/otp";
import {
  cmsChangePasswordSchema,
  cmsLoginSchema,
  cmsRequestEmailChangeSchema,
  cmsRequestPasswordResetSchema,
  cmsResetPasswordSchema,
  cmsUserCreateSchema,
  cmsUserUpdateSchema,
  cmsVerifyEmailChangeSchema,
  cmsVerifyEmailSchema,
  type CmsRole,
  type CmsUserDTO,
} from "../types/cmsUser";

/** Ambil `newEmail` dari kolom json `meta` (bisa berupa string atau object). */
function readNewEmail(meta: unknown): string | null {
  if (!meta) return null;
  const parsed = typeof meta === "string" ? JSON.parse(meta) : meta;
  const value = (parsed as { newEmail?: unknown }).newEmail;
  return typeof value === "string" ? value : null;
}

function toDTO(
  row: NonNullable<Awaited<ReturnType<typeof cmsUserRepository.findById>>>,
): CmsUserDTO {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role as CmsRole,
    active: !row.deletedAt,
    emailVerified: !!row.emailVerifiedAt,
    createdAt: row.createdAt,
  };
}

export const cmsUserService = {
  async listAll(): Promise<CmsUserDTO[]> {
    try {
      return (await cmsUserRepository.findAll()).map(toDTO);
    } catch {
      return [];
    }
  },

  async getById(id: string): Promise<CmsUserDTO | null> {
    const row = await cmsUserRepository.findById(id);
    return row ? toDTO(row) : null;
  },

  /** Verifikasi kredensial login. Return id akun bila cocok, atau lempar Error. */
  async login(input: unknown): Promise<{ id: string }> {
    const { email, password } = cmsLoginSchema.parse(input);
    const row = await cmsUserRepository.findByEmail(email);
    if (!row || row.deletedAt) {
      throw new Error("Email atau kata sandi salah");
    }
    const ok = await comparePassword(password, row.password);
    if (!ok) throw new Error("Email atau kata sandi salah");
    return { id: row.id };
  },

  async create(input: unknown): Promise<CmsUserDTO> {
    const data = cmsUserCreateSchema.parse(input);
    const existing = await cmsUserRepository.findByEmail(data.email);
    if (existing) throw new Error("Email sudah dipakai akun lain");
    const id = createId();
    await cmsUserRepository.insert({
      id,
      name: data.name,
      email: data.email,
      // Selalu editor — super_admin tidak bisa dibuat lewat UI.
      role: "editor",
      password: await hashPassword(data.password),
    });
    const created = await cmsUserRepository.findById(id);
    return toDTO(created!);
  },

  async update(id: string, input: unknown): Promise<void> {
    const data = cmsUserUpdateSchema.parse(input);
    const target = await cmsUserRepository.findById(id);
    if (!target) throw new Error("Akun tidak ditemukan");

    // Email boleh sama dengan miliknya sendiri, tapi tak boleh bentrok akun lain.
    const other = await cmsUserRepository.findByEmail(data.email);
    if (other && other.id !== id) {
      throw new Error("Email sudah dipakai akun lain");
    }

    // Peran tidak diubah lewat UI (tetap seperti semula).
    const patch: Record<string, unknown> = {
      name: data.name,
      email: data.email,
    };
    if (data.password) patch.password = await hashPassword(data.password);
    await cmsUserRepository.update(id, patch);
  },

  /** Nonaktifkan akun (soft delete) — jejak penulis tetap tersimpan. */
  async deactivate(id: string): Promise<void> {
    const target = await cmsUserRepository.findById(id);
    if (!target || target.deletedAt) return;
    if (target.role === "super_admin") {
      const count = await cmsUserRepository.countActiveSuperAdmins();
      if (count <= 1) {
        throw new Error("Minimal harus ada satu Super Admin aktif");
      }
    }
    await cmsUserRepository.update(id, { deletedAt: new Date() });
  },

  async reactivate(id: string): Promise<void> {
    await cmsUserRepository.update(id, { deletedAt: null });
  },

  /**
   * Hapus permanen. Hanya untuk akun editor — akun Super Admin tak boleh
   * dihapus permanen (cegah lockout). Byline berita/PPID tetap utuh karena
   * memakai snapshot `authorName`, bukan join ke akun.
   */
  async hardDelete(id: string): Promise<void> {
    const target = await cmsUserRepository.findById(id);
    if (!target) return;
    if (target.role === "super_admin") {
      throw new Error("Akun Super Admin tidak bisa dihapus permanen.");
    }
    await cmsUserRepository.hardDelete(id);
  },

  /**
   * Buat Super Admin pertama sekali di awal deployment — satu-satunya jalur
   * karena super_admin tak bisa dibuat lewat UI. Menolak kalau sudah ada
   * super_admin aktif, supaya endpoint setup di /admin/api/setup otomatis
   * "mati" sendiri setelah dipakai sekali dan aman dibiarkan di kode.
   */
  async bootstrapSuperAdmin(input: {
    name?: string;
    email: string;
    password: string;
  }): Promise<{ created: boolean; reason?: string }> {
    const activeSuperAdmins = await cmsUserRepository.countActiveSuperAdmins();
    if (activeSuperAdmins > 0) {
      return { created: false, reason: "Super Admin sudah ada." };
    }
    const existing = await cmsUserRepository.findByEmail(input.email);
    if (existing) {
      return { created: false, reason: "Email sudah dipakai akun lain." };
    }
    await cmsUserRepository.insert({
      name: input.name || "Administrator",
      email: input.email,
      role: "super_admin",
      password: await hashPassword(input.password),
      // Super admin menentukan kredensialnya sendiri saat setup, jadi tak perlu
      // membuktikan kepemilikan email lewat OTP (dan belum tentu email bisa
      // dikirim saat setup pertama).
      emailVerifiedAt: new Date(),
    });
    return { created: true };
  },

  // === Kelola akun sendiri (super_admin & editor) ===

  /** Ganti kata sandi sendiri. Wajib tahu kata sandi lama. */
  async changeOwnPassword(id: string, input: unknown): Promise<void> {
    const data = cmsChangePasswordSchema.parse(input);
    const row = await cmsUserRepository.findById(id);
    if (!row || row.deletedAt) throw new Error("Akun tidak ditemukan");

    const ok = await comparePassword(data.currentPassword, row.password);
    if (!ok) throw new Error("Kata sandi saat ini salah");

    await cmsUserRepository.update(id, {
      password: await hashPassword(data.newPassword),
    });
  },

  /**
   * Ganti email tahap 1 — kirim OTP ke email BARU. Emailnya belum ditukar di
   * sini; penukaran baru terjadi setelah OTP diverifikasi, supaya akun tidak
   * pindah ke alamat yang ternyata salah ketik / tak bisa diakses.
   */
  async requestEmailChange(
    id: string,
    input: unknown,
  ): Promise<{ newEmail: string }> {
    const data = cmsRequestEmailChangeSchema.parse(input);
    const row = await cmsUserRepository.findById(id);
    if (!row || row.deletedAt) throw new Error("Akun tidak ditemukan");

    const ok = await comparePassword(data.currentPassword, row.password);
    if (!ok) throw new Error("Kata sandi saat ini salah");

    if (data.newEmail === row.email) {
      throw new Error("Email baru sama dengan email saat ini");
    }
    const taken = await cmsUserRepository.findByEmail(data.newEmail);
    if (taken) throw new Error("Email sudah dipakai akun lain");

    const otp = generateOTP();
    await cmsUserTokenRepository.deleteByUserAndType(id, "EmailChange");
    await cmsUserTokenRepository.insert({
      cmsUserId: id,
      token: otp,
      type: "EmailChange",
      meta: { newEmail: data.newEmail },
      expiresAt: getOTPExpiration(),
    });

    try {
      await sendOTPEmail(data.newEmail, otp);
    } catch (err) {
      console.error("Gagal mengirim OTP ganti email CMS:", err);
      throw new Error("Gagal mengirim kode OTP ke email baru");
    }
    return { newEmail: data.newEmail };
  },

  /** Ganti email tahap 2 — verifikasi OTP lalu tukar emailnya. */
  async verifyEmailChange(
    id: string,
    input: unknown,
  ): Promise<{ newEmail: string }> {
    const data = cmsVerifyEmailChangeSchema.parse(input);
    const token = await cmsUserTokenRepository.findValid(
      id,
      data.otp,
      "EmailChange",
    );
    if (!token) throw new Error("Kode OTP tidak valid atau sudah kedaluwarsa");

    const newEmail = readNewEmail(token.meta);
    if (!newEmail) throw new Error("Data email baru tidak ditemukan");

    // Cek ulang: email bisa saja keburu dipakai akun lain sejak OTP dikirim.
    const taken = await cmsUserRepository.findByEmail(newEmail);
    if (taken && taken.id !== id) {
      throw new Error("Email sudah dipakai akun lain");
    }

    // OTP tadi dikirim ke email baru dan berhasil dimasukkan → kepemilikan email
    // itu terbukti, jadi sekalian tandai terverifikasi. Ini juga jalan keluar
    // bagi editor yang emailnya salah ketik: ganti email = sekaligus verifikasi.
    await cmsUserRepository.update(id, {
      email: newEmail,
      emailVerifiedAt: new Date(),
    });
    await cmsUserTokenRepository.markUsed(token.id);
    return { newEmail };
  },

  /** Kirim OTP verifikasi ke email akun sendiri (editor yang baru dibuat). */
  async requestEmailVerification(id: string): Promise<{ email: string }> {
    const row = await cmsUserRepository.findById(id);
    if (!row || row.deletedAt) throw new Error("Akun tidak ditemukan");
    if (row.emailVerifiedAt) throw new Error("Email sudah terverifikasi");

    const otp = generateOTP();
    await cmsUserTokenRepository.deleteByUserAndType(id, "EmailVerify");
    await cmsUserTokenRepository.insert({
      cmsUserId: id,
      token: otp,
      type: "EmailVerify",
      expiresAt: getOTPExpiration(),
    });

    try {
      await sendOTPEmail(row.email, otp);
    } catch (err) {
      console.error("Gagal mengirim OTP verifikasi email CMS:", err);
      throw new Error("Gagal mengirim kode OTP");
    }
    return { email: row.email };
  },

  /** Verifikasi email akun sendiri → akun boleh melakukan aksi tulis. */
  async verifyEmail(id: string, input: unknown): Promise<void> {
    const data = cmsVerifyEmailSchema.parse(input);
    const row = await cmsUserRepository.findById(id);
    if (!row || row.deletedAt) throw new Error("Akun tidak ditemukan");
    if (row.emailVerifiedAt) return; // sudah terverifikasi, idempoten

    const token = await cmsUserTokenRepository.findValid(
      id,
      data.otp,
      "EmailVerify",
    );
    if (!token) throw new Error("Kode OTP tidak valid atau sudah kedaluwarsa");

    await cmsUserRepository.update(id, { emailVerifiedAt: new Date() });
    await cmsUserTokenRepository.markUsed(token.id);
  },

  /**
   * Lupa kata sandi tahap 1 — kirim OTP ke email terdaftar. Selalu "berhasil"
   * walau email tak terdaftar, agar tidak bisa dipakai menebak email admin
   * mana yang ada (email enumeration).
   */
  async requestPasswordReset(input: unknown): Promise<void> {
    const data = cmsRequestPasswordResetSchema.parse(input);
    const row = await cmsUserRepository.findByEmail(data.email);
    if (!row || row.deletedAt) return;

    const otp = generateOTP();
    await cmsUserTokenRepository.deleteByUserAndType(row.id, "PasswordReset");
    await cmsUserTokenRepository.insert({
      cmsUserId: row.id,
      token: otp,
      type: "PasswordReset",
      expiresAt: getOTPExpiration(),
    });

    try {
      await sendOTPEmail(row.email, otp);
    } catch (err) {
      console.error("Gagal mengirim OTP reset sandi CMS:", err);
      throw new Error("Gagal mengirim kode OTP");
    }
  },

  /** Lupa kata sandi tahap 2 — OTP valid → set kata sandi baru. */
  async resetPassword(input: unknown): Promise<void> {
    const data = cmsResetPasswordSchema.parse(input);
    const row = await cmsUserRepository.findByEmail(data.email);
    if (!row || row.deletedAt) {
      throw new Error("Kode OTP tidak valid atau sudah kedaluwarsa");
    }

    const token = await cmsUserTokenRepository.findValid(
      row.id,
      data.otp,
      "PasswordReset",
    );
    if (!token) throw new Error("Kode OTP tidak valid atau sudah kedaluwarsa");

    await cmsUserRepository.update(row.id, {
      password: await hashPassword(data.newPassword),
    });
    await cmsUserTokenRepository.markUsed(token.id);
  },
};
