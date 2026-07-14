"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSubmitAction, type SubmitActionError } from "@/hooks/useSubmitAction";
import { MAX_DOC_BYTES, MAX_DOC_LABEL } from "@/lib/uploadLimits";
import type { TemplateReport } from "@/server/types/letter";

export type TemplateError = {
  message: string;
  unknownTags?: string[];
  knownTags?: string[];
  reasons?: string[];
  // status placeholder ikut dibawa pada error tag → keterangan QR/TTD tetap tampil
  hasQr?: boolean;
  hasTtd?: boolean;
};

/** Status + keterangan placeholder QR & tanda tangan; dipakai di hasil validasi maupun panel error. */
function PlaceholderChecklist({ hasQr, hasTtd }: { hasQr: boolean; hasTtd: boolean }) {
  return (
    <>
      <div className="mt-2">
        <p className={hasQr ? "text-pine-700" : "text-oxide"}>
          {hasQr
            ? "✓ Placeholder QR terdeteksi"
            : "⚠ Placeholder QR tidak ditemukan — surat terbit tanpa QR verifikasi"}
        </p>
        <p className="text-[11px] text-inkmut leading-relaxed">
          Titik QR kode verifikasi surat — terisi otomatis saat surat terbit,
          dapat dipindai untuk mengecek keaslian surat.
        </p>
      </div>
      <div className="mt-2">
        <p className={hasTtd ? "text-pine-700" : "text-oxide"}>
          {hasTtd
            ? "✓ Placeholder tanda tangan terdeteksi"
            : "⚠ Placeholder tanda tangan tidak ditemukan — surat terbit tanpa gambar tanda tangan"}
        </p>
        <p className="text-[11px] text-inkmut leading-relaxed">
          Titik tanda tangan penandatangan — terisi otomatis dengan tanda tangan
          digital saat surat final disetujui.
        </p>
      </div>
    </>
  );
}

/**
 * Panel unggah/kelola template DOCX. Dipakai di halaman tambah (id null → file
 * di-stage, diunggah otomatis begitu jenis surat tercipta) maupun ubah (id ada
 * → unggah & validasi langsung).
 */
