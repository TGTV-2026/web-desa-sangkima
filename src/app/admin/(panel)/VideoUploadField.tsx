"use client";

import { useRef, useState } from "react";
import { useToast } from "@/hooks/useToast";
import {
  MAX_VIDEO_BYTES,
  MAX_VIDEO_LABEL,
  MAX_VIDEO_SECONDS,
  WARN_VIDEO_BYTES,
  WARN_VIDEO_LABEL,
} from "@/lib/uploadLimits";

const ACCEPTED = ["video/mp4", "video/webm"];

/** Baca durasi video di browser. null bila metadata gagal dibaca. */
function bacaDurasi(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const el = document.createElement("video");
    el.preload = "metadata";
    el.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(Number.isFinite(el.duration) ? el.duration : null);
    };
    el.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    el.src = url;
  });
}

// Field upload satu video latar. Durasi hanya bisa dicek di sini (server tak
// punya ffprobe), jadi server hanya menjaga tipe & ukuran berkas.
export default function VideoUploadField({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function upload(file: File | undefined) {
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      toast("Video harus MP4 atau WEBM.", "Format ditolak", "error");
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      toast(
        `Ukuran video melebihi ${MAX_VIDEO_LABEL}. Kompres dulu — idealnya 2–3 MB.`,
        "Terlalu besar",
        "error",
      );
      return;
    }
    const durasi = await bacaDurasi(file);
    if (durasi !== null && durasi > MAX_VIDEO_SECONDS + 0.5) {
      toast(
        `Durasi ${Math.round(durasi)} detik, maksimal ${MAX_VIDEO_SECONDS} detik.`,
        "Terlalu panjang",
        "error",
      );
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/admin/api/upload-video", {
        method: "POST",
        body: fd,
      });
      const json = (await res.json()) as {
        success: boolean;
        message?: string;
        data?: {
          url: string;
          compressed: boolean;
          originalBytes: number;
          finalBytes: number;
        };
      };
      if (!json.success || !json.data) {
        toast(json.message ?? "Gagal mengunggah.", "Gagal", "error");
        return;
      }

      const { url, compressed, originalBytes, finalBytes } = json.data;
      onChange(url);
      const mb = (n: number) => (n / 1024 / 1024).toFixed(1);

      if (compressed) {
        toast(
          `Dikompres otomatis: ${mb(originalBytes)} MB → ${mb(finalBytes)} MB.`,
          "Berhasil",
          "success",
        );
      } else if (finalBytes > WARN_VIDEO_BYTES) {
        // Server tak punya ffmpeg; berkas disajikan apa adanya ke pengunjung.
        toast(
          `Kompresi otomatis tidak tersedia di server, video disimpan apa adanya ` +
            `(${mb(finalBytes)} MB). Setiap pengunjung beranda mengunduh sebesar ini — ` +
            `sebaiknya kompres manual ke bawah ${WARN_VIDEO_LABEL}.`,
          "Tanpa kompresi",
          "error",
        );
      } else {
        toast(
          "Video terunggah (kompresi otomatis tidak tersedia di server).",
          "Berhasil",
          "success",
        );
      }
    } catch {
      toast("Gagal mengunggah video.", "Gagal", "error");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {label && <span className="label-doc text-xs">{label}</span>}
      <p className="text-[11px] text-inkmut">
        Opsional. MP4/WEBM, maksimal {MAX_VIDEO_SECONDS} detik & {MAX_VIDEO_LABEL}.
        Video <span className="font-semibold">dikompres otomatis</span> di server
        ke 720p tanpa suara (biasanya jadi 2–3 MB), jadi Anda boleh mengunggah
        rekaman drone mentahan. Bila kosong, hero memakai gambar di atas.
      </p>
      <div className="flex items-center gap-3">
        <div className="h-20 w-28 shrink-0 overflow-hidden border border-line bg-paper2/40">
          {value ? (
            <video
              src={value}
              muted
              playsInline
              preload="metadata"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-center text-[10px] text-inkmut/50">
              Tanpa video
            </div>
          )}
        </div>
        <div className="flex flex-col items-start gap-1">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(",")}
            className="hidden"
            onChange={(e) => upload(e.target.files?.[0])}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="btn-outline text-xs disabled:opacity-50"
            >
              {busy ? "Mengunggah…" : value ? "Ganti video" : "Unggah video"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                disabled={busy}
                className="btn-danger text-xs disabled:opacity-50"
              >
                Hapus
              </button>
            )}
          </div>
          {value && (
            <span className="max-w-[200px] truncate font-mono text-[10px] text-inkmut">
              {value}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
