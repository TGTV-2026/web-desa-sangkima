import { execFile } from "node:child_process";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { ReadableStream as WebReadableStream } from "node:stream/web";
import { promisify } from "node:util";
import { createId } from "@paralleldrive/cuid2";
import { MAX_VIDEO_BYTES, MAX_VIDEO_LABEL, MAX_VIDEO_SECONDS } from "@/lib/uploadLimits";

const execFileAsync = promisify(execFile);

// Video latar hero. Disimpan DI LUAR public/ dan disajikan lewat route handler
// ber-Range di src/app/uploads/video/. Berbeda dari video galeri yang cuma
// referensi YouTube/Instagram: yang ini di-host sendiri karena dipakai sebagai
// latar autoplay & loop.
const VIDEO_DIR = path.join(process.cwd(), "uploads", "video");
const VIDEO_URL_BASE = "/uploads/video";

export const ALLOWED_VIDEO_TYPES: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
};

export type SaveHeroVideoResult = {
  url: string;
  /** false = ffmpeg tak tersedia, berkas disimpan apa adanya. */
  compressed: boolean;
  originalBytes: number;
  finalBytes: number;
};

/** true bila error berasal dari binary yang tidak ditemukan (bukan gagal proses). */
function binaryTidakAda(err: unknown): boolean {
  return (err as { code?: string })?.code === "ENOENT";
}

/** Durasi (detik) & lebar video. Throw bila ffprobe tak ada / berkas rusak. */
async function probe(file: string): Promise<{ durasi: number; lebar: number }> {
  const { stdout } = await execFileAsync(
    "ffprobe",
    [
      "-v", "error",
      "-select_streams", "v:0",
      "-show_entries", "format=duration:stream=width",
      "-of", "default=noprint_wrappers=1:nokey=1",
      file,
    ],
    { timeout: 30_000 },
  );
  // Urutan keluaran: width (stream) lalu duration (format).
  const baris = stdout.trim().split(/\s+/);
  const lebar = Number(baris[0]);
  const durasi = Number(baris[1]);
  if (!Number.isFinite(durasi)) throw new Error("Video tidak dapat dibaca");
  return { durasi, lebar: Number.isFinite(lebar) ? lebar : 0 };
}

/**
 * Kompres ke MP4 720p tanpa audio. Inilah yang membuat unggahan besar tak
 * membebani pengunjung: berapa pun ukuran aslinya, yang disajikan ~2–3 MB.
 * `+faststart` agar video mulai diputar sebelum terunduh penuh.
 */
async function kompres(sumber: string, tujuan: string, lebar: number): Promise<void> {
  const args = [
    "-nostdin", "-y",
    "-i", sumber,
    "-t", String(MAX_VIDEO_SECONDS), // pengaman: potong bila lebih panjang
    "-an", // buang audio: hemat ukuran & autoplay pasti diizinkan
    ...(lebar > 1280 ? ["-vf", "scale=1280:-2"] : []), // jangan upscale
    "-c:v", "libx264",
    "-crf", "30",
    "-preset", "veryfast", // VPS 2 vCPU; cegah timeout proxy
    "-movflags", "+faststart",
    tujuan,
  ];
  await execFileAsync("ffmpeg", args, { timeout: 180_000 });
}

/**
 * Simpan video latar hero. Ditulis ke disk dengan stream (bukan arrayBuffer)
 * supaya berkas besar tak menumpuk di memori, lalu dikompres dengan ffmpeg.
 * Bila ffmpeg tak terpasang, berkas disimpan apa adanya dan `compressed=false`
 * — pemanggil wajib memberitahu operator, jangan didiamkan.
 */
export async function saveHeroVideo(file: File): Promise<SaveHeroVideoResult> {
  const ext = ALLOWED_VIDEO_TYPES[file.type];
  if (!ext) throw new Error("Video harus berformat MP4 atau WEBM");
  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error(`Ukuran video melebihi ${MAX_VIDEO_LABEL}`);
  }

  await fsp.mkdir(VIDEO_DIR, { recursive: true });
  const id = createId();
  const tmp = path.join(VIDEO_DIR, `${id}.tmp.${ext}`);

  try {
    await pipeline(
      Readable.fromWeb(file.stream() as WebReadableStream),
      fs.createWriteStream(tmp),
    );
  } catch (err) {
    await fsp.unlink(tmp).catch(() => {});
    throw err;
  }

  try {
    const { durasi, lebar } = await probe(tmp);
    if (durasi > MAX_VIDEO_SECONDS + 0.5) {
      throw new Error(
        `Durasi ${Math.round(durasi)} detik, maksimal ${MAX_VIDEO_SECONDS} detik`,
      );
    }
    const akhir = path.join(VIDEO_DIR, `${id}.mp4`);
    await kompres(tmp, akhir, lebar);
    await fsp.unlink(tmp).catch(() => {});
    return {
      url: `${VIDEO_URL_BASE}/${id}.mp4`,
      compressed: true,
      originalBytes: file.size,
      finalBytes: (await fsp.stat(akhir)).size,
    };
  } catch (err) {
    if (binaryTidakAda(err)) {
      // ffmpeg/ffprobe tak terpasang (mis. dev lokal). Simpan apa adanya —
      // durasi pun tak bisa diperiksa di sini, hanya andalan cek di browser.
      const akhir = path.join(VIDEO_DIR, `${id}.${ext}`);
      await fsp.rename(tmp, akhir);
      console.warn(
        "[videoUpload] ffmpeg tidak ditemukan — video disimpan tanpa kompresi.",
      );
      return {
        url: `${VIDEO_URL_BASE}/${id}.${ext}`,
        compressed: false,
        originalBytes: file.size,
        finalBytes: file.size,
      };
    }
    await fsp.unlink(tmp).catch(() => {});
    throw err;
  }
}

/** Hapus video berdasarkan URL publiknya. Aman walau berkas sudah tak ada. */
export async function deleteHeroVideo(
  url: string | null | undefined,
): Promise<void> {
  if (!url) return;
  try {
    await fsp.unlink(path.join(VIDEO_DIR, path.basename(url)));
  } catch {
    // sudah terhapus / tak ada — abaikan
  }
}
