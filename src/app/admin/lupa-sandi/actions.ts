"use server";

import { z } from "zod";
import { cmsUserService } from "@/server/services/cmsUser.service";

export type LupaSandiResult =
  | { success: true; message: string }
  | { success: false; message: string };

function toMessage(err: unknown, fallback: string): string {
  if (err instanceof z.ZodError) {
    return err.issues[0]?.message ?? "Periksa isian — ada yang belum valid.";
  }
  return err instanceof Error ? err.message : fallback;
}

/**
 * Kirim OTP ke email terdaftar. Pesan sukses selalu sama walau email tak
 * terdaftar — mencegah orang menebak-nebak email admin mana yang ada.
 */
export async function requestCmsPasswordReset(
  input: unknown,
): Promise<LupaSandiResult> {
  try {
    await cmsUserService.requestPasswordReset(input);
    return {
      success: true,
      message: "Jika email terdaftar, kode OTP telah dikirim ke email tersebut.",
    };
  } catch (err) {
    return { success: false, message: toMessage(err, "Gagal mengirim kode OTP.") };
  }
}

export async function resetCmsPassword(input: unknown): Promise<LupaSandiResult> {
  try {
    await cmsUserService.resetPassword(input);
    return { success: true, message: "Kata sandi berhasil diatur ulang." };
  } catch (err) {
    return {
      success: false,
      message: toMessage(err, "Gagal mengatur ulang kata sandi."),
    };
  }
}
