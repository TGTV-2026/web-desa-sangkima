"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useToast } from "@/hooks/useToast";
import type { AlbumDTO } from "@/server/types/gallery";
import { formatTanggal } from "@/lib/format";
import { deleteAlbum } from "./actions";

export default function AlbumList({ items }: { items: AlbumDTO[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  function hapus(id: string) {
    startTransition(async () => {
      const res = await deleteAlbum(id);
      if (res.success) {
        toast("Album dihapus.", "Terhapus", "success");
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
        Belum ada album. Klik “Tambah Album” untuk membuat yang pertama.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((a) => (
        <div key={a.id} className="card-doc flex items-center gap-4 p-4">
          <div className="h-14 w-20 shrink-0 overflow-hidden border border-line bg-paper2/40">
            {a.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={a.coverImage} alt="" className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate font-semibold text-ink">{a.title}</span>
              {!a.published && (
                <span className="shrink-0 rounded-sm border border-line px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-inkmut">
                  Draf
                </span>
              )}
            </div>
            <span className="text-xs text-inkmut">
              {a.photoCount} foto · {formatTanggal(a.createdAt?.toISOString())}
              {a.authorName ? ` · oleh ${a.authorName}` : ""}
            </span>
          </div>
          <Link
            href={`/admin/album/${a.id}`}
            className="btn-outline shrink-0 text-xs"
          >
            Kelola
          </Link>
          {confirmId === a.id ? (
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => hapus(a.id)}
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
              onClick={() => setConfirmId(a.id)}
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
