"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSubmitAction } from "@/hooks/useSubmitAction";
import FormField from "@/components/esurat/FormField";
import FileDropzone, { formatSize } from "@/components/esurat/FileDropzone";
import type { LetterTypeDTO } from "@/server/types/letter";
import DynamicLetterFields from "@/components/esurat/DynamicLetterFields";

const MAX_FILES = 3;
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

export default function AjukanForm({ type }: { type: LetterTypeDTO }) {
  const router = useRouter();
  const { busy: submitting, submit } = useSubmitAction();

  const [purpose, setPurpose] = useState("");
  const [data, setData] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]);

  const setField = (name: string, value: string) =>
    setData((d) => ({ ...d, [name]: value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload: Record<string, string | number> = {};
    for (const f of type.requiredFields) {
      const v = data[f.name] ?? "";
      if (v === "") continue;
      payload[f.name] = f.type === "number" ? Number(v) : v;
    }

    const fd = new FormData();
    fd.append("letterTypeId", type.id);
    fd.append("purpose", purpose);
    fd.append("data", JSON.stringify(payload));
    for (const file of files) fd.append("lampiran", file);

    await submit(
      () => fetch("/esurat/api/letter-requests", { method: "POST", body: fd }),
      {
        successMessage: "Permohonan surat Anda berhasil dikirim ke server administrasi desa.",
        successTitle: "Pengajuan Terkirim",
        errorTitle: "Sistem Bermasalah",
        errorFallback: "Gagal mengajukan surat",
        extractErrorMessage: (json) =>
          json.errors && (Object.values(json.errors).flat()[0] as string | undefined),
        onSuccess: () => {
          router.push("/esurat/dashboard/surat");
          router.refresh();
        },
      },
    ).catch(() => {});
  };

  return (
    <form onSubmit={handleSubmit} className="card-doc p-5 sm:p-7 md:p-8 bg-paper border border-line/70 rounded-sm shadow-sm flex flex-col gap-6 text-ink">

      {/* SECTION 1: KLASIFIKASI SURAT (sudah ditentukan dari modal pilih jenis surat) */}
      <div className="flex flex-col gap-4">
        <div>
          <p className="overline-doc !text-brass">{type.code}</p>
          <h2 className="font-serif text-xl font-medium text-pine-900 mt-0.5">{type.name}</h2>
        </div>

        {type.description && (
          <div className="bg-paper2/40 border-l-2 border-brass px-4 py-3 text-xs leading-relaxed text-inkmut rounded-sm">
            <span className="font-semibold text-ink">Deskripsi Layanan:</span> {type.description}
          </div>
        )}
      </div>

      {/* SECTION 2: INTENSI / KEPERLUAN */}
      <div className="border-t border-line/50 pt-5">
        <FormField
          id="purpose"
          label="Maksud / Keperluan Pengajuan"
          type="textarea"
          value={purpose}
          onChange={setPurpose}
          placeholder="Tulis alasan pengajuan, misal: Pemenuhan berkas administrasi pendaftaran beasiswa daerah"
          required
          rows={3}
          labelClassName="text-xs font-bold tracking-wider text-pine-900"
          inputClassName="mt-1.5 bg-white transition-all focus:border-pine-900"
        />
      </div>

      {/* SECTION 3: FORM DINAMIS (DATA TAMBAHAN) */}
      <DynamicLetterFields
        letterTypeCode={type.code}
        fields={type.requiredFields}
        values={data}
        onChange={setField}
      />

      {/* SECTION 4: UNGGAH BERKAS (PREMIUM DROP ZONE) */}
      <div className="border-t border-line pt-5">
        <p className="label-doc text-xs font-bold tracking-wider text-pine-900">
          Dokumen Lampiran Pendukung
          <span className="normal-case tracking-normal font-normal text-inkmut/60 italic ml-1">(opsional)</span>
        </p>
        <FileDropzone
          value={files}
          onChange={setFiles}
          maxFiles={MAX_FILES}
          maxSizeBytes={MAX_SIZE}
          helperText={`Unggah berkas pembuktian (Scan KTP/KK/Surat Pengantar RT) jika diminta. Maksimal ${MAX_FILES} file, batas ukuran ${formatSize(MAX_SIZE)} per data, format resmi: PDF, JPG, atau PNG.`}
        />
      </div>

      {/* SUBMIT BUTTON */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full shadow-sm py-3 px-4 font-bold tracking-wide uppercase text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Mentransmisikan Dokumen..." : "Kirim Dokumen Pengajuan"}
        </button>
      </div>
    </form>
  );
}
