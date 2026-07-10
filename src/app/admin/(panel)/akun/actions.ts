"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { cmsUserService } from "@/server/services/cmsUser.service";
import { requireCmsUser } from "@/server/utils/cmsSession";

export type AkunResult =
  | { success: true; message: string }
  | { success: false; message: string };

// Zod di service sudah memberi pesan spesifik per field; di sini cukup ambil
// pesan pertama supaya operator langsung tahu apa yang salah.
function toMessage(err: unknown, fallback: string): string {
  if (err instanceof z.ZodError) {
    return err.issues[0]?.message ?? "Periksa isian — ada yang belum valid.";
  }
  return err instanceof Error ? err.message : fallback;
}

export async function changeMyPassword(input: unknown): Promise<AkunResult> {
  const me = await requireCmsUser();
  try {
    await cmsUserService.changeOwnPassword(me.id, input);
    return { success: true, message: "Kata sandi berhasil diubah." };
  } catch (err) {
    return { success: false, message: toMessage(err, "Gagal mengubah kata sandi.") };
  }
}

export async function requestMyEmailChange(input: unknown): Promise<AkunResult> {
  const me = await requireCmsUser();
  try {
    const { newEmail } = await cmsUserService.requestEmailChange(me.id, input);
    return { success: true, message: `Kode OTP dikirim ke ${newEmail}.` };
  } catch (err) {
    return { success: false, message: toMessage(err, "Gagal mengirim kode OTP.") };
  }
}

export async function verifyMyEmailChange(input: unknown): Promise<AkunResult> {
  const me = await requireCmsUser();
  try {
    const { newEmail } = await cmsUserService.verifyEmailChange(me.id, input);
    revalidatePath("/admin/akun");
    return { success: true, message: `Email berhasil diubah ke ${newEmail}.` };
  } catch (err) {
    return { success: false, message: toMessage(err, "Gagal memverifikasi OTP.") };
  }
}
