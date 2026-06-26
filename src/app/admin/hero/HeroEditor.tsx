"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/hooks/useToast";
import type { HeroContent } from "@/server/types/content";
import { saveSection } from "../actions";
import ImageUploadField from "../ImageUploadField";

export default function HeroEditor({ initial }: { initial: HeroContent }) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [v, setV] = useState<HeroContent>(initial);

  const set = <K extends keyof HeroContent>(k: K, val: HeroContent[K]) =>
    setV((p) => ({ ...p, [k]: val }));

  function save() {
    startTransition(async () => {
      const res = await saveSection("hero", {
        ...v,
        titleLines: v.titleLines.map((s) => s).filter((s) => s.trim()),
      });
      toast(
        res.success ? "Hero beranda disimpan." : res.message,
        res.success ? "Tersimpan" : "Gagal",
        res.success ? "success" : "error",
      );
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="card-doc flex flex-col gap-4 p-6">
        <div>
          <label className="label-doc text-xs">Teks kecil (eyebrow)</label>
          <input
            className="input-doc mt-1 w-full"
            value={v.eyebrow}
            onChange={(e) => set("eyebrow", e.target.value)}
          />
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <label className="label-doc text-xs">Judul (per baris)</label>
            <button
              type="button"
              className="btn-outline text-[11px]"
              onClick={() => set("titleLines", [...v.titleLines, ""])}
            >
              + Baris
            </button>
          </div>
          <div className="mt-2 flex flex-col gap-2">
            {v.titleLines.map((line, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className="input-doc w-full"
                  value={line}
                  onChange={(e) =>
                    set(
                      "titleLines",
                      v.titleLines.map((l, idx) => (idx === i ? e.target.value : l)),
                    )
                  }
                />
                <button
                  type="button"
                  className="btn-danger shrink-0 px-3 text-xs"
                  onClick={() =>
                    set(
                      "titleLines",
                      v.titleLines.filter((_, idx) => idx !== i),
                    )
                  }
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="label-doc text-xs">Subjudul</label>
          <textarea
            rows={3}
            className="input-doc mt-1 w-full resize-y"
            value={v.subtitle}
            onChange={(e) => set("subtitle", e.target.value)}
          />
        </div>
      </section>

      <section className="card-doc grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
        <div>
          <label className="label-doc text-xs">Tombol utama — teks</label>
          <input
            className="input-doc mt-1 w-full"
            value={v.primaryLabel}
            onChange={(e) => set("primaryLabel", e.target.value)}
          />
        </div>
        <div>
          <label className="label-doc text-xs">Tombol utama — tautan</label>
          <input
            className="input-doc mt-1 w-full"
            value={v.primaryHref}
            onChange={(e) => set("primaryHref", e.target.value)}
          />
        </div>
        <div>
          <label className="label-doc text-xs">Tombol kedua — teks</label>
          <input
            className="input-doc mt-1 w-full"
            value={v.secondaryLabel}
            onChange={(e) => set("secondaryLabel", e.target.value)}
          />
        </div>
        <div>
          <label className="label-doc text-xs">Tombol kedua — tautan</label>
          <input
            className="input-doc mt-1 w-full"
            value={v.secondaryHref}
            onChange={(e) => set("secondaryHref", e.target.value)}
          />
        </div>
      </section>

      <section className="card-doc p-6">
        <ImageUploadField
          label="Gambar latar hero"
          value={v.backgroundImage}
          onChange={(url) => set("backgroundImage", url)}
        />
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
