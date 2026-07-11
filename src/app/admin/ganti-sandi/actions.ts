"use server";

import { z } from "zod";
import { cmsUserService } from "@/server/services/cmsUser.service";
import { requireCmsUser } from "@/server/utils/cmsSession";
import { pesanAksi } from "@/server/utils/appError";

export type GantiSandiResult =
  | { success: true }
  | { success: false; message: string };

/**
 * Ganti sandi sementara (akun hasil bulk-CSV, mustChangePassword=true).
 * Memakai changeOwnPassword yang juga membersihkan flag wajib-ganti.
 */
export async function gantiSandiWajib(input: unknown): Promise<GantiSandiResult> {
  const me = await requireCmsUser();
  try {
    await cmsUserService.changeOwnPassword(me.id, input);
    return { success: true };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        success: false,
        message: err.issues[0]?.message ?? "Periksa isian — ada yang belum valid.",
      };
    }
    return { success: false, message: pesanAksi(err, "Gagal mengganti kata sandi.") };
  }
}
