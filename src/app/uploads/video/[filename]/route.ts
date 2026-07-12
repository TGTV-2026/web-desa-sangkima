import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

// Selalu baca disk langsung; jangan ikut di-cache Next.js.
export const dynamic = "force-dynamic";

const DIR = path.join(process.cwd(), "uploads", "video");

const MIME_BY_EXT: Record<string, string> = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

/**
 * Sajikan video latar hero dengan dukungan HTTP Range.
 *
 * Range WAJIB untuk <video>: Safari/iOS menolak memutar sumber yang tak
 * mendukungnya, dan tanpa Range seluruh berkas harus diunduh sebelum mulai.
 * Karena itu video tidak memakai serveUpload.ts (yang membaca berkas utuh ke
 * memori) — di sini dipakai stream per-potong.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  const safeName = path.basename(filename); // cegah path traversal
  const mime = MIME_BY_EXT[path.extname(safeName).toLowerCase()];
  if (!mime) {
    return NextResponse.json(
      { success: false, message: "Berkas tidak ditemukan" },
      { status: 404 },
    );
  }

  const filePath = path.join(DIR, safeName);
  let size: number;
  try {
    size = (await fsp.stat(filePath)).size;
  } catch {
    return NextResponse.json(
      { success: false, message: "Berkas tidak ditemukan" },
      { status: 404 },
    );
  }

  const baseHeaders = {
    "Content-Type": mime,
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=31536000, immutable",
  };

  const range = req.headers.get("range");
  if (!range) {
    const stream = fs.createReadStream(filePath);
    return new Response(stream as unknown as ReadableStream, {
      status: 200,
      headers: { ...baseHeaders, "Content-Length": String(size) },
    });
  }

  // Format: "bytes=START-END" (END boleh kosong).
  const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  if (!match) {
    return new Response(null, {
      status: 416,
      headers: { "Content-Range": `bytes */${size}` },
    });
  }
  const start = match[1] ? Number(match[1]) : 0;
  const end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;

  if (start >= size || end < start) {
    return new Response(null, {
      status: 416,
      headers: { "Content-Range": `bytes */${size}` },
    });
  }

  const stream = fs.createReadStream(filePath, { start, end });
  return new Response(stream as unknown as ReadableStream, {
    status: 206,
    headers: {
      ...baseHeaders,
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Content-Length": String(end - start + 1),
    },
  });
}
