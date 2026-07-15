"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import { CMS_ROLE_LABELS, type CmsUserDTO } from "@/server/types/cmsUser";
import { setAccountActive } from "./actions";

// Tabel kredensial (Manajemen Admin). Pengawas boleh menangguhkan/memulihkan
// akun sebagai kontrol keamanan — pembuatan/penyuntingan akun tetap di CMS.
export default function AccountList({
  items,
  currentUserId,
}: {
  items: CmsUserDTO[];
  currentUserId: string;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggle(id: string, active: boolean) {
    startTransition(async () => {
      const res = await setAccountActive(id, active);
      if (res.success) {
        toast(active ? "Akun dipulihkan." : "Akun ditangguhkan.", "Tersimpan", "success");
        router.refresh();
      } else {
        toast(res.message, "Gagal", "error");
      }
    });
  }

  if (items.length === 0) {
    return (
      <p className="card-doc p-8 text-center text-sm text-inkmut">
        Belum ada akun terdaftar.
      </p>
    );
  }

  return (
    <div className="card-doc overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-line text-left text-[11px] uppercase tracking-[0.12em] text-inkmut">
            <th className="p-3 font-semibold">Identitas Pengguna</th>
            <th className="p-3 font-semibold">Peran Sistem</th>
            <th className="p-3 text-center font-semibold">Status</th>
            <th className="p-3 text-right font-semibold">Tindakan</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line/60">
          {items.map((u) => (
            <tr key={u.id} className="align-middle hover:bg-paper2/40">
              <td className="p-3">
                <div className="font-semibold text-ink">
                  {u.name}
                  {u.id === currentUserId && (
                    <span className="ml-2 text-[10px] font-bold uppercase tracking-wide text-inkmut">
                      (Anda)
                    </span>
                  )}
                </div>
                <div className="font-mono text-[11px] text-inkmut">{u.email}</div>
              </td>
              <td className="p-3">
                <span
                  className={`inline-block rounded-sm border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    u.role === "super_admin" || u.role === "monitoring"
                      ? "border-brass/50 text-brass"
                      : "border-line text-inkmut"
                  }`}
                >
                  {CMS_ROLE_LABELS[u.role]}
                </span>
              </td>
              <td className="p-3 text-center">
                <span
                  className={`inline-block rounded-sm border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    u.active
                      ? "border-pine-700 text-pine-800"
                      : "border-oxide/40 text-oxide"
                  }`}
                >
                  {u.active ? "Aktif" : "Ditangguhkan"}
                </span>
              </td>
              <td className="p-3 text-right">
                {u.id === currentUserId ? (
                  <span className="text-[11px] text-inkmut">—</span>
                ) : u.active ? (
                  <button
                    type="button"
                    onClick={() => toggle(u.id, false)}
                    disabled={pending}
                    className="btn-outline px-3 py-1.5 text-xs disabled:opacity-50"
                  >
                    Tangguhkan
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => toggle(u.id, true)}
                    disabled={pending}
                    className="btn-outline px-3 py-1.5 text-xs disabled:opacity-50"
                  >
                    Pulihkan
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
