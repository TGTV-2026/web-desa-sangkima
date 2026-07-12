"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { cmsUserService } from "@/server/services/cmsUser.service";
import { requireCmsUser } from "@/server/utils/cmsSession";
import { pesanAksi } from "@/server/utils/appError";

export type VerifikasiResult =
  | { success: true; message: string }
  | { success: false; message: string };

function toMessage(err: unknown, fallback: string): string {
  if (err instanceof z.ZodError) {
    return err.issues[0]?.message ?? "Periksa isian — ada yang belum valid.";
  }
  return pesanAksi(err, fallback);
}

// Sengaja pakai requireCmsUser (bukan requireVerifiedCmsUser) — justru akun yang
// BELUM terverifikasi yang perlu mengakses aksi ini.
export async function requestMyEmailVerification(): Promise<VerifikasiResult> {
  const me = await requireCmsUser();
  try {
    const { email } = await cmsUserService.requestEmailVerification(me.id);
    return { success: true, message: `Kode OTP dikirim ke ${email}.` };
  } catch (err) {
    return { success: false, message: toMessage(err, "Gagal mengirim kode OTP.") };
  }
}

export async function verifyMyEmail(input: unknown): Promise<VerifikasiResult> {
  const me = await requireCmsUser();
  try {
    await cmsUserService.verifyEmail(me.id, input);
    revalidatePath("/admin", "layout");
    return { success: true, message: "Email terverifikasi. Akun Anda kini aktif penuh." };
  } catch (err) {
    return { success: false, message: toMessage(err, "Gagal memverifikasi email.") };
  }
}
