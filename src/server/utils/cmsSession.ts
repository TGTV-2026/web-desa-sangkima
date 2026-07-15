import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { cmsUserRepository } from "../repositories/cmsUser.repository";
import type { CmsRole } from "../types/cmsUser";
import { AppError } from "./appError";

// Sesi CMS TERPISAH dari e-surat: cookie sendiri (cms_session), tabel cms_users
// sendiri. Menandai token dengan scope "cms" agar tak tertukar dengan token
// e-surat yang memakai secret sama.
const COOKIE = "cms_session";
const SCOPE = "cms";

export type CmsSessionUser = {
  id: string;
  name: string;
  email: string;
  role: CmsRole;
  emailVerified: boolean;
  /** hanya terisi untuk role "rt" */
  dusun: string | null;
  rt: string | null;
  /** true = sandi masih sandi sementara dari super_admin, wajib diganti dulu */
  mustChangePassword: boolean;
};

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(s);
}

async function signCmsToken(userId: string): Promise<string> {
  return new SignJWT({ id: userId, scope: SCOPE })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret());
}

export async function setCmsSession(userId: string): Promise<void> {
  const token = await signCmsToken(userId);
  const cookieStore = await cookies();
  cookieStore.set({
    name: COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearCmsSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set({ name: COOKIE, value: "", httpOnly: true, path: "/", maxAge: 0 });
}

/** Ambil akun CMS yang login dari cookie. null bila belum login/nonaktif. */
export async function getCmsUser(): Promise<CmsSessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.scope !== SCOPE || !payload.id) return null;
    const row = await cmsUserRepository.findById(payload.id as string);
    if (!row || row.deletedAt) return null;
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role as CmsRole,
      emailVerified: !!row.emailVerifiedAt,
      dusun: row.dusun,
      rt: row.rt,
      mustChangePassword: row.mustChangePassword,
    };
  } catch {
    return null;
  }
}

/** Guard halaman CMS: redirect ke login bila belum masuk. */
export async function requireCmsUser(): Promise<CmsSessionUser> {
  const user = await getCmsUser();
  if (!user) redirect("/admin/login");
  return user;
}

/** Guard khusus super admin (kelola akun & tanda tangan surat). */
export async function requireSuperAdmin(): Promise<CmsSessionUser> {
  const user = await requireCmsUser();
  if (user.role !== "super_admin") redirect("/admin");
  return user;
}

/**
 * Guard hub monitoring (dashboard, audit, infrastruktur, kelola akun). Dibuka
 * oleh akun berperan "monitoring" (khusus pengawasan) DAN super_admin (lapisan
 * pengawas tertinggi). Editor & RT ditolak — dialihkan ke ringkasan CMS.
 */
export async function requireMonitoringUser(): Promise<CmsSessionUser> {
  const user = await requireCmsUser();
  if (user.role !== "monitoring" && user.role !== "super_admin") {
    redirect("/admin");
  }
  // Akun monitoring hasil sandi sementara wajib menggantinya dulu.
  if (user.mustChangePassword) redirect("/admin/ganti-sandi");
  return user;
}

/** Guard khusus ketua RT (modul Laporan RT — mengisi laporan sendiri). */
export async function requireRtUser(): Promise<CmsSessionUser> {
  const user = await requireCmsUser();
  if (user.role !== "rt") redirect("/admin");
  // Sandi sementara belum diganti → paksa ke halaman ganti sandi. Ditegakkan
  // di guard (bukan cuma layout) supaya server action pun ikut terkunci.
  if (user.mustChangePassword) redirect("/admin/ganti-sandi");
  return user;
}

/** Dilempar oleh requireVerifiedCmsUser; ditangkap action → pesan ke operator. */
export class CmsEmailNotVerifiedError extends AppError {
  constructor() {
    super(
      "Email Anda belum diverifikasi. Buka menu “Verifikasi Email” untuk mengaktifkan akun sebelum mengubah konten.",
    );
    this.name = "CmsEmailNotVerifiedError";
  }
}

/**
 * Guard untuk SEMUA aksi tulis CMS (server action & route upload). Akun yang
 * emailnya belum diverifikasi tetap boleh membaca isi CMS, tapi tak boleh
 * mengubah apa pun. Ditegakkan di server supaya tak bisa diakali dari browser.
 */
export async function requireVerifiedCmsUser(): Promise<CmsSessionUser> {
  const user = await requireCmsUser();
  if (!user.emailVerified) throw new CmsEmailNotVerifiedError();
  return user;
}
