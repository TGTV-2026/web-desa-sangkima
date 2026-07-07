"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { newsService } from "@/server/services/news.service";
import { requireCmsUser } from "@/server/utils/cmsSession";

export type NewsResult =
  | { success: true }
  | { success: false; message: string };

function revalidateBerita() {
  revalidatePath("/berita");
  revalidatePath("/admin/berita");
}

export async function createNews(input: unknown): Promise<NewsResult> {
  await requireCmsUser();
  try {
    await newsService.create(input);
    revalidateBerita();
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, message: "Periksa isian — ada yang belum valid." };
    }
    return {
      success: false,
      message: err instanceof Error ? err.message : "Gagal menyimpan.",
    };
  }
  redirect("/admin/berita");
}

export async function updateNews(
  id: string,
  input: unknown,
): Promise<NewsResult> {
  await requireCmsUser();
  try {
    await newsService.update(id, input);
    revalidateBerita();
    revalidatePath(`/admin/berita/${id}`);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, message: "Periksa isian — ada yang belum valid." };
    }
    return {
      success: false,
      message: err instanceof Error ? err.message : "Gagal menyimpan.",
    };
  }
  redirect("/admin/berita");
}

export async function deleteNews(id: string): Promise<NewsResult> {
  await requireCmsUser();
  try {
    await newsService.remove(id);
    revalidateBerita();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Gagal menghapus.",
    };
  }
}
