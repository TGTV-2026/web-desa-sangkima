"use client";

import { useRouter } from "next/navigation";
import { useSubmitAction } from "@/hooks/useSubmitAction";

export default function ToggleActiveButton({
  id,
  active,
  name,
}: {
  id: string;
  active: boolean;
  name: string;
}) {
  const router = useRouter();
  const { busy, submit } = useSubmitAction();

  const toggle = () =>
    submit(
      () =>
        fetch(`/esurat/api/letter-types/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ active: !active }),
        }),
      {
        successMessage: `${name} kini ${!active ? "aktif" : "nonaktif"}.`,
        successTitle: "Tersimpan",
        successDuration: 3000,
        errorFallback: "Gagal mengubah status",
        onSuccess: () => router.refresh(),
      },
    ).catch(() => {});

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`rounded-[4px] border px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors disabled:opacity-60 ${
        active
          ? "bg-card border-line text-inkmut hover:text-ink hover:bg-paper2/50"
          : "bg-pine-800 border-pine-800 text-paper hover:bg-pine-700"
      }`}
    >
      {busy ? "..." : active ? "Nonaktifkan" : "Aktifkan"}
    </button>
  );
}
