"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/hooks/useToast";
import {
  LAYANAN_ICONS,
  type LayananContent,
} from "@/server/types/content";
import { saveSection } from "../actions";

type Item = LayananContent["items"][number];

const ICON_LABEL: Record<(typeof LAYANAN_ICONS)[number], string> = {
  FileText: "Dokumen",
  Trees: "Pohon (alam)",
  Store: "Toko (UMKM)",
};

export default function LayananEditor({
  initial,
}: {
  initial: LayananContent;
}) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [eyebrow, setEyebrow] = useState(initial.eyebrow);
  const [title, setTitle] = useState(initial.title);
  const [items, setItems] = useState<Item[]>(initial.items);

  function setItem(i: number, patch: Partial<Item>) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }

  function save() {
    startTransition(async () => {
      const res = await saveSection("layanan", { eyebrow, title, items });
      toast(
        res.success ? "Layanan disimpan." : res.message,
        res.success ? "Tersimpan" : "Gagal",
        res.success ? "success" : "error",
      );
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="card-doc grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
        <div>
          <label className="label-doc text-xs">Teks kecil (eyebrow)</label>
          <input
            className="input-doc mt-1 w-full"
            value={eyebrow}
            onChange={(e) => setEyebrow(e.target.value)}
          />
        </div>
        <div>
          <label className="label-doc text-xs">Judul seksi</label>
          <input
            className="input-doc mt-1 w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <span className="label-doc">Kartu Layanan</span>
          <button
            type="button"
            className="btn-outline text-xs"
            onClick={() =>
              setItems([
                ...items,
                { icon: "FileText", title: "", desc: "", cta: "", href: "" },
              ])
            }
          >
            + Tambah kartu
          </button>
        </div>

        {items.map((it, i) => (
          <div key={i} className="card-doc flex flex-col gap-3 p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-inkmut">Kartu {i + 1}</span>
              <button
                type="button"
                className="btn-danger px-3 py-1 text-xs"
                onClick={() => setItems(items.filter((_, idx) => idx !== i))}
              >
                Hapus
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="label-doc text-xs">Ikon</label>
                <select
                  className="input-doc mt-1 w-full"
                  value={it.icon}
                  onChange={(e) =>
                    setItem(i, { icon: e.target.value as Item["icon"] })
                  }
                >
                  {LAYANAN_ICONS.map((ic) => (
                    <option key={ic} value={ic}>
                      {ICON_LABEL[ic]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-doc text-xs">Judul</label>
                <input
                  className="input-doc mt-1 w-full"
                  value={it.title}
                  onChange={(e) => setItem(i, { title: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="label-doc text-xs">Deskripsi</label>
              <textarea
                rows={2}
                className="input-doc mt-1 w-full resize-y"
                value={it.desc}
                onChange={(e) => setItem(i, { desc: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="label-doc text-xs">Teks tombol</label>
                <input
                  className="input-doc mt-1 w-full"
                  value={it.cta}
                  onChange={(e) => setItem(i, { cta: e.target.value })}
                />
              </div>
              <div>
                <label className="label-doc text-xs">Tautan</label>
                <input
                  className="input-doc mt-1 w-full"
                  value={it.href}
                  onChange={(e) => setItem(i, { href: e.target.value })}
                />
              </div>
            </div>
          </div>
        ))}
      </section>

      <div className="sticky bottom-0 flex justify-end border-t border-line bg-paper/95 py-4 backdrop-blur">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="btn-primary disabled:opacity-50"
        >
          {pending ? "Menyimpan…" : "Simpan Perubahan"}
        </button>
      </div>
    </div>
  );
}
