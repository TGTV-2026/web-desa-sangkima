import Link from "next/link";
import type { PaginationMeta } from "@/server/types/pagination";

export interface PaginationProps {
  pagination: PaginationMeta;
  /** Bentuk URL halaman ke-n, mis. (p) => `/esurat/dashboard/pengguna?q=budi&page=${p}`. */
  makeHref: (page: number) => string;
}

const ARROW_CLASS =
  "inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-[4px] border text-xs sm:text-sm font-semibold transition-colors";

/** Navigasi prev/next + indikator halaman, dipakai di seluruh halaman tabel dashboard. */
export default function Pagination({ pagination, makeHref }: PaginationProps) {
  const { page, totalPages, total } = pagination;
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4">
      {hasPrev ? (
        <Link href={makeHref(page - 1)} className={`${ARROW_CLASS} bg-card border-line text-inkmut hover:text-ink hover:bg-paper2/50`}>
          ←
        </Link>
      ) : (
        <span className={`${ARROW_CLASS} border-line text-inkmut/30 cursor-not-allowed`}>←</span>
      )}

      <p className="text-xs sm:text-sm font-semibold text-inkmut whitespace-nowrap">
        Halaman {page} dari {Math.max(totalPages, 1)}
        {/* Sembunyikan kata "· 10 data" di layar HP agar lebih ringkas */}
        <span className="text-inkmut/60 font-normal hidden sm:inline"> · {total} data</span>
      </p>

      {hasNext ? (
        <Link href={makeHref(page + 1)} className={`${ARROW_CLASS} bg-card border-line text-inkmut hover:text-ink hover:bg-paper2/50`}>
          →
        </Link>
      ) : (
        <span className={`${ARROW_CLASS} border-line text-inkmut/30 cursor-not-allowed`}>→</span>
      )}
    </div>
  );
}