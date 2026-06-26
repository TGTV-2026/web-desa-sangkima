"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/hooks/useToast";
import type { KontakContent } from "@/server/types/content";
import { saveSection } from "../actions";
import ImageUploadField from "../ImageUploadField";

// Kategori titik peta (selaras KATEGORI_WARNA di peta-data.ts) → warna marker.
const KATEGORI = ["Wisata Alam", "Budaya", "UMKM", "Pemerintahan"];

// Bentuk titik untuk form: lat/lng string agar nyaman mengetik desimal.
type TitikForm = {
  nama: string;
  kategori: string;
  lat: string;
  lng: string;
  gambar: string;
  deskripsi: string;
};

export default function KontakEditor({
  initial,
}: {
  initial: KontakContent;
}) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const [alamat, setAlamat] = useState(initial.alamat);
  const [email, setEmail] = useState(initial.email);
  const [centerLat, setCenterLat] = useState(String(initial.petaCenter[0]));
  const [centerLng, setCenterLng] = useState(String(initial.petaCenter[1]));
  const [titik, setTitik] = useState<TitikForm[]>(
    initial.titik.map((t) => ({
      ...t,
      lat: String(t.lat),
      lng: String(t.lng),
    })),
  );

  function setT(i: number, patch: Partial<TitikForm>) {
    setTitik((prev) => prev.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));
  }

  function save() {
    startTransition(async () => {
      const res = await saveSection("kontak", {
        alamat,
        email,
        petaCenter: [Number(centerLat), Number(centerLng)],
        titik: titik.map((t) => ({
          nama: t.nama,
          kategori: t.kategori,
          lat: Number(t.lat),
          lng: Number(t.lng),
          gambar: t.gambar,
          deskripsi: t.deskripsi,
        })),
      });
      toast(
        res.success ? "Kontak & peta disimpan." : res.message,
        res.success ? "Tersimpan" : "Gagal",
        res.success ? "success" : "error",
      );
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="card-doc flex flex-col gap-4 p-6">
        <div>
          <label className="label-doc text-xs">Alamat kantor desa</label>
          <textarea
            rows={2}
            className="input-doc mt-1 w-full resize-y"
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="label-doc text-xs">Surel resmi</label>
            <input
              className="input-doc mt-1 w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="label-doc text-xs">Pusat peta — Lat</label>
            <input
              className="input-doc mt-1 w-full"
              value={centerLat}
              onChange={(e) => setCenterLat(e.target.value)}
            />
          </div>
          <div>
            <label className="label-doc text-xs">Pusat peta — Lng</label>
            <input
              className="input-doc mt-1 w-full"
              value={centerLng}
              onChange={(e) => setCenterLng(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <span className="label-doc">Titik Peta</span>
          <button
            type="button"
            className="btn-outline text-xs"
            onClick={() =>
              setTitik([
                ...titik,
                {
                  nama: "",
                  kategori: KATEGORI[0],
                  lat: String(centerLat),
                  lng: String(centerLng),
                  gambar: "",
                  deskripsi: "",
                },
              ])
            }
          >
            + Tambah titik
          </button>
        </div>

        {titik.map((t, i) => (
          <div key={i} className="card-doc flex flex-col gap-3 p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-inkmut">Titik {i + 1}</span>
              <button
                type="button"
                className="btn-danger px-3 py-1 text-xs"
                onClick={() => setTitik(titik.filter((_, idx) => idx !== i))}
              >
                Hapus
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="label-doc text-xs">Nama lokasi</label>
                <input
                  className="input-doc mt-1 w-full"
                  value={t.nama}
                  onChange={(e) => setT(i, { nama: e.target.value })}
                />
              </div>
              <div>
                <label className="label-doc text-xs">Kategori</label>
                <select
                  className="input-doc mt-1 w-full"
                  value={t.kategori}
                  onChange={(e) => setT(i, { kategori: e.target.value })}
                >
                  {KATEGORI.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-doc text-xs">Latitude</label>
                <input
                  className="input-doc mt-1 w-full"
                  value={t.lat}
                  onChange={(e) => setT(i, { lat: e.target.value })}
                />
              </div>
              <div>
                <label className="label-doc text-xs">Longitude</label>
                <input
                  className="input-doc mt-1 w-full"
                  value={t.lng}
                  onChange={(e) => setT(i, { lng: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="label-doc text-xs">Deskripsi</label>
              <textarea
                rows={2}
                className="input-doc mt-1 w-full resize-y"
                value={t.deskripsi}
                onChange={(e) => setT(i, { deskripsi: e.target.value })}
              />
            </div>
            <ImageUploadField
              label="Gambar lokasi"
              value={t.gambar}
              onChange={(url) => setT(i, { gambar: url })}
            />
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
