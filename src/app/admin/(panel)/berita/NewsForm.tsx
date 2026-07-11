"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/hooks/useToast";
import type { NewsDTO } from "@/server/types/news";
import ImageUploadField from "../ImageUploadField";
import NewsPreview from "./NewsPreview";
import { createNews, updateNews } from "./actions";

export default function NewsForm({ initial }: { initial?: NewsDTO }) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");
  const [published, setPublished] = useState(initial?.published ?? true);
  const [mode, setMode] = useState<"tulis" | "pratinjau">("tulis");

  function save() {
    startTransition(async () => {
      const payload = { title, excerpt, content, coverImage, published };
      // Aksi me-redirect ke /admin/berita saat sukses; hanya error yang kembali.
      const res = initial
        ? await updateNews(initial.id, payload)
        : await createNews(payload);
      if (res && !res.success) toast(res.message, "Gagal", "error");
    });
  }

  const tabClass = (m: "tulis" | "pratinjau") =>
    `rounded-sm px-4 py-1.5 text-sm transition-colors ${
      mode === m
        ? "bg-pine-900 font-semibold text-paper"
        : "text-ink hover:bg-paper2/60"
    }`;

  return (
    <div className="flex flex-col gap-6">
      {/* Tab Tulis / Pratinjau — tombol simpan tetap terlihat di kedua mode. */}
      <div className="flex gap-1 self-start rounded-sm border border-line bg-paper2/40 p-1">
        <button
          type="button"
          onClick={() => setMode("tulis")}
          className={tabClass("tulis")}
        >
          Tulis
        </button>
        <button
          type="button"
          onClick={() => setMode("pratinjau")}
          className={tabClass("pratinjau")}
        >
          Pratinjau
        </button>
      </div>

      {mode === "pratinjau" ? (
        <NewsPreview
          title={title}
          excerpt={excerpt}
          content={content}
          coverImage={coverImage}
        />
      ) : (
        <>
          <section className="card-doc flex flex-col gap-4 p-6">
            <div>
              <label className="label-doc text-xs">Judul</label>
              <input
                className="input-doc mt-1 w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Judul berita/pengumuman"
              />
            </div>
            <div>
              <label className="label-doc text-xs">
                Ringkasan singkat (tampil di kartu daftar)
              </label>
              <textarea
                rows={2}
                className="input-doc mt-1 w-full resize-y"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="1–2 kalimat ringkasan…"
              />
            </div>
            <ImageUploadField
              label="Foto sampul"
              value={coverImage}
              onChange={setCoverImage}
            />
          </section>

          <section className="card-doc p-6">
            <label className="label-doc text-xs">Isi berita</label>
            <textarea
              rows={14}
              className="input-doc mt-1 w-full resize-y"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tulis isi berita… (pisahkan antar paragraf dengan baris kosong)"
            />
            <p className="mt-2 text-[11px] text-inkmut">
              Tips: tekan Enter dua kali untuk memisahkan paragraf.
            </p>
          </section>
        </>
      )}

      <label className="flex items-center gap-3 text-sm text-ink">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="h-4 w-4"
        />
        Terbitkan (tampil di situs publik). Hilangkan centang untuk simpan sebagai draf.
      </label>

      <div className="sticky bottom-0 flex justify-end gap-3 border-t border-line bg-paper/95 py-4 backdrop-blur">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="btn-primary disabled:opacity-50"
        >
          {pending ? "Menyimpan…" : initial ? "Simpan Perubahan" : "Terbitkan Berita"}
        </button>
      </div>
    </div>
  );
}
