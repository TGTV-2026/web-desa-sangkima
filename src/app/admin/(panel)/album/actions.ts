"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { galleryService } from "@/server/services/gallery.service";
import { requireCmsUser } from "@/server/utils/cmsSession";

export type AlbumResult =
  | { success: true }
  | { success: false; message: string };

function revalidateGaleri(slug?: string) {
  revalidatePath("/galeri");
  revalidatePath("/"); // teaser beranda
  revalidatePath("/admin/album");
  if (slug) revalidatePath(`/galeri/${slug}`);
}

export async function createAlbum(input: unknown): Promise<AlbumResult> {
  const user = await requireCmsUser();
  let id: string;
  try {
    const album = await galleryService.createAlbum(input, {
      id: user.id,
      name: user.name,
    });
    id = album.id;
    revalidateGaleri();
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, message: "Periksa isian — ada yang belum valid." };
    }
    return {
      success: false,
      message: err instanceof Error ? err.message : "Gagal menyimpan.",
    };
  }
  // Langsung ke halaman kelola foto album baru.
  redirect(`/admin/album/${id}`);
}

export async function updateAlbum(
  id: string,
  input: unknown,
): Promise<AlbumResult> {
  await requireCmsUser();
  try {
    await galleryService.updateAlbum(id, input);
    revalidateGaleri();
    revalidatePath(`/admin/album/${id}`);
    return { success: true };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, message: "Periksa isian — ada yang belum valid." };
    }
    return {
      success: false,
      message: err instanceof Error ? err.message : "Gagal menyimpan.",
    };
  }
}

export async function deleteAlbum(id: string): Promise<AlbumResult> {
  await requireCmsUser();
  try {
    await galleryService.removeAlbum(id);
    revalidateGaleri();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Gagal menghapus.",
    };
  }
}

export async function addAlbumPhoto(
  albumId: string,
  url: string,
  caption?: string,
): Promise<AlbumResult> {
  await requireCmsUser();
  try {
    await galleryService.addPhoto(albumId, url, caption);
    revalidateGaleri();
    revalidatePath(`/admin/album/${albumId}`);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Gagal menambah foto.",
    };
  }
}

export async function deleteAlbumPhoto(
  photoId: string,
  albumId: string,
): Promise<AlbumResult> {
  await requireCmsUser();
  try {
    await galleryService.removePhoto(photoId);
    revalidateGaleri();
    revalidatePath(`/admin/album/${albumId}`);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Gagal menghapus foto.",
    };
  }
}

export async function setAlbumCover(
  photoId: string,
  albumId: string,
): Promise<AlbumResult> {
  await requireCmsUser();
  try {
    await galleryService.setCover(photoId);
    revalidateGaleri();
    revalidatePath(`/admin/album/${albumId}`);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Gagal mengatur sampul.",
    };
  }
}

export async function addAlbumVideo(
  albumId: string,
  url: string,
  caption?: string,
): Promise<AlbumResult> {
  await requireCmsUser();
  try {
    await galleryService.addVideo(albumId, url, caption);
    revalidateGaleri();
    revalidatePath(`/admin/album/${albumId}`);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Gagal menambah video.",
    };
  }
}

export async function deleteAlbumVideo(
  videoId: string,
  albumId: string,
): Promise<AlbumResult> {
  await requireCmsUser();
  try {
    await galleryService.removeVideo(videoId);
    revalidateGaleri();
    revalidatePath(`/admin/album/${albumId}`);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Gagal menghapus video.",
    };
  }
}
