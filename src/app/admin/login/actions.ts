"use server";
import { pesanAksi } from "@/server/utils/appError";

import { redirect } from "next/navigation";
import { z } from "zod";
import { cmsUserService } from "@/server/services/cmsUser.service";
import {
  setCmsSession,
  clearCmsSession,
  getCmsUser,
} from "@/server/utils/cmsSession";

export type LoginResult = { success: false; message: string } | void;

export async function loginCms(input: unknown): Promise<LoginResult> {
  // Akun pengawas tak punya beranda CMS — langsung diarahkan ke hub monitoring.
  let tujuan = "/admin";
  try {
    const { id } = await cmsUserService.login(input);
    await setCmsSession(id);
    const me = await getCmsUser();
    if (me?.role === "monitoring") tujuan = "/admin/monitoring";
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, message: "Periksa email dan kata sandi." };
    }
    return {
      success: false,
      message: pesanAksi(err, "Gagal masuk."),
    };
  }
  // di luar try agar redirect (yang melempar) tidak tertangkap sebagai error
  redirect(tujuan);
}

export async function logoutCms(): Promise<void> {
  await clearCmsSession();
  redirect("/admin/login");
}
