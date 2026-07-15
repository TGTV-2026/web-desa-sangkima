"use server";

import { revalidatePath } from "next/cache";
import { cmsUserService } from "@/server/services/cmsUser.service";
import { requireMonitoringUser } from "@/server/utils/cmsSession";
import { catatAksiCms } from "@/server/utils/audit";
import { pesanAksi } from "@/server/utils/appError";

export type AkunResult =
  | { success: true }
  | { success: false; message: string };

/**
 * Aktif/nonaktifkan akun CMS dari hub monitoring (kontrol pengawasan). Sama
 * seperti di CMS pengguna, tapi guard-nya requireMonitoringUser — jadi akun
 * pengawas pun boleh menangguhkan akun tanpa perlu akses konten CMS.
 */
export async function setAccountActive(
  id: string,
  active: boolean,
): Promise<AkunResult> {
  const me = await requireMonitoringUser();
  // Cegah menonaktifkan diri sendiri (bisa terkunci keluar).
  if (!active && id === me.id) {
    return { success: false, message: "Tidak bisa menonaktifkan akun sendiri." };
  }
  try {
    if (active) await cmsUserService.reactivate(id);
    else await cmsUserService.deactivate(id);
    await catatAksiCms(me, active ? "cms_user.reactivate" : "cms_user.deactivate", {
      targetType: "Akun CMS",
      targetId: id,
      summary: active
        ? `Mengaktifkan ulang akun CMS (${id}) dari hub monitoring.`
        : `Menonaktifkan akun CMS (${id}) dari hub monitoring.`,
    });
    revalidatePath("/admin/monitoring/pengaturan");
    return { success: true };
  } catch (err) {
    return { success: false, message: pesanAksi(err, "Gagal memperbarui akun.") };
  }
}
