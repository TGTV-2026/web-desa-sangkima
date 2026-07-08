"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/hooks/useToast";
import FormField from "@/components/esurat/FormField";
import { PPID_CATEGORIES, type PpidDocDTO } from "@/server/types/ppid";
import DocUploadField from "../DocUploadField";
import { createPpidDoc, updatePpidDoc } from "./actions";

const CATEGORY_OPTIONS = PPID_CATEGORIES.map((c) => ({
  value: c.key,
  label: c.label,
}));

export default function PpidDocForm({ initial }: { initial?: PpidDocDTO }) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const [category, setCategory] = useState<string>(
    initial?.category ?? PPID_CATEGORIES[0].key,
  );
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [fileUrl, setFileUrl] = useState(initial?.fileUrl ?? "");
  const [externalUrl, setExternalUrl] = useState(initial?.externalUrl ?? "");
  const [year, setYear] = useState(initial?.year ?? "");
  const [published, setPublished] = useState(initial?.published ?? true);

  function save() {
    startTransition(async () => {
      const payload = {
        category,
        title,
        description,
        fileUrl,
        externalUrl,
        year,
        published,
      };
      // Aksi me-redirect ke /admin/ppid saat sukses; hanya error yang kembali.
      const res = initial
        ? await updatePpidDoc(initial.id, payload)
        : await createPpidDoc(payload);
      if (res && !res.success) toast(res.message, "Gagal", "error");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="card-doc flex flex-col gap-4 p-6">
        <FormField
          id="category"
          label="Jenis Informasi Publik"
          type="select"
          value={category}
          onChange={setCategory}
          options={CATEGORY_OPTIONS}
          required
        />
        <FormField
          id="title"
          label="Judul dokumen / informasi"
          value={title}
          onChange={setTitle}
          placeholder="mis. APBDes Tahun Anggaran 2024"
        />
        <FormField
          id="description"
          label="Deskripsi singkat"
          type="textarea"
          rows={2}
          value={description}
          onChange={setDescription}
          optionalHint
          placeholder="Keterangan singkat isi dokumen…"
        />
        <FormField
          id="year"
          label="Tahun / periode"
          value={year}
          onChange={setYear}
          optionalHint
          placeholder="mis. 2024"
        />
      </section>

      <section className="card-doc flex flex-col gap-4 p-6">
        <span className="label-doc">Berkas Dokumen</span>
        <p className="-mt-2 text-[11px] text-inkmut">
          Unggah berkas PDF <b>atau</b> isi tautan dokumen di bawah. Minimal
          salah satu harus diisi.
        </p>
        <DocUploadField
          label="Unggah berkas (PDF, maks. 10 MB)"
          value={fileUrl}
          onChange={setFileUrl}
        />
        <FormField
          id="externalUrl"
          label="Atau tautan dokumen (Google Drive, dsb.)"
          value={externalUrl}
          onChange={setExternalUrl}
          optionalHint
          placeholder="https://…"
        />
      </section>

      <label className="flex items-center gap-3 text-sm text-ink">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="h-4 w-4"
        />
        Terbitkan (tampil di halaman publik /ppid). Hilangkan centang untuk
        menyimpan sebagai draf.
      </label>

      <div className="sticky bottom-0 flex justify-end gap-3 border-t border-line bg-paper/95 py-4 backdrop-blur">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="btn-primary disabled:opacity-50"
        >
          {pending
            ? "Menyimpan…"
            : initial
              ? "Simpan Perubahan"
              : "Tambah Dokumen"}
        </button>
      </div>
    </div>
  );
}
