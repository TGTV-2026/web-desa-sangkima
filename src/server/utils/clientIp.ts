import { headers } from "next/headers";

/**
 * Ambil IP klien dari header proxy (di produksi via Coolify/Nginx). Dipakai
 * untuk audit log. Mengembalikan null bila tak terbaca — audit tak boleh gagal
 * hanya karena IP tak ada.
 */
export async function getClientIp(): Promise<string | null> {
  try {
    const h = await headers();
    const fwd = h.get("x-forwarded-for");
    if (fwd) return fwd.split(",")[0].trim().slice(0, 45);
    return h.get("x-real-ip")?.slice(0, 45) ?? null;
  } catch {
    return null;
  }
}
