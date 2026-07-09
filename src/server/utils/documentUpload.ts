import fs from "node:fs/promises";
import path from "node:path";
import { createId } from "@paralleldrive/cuid2";
import { compressImage } from "./imageCompress";
import { MAX_DOC_BYTES, MAX_DOC_LABEL } from "@/lib/uploadLimits";

// Dokumen PPID bersifat PUBLIK (bisa diunduh warga), jadi disimpan di
// public/uploads/dokumen/ dan dilayani statis lewat URL /uploads/dokumen/<file>.
const PUBLIC_DIR = path.join(process.cwd(), "public", "uploads", "dokumen");
const PUBLIC_URL_BASE = "/uploads/dokumen";

export const MAX_DOC_SIZE = MAX_DOC_BYTES; // PDF disimpan apa adanya
export const ALLOWED_DOC_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
};

/**
 * Simpan satu dokumen, kembalikan URL publiknya. PDF disimpan apa adanya;
 * gambar (JPG/PNG) dikompres jadi WebP agar ringan. Throw Error bila tak valid.
 */
export async function saveDocument(file: {
  mime: string;
  size: number;
  buffer: Buffer;
}): Promise<string> {
  if (!ALLOWED_DOC_TYPES[file.mime]) {
    throw new Error("Berkas harus PDF, JPG, atau PNG");
  }
  if (file.size > MAX_DOC_SIZE) {
    throw new Error(`Ukuran berkas melebihi ${MAX_DOC_LABEL}`);
  }

  await fs.mkdir(PUBLIC_DIR, { recursive: true });

  // PDF: simpan apa adanya (tak bisa/di-perlu dikompres di sini).
  if (file.mime === "application/pdf") {
    const storedName = `${createId()}.pdf`;
    await fs.writeFile(path.join(PUBLIC_DIR, storedName), file.buffer);
    return `${PUBLIC_URL_BASE}/${storedName}`;
  }

  // Gambar: kompres → WebP.
  const { buffer, ext } = await compressImage(file.buffer, "photo");
  const storedName = `${createId()}.${ext}`;
  await fs.writeFile(path.join(PUBLIC_DIR, storedName), buffer);
  return `${PUBLIC_URL_BASE}/${storedName}`;
}
