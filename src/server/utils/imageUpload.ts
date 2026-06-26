import fs from "node:fs/promises";
import path from "node:path";
import { createId } from "@paralleldrive/cuid2";

// Gambar konten web profil (galeri, hero, titik peta) bersifat PUBLIK, jadi
// disimpan di public/uploads/profil/ dan dilayani statis lewat URL /uploads/profil/<file>.
// (Beda dengan lampiran surat yang privat di /uploads/lampiran.)
const PUBLIC_DIR = path.join(process.cwd(), "public", "uploads", "profil");
const PUBLIC_URL_BASE = "/uploads/profil";

export const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4 MB
export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** Simpan satu gambar, kembalikan URL publiknya. Throw Error bila tipe/ukuran tak valid. */
export async function saveProfileImage(file: {
  mime: string;
  size: number;
  buffer: Buffer;
}): Promise<string> {
  const ext = ALLOWED_IMAGE_TYPES[file.mime];
  if (!ext) throw new Error("Format gambar harus JPG, PNG, atau WEBP");
  if (file.size > MAX_IMAGE_SIZE) throw new Error("Ukuran gambar melebihi 4 MB");

  await fs.mkdir(PUBLIC_DIR, { recursive: true });
  const storedName = `${createId()}.${ext}`;
  await fs.writeFile(path.join(PUBLIC_DIR, storedName), file.buffer);
  return `${PUBLIC_URL_BASE}/${storedName}`;
}
