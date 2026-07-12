import fs from "node:fs/promises";
import path from "node:path";

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
};

/**
 * Baca & sajikan berkas publik (gambar/dokumen) yang disimpan di luar public/.
 * Dilayani lewat route handler (bukan static file Next.js) karena penulisan
 * saat runtime tidak selalu langsung terlihat oleh static serving di semua
 * environment deploy — route handler selalu baca langsung dari disk tiap request.
 * null bila berkas tak ditemukan atau ekstensi tak dikenal.
 */
export async function serveUploadedFile(
  dir: string,
  filename: string,
): Promise<Response | null> {
  const safeName = path.basename(filename); // cegah path traversal
  const ext = path.extname(safeName).toLowerCase();
  const mime = MIME_BY_EXT[ext];
  if (!mime) return null;

  try {
    const buffer = await fs.readFile(path.join(dir, safeName));
    return new Response(buffer as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": mime,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return null;
  }
}
