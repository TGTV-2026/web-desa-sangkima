"use client";

import { useState } from "react";

export interface SequencePanelProps {
  busy: boolean;
  onConfirm: (sequence: string) => void;
  onCancel: () => void;
}

const ROMAN_MONTHS = [
  "I", "II", "III", "IV", "V", "VI",
  "VII", "VIII", "IX", "X", "XI", "XII"
];

/** Panel input nomor surat untuk Kepala Urusan saat memproses permohonan. */
export default function SequencePanel({ busy, onConfirm, onCancel }: SequencePanelProps) {
  const [sequence, setSequence] = useState("");
  const now = new Date();
  const month = ROMAN_MONTHS[now.getMonth()];
  const year = now.getFullYear();

  return (
    <div className="flex flex-col gap-3">
      <label htmlFor="sequence" className="label-doc !mb-0">
        Masukkan Nomor Urut
      </label>
      <div className="flex items-center gap-2">
        <input
          id="sequence"
          type="text"
          value={sequence}
          onChange={(e) => setSequence(e.target.value)}
          placeholder="Contoh: 001"
          maxLength={10}
          className="input-doc !w-32 text-center font-mono placeholder:font-sans"
        />
      </div>
      <p className="text-xs text-inkmut mt-1">
        Masukkan nomor urutnya saja (misal: 001). Teks awalan/akhiran (seperti 470/...) sudah ada di dalam template dokumen.
      </p>
      
      <div className="flex gap-3 mt-2">
        <button
          onClick={() => onConfirm(sequence)}
          disabled={busy || sequence.trim().length === 0}
          className="btn-primary flex-1"
        >
          {busy ? "Memproses..." : "Konfirmasi & Buat PDF"}
        </button>
        <button onClick={onCancel} disabled={busy} className="btn-outline flex-1">
          Batal
        </button>
      </div>
    </div>
  );
}
