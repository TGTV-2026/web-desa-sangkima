import fs from "node:fs/promises";
import path from "node:path";
import { createId } from "@paralleldrive/cuid2";

// Dokumen PPID bersifat PUBLIK (bisa diunduh warga), jadi disimpan di
// public/uploads/dokumen/ dan dilayani statis lewat URL /uploads/dokumen/<file>.
const PUBLIC_DIR = path.join(process.cwd(), "public", "uploads", "dokumen");
const PUBLIC_URL_BASE = "/uploads/dokumen";

export const MAX_DOC_SIZE = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_DOC_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
};

/** Simpan satu dokumen, kembalikan URL publiknya. Throw Error bila tipe/ukuran tak valid. */
export async function saveDocument(file: {
  mime: string;
  size: number;
  buffer: Buffer;
}): Promise<string> {
  const ext = ALLOWED_DOC_TYPES[file.mime];
  if (!ext) throw new Error("Berkas harus PDF, JPG, atau PNG");
  if (file.size > MAX_DOC_SIZE) throw new Error("Ukuran berkas melebihi 10 MB");

  await fs.mkdir(PUBLIC_DIR, { recursive: true });
  const storedName = `${createId()}.${ext}`;
  await fs.writeFile(path.join(PUBLIC_DIR, storedName), file.buffer);
  return `${PUBLIC_URL_BASE}/${storedName}`;
}
