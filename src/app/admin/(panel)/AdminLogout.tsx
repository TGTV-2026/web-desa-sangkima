"use client";

import { useTransition } from "react";
import { logoutCms } from "../login/actions";

// Tombol keluar CMS: menghapus cookie sesi CMS lalu kembali ke login CMS.
export default function AdminLogout() {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      onClick={() => startTransition(() => logoutCms())}
      disabled={pending}
      className="btn-outline text-[11px] disabled:opacity-50"
    >
      {pending ? "Keluar…" : "Keluar"}
    </button>
  );
}
