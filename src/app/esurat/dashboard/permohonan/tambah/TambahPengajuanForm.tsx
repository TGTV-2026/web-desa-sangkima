"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSubmitAction } from "@/hooks/useSubmitAction";
import { useToast } from "@/hooks/useToast";
import FormField from "@/components/esurat/FormField";
import DocumentUploadField from "@/components/esurat/DocumentUploadField";
import DynamicLetterFields from "@/components/esurat/DynamicLetterFields";
import type { LetterTypeDTO } from "@/server/types/letter";
import { isProfileComplete } from "@/server/types/user";
import UserPicker, { type PickedUser } from "./UserPicker";

export default function TambahPengajuanForm({ type }: { type: LetterTypeDTO }) {
  const router = useRouter();
  const { toast } = useToast();
  const { busy: submitting, submit } = useSubmitAction();

  const docs = type.supportingDocs;

  const [requester, setRequester] = useState<PickedUser | null>(null);
  const [purpose, setPurpose] = useState("");
  const [data, setData] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<(File | null)[]>(() => docs.map(() => null));
  const [hasPendingSameType, setHasPendingSameType] = useState(false);

  const requesterReady = !!requester && isProfileComplete(requester);

  // cek lebih dulu apakah pemohon yang dipilih masih punya pengajuan jenis surat ini yang berjalan
  useEffect(() => {
    if (!requester) {
      setHasPendingSameType(false);
      return;
    }
    let cancelled = false;
    fetch(`/esurat/api/letter-requests/pending-types?userId=${requester.id}`)
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) setHasPendingSameType((json.data ?? []).includes(type.id));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [requester, type.id]);

  const setField = (name: string, value: string) =>
    setData((d) => ({ ...d, [name]: value }));

  const setFileAt = (i: number, file: File | null) =>
    setFiles((prev) => prev.map((f, idx) => (idx === i ? file : f)));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!requesterReady || !requester || hasPendingSameType) return;

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
    fd.append("userId", requester.id);
    fd.append("letterTypeId", type.id);
    fd.append("purpose", purpose);
    fd.append("data", JSON.stringify(payload));
    files.forEach((file, i) => {
      if (file) fd.append(`lampiran_${i}`, file);
    });

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
      {/* SECTION 1: JENIS SURAT (sudah ditentukan dari modal pilih jenis surat) */}
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

      {/* SECTION 2: PEMOHON */}
      <div className="border-t border-line/50 pt-5 flex flex-col gap-2">
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

        {requester && hasPendingSameType && (
          <div className="bg-oxide/[0.05] border border-oxide/30 rounded-[4px] px-4 py-3">
            <p className="text-xs text-oxide">
              {requester.name} masih memiliki pengajuan {type.name} yang belum disetujui.
              Tunggu sampai disetujui sebelum membuat pengajuan baru.
            </p>
          </div>
        )}
      </div>

      {/* SECTION 3: KEPERLUAN */}
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

      {/* SECTION 4: FIELD DINAMIS */}
      <DynamicLetterFields
        letterTypeCode={type.code}
        fields={type.requiredFields}
        values={data}
        onChange={setField}
      />

      {/* SECTION 5: LAMPIRAN — satu slot per dokumen pendukung */}
      {docs.length > 0 && (
        <div className="border-t border-line pt-5 flex flex-col gap-4">
          <div>
            <p className="label-doc !mb-1">Dokumen Lampiran Pendukung</p>
            <p className="text-[11px] text-inkmut leading-relaxed">
              Bertanda <span className="text-oxide font-bold">*</span> wajib diunggah. Format PDF, JPG, atau PNG.
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

      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting || !requesterReady || hasPendingSameType}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Menyimpan..." : "Simpan Pengajuan"}
        </button>
      </div>
    </form>
  );
}
