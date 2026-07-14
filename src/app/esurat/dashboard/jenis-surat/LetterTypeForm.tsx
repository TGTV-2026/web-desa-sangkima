"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSubmitAction } from "@/hooks/useSubmitAction";
import { useToast } from "@/hooks/useToast";
import FormField from "@/components/esurat/FormField";
import type {
  LetterFieldDef,
  LetterTypeAdminDTO,
  SupportingDoc,
} from "@/server/types/letter";
import FieldBuilder from "./FieldBuilder";
import SupportingDocsBuilder from "./SupportingDocsBuilder";
import TagDictionary from "./TagDictionary";
import TemplateUploadSection, { type TemplateError } from "./TemplateUploadSection";

/** Form tambah/ubah jenis surat; mode edit juga memuat pengelolaan template DOCX. */
export default function LetterTypeForm({ initial }: { initial?: LetterTypeAdminDTO }) {
  const router = useRouter();
  const { toast } = useToast();
  const { busy, submit } = useSubmitAction();

  const [code, setCode] = useState(initial?.code ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [template, setTemplate] = useState(initial?.template ?? "");
  const [active, setActive] = useState(initial?.active ?? true);
  const [requireManualNumber, setRequireManualNumber] = useState(initial?.requireManualNumber ?? true);
  const [fields, setFields] = useState<LetterFieldDef[]>(initial?.requiredFields ?? []);
  const [docs, setDocs] = useState<SupportingDoc[]>(initial?.supportingDocs ?? []);
  // Alur buat: id baru ada setelah tersimpan; template DOCX di-stage lalu diunggah
  // otomatis setelah createdId terisi. ponytail: reload di jeda ini memunculkan
  // form buat lagi, tapi keunikan `code` di service mencegah duplikat.
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [stagedTemplate, setStagedTemplate] = useState<File | null>(null);
  const [templateError, setTemplateError] = useState<TemplateError | null>(null);
  const [checking, setChecking] = useState(false);

  const isEdit = !!initial;
  const currentId = initial?.id ?? createdId;

  // Gate mode buat: pastikan template ter-stage valid (tag dikenal + bisa dirender)
  // SEBELUM jenis surat dibuat — tanpa menyimpan apa pun.
  const validateStagedTemplate = async (
    file: File,
    requiredFields: unknown[],
  ): Promise<boolean> => {
    setChecking(true);
    setTemplateError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("fields", JSON.stringify(requiredFields));
      const res = await fetch("/esurat/api/letter-types/validate-template", {
        method: "POST",
        body: fd,
      });
      const json = (await res.json()) as {
        message?: string;
        errors?: Partial<TemplateError>;
      };
      if (!res.ok) {
        const errs = json.errors;
        setTemplateError({
          message: json.message ?? "Template ditolak.",
          unknownTags: errs?.unknownTags,
          knownTags: errs?.knownTags,
          reasons: errs?.reasons,
          hasQr: errs?.hasQr,
          hasTtd: errs?.hasTtd,
        });
        toast(json.message ?? "Template ditolak.", "Template Ditolak", "error", 5000);
        return false;
      }
      return true;
    } catch {
      toast("Gagal memvalidasi template.", "Gagal", "error", 4000);
      return false;
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const requiredFields = fields.map((f) => ({
      ...f,
      // opsi kosong sisa pengetikan koma dibuang saat submit
      options: f.type === "select" ? f.options?.filter(Boolean) : undefined,
    }));

    // Jenis surat TIDAK dibuat bila template masih punya tag tak dikenal.
    if (!isEdit && stagedTemplate) {
      const ok = await validateStagedTemplate(stagedTemplate, requiredFields);
      if (!ok) return;
    }

    const payload = {
      code: code.trim().toUpperCase(),
      name: name.trim(),
      description: description.trim() || undefined,
      template: template.trim() || undefined,
      requiredFields,
      supportingDocs: docs.filter((d) => d.label.trim()),
      requireManualNumber,
      active,
    };

    await submit(
      () =>
        fetch(isEdit ? `/esurat/api/letter-types/${initial.id}` : "/esurat/api/letter-types", {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
      {
        successMessage: isEdit
          ? "Perubahan jenis surat tersimpan."
          : stagedTemplate
            ? "Jenis surat dibuat — mengunggah template…"
            : "Jenis surat dibuat.",
        successTitle: "Tersimpan",
        errorFallback: "Gagal menyimpan jenis surat",
        // error Zod per-field lebih informatif daripada "Validasi gagal"
        extractErrorMessage: (json) => {
          const errors = json.errors as Record<string, string[]> | undefined;
          const first = errors && Object.values(errors).flat()[0];
          return first;
        },
        onSuccess: (json) => {
          const data = json.data as { id?: string; templateWarnings?: string[] } | undefined;
          data?.templateWarnings?.forEach((w) =>
            toast(w, "Periksa Template DOCX", "error", 8000),
          );
          if (isEdit) {
            router.refresh();
            return;
          }
          if (data?.id) {
            // Template sudah lolos gate di atas → TemplateUploadSection auto-unggah
            // (simpan) lalu menavigasi via onUploaded. Tanpa template, langsung ke ubah.
            setCreatedId(data.id);
            if (!stagedTemplate) router.push(`/esurat/dashboard/jenis-surat/${data.id}`);
          }
        },
      },
    ).catch(() => {});
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
      <form onSubmit={handleSubmit} className="lg:col-span-2 flex flex-col gap-6">
        <section className="card-doc p-6 rise-in">
          <p className="overline-doc mb-4">Informasi Dasar</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              id="code"
              label="Kode"
              value={code}
              onChange={(v) => setCode(v.toUpperCase())}
              placeholder="mis. SKU"
              required
              disabled={isEdit}
              maxLength={20}
            />
            <div className="sm:col-span-2">
              <FormField
                id="name"
                label="Nama Jenis Surat"
                value={name}
                onChange={setName}
                placeholder="mis. Surat Keterangan Usaha"
                required
              />
            </div>
          </div>
          <div className="mt-4">
            <FormField
              id="description"
              label="Deskripsi"
              type="textarea"
              rows={2}
              value={description}
              onChange={setDescription}
              optionalHint
            />
          </div>
          <label className="mt-4 flex items-center gap-2.5 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="accent-pine-700 w-4 h-4"
            />
            Aktif (muncul di formulir pengajuan warga)
          </label>
        </section>

        <section className="card-doc p-6 rise-in" style={{ animationDelay: "60ms" }}>
          <p className="overline-doc mb-1">Field Tambahan</p>
          <p className="text-xs text-inkmut mb-4 max-w-lg leading-relaxed">
            Pertanyaan tambahan yang diisi warga saat mengajukan. Nama field otomatis
            menjadi tag template, mis. field <span className="font-mono">nama_usaha</span>{" "}
            → tag <span className="font-mono">{"{nama_usaha}"}</span>.
          </p>
          <FieldBuilder
            fields={fields}
            onChange={setFields}
            warnRename={isEdit && !!initial?.templateDocx}
          />
        </section>

        <section className="card-doc p-6 rise-in" style={{ animationDelay: "120ms" }}>
          <p className="overline-doc mb-1">Dokumen Pendukung</p>
          <p className="text-xs text-inkmut mb-4 max-w-lg leading-relaxed">
            Lampiran yang wajib/opsional diunggah warga. Bila sudah ada pengajuan
            berjalan, jangan menghapus atau mengubah urutan dokumen lama — tambahkan
            dokumen baru di urutan paling akhir.
          </p>
          <SupportingDocsBuilder docs={docs} onChange={setDocs} />
        </section>

        <section className="card-doc p-6 rise-in" style={{ animationDelay: "180ms" }}>
          <p className="overline-doc mb-1">Template Teks Bawaan</p>
          <p className="text-xs text-inkmut mb-4 max-w-lg leading-relaxed">
            Dipakai hanya bila belum ada template DOCX: satu paragraf isi surat dengan
            placeholder <span className="font-mono">{"{{name}}"}</span>,{" "}
            <span className="font-mono">{"{{nik}}"}</span>, dan nama field tambahan.
            Kop, judul, dan tanda tangan diatur otomatis oleh sistem.
          </p>
          <FormField
            id="template"
            label="Isi Surat"
            type="textarea"
            rows={4}
            value={template}
            onChange={setTemplate}
            optionalHint
            inputClassName={initial?.templateDocx ? "opacity-60" : ""}
          />
        </section>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={busy || checking || (!!createdId && !isEdit)}
            className="btn-primary disabled:opacity-60"
          >
            {checking
              ? "Memvalidasi template…"
              : createdId && !isEdit
                ? "Mengunggah template…"
                : busy
                  ? "Menyimpan..."
                  : isEdit
                    ? "Simpan Perubahan"
                    : "Buat Jenis Surat"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/esurat/dashboard/jenis-surat")}
            className="btn-outline"
          >
            Kembali
          </button>
        </div>
      </form>

      <div className="flex flex-col gap-6">
        <TemplateUploadSection
          id={currentId}
          code={initial?.code ?? code}
          templateDocx={initial?.templateDocx ?? null}
          onStageChange={(f) => {
            setStagedTemplate(f);
            setTemplateError(null);
          }}
          onUploaded={
            isEdit
              ? undefined
              : () => {
                  if (createdId) router.push(`/esurat/dashboard/jenis-surat/${createdId}`);
                }
          }
          externalError={templateError}
        />

        <section className="card-doc p-6 rise-in" style={{ animationDelay: "30ms" }}>
          <p className="overline-doc mb-1">Pengaturan Nomor Surat</p>
          <label className="flex items-start gap-2.5 cursor-pointer group mt-3">
            <input
              type="checkbox"
              checked={requireManualNumber}
              onChange={(e) => setRequireManualNumber(e.target.checked)}
              className="accent-pine-700 w-4 h-4 mt-0.5"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-ink">
                Membutuhkan input nomor surat oleh petugas
              </span>
              <p className="text-xs text-inkmut mt-1 leading-relaxed">
                Jika diaktifkan, petugas akan diminta mengisi nomor urut manual, dan tag <span className="font-mono text-[11px] text-brass border border-line rounded-[3px] bg-card px-1 py-0.5">{`{nomor_surat}`}</span> akan diisi otomatis di dokumen. Jika dimatikan, tahap tersebut dilewati.
              </p>
            </div>
          </label>
        </section>

        <TagDictionary fields={fields} />
      </div>
    </div>
  );
}
