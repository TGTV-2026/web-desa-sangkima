"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import type { LetterTypeDTO } from "@/server/types/letter";

const MAX_FILES = 3;
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED = ["application/pdf", "image/jpeg", "image/png"];

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function AjukanForm({ types }: { types: LetterTypeDTO[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [typeId, setTypeId] = useState("");
  const [purpose, setPurpose] = useState("");
  const [data, setData] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const selected = useMemo(
    () => types.find((t) => t.id === typeId),
    [types, typeId],
  );

  const setField = (name: string, value: string) =>
    setData((d) => ({ ...d, [name]: value }));

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const next = [...files];
    for (const f of Array.from(incoming)) {
      if (next.length >= MAX_FILES) {
        toast(`Maksimal ${MAX_FILES} lampiran berkas`, "Batas Terpenuhi", "error", 4000);
        break;
      }
      if (!ALLOWED.includes(f.type)) {
        toast(`"${f.name}" wajib berformat PDF/JPG/PNG`, "Format Ditolak", "error", 4000);
        continue;
      }
      if (f.size > MAX_SIZE) {
        toast(`"${f.name}" melebihi batas ukuran 2 MB`, "Ukuran Terlalu Besar", "error", 4000);
        continue;
      }
      next.push(f);
    }
    setFiles(next);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (idx: number) =>
    setFiles((fs) => fs.filter((_, i) => i !== idx));

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    
    try {
      const payload: Record<string, string | number> = {};
      for (const f of selected.requiredFields) {
        const v = data[f.name] ?? "";
        if (v === "") continue;
        payload[f.name] = f.type === "number" ? Number(v) : v;
      }

      const fd = new FormData();
      fd.append("letterTypeId", selected.id);
      fd.append("purpose", purpose);
      fd.append("data", JSON.stringify(payload));
      for (const file of files) fd.append("lampiran", file);

      const res = await fetch("/api/letter-requests", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();

      if (!res.ok) {
        const firstError = json.errors && Object.values(json.errors).flat()[0];
        throw new Error((firstError as string) || json.message || "Gagal mengajukan surat");
      }

      toast(
        "Permohonan surat Anda berhasil dikirim ke server administrasi desa.",
        "Pengajuan Terkirim",
        "success",
        4000,
      );
      router.push("/dashboard/surat");
      router.refresh();
    } catch (err: any) {
      toast(err.message || "Gagal terhubung ke server", "Sistem Bermasalah", "error", 5000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card-doc p-5 sm:p-7 md:p-8 bg-paper border border-line/70 rounded-sm shadow-sm flex flex-col gap-6 text-ink">
      
      {/* SECTION 1: KLASIFIKASI SURAT */}
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="jenis" className="label-doc text-xs font-bold tracking-wider text-pine-900">
            Pilih Jenis Surat Resmi
          </label>
          <select
            id="jenis"
            value={typeId}
            onChange={(e) => {
              setTypeId(e.target.value);
              setData({});
            }}
            required
            className="input-doc mt-1.5 w-full bg-white transition-all focus:border-pine-900 focus:ring-1 focus:ring-pine-900"
          >
            <option value="" disabled>— Klik untuk memilih dokumen —</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.code})
              </option>
            ))}
          </select>
        </div>

        {selected?.description && (
          <div className="bg-paper2/40 border-l-2 border-brass px-4 py-3 text-xs leading-relaxed text-inkmut rounded-sm animate-fade-in">
            <span className="font-semibold text-ink">Deskripsi Layanan:</span> {selected.description}
          </div>
        )}
      </div>

      {/* SECTION 2: INTENSI / KEPERLUAN */}
      <div className="border-t border-line/50 pt-5">
        <label htmlFor="purpose" className="label-doc text-xs font-bold tracking-wider text-pine-900">
          Maksud / Keperluan Pengajuan
        </label>
        <textarea
          id="purpose"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="Tulis alasan pengajuan, misal: Pemenuhan berkas administrasi pendaftaran beasiswa daerah"
          required
          rows={3}
          className="input-doc mt-1.5 w-full bg-white transition-all focus:border-pine-900"
        />
      </div>

      {/* SECTION 3: FORM DINAMIS (DATA TAMBAHAN) */}
      {selected && selected.requiredFields.length > 0 && (
        <div className="flex flex-col gap-4 border-t border-line pt-5 animate-fade-in">
          <p className="overline-doc !text-brass tracking-widest font-bold">
            Instrumen Data Tambahan — {selected.code}
          </p>
          
          <div className="grid grid-cols-1 gap-4">
            {selected.requiredFields.map((f) => (
              <div key={f.name} className="w-full">
                <label htmlFor={f.name} className="label-doc text-xs font-semibold">
                  {f.label}
                  {!f.required && (
                    <span className="normal-case tracking-normal font-normal text-inkmut/60 italic ml-1">
                      (opsional)
                    </span>
                  )}
                </label>
                
                {f.type === "textarea" ? (
                  <textarea
                    id={f.name}
                    value={data[f.name] ?? ""}
                    onChange={(e) => setField(f.name, e.target.value)}
                    placeholder={f.placeholder}
                    required={f.required}
                    rows={3}
                    className="input-doc mt-1.5 w-full bg-white focus:border-pine-900"
                  />
                ) : (
                  <input
                    id={f.name}
                    type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                    value={data[f.name] ?? ""}
                    onChange={(e) => setField(f.name, e.target.value)}
                    placeholder={f.placeholder}
                    required={f.required}
                    className="input-doc mt-1.5 w-full bg-white focus:border-pine-900 h-10.5"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: UNGHAH BERKAS (PREMIUM DROP ZONE) */}
      <div className="border-t border-line pt-5">
        <p className="label-doc text-xs font-bold tracking-wider text-pine-900">
          Dokumen Lampiran Pendukung
          <span className="normal-case tracking-normal font-normal text-inkmut/60 italic ml-1">(opsional)</span>
        </p>
        <p className="text-[11px] text-inkmut mt-1 mb-3.5 leading-relaxed">
          Unggah berkas pembuktian (Scan KTP/KK/Surat Pengantar RT) jika diminta. Maksimal {MAX_FILES} file, batas ukuran {formatSize(MAX_SIZE)} per data, format resmi: PDF, JPG, atau PNG.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />

        {/* DRAG & DROP AREA INTERAKTIF */}
        {files.length < MAX_FILES && (
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
              {isDragActive ? "Lepas berkas di sini sekarang" : "+ Tarik & lepas berkas, atau klik untuk telusuri"}
            </p>
          </div>
        )}

        {/* DAFTAR BERKAS TERUNGGAH */}
        {files.length > 0 && (
          <ul className="mt-3 flex flex-col gap-2 animate-fade-in">
            {files.map((f, i) => (
              <li
                key={`${f.name}-${i}`}
                className="flex items-center justify-between gap-4 border border-line bg-paper2/10 rounded-sm px-3.5 py-2.5 transition-all hover:bg-paper2/20"
              >
                <div className="min-w-0 flex items-center gap-3">
                  <span className="font-mono text-[11px] font-bold text-brass bg-brass/5 px-1.5 py-0.5 rounded-sm shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-xs font-semibold text-ink truncate max-w-[180px] sm:max-w-xs">{f.name}</span>
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

      {/* SUBMIT BUTTON */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting || !typeId}
          className="btn-primary w-full shadow-sm py-3 px-4 font-bold tracking-wide uppercase text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Mentransmisikan Dokumen..." : "Kirim Dokumen Pengajuan"}
        </button>
      </div>
    </form>
  );
}