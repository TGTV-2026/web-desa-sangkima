"use server";
import { pesanAksi } from "@/server/utils/appError";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { galleryService } from "@/server/services/gallery.service";
import { requireVerifiedCmsUser } from "@/server/utils/cmsSession";

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
  let id: string;
  try {
    const user = await requireVerifiedCmsUser();
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
      message: pesanAksi(err, "Gagal menyimpan."),
    };
  }
  // Langsung ke halaman kelola foto album baru.
  redirect(`/admin/album/${id}`);
}

export async function updateAlbum(
  id: string,
  input: unknown,
): Promise<AlbumResult> {
  try {
    await requireVerifiedCmsUser();
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
      message: pesanAksi(err, "Gagal menyimpan."),
    };
  }
}

export async function deleteAlbum(id: string): Promise<AlbumResult> {
  try {
    await requireVerifiedCmsUser();
    await galleryService.removeAlbum(id);
    revalidateGaleri();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: pesanAksi(err, "Gagal menghapus."),
    };
  }
}

export async function addAlbumPhoto(
  albumId: string,
  url: string,
  caption?: string,
): Promise<AlbumResult> {
  try {
    await requireVerifiedCmsUser();
    await galleryService.addPhoto(albumId, url, caption);
    revalidateGaleri();
    revalidatePath(`/admin/album/${albumId}`);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: pesanAksi(err, "Gagal menambah foto."),
    };
  }
}

export async function deleteAlbumPhoto(
  photoId: string,
  albumId: string,
): Promise<AlbumResult> {
  try {
    await requireVerifiedCmsUser();
    await galleryService.removePhoto(photoId);
    revalidateGaleri();
    revalidatePath(`/admin/album/${albumId}`);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: pesanAksi(err, "Gagal menghapus foto."),
    };
  }
}

export async function setAlbumCover(
  photoId: string,
  albumId: string,
): Promise<AlbumResult> {
  try {
    await requireVerifiedCmsUser();
    await galleryService.setCover(photoId);
    revalidateGaleri();
    revalidatePath(`/admin/album/${albumId}`);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: pesanAksi(err, "Gagal mengatur sampul."),
    };
  }
}

export async function addAlbumVideo(
  albumId: string,
  url: string,
  caption?: string,
): Promise<AlbumResult> {
  try {
    await requireVerifiedCmsUser();
    await galleryService.addVideo(albumId, url, caption);
    revalidateGaleri();
    revalidatePath(`/admin/album/${albumId}`);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: pesanAksi(err, "Gagal menambah video."),
    };
  }
}

export async function deleteAlbumVideo(
  videoId: string,
  albumId: string,
): Promise<AlbumResult> {
  try {
    await requireVerifiedCmsUser();
    await galleryService.removeVideo(videoId);
    revalidateGaleri();
    revalidatePath(`/admin/album/${albumId}`);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: pesanAksi(err, "Gagal menghapus video."),
    };
  }
}