export default function TemplateUploadSection({
  id,
  code,
  templateDocx,
  onStageChange,
  onUploaded,
  externalError,
}: {
  id: string | null;
  code: string;
  templateDocx: string | null;
  onStageChange?: (file: File | null) => void;
  onUploaded?: () => void;
  /** Error validasi dari luar (mode buat: gate dry-run sebelum jenis surat dibuat). */
  externalError?: TemplateError | null;
}) {
  const router = useRouter();
  const { busy, submit } = useSubmitAction();
  const fileRef = useRef<HTMLInputElement>(null);
  const [report, setReport] = useState<TemplateReport | null>(null);
  const [error, setError] = useState<TemplateError | null>(null);
  const [staged, setStaged] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const autoUploadedRef = useRef(false);

  const upload = async (file: File) => {
    setReport(null);
    setError(null);
    const form = new FormData();
    form.append("file", file);
    await submit(
      () =>
        fetch(`/esurat/api/letter-types/${id}/template`, {
          method: "POST",
          body: form,
        }),
      {
        successMessage: "Template DOCX tervalidasi & aktif.",
        successTitle: "Template Tersimpan",
        errorTitle: "Template Ditolak",
        errorFallback: "Gagal mengunggah template",
        onSuccess: (json) => {
          setReport((json.data as TemplateReport) ?? null);
          setStaged(null);
          onStageChange?.(null);
          onUploaded?.();
          router.refresh();
        },
      },
    ).catch((err) => {
      // detail terstruktur dari server (daftar tag/alasan) → dirender jadi chip
      const json = (err as SubmitActionError).json;
      const errs = json?.errors as Partial<TemplateError> | undefined;
      setError({
        message: json?.message ?? "Template ditolak.",
        unknownTags: errs?.unknownTags,
        knownTags: errs?.knownTags,
        reasons: errs?.reasons,
        hasQr: errs?.hasQr,
        hasTtd: errs?.hasTtd,
      });
      // ditolak → buang stage agar dropzone muncul lagi untuk unggah ulang
      // (jenis surat sudah tercipta, id tersedia, jadi re-drop langsung tervalidasi)
      setStaged(null);
      onStageChange?.(null);
    });
    if (fileRef.current) fileRef.current.value = "";
  };

  // Validasi ringan sisi klien meniru penjaga server, lalu unggah/stage.
  const pick = (file: File) => {
    setError(null);
    if (!file.name.toLowerCase().endsWith(".docx")) {
      setError({ message: `"${file.name}" harus berformat .docx (Word).` });
      return;
    }
    if (file.size > MAX_DOC_BYTES) {
      setError({ message: `Ukuran template maksimal ${MAX_DOC_LABEL}.` });
      return;
    }
    if (id) {
      void upload(file);
    } else {
      setReport(null);
      setStaged(file);
      onStageChange?.(file);
    }
  };

  // Mode buat: begitu jenis surat tercipta (id terisi) & ada file ter-stage → unggah otomatis.
  useEffect(() => {
    if (id && staged && !autoUploadedRef.current) {
      autoUploadedRef.current = true;
      void upload(staged);
    }
    // hanya bergantung pada munculnya id; staged/upload sengaja tak masuk deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const clearStaged = () => {
    setStaged(null);
    onStageChange?.(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const detach = async () => {
    if (!confirm("Lepas template DOCX? Jenis surat kembali memakai render bawaan sistem.")) return;
    await submit(
      () => fetch(`/esurat/api/letter-types/${id}/template`, { method: "DELETE" }),
      {
        successMessage: "Template dilepas — kembali ke render bawaan.",
        successTitle: "Tersimpan",
        errorFallback: "Gagal melepas template",
        onSuccess: () => {
          setReport(null);
          setError(null);
          router.refresh();
        },
      },
    ).catch(() => {});
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) pick(f);
  };

  return (
    <section className="card-doc p-6 rise-in">
      <p className="overline-doc mb-1">Template DOCX</p>
      <p className="text-xs text-inkmut mb-4 leading-relaxed">
        Surat dirender persis mengikuti berkas Word ini. Perubahan format cukup
        unggah ulang — tanpa menyentuh kode.
      </p>

      {templateDocx && !staged && (
        <div className="border border-pine-600/40 bg-pine-600/[0.05] rounded-[4px] px-3.5 py-2.5 text-sm mb-4">
          <p className="font-semibold text-pine-700">Template aktif</p>
          <p className="font-mono text-[11px] text-inkmut mt-0.5 break-all">{templateDocx}</p>
          <span className="mt-2 flex flex-wrap gap-2">
            <a
              href={`/esurat/api/letter-types/${id}/template/preview`}
              target="_blank"
              rel="noreferrer"
              className="btn-outline !px-3 !py-1.5 text-xs"
            >
              Pratinjau PDF
            </a>
            <a
              href={`/esurat/api/letter-types/${id}/template`}
              download={`template-${code}.docx`}
              className="btn-outline !px-3 !py-1.5 text-xs"
            >
              Unduh
            </a>
            <button
              type="button"
              onClick={detach}
              disabled={busy}
              className="btn-danger !px-3 !py-1.5 text-xs disabled:opacity-60"
            >
              Lepas
            </button>
          </span>
        </div>
      )}

      {staged ? (
        <div className="border border-brass/40 bg-brass/[0.05] rounded-[4px] px-3.5 py-2.5 text-sm mb-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-ink">Template siap</p>
            <p className="font-mono text-[11px] text-inkmut mt-0.5 break-all">{staged.name}</p>
            <p className="text-[11px] text-inkmut mt-1 leading-relaxed">
              Akan divalidasi otomatis setelah jenis surat dibuat.
            </p>
          </div>
          <button
            type="button"
            onClick={clearStaged}
            disabled={busy}
            className="text-xs font-bold text-oxide/80 hover:text-oxide shrink-0 disabled:opacity-60"
          >
            Batal
          </button>
        </div>
      ) : (
        <>
          {!templateDocx && (
            <p className="label-doc">{id ? "Unggah template" : "Template (opsional)"}</p>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".docx"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) pick(f);
            }}
          />
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => !busy && fileRef.current?.click()}
            className={`w-full border border-dashed rounded-sm transition-all px-4 py-6 text-center cursor-pointer flex flex-col items-center justify-center gap-1 ${
              dragActive
                ? "border-pine-900 bg-pine-50/40 text-pine-900 shadow-inner"
                : "border-line/80 bg-paper2/20 hover:bg-paper2/40 text-inkmut hover:border-line"
            } ${busy ? "opacity-60 pointer-events-none" : ""}`}
          >
            <span className="text-lg font-serif italic opacity-60">W</span>
            <p className="text-xs font-semibold">
              {dragActive
                ? "Lepas berkas .docx di sini"
                : templateDocx
                  ? "+ Ganti dengan versi baru (.docx)"
                  : "+ Tarik & lepas berkas .docx, atau klik untuk telusuri"}
            </p>
            <p className="text-[10px] text-inkmut">Word (.docx) • maksimal {MAX_DOC_LABEL}</p>
          </div>
        </>
      )}

      {busy && <p className="text-xs text-inkmut mt-3">Memvalidasi & merender contoh…</p>}

      {(() => {
        const shown = error ?? externalError ?? null;
        return shown ? (
          <div className="mt-4 border border-oxide/40 bg-oxide/[0.05] rounded-[4px] px-3.5 py-3 text-xs leading-relaxed">
            <p className="font-semibold text-oxide mb-2">{shown.message}</p>
            {shown.unknownTags?.length ? (
              <div className="mb-2.5">
                <p className="text-inkmut mb-1">Tag tidak dikenal:</p>
                <span className="flex flex-wrap gap-1.5">
                  {shown.unknownTags.map((t) => (
                    <span
                      key={t}
                      className="font-mono text-[11px] text-oxide border border-oxide/40 rounded-[3px] bg-oxide/[0.06] px-1.5 py-0.5"
                    >
                      {`{${t}}`}
                    </span>
                  ))}
                </span>
              </div>
            ) : null}
            {shown.knownTags?.length ? (
              <div>
                <p className="text-inkmut mb-1">Tag di template yang sudah sesuai:</p>
                <span className="flex flex-wrap gap-1.5">
                  {shown.knownTags.map((t) => (
                    <span
                      key={t}
                      className="font-mono text-[11px] text-pine-700 border border-pine-600/40 rounded-[3px] bg-pine-600/[0.06] px-1.5 py-0.5"
                    >
                      {`{${t}}`}
                    </span>
                  ))}
                </span>
              </div>
            ) : null}
            {shown.reasons?.length ? (
              <ul className="list-disc pl-4 text-inkmut mt-1 space-y-0.5">
                {shown.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            ) : null}
            {typeof shown.hasQr === "boolean" && typeof shown.hasTtd === "boolean" ? (
              <div className="mt-3 border-t border-oxide/20 pt-2">
                <PlaceholderChecklist hasQr={shown.hasQr} hasTtd={shown.hasTtd} />
              </div>
            ) : null}
          </div>
        ) : null;
      })()}

      {report && (
        <div className="mt-4 border-t border-line pt-3 text-xs leading-relaxed">
          <p className="font-semibold text-ink mb-1.5">Hasil pemeriksaan:</p>
          <p className="text-inkmut">
            Tag terpakai:{" "}
            {report.tags.length ? (
              <span className="font-mono">{report.tags.map((t) => `{${t}}`).join(" ")}</span>
            ) : (
              "tidak ada"
            )}
          </p>
          <PlaceholderChecklist hasQr={report.hasQr} hasTtd={report.hasTtd} />
        </div>
      )}
    </section>
  );
}
