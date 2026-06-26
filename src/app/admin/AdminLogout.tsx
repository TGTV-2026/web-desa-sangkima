"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// Tombol keluar CMS: menghapus cookie sesi e-surat lalu kembali ke login.
export default function AdminLogout() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      await fetch("/esurat/api/auth/logout", { method: "POST" });
      router.push("/esurat");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={busy}
      className="btn-outline text-[11px] disabled:opacity-50"
    >
      {busy ? "Keluar…" : "Keluar"}
    </button>
  );
}
