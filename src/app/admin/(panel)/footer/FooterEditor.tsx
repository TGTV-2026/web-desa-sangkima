"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/hooks/useToast";
import type { FooterContent } from "@/server/types/content";
import { saveSection } from "../actions";

export default function FooterEditor({
  initial,
}: {
  initial: FooterContent;
}) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [v, setV] = useState<FooterContent>(initial);

  const set = <K extends keyof FooterContent>(k: K, val: FooterContent[K]) =>
    setV((p) => ({ ...p, [k]: val }));

  function save() {
    startTransition(async () => {
      const res = await saveSection("footer", v);
      toast(
        res.success ? "Footer disimpan." : res.message,
        res.success ? "Tersimpan" : "Gagal",
        res.success ? "success" : "error",
      );
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="card-doc flex flex-col gap-4 p-6">
        <div>
          <label className="label-doc text-xs">Deskripsi singkat (brand)</label>
          <textarea
            rows={3}
            className="input-doc mt-1 w-full resize-y"
            value={v.deskripsi}
            onChange={(e) => set("deskripsi", e.target.value)}
          />
        </div>
        <div>
          <label className="label-doc text-xs">Alamat (footer)</label>
          <textarea
            rows={2}
            className="input-doc mt-1 w-full resize-y"
            value={v.alamat}
            onChange={(e) => set("alamat", e.target.value)}
          />
        </div>
        <div>
          <label className="label-doc text-xs">Surel</label>
          <input
            className="input-doc mt-1 w-full"
            value={v.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </div>
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
