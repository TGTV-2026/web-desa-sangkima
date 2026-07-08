"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/hooks/useToast";
import type { StrukturContent } from "@/server/types/content";
import { saveSection } from "../actions";
import ImageUploadField from "../ImageUploadField";

type Aparat = StrukturContent["aparatur"][number];

export default function StrukturEditor({
  initial,
}: {
  initial: StrukturContent;
}) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const [kepalaNama, setKepalaNama] = useState(initial.kepalaDesa.nama);
  const [kepalaNip, setKepalaNip] = useState(initial.kepalaDesa.nip);
  const [kepalaFoto, setKepalaFoto] = useState(initial.kepalaDesa.foto);
  const [aparatur, setAparatur] = useState<Aparat[]>(initial.aparatur);

  function updateAparatur(i: number, patch: Partial<Aparat>) {
    setAparatur((prev) =>
      prev.map((a, idx) => (idx === i ? { ...a, ...patch } : a)),
    );
  }

  function save() {
    startTransition(async () => {
      const res = await saveSection("struktur", {
        kepalaDesa: {
          nama: kepalaNama.trim(),
          nip: kepalaNip.trim(),
          foto: kepalaFoto,
        },
        aparatur: aparatur
          .map((a) => ({
            jabatan: a.jabatan.trim(),
            nama: a.nama.trim(),
            foto: a.foto,
          }))
          .filter((a) => a.jabatan && a.nama),
      });
      if (res.success) {
        toast("Struktur organisasi disimpan.", "Tersimpan", "success");
      } else {
        toast(res.message, "Gagal", "error");
      }
    });
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Kepala Desa */}
      <section className="card-doc p-6">
        <span className="label-doc">Kepala Desa</span>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label-doc text-xs" htmlFor="kdnama">
              Nama
            </label>
            <input
              id="kdnama"
              value={kepalaNama}
              onChange={(e) => setKepalaNama(e.target.value)}
              className="input-doc mt-1 w-full"
              placeholder="Nama kepala desa"
            />
          </div>
          <div>
            <label className="label-doc text-xs" htmlFor="kdnip">
              NIP / Keterangan
            </label>
            <input
              id="kdnip"
              value={kepalaNip}
              onChange={(e) => setKepalaNip(e.target.value)}
              className="input-doc mt-1 w-full"
              placeholder="NIP. ……"
            />
          </div>
        </div>
        <div className="mt-4">
          <ImageUploadField
            label="Foto kepala desa"
            value={kepalaFoto}
            onChange={setKepalaFoto}
          />
        </div>
      </section>

      {/* Aparatur */}
      <section className="card-doc p-6">
        <div className="mb-1 flex items-baseline justify-between">
          <span className="label-doc">Aparatur Desa</span>
          <span className="text-[11px] text-inkmut">Jabatan &amp; nama.</span>
        </div>
        <div className="mt-3 flex flex-col gap-3">
          {aparatur.map((a, i) => (
            <div
              key={i}
              className="flex flex-col gap-3 border border-line bg-paper2/20 p-4 sm:flex-row sm:items-start"
            >
              <ImageUploadField
                label="Foto"
                value={a.foto}
                onChange={(url) => updateAparatur(i, { foto: url })}
              />
              <div className="flex flex-1 flex-col gap-2">
                <input
                  value={a.jabatan}
                  onChange={(e) => updateAparatur(i, { jabatan: e.target.value })}
                  className="input-doc w-full"
                  placeholder="Jabatan"
                />
                <input
                  value={a.nama}
                  onChange={(e) => updateAparatur(i, { nama: e.target.value })}
                  className="input-doc w-full"
                  placeholder="Nama"
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  setAparatur((prev) => prev.filter((_, idx) => idx !== i))
                }
                className="btn-danger shrink-0 px-3 py-2 text-xs"
              >
                Hapus
              </button>
            </div>
          ))}
          {aparatur.length === 0 && (
            <p className="text-sm text-inkmut">Belum ada aparatur.</p>
          )}
        </div>
        <button
          type="button"
          onClick={() =>
            setAparatur((prev) => [
              ...prev,
              { jabatan: "", nama: "", foto: "" },
            ])
          }
          className="btn-outline mt-4 text-xs"
        >
          + Tambah aparatur
        </button>
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
