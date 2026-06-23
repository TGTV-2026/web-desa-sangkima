"use client";

import { useRef } from "react";
import { useToast } from "@/hooks/useToast";
import { formatSize } from "@/components/esurat/FileDropzone";

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB (sinkron dengan MAX_ATTACHMENT_SIZE di server)

export interface DocumentUploadFieldProps {
  label: string;
  required: boolean;
  value: File | null;
  onChange: (file: File | null) => void;
}

/** Slot unggah satu dokumen pendukung (1 file): label + penanda wajib + pilih/hapus. */
export default function DocumentUploadField({
  label,
  required,
  value,
  onChange,
}: DocumentUploadFieldProps) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = (file: File | undefined | null) => {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast(`"${file.name}" wajib berformat PDF/JPG/PNG`, "Format Ditolak", "error", 4000);
      return;
    }
    if (file.size > MAX_SIZE) {
      toast(`"${file.name}" melebihi batas ${formatSize(MAX_SIZE)}`, "Ukuran Terlalu Besar", "error", 4000);
      return;
    }
    onChange(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-semibold text-ink">
        {label}
        {required ? (
          <span className="text-oxide ml-1">*</span>
        ) : (
          <span className="normal-case tracking-normal font-normal text-inkmut/60 italic ml-1">
            (opsional)
          </span>
        )}
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0])}
      />

      {value ? (
        <div className="flex items-center justify-between gap-3 border border-line bg-paper2/10 rounded-sm px-3.5 py-2.5">
          <span className="min-w-0 flex items-center gap-2.5">
            <span className="text-xs font-semibold text-ink truncate max-w-[180px] sm:max-w-xs">
              {value.name}
            </span>
            <span className="text-[10px] font-mono text-inkmut shrink-0 bg-line/30 px-1 rounded-xs">
              {formatSize(value.size)}
            </span>
          </span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs font-bold text-oxide/80 hover:text-oxide hover:underline underline-offset-4 shrink-0 transition-colors"
          >
            Hapus
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full border border-dashed border-line/80 bg-paper2/20 hover:bg-paper2/40 hover:border-line text-inkmut rounded-sm px-3.5 py-2.5 text-left text-xs font-semibold transition-all cursor-pointer"
        >
          + Pilih berkas (PDF/JPG/PNG, maks {formatSize(MAX_SIZE)})
        </button>
      )}
    </div>
  );
}
