"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSubmitAction } from "@/hooks/useSubmitAction";
import { useToast } from "@/hooks/useToast";
import FormField from "@/components/esurat/FormField";
import DocumentUploadField from "@/components/esurat/DocumentUploadField";
import { SUPPORTING_DOCS, type LetterTypeDTO } from "@/server/types/letter";
import DynamicLetterFields from "@/components/esurat/DynamicLetterFields";

export default function AjukanForm({ type }: { type: LetterTypeDTO }) {
  const router = useRouter();
  const { toast } = useToast();
  const { busy: submitting, submit } = useSubmitAction();

  const docs = SUPPORTING_DOCS[type.code] ?? [];

  const [purpose, setPurpose] = useState("");
  const [data, setData] = useState<Record<string, string>>({});
  // file per dokumen pendukung; index = docIndex
  const [files, setFiles] = useState<(File | null)[]>(() => docs.map(() => null));

  const setField = (name: string, value: string) =>
    setData((d) => ({ ...d, [name]: value }));

  const setFileAt = (i: number, file: File | null) =>
    setFiles((prev) => prev.map((f, idx) => (idx === i ? file : f)));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // dokumen wajib harus terisi (server juga menegakkan ini)
    const missing = docs.find((doc, i) => doc.required && !files[i]);
    if (missing) {
      toast(`Dokumen wajib "${missing.label}" belum diunggah.`, "Lampiran Belum Lengkap", "error", 4000);
      return;
    }

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
    files.forEach((file, i) => {
      if (file) fd.append(`lampiran_${i}`, file);
    });

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

      {/* SECTION 4: UNGGAH BERKAS — satu slot per dokumen pendukung */}
      {docs.length > 0 && (
        <div className="border-t border-line pt-5 flex flex-col gap-4">
          <div>
            <p className="label-doc text-xs font-bold tracking-wider text-pine-900 !mb-1">
              Dokumen Lampiran Pendukung
            </p>
            <p className="text-[11px] text-inkmut leading-relaxed">
              Unggah tiap dokumen pada slotnya masing-masing. Bertanda{" "}
              <span className="text-oxide font-bold">*</span> wajib diunggah. Format PDF, JPG, atau PNG.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {docs.map((doc, i) => (
              <DocumentUploadField
                key={doc.label}
                label={doc.label}
                required={doc.required}
                value={files[i] ?? null}
                onChange={(file) => setFileAt(i, file)}
              />
            ))}
          </div>
        </div>
      )}

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
