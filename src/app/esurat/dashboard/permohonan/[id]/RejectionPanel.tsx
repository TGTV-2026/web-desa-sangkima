"use client";

import { useState } from "react";

export interface RejectionPanelProps {
  busy: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

/** Textarea alasan + tombol konfirmasi/batal untuk alur penolakan permohonan. */
export default function RejectionPanel({ busy, onConfirm, onCancel }: RejectionPanelProps) {
  const [reason, setReason] = useState("");

  return (
    <div className="flex flex-col gap-3">
      <label htmlFor="reason" className="label-doc !mb-0">
        Alasan Penolakan
      </label>
      <textarea
        id="reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Contoh: Data alamat tidak sesuai KTP"
        rows={3}
        className="input-doc focus:!border-oxide focus:!ring-oxide/15"
      />
      <div className="flex gap-3">
        <button
          onClick={() => onConfirm(reason)}
          disabled={busy || reason.trim().length < 3}
          className="btn-danger flex-1 !bg-oxide !text-paper !border-oxide hover:!bg-oxide/90"
        >
          {busy ? "Memproses..." : "Konfirmasi Tolak"}
        </button>
        <button onClick={onCancel} disabled={busy} className="btn-outline flex-1">
          Batal
        </button>
      </div>
    </div>
  );
}
