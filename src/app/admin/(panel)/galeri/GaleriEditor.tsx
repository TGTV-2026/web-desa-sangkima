"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/hooks/useToast";
import type { GaleriContent } from "@/server/types/content";
import { saveSection } from "../actions";
import ImageUploadField from "../ImageUploadField";

type Koleksi = GaleriContent["koleksi"][number];
type Potensi = GaleriContent["potensi"][number];

export default function GaleriEditor({
  initial,
}: {
  initial: GaleriContent;
}) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const [eyebrow, setEyebrow] = useState(initial.eyebrow);
  const [title, setTitle] = useState(initial.title);
  const [subtitle, setSubtitle] = useState(initial.subtitle);
  const [koleksi, setKoleksi] = useState<Koleksi[]>(initial.koleksi);
  const [utama, setUtama] = useState(initial.potensiUtama);
  const [potensi, setPotensi] = useState<Potensi[]>(initial.potensi);

  const setKol = (i: number, patch: Partial<Koleksi>) =>
    setKoleksi((p) => p.map((k, idx) => (idx === i ? { ...k, ...patch } : k)));
  const setPot = (i: number, patch: Partial<Potensi>) =>
    setPotensi((p) => p.map((k, idx) => (idx === i ? { ...k, ...patch } : k)));

  function save() {
    startTransition(async () => {
      const res = await saveSection("galeri", {
        eyebrow,
        title,
        subtitle,
        koleksi,
        potensiUtama: utama,
        potensi,
      });
      toast(
        res.success ? "Galeri disimpan." : res.message,
        res.success ? "Tersimpan" : "Gagal",
        res.success ? "success" : "error",
      );
    });
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Judul seksi */}
      <section className="card-doc flex flex-col gap-4 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        </div>
        <div>
          <label className="label-doc text-xs">Subjudul</label>
          <textarea
            rows={2}
            className="input-doc mt-1 w-full resize-y"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />
        </div>
      </section>

      {/* Koleksi foto */}
      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <span className="label-doc">Koleksi Foto</span>
          <button
            type="button"
            className="btn-outline text-xs"
            onClick={() =>
              setKoleksi([
                ...koleksi,
                { src: "", kategori: "Lanskap", judul: "", arsip: "", alt: "" },
              ])
            }
          >
            + Tambah foto
          </button>
        </div>
        {koleksi.map((k, i) => (
          <div key={i} className="card-doc flex flex-col gap-3 p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-inkmut">Foto {i + 1}</span>
              <button
                type="button"
                className="btn-danger px-3 py-1 text-xs"
                onClick={() => setKoleksi(koleksi.filter((_, idx) => idx !== i))}
              >
                Hapus
              </button>
            </div>
            <ImageUploadField
              label="Gambar"
              value={k.src}
              onChange={(url) => setKol(i, { src: url })}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="label-doc text-xs">Judul</label>
                <input
                  className="input-doc mt-1 w-full"
                  value={k.judul}
                  onChange={(e) => setKol(i, { judul: e.target.value })}
                />
              </div>
              <div>
                <label className="label-doc text-xs">
                  Kategori (untuk filter)
                </label>
                <input
                  className="input-doc mt-1 w-full"
                  value={k.kategori}
                  onChange={(e) => setKol(i, { kategori: e.target.value })}
                  placeholder="Lanskap / Budaya / …"
                />
              </div>
              <div>
                <label className="label-doc text-xs">Kode arsip</label>
                <input
                  className="input-doc mt-1 w-full"
                  value={k.arsip}
                  onChange={(e) => setKol(i, { arsip: e.target.value })}
                />
              </div>
              <div>
                <label className="label-doc text-xs">Teks alternatif (alt)</label>
                <input
                  className="input-doc mt-1 w-full"
                  value={k.alt}
                  onChange={(e) => setKol(i, { alt: e.target.value })}
                />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Potensi utama */}
      <section className="card-doc flex flex-col gap-3 p-6">
        <span className="label-doc">Potensi Unggulan (kartu besar)</span>
        <ImageUploadField
          label="Gambar"
          value={utama.src}
          onChange={(url) => setUtama({ ...utama, src: url })}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="label-doc text-xs">Badge</label>
            <input
              className="input-doc mt-1 w-full"
              value={utama.badge}
              onChange={(e) => setUtama({ ...utama, badge: e.target.value })}
            />
          </div>
          <div>
            <label className="label-doc text-xs">Judul</label>
            <input
              className="input-doc mt-1 w-full"
              value={utama.judul}
              onChange={(e) => setUtama({ ...utama, judul: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="label-doc text-xs">Deskripsi</label>
          <textarea
            rows={2}
            className="input-doc mt-1 w-full resize-y"
            value={utama.desc}
            onChange={(e) => setUtama({ ...utama, desc: e.target.value })}
          />
        </div>
        <div>
          <label className="label-doc text-xs">Teks tombol</label>
          <input
            className="input-doc mt-1 w-full"
            value={utama.cta}
            onChange={(e) => setUtama({ ...utama, cta: e.target.value })}
          />
        </div>
        <div>
          <label className="label-doc text-xs">Teks alternatif (alt)</label>
          <input
            className="input-doc mt-1 w-full"
            value={utama.alt}
            onChange={(e) => setUtama({ ...utama, alt: e.target.value })}
          />
        </div>
      </section>

      {/* Potensi sekunder */}
      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <span className="label-doc">Potensi Lain (kartu kecil)</span>
          <button
            type="button"
            className="btn-outline text-xs"
            onClick={() =>
              setPotensi([
                ...potensi,
                { src: "", judul: "", desc: "", tag: "", alt: "" },
              ])
            }
          >
            + Tambah potensi
          </button>
        </div>
        {potensi.map((p, i) => (
          <div key={i} className="card-doc flex flex-col gap-3 p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-inkmut">
                Potensi {i + 1}
              </span>
              <button
                type="button"
                className="btn-danger px-3 py-1 text-xs"
                onClick={() => setPotensi(potensi.filter((_, idx) => idx !== i))}
              >
                Hapus
              </button>
            </div>
            <ImageUploadField
              label="Gambar"
              value={p.src}
              onChange={(url) => setPot(i, { src: url })}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="label-doc text-xs">Judul</label>
                <input
                  className="input-doc mt-1 w-full"
                  value={p.judul}
                  onChange={(e) => setPot(i, { judul: e.target.value })}
                />
              </div>
              <div>
                <label className="label-doc text-xs">Tag</label>
                <input
                  className="input-doc mt-1 w-full"
                  value={p.tag}
                  onChange={(e) => setPot(i, { tag: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="label-doc text-xs">Deskripsi</label>
              <textarea
                rows={2}
                className="input-doc mt-1 w-full resize-y"
                value={p.desc}
                onChange={(e) => setPot(i, { desc: e.target.value })}
              />
            </div>
            <div>
              <label className="label-doc text-xs">Teks alternatif (alt)</label>
              <input
                className="input-doc mt-1 w-full"
                value={p.alt}
                onChange={(e) => setPot(i, { alt: e.target.value })}
              />
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
