"use server";
import { pesanAksi } from "@/server/utils/appError";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { newsService } from "@/server/services/news.service";
import { requireVerifiedCmsUser } from "@/server/utils/cmsSession";

export type NewsResult =
  | { success: true }
  | { success: false; message: string };

function revalidateBerita() {
  revalidatePath("/berita");
  revalidatePath("/admin/berita");
}

export async function createNews(input: unknown): Promise<NewsResult> {
  try {
    const user = await requireVerifiedCmsUser();
    await newsService.create(input, { id: user.id, name: user.name });
    revalidateBerita();
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, message: "Periksa isian — ada yang belum valid." };
    }
    return {
      success: false,
      message: pesanAksi(err, "Gagal menyimpan."),
    };
  }
  redirect("/admin/berita");
}

export async function updateNews(
  id: string,
  input: unknown,
): Promise<NewsResult> {
  try {
    await requireVerifiedCmsUser();
    await newsService.update(id, input);
    revalidateBerita();
    revalidatePath(`/admin/berita/${id}`);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, message: "Periksa isian — ada yang belum valid." };
    }
    return {
      success: false,
      message: pesanAksi(err, "Gagal menyimpan."),
    };
  }
  redirect("/admin/berita");
}

export async function deleteNews(id: string): Promise<NewsResult> {
  try {
    await requireVerifiedCmsUser();
    await newsService.remove(id);
    revalidateBerita();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: pesanAksi(err, "Gagal menghapus."),
    };
  }
}
