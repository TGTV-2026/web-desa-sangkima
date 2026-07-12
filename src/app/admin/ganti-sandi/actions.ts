"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { cmsUserService } from "@/server/services/cmsUser.service";
import { requireCmsUser } from "@/server/utils/cmsSession";
import { pesanAksi } from "@/server/utils/appError";

// Sukses → server action langsung redirect ke /admin (seperti loginCms), jadi
// void. Hanya kegagalan yang dikembalikan ke form.
export type GantiSandiResult = { success: false; message: string } | void;

/**
 * Ganti sandi sementara (akun hasil bulk-CSV, mustChangePassword=true).
 * Memakai changeOwnPassword yang juga membersihkan flag wajib-ganti.
 */
export async function gantiSandiWajib(input: unknown): Promise<GantiSandiResult> {
  const me = await requireCmsUser();
  try {
    await cmsUserService.changeOwnPassword(me.id, input);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        success: false,
        message: err.issues[0]?.message ?? "Periksa isian — ada yang belum valid.",
      };
    }
    return { success: false, message: pesanAksi(err, "Gagal mengganti kata sandi.") };
  }
  // Di luar try agar redirect (yang melempar NEXT_REDIRECT) tak tertangkap
  // sebagai error. Flag mustChangePassword sudah bersih → /admin tak memantul.
  redirect("/admin");
}
