"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";

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
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/esurat/api/letter-types/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal mengubah status");

      toast(
        `${name} kini ${!active ? "aktif" : "nonaktif"}.`,
        "Tersimpan",
        "success",
        3000,
      );
      router.refresh();
    } catch (err: any) {
      toast(err.message || "Gagal terhubung ke server", "Gagal", "error", 5000);
    } finally {
      setBusy(false);
    }
  };

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
