"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSubmitAction } from "@/hooks/useSubmitAction";
import ConfirmModal from "./ConfirmModal";

export default function DeleteUserButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const { busy, submit } = useSubmitAction();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () =>
    submit(() => fetch(`/esurat/api/users/${id}`, { method: "DELETE" }), {
      successMessage: `${name} berhasil dihapus.`,
      successTitle: "Terhapus",
      errorFallback: "Gagal menghapus pengguna",
      onSuccess: () => {
        router.push("/esurat/dashboard/pengguna");
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
        title="Hapus Pengguna"
        message={`Hapus pengguna "${name}"? Akun ini tidak akan bisa login lagi.`}
        confirmLabel="Hapus"
        busy={busy}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
