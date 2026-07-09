"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/hooks/useToast";
import type { SuratContent } from "@/server/types/content";
import { saveSection } from "../actions";

export default function SuratEditor({ initial }: { initial: SuratContent }) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [v, setV] = useState<SuratContent>(initial);

  const set = <K extends keyof SuratContent>(k: K, val: SuratContent[K]) =>
    setV((p) => ({ ...p, [k]: val }));

  function save() {
    startTransition(async () => {
      const res = await saveSection("surat", v);
      toast(
        res.success ? "Pengaturan surat disimpan." : res.message,
        res.success ? "Tersimpan" : "Gagal",
        res.success ? "success" : "error",
      );
    });
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Kop surat */}
      <section className="card-doc flex flex-col gap-4 p-6">
        <span className="label-doc">Kop Surat (bagian atas)</span>
        <div>
          <label className="label-doc text-xs">Baris 1 (kabupaten)</label>
          <input
            className="input-doc mt-1 w-full"
            value={v.kopKabupaten}
            onChange={(e) => set("kopKabupaten", e.target.value)}
          />
        </div>
        <div>
          <label className="label-doc text-xs">Baris 2 (kecamatan)</label>
          <input
            className="input-doc mt-1 w-full"
            value={v.kopKecamatan}
            onChange={(e) => set("kopKecamatan", e.target.value)}
          />
        </div>
        <div>
          <label className="label-doc text-xs">Baris 3 (nama desa)</label>
          <input
            className="input-doc mt-1 w-full"
            value={v.kopDesa}
            onChange={(e) => set("kopDesa", e.target.value)}
          />
        </div>
        <div>
          <label className="label-doc text-xs">Alamat (di bawah kop)</label>
          <input
            className="input-doc mt-1 w-full"
            value={v.alamatKop}
            onChange={(e) => set("alamatKop", e.target.value)}
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
