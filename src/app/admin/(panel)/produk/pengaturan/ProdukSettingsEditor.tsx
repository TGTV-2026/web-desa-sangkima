"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/hooks/useToast";
import type { ProdukContent } from "@/server/types/content";
import { saveSection } from "../../actions";

export default function ProdukSettingsEditor({
  initial,
}: {
  initial: ProdukContent;
}) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const [judul, setJudul] = useState(initial.judul);
  const [deskripsi, setDeskripsi] = useState(initial.deskripsi);
  const [namaKoperasi, setNamaKoperasi] = useState(initial.namaKoperasi);
  const [whatsapp, setWhatsapp] = useState(initial.whatsapp);

  function save() {
    startTransition(async () => {
      const res = await saveSection("produk", {
        judul: judul.trim(),
        deskripsi: deskripsi.trim(),
        namaKoperasi: namaKoperasi.trim(),
        whatsapp: whatsapp.trim(),
      });
      if (res.success) {
        toast("Pengaturan koperasi disimpan.", "Tersimpan", "success");
      } else {
        toast(res.message, "Gagal", "error");
      }
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="card-doc flex flex-col gap-4 p-6">
        <div>
          <label className="label-doc text-xs">Judul halaman</label>
          <input
            className="input-doc mt-1 w-full"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            placeholder="mis. Produk Koperasi Desa"
          />
        </div>
        <div>
          <label className="label-doc text-xs">Nama koperasi</label>
          <input
            className="input-doc mt-1 w-full"
            value={namaKoperasi}
            onChange={(e) => setNamaKoperasi(e.target.value)}
            placeholder="mis. Koperasi Desa Sangkima"
          />
        </div>
        <div>
          <label className="label-doc text-xs">Deskripsi singkat</label>
          <textarea
            rows={3}
            className="input-doc mt-1 w-full resize-y"
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            placeholder="Kalimat pengantar halaman produk…"
          />
        </div>
      </section>

      <section className="card-doc flex flex-col gap-2 p-6">
        <label className="label-doc text-xs">
          Nomor WhatsApp tujuan pemesanan
        </label>
        <input
          className="input-doc mt-1 w-full"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="mis. 081234567890 atau 6281234567890"
        />
        <p className="text-[11px] text-inkmut">
          Semua pesanan dari keranjang akan dikirim ke nomor ini. Boleh diawali{" "}
          <span className="font-mono">0</span> atau{" "}
          <span className="font-mono">62</span> — otomatis disesuaikan. Kosongkan
          untuk menyembunyikan tombol pemesanan.
        </p>
      </section>

      <div className="sticky bottom-0 flex justify-end gap-3 border-t border-line bg-paper/95 py-4 backdrop-blur">
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
