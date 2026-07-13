"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSubmitAction } from "@/hooks/useSubmitAction";
import type { TemplateReport } from "@/server/types/letter";

/** Panel unggah/kelola template DOCX pada halaman ubah jenis surat. */
export default function TemplateUploadSection({
  id,
  code,
  templateDocx,
}: {
  id: string;
  code: string;
  templateDocx: string | null;
}) {
  const router = useRouter();
  const { busy, submit } = useSubmitAction();
  const fileRef = useRef<HTMLInputElement>(null);
  const [report, setReport] = useState<TemplateReport | null>(null);

  const upload = async (file: File) => {
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
          router.refresh();
        },
      },
    ).catch(() => {});
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
          router.refresh();
        },
      },
    ).catch(() => {});
  };

  return (
    <section className="card-doc p-6 rise-in">
      <p className="overline-doc mb-1">Template DOCX</p>
      <p className="text-xs text-inkmut mb-4 leading-relaxed">
        Surat dirender persis mengikuti berkas Word ini. Perubahan format cukup
        unggah ulang — tanpa menyentuh kode.
      </p>

      {templateDocx ? (
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
      ) : (
        <p className="text-sm text-inkmut mb-4">
          Belum ada template — surat memakai render bawaan sistem.
        </p>
      )}

      <label className="label-doc" htmlFor="template-file">
        {templateDocx ? "Unggah versi baru" : "Unggah template"}
      </label>
      <input
        ref={fileRef}
        id="template-file"
        type="file"
        accept=".docx"
        disabled={busy}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void upload(f);
        }}
        className="block w-full text-sm text-inkmut file:mr-3 file:btn-outline file:cursor-pointer cursor-pointer"
      />
      {busy && <p className="text-xs text-inkmut mt-2">Memvalidasi & merender contoh…</p>}

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
          <p className={report.hasQr ? "text-pine-700" : "text-oxide"}>
            {report.hasQr
              ? "✓ Placeholder QR terdeteksi"
              : "⚠ Placeholder QR tidak ditemukan — surat terbit tanpa QR verifikasi"}
          </p>
          <p className={report.hasTtd ? "text-pine-700" : "text-oxide"}>
            {report.hasTtd
              ? "✓ Placeholder tanda tangan terdeteksi"
              : "⚠ Placeholder tanda tangan tidak ditemukan — surat terbit tanpa gambar tanda tangan"}
          </p>
        </div>
      )}
    </section>
  );
}
