"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useToast } from "@/hooks/useToast";
import { CMS_ROLE_LABELS, type CmsUserDTO } from "@/server/types/cmsUser";
import { setCmsUserActive } from "./actions";

export default function CmsUserList({
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
      const res = await setCmsUserActive(id, active);
      if (res.success) {
        toast(active ? "Akun diaktifkan." : "Akun dinonaktifkan.", "Tersimpan", "success");
        router.refresh();
      } else {
        toast(res.message, "Gagal", "error");
      }
    });
  }

  if (items.length === 0) {
    return (
      <p className="card-doc p-8 text-center text-sm text-inkmut">
        Belum ada akun editor.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((u) => (
        <div key={u.id} className="card-doc flex items-center gap-4 p-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate font-semibold text-ink">{u.name}</span>
              <span
                className={`shrink-0 rounded-sm border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                  u.role === "super_admin"
                    ? "border-brass/50 text-brass"
                    : "border-line text-inkmut"
                }`}
              >
                {CMS_ROLE_LABELS[u.role]}
              </span>
              {!u.active && (
                <span className="shrink-0 rounded-sm border border-oxide/40 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-oxide">
                  Nonaktif
                </span>
              )}
              {u.id === currentUserId && (
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-inkmut">
                  (Anda)
                </span>
              )}
            </div>
            <span className="text-xs text-inkmut">{u.email}</span>
          </div>
          <Link
            href={`/admin/pengguna/${u.id}`}
            className="btn-outline shrink-0 text-xs"
          >
            Edit
          </Link>
          {u.id !== currentUserId &&
            (u.active ? (
              <button
                type="button"
                onClick={() => toggle(u.id, false)}
                disabled={pending}
                className="btn-danger shrink-0 px-3 py-2 text-xs disabled:opacity-50"
              >
                Nonaktifkan
              </button>
            ) : (
              <button
                type="button"
                onClick={() => toggle(u.id, true)}
                disabled={pending}
                className="btn-outline shrink-0 px-3 py-2 text-xs disabled:opacity-50"
              >
                Aktifkan
              </button>
            ))}
        </div>
      ))}
    </div>
  );
}
