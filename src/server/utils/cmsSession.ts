import { redirect } from "next/navigation";
import { getSessionUser, type SessionUser } from "./session";

// Role yang boleh mengelola CMS web profil:
// "staff" = operator, "admin" = kepala desa. Warga biasa ("user") ditolak.
const CMS_ROLES = ["staff", "admin"] as const;

/**
 * Pengaman halaman /admin (Server Component). Memakai sesi e-surat yang sama
 * (cookie access_token). Bila belum login atau bukan operator/kepala desa,
 * dialihkan ke halaman login e-surat — tidak ada tombol menuju /admin, jadi
 * akses memang harus diketik manual lalu lolos guard ini.
 */
export async function requireCmsUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/esurat");
  if (!CMS_ROLES.includes(user.role as (typeof CMS_ROLES)[number])) {
    redirect("/esurat");
  }
  return user;
}
