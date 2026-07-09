"use client";

import { useRef, useState } from "react";
import { useToast } from "@/hooks/useToast";
import { MAX_DOC_BYTES, MAX_DOC_LABEL } from "@/lib/uploadLimits";

const ACCEPTED = ["application/pdf", "image/jpeg", "image/png"];
const MAX = MAX_DOC_BYTES;

// Field unggah satu dokumen (PDF disarankan). Mengunggah ke /admin/api/upload-doc
// lalu mengembalikan URL publik lewat onChange. Kosongkan dengan tombol hapus.
export default function DocUploadField({
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
      toast("Berkas harus PDF, JPG, atau PNG.", "Format ditolak", "error");
      return;
    }
    if (file.size > MAX) {
      toast(`Ukuran berkas melebihi ${MAX_DOC_LABEL}.`, "Terlalu besar", "error");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/admin/api/upload-doc", {
        method: "POST",
        body: fd,
      });
      const json = (await res.json()) as {
        success: boolean;
        message?: string;
        data?: { url: string };
      };
      if (json.success && json.data) {
        onChange(json.data.url);
        toast("Berkas terunggah.", "Berhasil", "success");
      } else {
        toast(json.message ?? "Gagal mengunggah.", "Gagal", "error");
      }
    } catch {
      toast("Gagal mengunggah berkas.", "Gagal", "error");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const fileName = value ? value.split("/").pop() : "";

  return (
    <div className="flex flex-col gap-2">
      {label && <span className="label-doc text-xs">{label}</span>}
      <div className="flex flex-wrap items-center gap-3">
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
          {busy ? "Mengunggah…" : value ? "Ganti berkas" : "Unggah berkas (PDF)"}
        </button>
        {value && (
          <>
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="max-w-[220px] truncate font-mono text-[11px] text-pine-800 underline"
            >
              {fileName}
            </a>
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-[11px] font-bold uppercase tracking-wide text-oxide hover:underline"
            >
              Hapus
            </button>
          </>
        )}
      </div>
    </div>
  );
}
