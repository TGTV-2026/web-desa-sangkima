import { cookies } from "next/headers";
import { verifyToken } from "./jwt";
import { userRepository } from "../repositories/user.repository";
import type { UserRole } from "../middlewares/role.middleware";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  nik: string;
  role: UserRole;
  isProfileComplete: boolean;
  positionName: string | null;
};

/** Field yang harus non-null agar profil dianggap lengkap (sinkron dengan PROFILE_REQUIRED_FIELDS di types/user). */
const PROFILE_FIELDS = [
  "gender",
  "placeOfBirth",
  "birthday",
  "religion",
  "address",
  "job",
  "telp",
  "citizenship",
  "status",
  "education",
] as const;

/**
 * Ambil user yang sedang login dari cookie httpOnly "access_token".
 * Dipakai oleh server component (layout/page dashboard) — tanpa lewat HTTP.
 * Mengembalikan null jika belum login / token kadaluarsa / akun nonaktif.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload?.id) return null;

  const data = await userRepository.findByIdWithPosition(payload.id as string);
  if (!data || !data.user || data.user.deletedAt) return null;

  const user = data.user;
  const isProfileComplete = PROFILE_FIELDS.every(
    (f) => user[f] !== null && user[f] !== undefined,
  );

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    nik: user.nik,
    role: user.role as UserRole,
    isProfileComplete,
    positionName: data.positionName,
  };
}

/**
 * Cookie penanda "user ini sedang menunggu verifikasi OTP".
 * Dipakai agar alur verifikasi tahan terhadap tab yang tertutup: nilainya
 * (userId) bertahan di browser (httpOnly) sampai verifikasi selesai atau
 * kedaluwarsa, menggantikan sessionStorage yang hilang saat tab ditutup.
 */
const PENDING_VERIFICATION_COOKIE = "pending_verification";

export async function setPendingVerification(userId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set({
    name: PENDING_VERIFICATION_COOKIE,
    value: userId,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 hari — cukup longgar untuk kembali & resend OTP
  });
}

export async function clearPendingVerification(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set({
    name: PENDING_VERIFICATION_COOKIE,
    value: "",
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
}

export async function getPendingVerificationUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(PENDING_VERIFICATION_COOKIE)?.value ?? null;
}
