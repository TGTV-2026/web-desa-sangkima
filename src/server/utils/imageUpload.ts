import fs from "node:fs/promises";
import path from "node:path";
import { createId } from "@paralleldrive/cuid2";
import { compressImage, type ImageVariant } from "./imageCompress";
import { MAX_IMAGE_BYTES, MAX_IMAGE_LABEL } from "@/lib/uploadLimits";

// Gambar konten web profil (galeri, hero, titik peta) bersifat PUBLIK, jadi
// disimpan di public/uploads/profil/ dan dilayani statis lewat URL /uploads/profil/<file>.
// (Beda dengan lampiran surat yang privat di /uploads/lampiran.)
const PUBLIC_DIR = path.join(process.cwd(), "public", "uploads", "profil");
const PUBLIC_URL_BASE = "/uploads/profil";

// Plafon pengaman tinggi — gambar dikompres server-side jadi jauh lebih kecil
// sebelum disimpan; foto kamera langsung (20–30 MB+) tetap diterima.
export const MAX_IMAGE_SIZE = MAX_IMAGE_BYTES;
export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * Simpan satu gambar (dikompres & di-resize otomatis), kembalikan URL publiknya.
 * `variant="graphic"` untuk tanda tangan/logo yang harus tetap PNG.
 * Throw Error bila tipe/ukuran tak valid.
 */
export async function saveProfileImage(
  file: { mime: string; size: number; buffer: Buffer },
  opts?: { variant?: ImageVariant },
): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES[file.mime]) {
    throw new Error("Format gambar harus JPG, PNG, atau WEBP");
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error(`Ukuran gambar melebihi ${MAX_IMAGE_LABEL}`);
  }

  const { buffer, ext } = await compressImage(
    file.buffer,
    opts?.variant ?? "photo",
  );

  await fs.mkdir(PUBLIC_DIR, { recursive: true });
  const storedName = `${createId()}.${ext}`;
  await fs.writeFile(path.join(PUBLIC_DIR, storedName), buffer);
  return `${PUBLIC_URL_BASE}/${storedName}`;
}
