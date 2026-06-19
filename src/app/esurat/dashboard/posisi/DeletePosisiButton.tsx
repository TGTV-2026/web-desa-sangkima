"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSubmitAction } from "@/hooks/useSubmitAction";
import ConfirmModal from "@/components/esurat/ConfirmModal";

export default function DeletePosisiButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const { busy, submit } = useSubmitAction();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () =>
    submit(() => fetch(`/esurat/api/position/${id}`, { method: "DELETE" }), {
      successMessage: `Jabatan "${name}" berhasil dihapus.`,
      successTitle: "Terhapus",
      errorFallback: "Gagal menghapus jabatan",
      onSuccess: () => {
        setShowConfirm(false);
        router.refresh();
      },
    }).catch(() => {});

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="text-xs font-semibold text-oxide hover:underline underline-offset-2 whitespace-nowrap"
      >
        Hapus
      </button>

      <ConfirmModal
        isOpen={showConfirm}
        title="Hapus Jabatan"
        message={`Hapus jabatan "${name}"? Pengguna yang masih memakai jabatan ini akan kehilangan jabatannya (tidak ikut terhapus).`}
        confirmLabel="Hapus"
        busy={busy}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
