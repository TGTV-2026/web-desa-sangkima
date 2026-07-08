"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useToast } from "@/hooks/useToast";
import type { ProductDTO } from "@/server/types/product";
import { formatRupiah } from "@/lib/format";
import { deleteProduct } from "./actions";

export default function ProductList({ items }: { items: ProductDTO[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  function hapus(id: string) {
    startTransition(async () => {
      const res = await deleteProduct(id);
      if (res.success) {
        toast("Produk dihapus.", "Terhapus", "success");
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
        Belum ada produk. Klik “Tambah Produk” untuk membuat yang pertama.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((p) => (
        <div key={p.id} className="card-doc flex items-center gap-4 p-4">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-sm border border-line bg-paper2/40">
            {p.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.image} alt="" className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate font-semibold text-ink">{p.name}</span>
              {!p.published && (
                <span className="shrink-0 rounded-sm border border-line px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-inkmut">
                  Disembunyikan
                </span>
              )}
            </div>
            <span className="text-xs text-inkmut">
              {p.category ? `${p.category} • ` : ""}
              {p.price ? formatRupiah(p.price) : "Hubungi penjual"}
              {p.unit ? ` / ${p.unit}` : ""}
            </span>
          </div>
          <Link
            href={`/admin/produk/${p.id}`}
            className="btn-outline shrink-0 text-xs"
          >
            Edit
          </Link>
          {confirmId === p.id ? (
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => hapus(p.id)}
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
              onClick={() => setConfirmId(p.id)}
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
