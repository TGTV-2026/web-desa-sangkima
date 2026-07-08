"use client";

import { useRef, useState } from "react";
import { useToast } from "@/hooks/useToast";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX = 4 * 1024 * 1024;

// Field upload satu gambar: tampil preview + tombol ganti. Mengunggah ke
// /admin/api/upload lalu mengembalikan URL publik lewat onChange.
export default function ImageUploadField({
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
      toast("Gambar harus JPG, PNG, atau WEBP.", "Format ditolak", "error");
      return;
    }
    if (file.size > MAX) {
      toast("Ukuran gambar melebihi 4 MB.", "Terlalu besar", "error");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/admin/api/upload", { method: "POST", body: fd });
      const json = (await res.json()) as {
        success: boolean;
        message?: string;
        data?: { url: string };
      };
      if (json.success && json.data) {
        onChange(json.data.url);
        toast("Gambar terunggah.", "Berhasil", "success");
      } else {
        toast(json.message ?? "Gagal mengunggah.", "Gagal", "error");
      }
    } catch {
      toast("Gagal mengunggah gambar.", "Gagal", "error");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {label && <span className="label-doc text-xs">{label}</span>}
      <div className="flex items-center gap-3">
        <div className="h-20 w-28 shrink-0 overflow-hidden border border-line bg-paper2/40">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt="Pratinjau"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-inkmut/50">
              Tanpa gambar
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(",")}
            className="hidden"
            onChange={(e) => upload(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="btn-outline text-xs disabled:opacity-50"
          >
            {busy ? "Mengunggah…" : value ? "Ganti gambar" : "Unggah gambar"}
          </button>
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
