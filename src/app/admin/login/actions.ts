"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { cmsUserService } from "@/server/services/cmsUser.service";
import { setCmsSession, clearCmsSession } from "@/server/utils/cmsSession";

export type LoginResult = { success: false; message: string } | void;

export async function loginCms(input: unknown): Promise<LoginResult> {
  try {
    const { id } = await cmsUserService.login(input);
    await setCmsSession(id);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, message: "Periksa email dan kata sandi." };
    }
    return {
      success: false,
      message: err instanceof Error ? err.message : "Gagal masuk.",
    };
  }
  // di luar try agar redirect (yang melempar) tidak tertangkap sebagai error
  redirect("/admin");
}

export async function logoutCms(): Promise<void> {
  await clearCmsSession();
  redirect("/admin/login");
}
