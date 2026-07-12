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

type HasilUnggah = {
  url: string;
  compressed: boolean;
  originalBytes: number;
  finalBytes: number;
};

type Fase =
  | { nama: "diam" }
  | { nama: "unggah"; persen: number }
  | { nama: "kompres" };

const mb = (n: number) => (n / 1024 / 1024).toFixed(1);

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

/**
 * Unggah lewat XMLHttpRequest, bukan fetch(): hanya XHR yang bisa melaporkan
 * progres unggah. Berkas dikirim sebagai raw body agar server bisa
 * mengalirkannya ke disk tanpa menumpuk 500 MB di memori.
 */
function unggahDenganProgres(
  file: File,
  onProgres: (persen: number) => void,
): Promise<HasilUnggah> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/admin/api/upload-video");
    xhr.setRequestHeader("Content-Type", file.type);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgres((e.loaded / e.total) * 100);
    };
    xhr.onerror = () => reject(new Error("Koneksi terputus saat mengunggah"));
    xhr.onload = () => {
      let json: { success?: boolean; message?: string; data?: HasilUnggah };
      try {
        json = JSON.parse(xhr.responseText);
      } catch {
        reject(new Error("Respons server tidak dikenali"));
        return;
      }
      if (json.success && json.data) resolve(json.data);
      else reject(new Error(json.message ?? "Gagal mengunggah"));
    };
    xhr.send(file);
  });
}

// Field upload satu video latar. Server mengompres via ffmpeg, jadi operator
// boleh mengunggah rekaman mentahan.
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
  const [fase, setFase] = useState<Fase>({ nama: "diam" });
  const sibuk = fase.nama !== "diam";

  async function upload(file: File | undefined) {
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      toast("Video harus MP4 atau WEBM.", "Format ditolak", "error");
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      toast(`Ukuran video melebihi ${MAX_VIDEO_LABEL}.`, "Terlalu besar", "error");
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

    setFase({ nama: "unggah", persen: 0 });
    try {
      const hasil = await unggahDenganProgres(file, (persen) => {
        // 100% terkirim ≠ selesai: server masih mengompres, dan lamanya tak
        // bisa dipantau dari sini.
        setFase(persen >= 100 ? { nama: "kompres" } : { nama: "unggah", persen });
      });

      onChange(hasil.url);
      if (hasil.compressed) {
        toast(
          `Dikompres otomatis: ${mb(hasil.originalBytes)} MB → ${mb(hasil.finalBytes)} MB.`,
          "Berhasil",
          "success",
        );
      } else if (hasil.finalBytes > WARN_VIDEO_BYTES) {
        toast(
          `Kompresi otomatis tidak tersedia di server, video disimpan apa adanya ` +
            `(${mb(hasil.finalBytes)} MB). Setiap pengunjung beranda mengunduh sebesar ` +
            `ini — sebaiknya kompres manual ke bawah ${WARN_VIDEO_LABEL}.`,
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
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Gagal mengunggah video.",
        "Gagal",
        "error",
      );
    } finally {
      setFase({ nama: "diam" });
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
              disabled={sibuk}
              className="btn-outline text-xs disabled:opacity-50"
            >
              {sibuk ? "Memproses…" : value ? "Ganti video" : "Unggah video"}
            </button>
            {value && !sibuk && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="btn-danger text-xs"
              >
                Hapus
              </button>
            )}
          </div>
          {value && !sibuk && (
            <span className="max-w-[200px] truncate font-mono text-[10px] text-inkmut">
              {value}
            </span>
          )}
        </div>
      </div>

      {fase.nama === "unggah" && (
        <div className="flex flex-col gap-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-paper2 border border-line">
            <div
              className="h-full bg-pine-800 transition-[width] duration-150"
              style={{ width: `${fase.persen}%` }}
            />
          </div>
          <span className="text-[11px] text-inkmut">
            Mengunggah… {Math.round(fase.persen)}%
          </span>
        </div>
      )}

      {fase.nama === "kompres" && (
        <div className="flex flex-col gap-1">
          {/* Progres kompresi tak bisa dipantau dari browser — jangan berpura-pura
              tahu persentasenya. Bar sengaja dibuat animasi tak tentu. */}
          <div className="h-2 w-full overflow-hidden rounded-full border border-line bg-paper2">
            <div className="h-full w-1/3 animate-pulse bg-brass" />
          </div>
          <span className="text-[11px] text-inkmut">
            Terunggah. Server sedang mengompres video — bisa memakan 1–2 menit
            untuk berkas besar. Jangan tutup halaman ini.
          </span>
        </div>
      )}
    </div>
  );
}
