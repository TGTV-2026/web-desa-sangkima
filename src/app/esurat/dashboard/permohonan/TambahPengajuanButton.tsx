"use client";

import { useState } from "react";
import PilihJenisSuratModal from "@/components/esurat/PilihJenisSuratModal";
import type { LetterTypeDTO } from "@/server/types/letter";

/** Tombol "+ Tambah Pengajuan" di halaman daftar permohonan — buka modal pilih jenis surat di tempat, baru lanjut ke form. */
export default function TambahPengajuanButton({ types }: { types: LetterTypeDTO[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-primary">
        + Tambah Pengajuan
      </button>
      {open && (
        <PilihJenisSuratModal
          types={types}
          onClose={() => setOpen(false)}
          typeBasePath="/esurat/dashboard/permohonan/tambah"
        />
      )}
    </>
  );
}
