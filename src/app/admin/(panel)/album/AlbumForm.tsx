"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/hooks/useToast";
import FormField from "@/components/esurat/FormField";
import type { AlbumDTO } from "@/server/types/gallery";
import ImageUploadField from "../ImageUploadField";
import { createAlbum, updateAlbum } from "./actions";

export default function AlbumForm({ initial }: { initial?: AlbumDTO }) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");
  const [published, setPublished] = useState(initial?.published ?? true);

  function save() {
    startTransition(async () => {
      const payload = { title, description, coverImage, published };
      const res = initial
        ? await updateAlbum(initial.id, payload)
        : await createAlbum(payload);
      // createAlbum me-redirect saat sukses; updateAlbum mengembalikan hasil.
      if (res && !res.success) toast(res.message, "Gagal", "error");
      else if (res && res.success) toast("Album disimpan.", "Tersimpan", "success");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="card-doc flex flex-col gap-4 p-6">
        <FormField
          id="title"
          label="Judul album"
          value={title}
          onChange={setTitle}
          placeholder="mis. Footage Udara Hutan Lindung — Januari 2026"
        />
        <FormField
          id="description"
          label="Deskripsi"
          type="textarea"
          rows={3}
          value={description}
          onChange={setDescription}
          optionalHint
          placeholder="Ceritakan tentang album ini…"
        />
        <ImageUploadField
          label="Foto sampul (bisa juga diset dari salah satu foto album)"
          value={coverImage}
          onChange={setCoverImage}
        />
      </section>

      <label className="flex items-center gap-3 text-sm text-ink">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="h-4 w-4"
        />
        Tampilkan album di situs publik (/galeri). Hilangkan centang untuk draf.
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
              : "Buat Album & Tambah Foto"}
        </button>
      </div>
    </div>
  );
}
