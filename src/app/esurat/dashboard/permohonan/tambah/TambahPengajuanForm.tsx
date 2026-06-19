"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSubmitAction } from "@/hooks/useSubmitAction";
import FormField from "@/components/esurat/FormField";
import FileDropzone, { formatSize } from "@/components/esurat/FileDropzone";
import DynamicLetterFields from "@/components/esurat/DynamicLetterFields";
import type { LetterTypeDTO } from "@/server/types/letter";
import UserPicker, { type PickedUser } from "./UserPicker";

const MAX_FILES = 3;
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

export default function TambahPengajuanForm({ types }: { types: LetterTypeDTO[] }) {
  const router = useRouter();
  const { busy: submitting, submit } = useSubmitAction();

  const [requester, setRequester] = useState<PickedUser | null>(null);
  const [typeId, setTypeId] = useState("");
  const [purpose, setPurpose] = useState("");
  const [data, setData] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]);

  const selected = useMemo(
    () => types.find((t) => t.id === typeId),
    [types, typeId],
  );

  const setField = (name: string, value: string) =>
    setData((d) => ({ ...d, [name]: value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!requester || !selected) return;

    const payload: Record<string, string | number> = {};
    for (const f of selected.requiredFields) {
      const v = data[f.name] ?? "";
      if (v === "") continue;
      payload[f.name] = f.type === "number" ? Number(v) : v;
    }

    const fd = new FormData();
    fd.append("userId", requester.id);
    fd.append("letterTypeId", selected.id);
    fd.append("purpose", purpose);
    fd.append("data", JSON.stringify(payload));
    for (const file of files) fd.append("lampiran", file);

    await submit(
      () => fetch("/esurat/api/letter-requests", { method: "POST", body: fd }),
      {
        successMessage: `Pengajuan atas nama ${requester.name} berhasil dibuat.`,
        successTitle: "Pengajuan Tersimpan",
        errorTitle: "Gagal Membuat Pengajuan",
        errorFallback: "Gagal membuat pengajuan",
        extractErrorMessage: (json) =>
          json.errors && (Object.values(json.errors).flat()[0] as string | undefined),
        onSuccess: () => {
          router.push("/esurat/dashboard/permohonan");
          router.refresh();
        },
      },
    ).catch(() => {});
  };

  return (
    <form onSubmit={handleSubmit} className="card-doc p-5 sm:p-7 md:p-8 flex flex-col gap-6">
      {/* SECTION 0: PEMOHON */}
      <div className="flex flex-col gap-2">
        <label className="label-doc">Pemohon</label>
        <UserPicker value={requester} onChange={setRequester} />
        <p className="text-xs text-inkmut">
          Belum terdaftar?{" "}
          <a
            href="/esurat/dashboard/pengguna/tambah"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brass font-semibold hover:underline underline-offset-2"
          >
            Tambah pengguna baru
          </a>{" "}
          di tab baru, lalu cari lagi di sini.
        </p>
      </div>

      {/* SECTION 1: KLASIFIKASI SURAT */}
      <div className="border-t border-line/50 pt-5 flex flex-col gap-4">
        <FormField
          id="jenis"
          label="Pilih Jenis Surat"
          type="select"
          value={typeId}
          onChange={(val) => {
            setTypeId(val);
            setData({});
          }}
          required
          disabled={!requester}
          placeholder="— Pilih jenis surat —"
          options={types.map((t) => ({ value: t.id, label: `${t.name} (${t.code})` }))}
        />

        {selected?.description && (
          <div className="bg-paper2/40 border-l-2 border-brass px-4 py-3 text-xs leading-relaxed text-inkmut rounded-sm">
            <span className="font-semibold text-ink">Deskripsi Layanan:</span> {selected.description}
          </div>
        )}
      </div>

      {/* SECTION 2: KEPERLUAN */}
      <div className="border-t border-line/50 pt-5">
        <FormField
          id="purpose"
          label="Maksud / Keperluan Pengajuan"
          type="textarea"
          value={purpose}
          onChange={setPurpose}
          placeholder="mis. Pemenuhan berkas administrasi pendaftaran beasiswa daerah"
          required
          disabled={!requester}
          rows={3}
        />
      </div>

      {/* SECTION 3: FIELD DINAMIS */}
      {selected && (
        <DynamicLetterFields
          letterTypeCode={selected.code}
          fields={selected.requiredFields}
          values={data}
          onChange={setField}
        />
      )}

      {/* SECTION 4: LAMPIRAN */}
      <div className="border-t border-line pt-5">
        <p className="label-doc">
          Dokumen Lampiran Pendukung
          <span className="normal-case tracking-normal font-normal text-inkmut/60 italic ml-1">(opsional)</span>
        </p>
        <FileDropzone
          value={files}
          onChange={setFiles}
          maxFiles={MAX_FILES}
          maxSizeBytes={MAX_SIZE}
          helperText={`Maksimal ${MAX_FILES} file, batas ukuran ${formatSize(MAX_SIZE)} per data, format: PDF, JPG, atau PNG.`}
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting || !requester || !typeId}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Menyimpan..." : "Simpan Pengajuan"}
        </button>
      </div>
    </form>
  );
}
