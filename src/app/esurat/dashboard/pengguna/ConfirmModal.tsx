"use client";

import { createPortal } from "react-dom";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Hapus",
  busy,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">
      <div className="card-doc bg-paper w-full max-w-sm p-6 rise-in">
        <h3 className="font-serif text-lg font-medium">{title}</h3>
        <p className="text-sm text-inkmut mt-2 leading-relaxed">{message}</p>
        <div className="flex gap-3 mt-6">
          <button onClick={onCancel} disabled={busy} className="btn-outline flex-1 disabled:opacity-60">
            Batal
          </button>
          <button onClick={onConfirm} disabled={busy} className="btn-danger flex-1 disabled:opacity-60">
            {busy ? "Memproses..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
