"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useToast } from "@/hooks/useToast";
import { ppidCategoryLabel, type PpidDocDTO } from "@/server/types/ppid";
import { deletePpidDoc } from "./actions";

export default function PpidDocList({ items }: { items: PpidDocDTO[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  function hapus(id: string) {
    startTransition(async () => {
      const res = await deletePpidDoc(id);
      if (res.success) {
        toast("Dokumen dihapus.", "Terhapus", "success");
        router.refresh();
      } else {
        toast(res.message, "Gagal", "error");
      }
      setConfirmId(null);
    });
  }

  if (items.length === 0) {
    return (
      <p className="card-doc p-8 text-center text-sm text-inkmut">
        Belum ada dokumen. Klik “Tambah Dokumen” untuk membuat yang pertama.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((d) => (
        <div key={d.id} className="card-doc flex items-center gap-4 p-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate font-semibold text-ink">{d.title}</span>
              {!d.published && (
                <span className="shrink-0 rounded-sm border border-line px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-inkmut">
                  Draf
                </span>
              )}
            </div>
            <span className="text-xs text-inkmut">
              {ppidCategoryLabel(d.category)}
              {d.year ? ` • ${d.year}` : ""}
              {d.authorName ? ` • diunggah oleh ${d.authorName}` : ""}
            </span>
          </div>
          <Link
            href={`/admin/ppid/${d.id}`}
            className="btn-outline shrink-0 text-xs"
          >
            Edit
          </Link>
          {confirmId === d.id ? (
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => hapus(d.id)}
                disabled={pending}
                className="btn-danger px-3 py-2 text-xs disabled:opacity-50"
              >
                Yakin?
              </button>
              <button
                type="button"
                onClick={() => setConfirmId(null)}
                className="btn-outline px-3 py-2 text-xs"
              >
                Batal
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmId(d.id)}
              className="btn-danger shrink-0 px-3 py-2 text-xs"
            >
              Hapus
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
