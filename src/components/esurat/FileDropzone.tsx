"use client";

import { useRef, useState } from "react";
import { useToast } from "@/hooks/useToast";

const DEFAULT_MAX_FILES = 3;
const DEFAULT_MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const DEFAULT_ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

export interface FileDropzoneProps {
  value: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  maxSizeBytes?: number;
  acceptedTypes?: string[];
  helperText?: string;
}

export function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Zona unggah berkas seret-lepas dengan validasi jumlah/ukuran/tipe, fully controlled. */
export default function FileDropzone({
  value,
  onChange,
  maxFiles = DEFAULT_MAX_FILES,
  maxSizeBytes = DEFAULT_MAX_SIZE,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  helperText,
}: FileDropzoneProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const next = [...value];
    for (const f of Array.from(incoming)) {
      if (next.length >= maxFiles) {
        toast(`Maksimal ${maxFiles} lampiran berkas`, "Batas Terpenuhi", "error", 4000);
        break;
      }
      if (!acceptedTypes.includes(f.type)) {
        toast(`"${f.name}" wajib berformat PDF/JPG/PNG`, "Format Ditolak", "error", 4000);
        continue;
      }
      if (f.size > maxSizeBytes) {
        toast(
          `"${f.name}" melebihi batas ukuran ${formatSize(maxSizeBytes)}`,
          "Ukuran Terlalu Besar",
          "error",
          4000,
        );
        continue;
      }
      next.push(f);
    }
    onChange(next);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (idx: number) => onChange(value.filter((_, i) => i !== idx));

  // Fungsi interaksi seret-lepas berkas (Drag & Drop)
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      addFiles(e.dataTransfer.files);
    }
  };

  return (
    <div>
      {helperText && (
        <p className="text-[11px] text-inkmut mt-1 mb-3.5 leading-relaxed">{helperText}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(",")}
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />

      {/* DRAG & DROP AREA INTERAKTIF */}
      {value.length < maxFiles && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full border border-dashed rounded-sm transition-all px-4 py-6 text-center cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
            isDragActive
              ? "border-pine-900 bg-pine-50/40 text-pine-900 shadow-inner"
              : "border-line/80 bg-paper2/20 hover:bg-paper2/40 text-inkmut hover:border-line"
          }`}
        >
          <span className="text-lg font-serif italic opacity-60">S</span>
          <p className="text-xs font-semibold">
            {isDragActive
              ? "Lepas berkas di sini sekarang"
              : "+ Tarik & lepas berkas, atau klik untuk telusuri"}
          </p>
        </div>
      )}

      {/* DAFTAR BERKAS TERUNGGAH */}
      {value.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2 animate-fade-in">
          {value.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center justify-between gap-4 border border-line bg-paper2/10 rounded-sm px-3.5 py-2.5 transition-all hover:bg-paper2/20"
            >
              <div className="min-w-0 flex items-center gap-3">
                <span className="font-mono text-[11px] font-bold text-brass bg-brass/5 px-1.5 py-0.5 rounded-sm shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-xs font-semibold text-ink truncate max-w-[180px] sm:max-w-xs">
                  {f.name}
                </span>
                <span className="text-[10px] font-mono text-inkmut shrink-0 bg-line/30 px-1 rounded-xs">
                  {formatSize(f.size)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="text-xs font-bold text-oxide/80 hover:text-oxide hover:underline underline-offset-4 shrink-0 transition-colors"
              >
                Hapus
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
