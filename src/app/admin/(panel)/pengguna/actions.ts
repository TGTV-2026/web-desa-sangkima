"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { cmsUserService } from "@/server/services/cmsUser.service";
import { requireSuperAdmin } from "@/server/utils/cmsSession";

export type CmsUserResult =
  | { success: true }
  | { success: false; message: string };

export async function createCmsUser(input: unknown): Promise<CmsUserResult> {
  await requireSuperAdmin();
  try {
    await cmsUserService.create(input);
    revalidatePath("/admin/pengguna");
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, message: "Periksa isian — ada yang belum valid." };
    }
    return {
      success: false,
      message: err instanceof Error ? err.message : "Gagal menyimpan.",
    };
  }
  redirect("/admin/pengguna");
}

export async function updateCmsUser(
  id: string,
  input: unknown,
): Promise<CmsUserResult> {
  await requireSuperAdmin();
  try {
    await cmsUserService.update(id, input);
    revalidatePath("/admin/pengguna");
    revalidatePath(`/admin/pengguna/${id}`);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, message: "Periksa isian — ada yang belum valid." };
    }
    return {
      success: false,
      message: err instanceof Error ? err.message : "Gagal menyimpan.",
    };
  }
  redirect("/admin/pengguna");
}

export async function setCmsUserActive(
  id: string,
  active: boolean,
): Promise<CmsUserResult> {
  const me = await requireSuperAdmin();
  // Cegah menonaktifkan diri sendiri (bisa terkunci keluar).
  if (!active && id === me.id) {
    return { success: false, message: "Tidak bisa menonaktifkan akun sendiri." };
  }
  try {
    if (active) await cmsUserService.reactivate(id);
    else await cmsUserService.deactivate(id);
    revalidatePath("/admin/pengguna");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Gagal memperbarui.",
    };
  }
}

export async function deleteCmsUser(id: string): Promise<CmsUserResult> {
  const me = await requireSuperAdmin();
  if (id === me.id) {
    return { success: false, message: "Tidak bisa menghapus akun sendiri." };
  }
  try {
    await cmsUserService.hardDelete(id);
    revalidatePath("/admin/pengguna");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Gagal menghapus.",
    };
  }
}
