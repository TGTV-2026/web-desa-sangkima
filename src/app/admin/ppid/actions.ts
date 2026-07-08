"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ppidService } from "@/server/services/ppid.service";
import { requireCmsUser } from "@/server/utils/cmsSession";

export type PpidResult =
  | { success: true }
  | { success: false; message: string };

function revalidatePpid() {
  revalidatePath("/ppid");
  revalidatePath("/admin/ppid");
}

export async function createPpidDoc(input: unknown): Promise<PpidResult> {
  await requireCmsUser();
  try {
    await ppidService.create(input);
    revalidatePpid();
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, message: "Periksa isian — ada yang belum valid." };
    }
    return {
      success: false,
      message: err instanceof Error ? err.message : "Gagal menyimpan.",
    };
  }
  redirect("/admin/ppid");
}

export async function updatePpidDoc(
  id: string,
  input: unknown,
): Promise<PpidResult> {
  await requireCmsUser();
  try {
    await ppidService.update(id, input);
    revalidatePpid();
    revalidatePath(`/admin/ppid/${id}`);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, message: "Periksa isian — ada yang belum valid." };
    }
    return {
      success: false,
      message: err instanceof Error ? err.message : "Gagal menyimpan.",
    };
  }
  redirect("/admin/ppid");
}

export async function deletePpidDoc(id: string): Promise<PpidResult> {
  await requireCmsUser();
  try {
    await ppidService.remove(id);
    revalidatePpid();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Gagal menghapus.",
    };
  }
}
