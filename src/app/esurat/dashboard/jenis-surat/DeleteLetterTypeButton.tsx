"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSubmitAction } from "@/hooks/useSubmitAction";
import ConfirmModal from "@/components/esurat/ConfirmModal";

export default function DeleteLetterTypeButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();
  const { busy, submit } = useSubmitAction();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () =>
    submit(() => fetch(`/esurat/api/letter-types/${id}`, { method: "DELETE" }), {
      successMessage: `Jenis surat "${name}" berhasil dihapus.`,
      successTitle: "Terhapus",
      errorFallback: "Gagal menghapus jenis surat",
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
        title="Hapus Jenis Surat"
        message={`Hapus jenis surat "${name}"? Jika sudah pernah dipakai permohonan, jenis surat disembunyikan dan permohonan lama tetap tersimpan.`}
        confirmLabel="Hapus"
        busy={busy}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
