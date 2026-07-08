"use client";

// Carousel album di beranda: tampil 3 per halaman, geser kiri/kanan.
// Navigasi via panah, dot, ATAU gesture drag/swipe (Pointer Events — jalan di
// sentuh HP maupun klik-drag mouse laptop). Kartu menaut ke /galeri/<slug>.
import { useRef, useState } from "react";
import Link from "next/link";
import Seal from "./Seal";
import type { AlbumDTO } from "@/server/types/gallery";
import { formatTanggal } from "@/lib/format";

const PER_PAGE = 3;
// jarak drag minimal (px) untuk dianggap "geser" (bukan klik)
const DRAG_TAP_SLOP = 8;

export default function AlbumCarousel({
  albums,
  heading,
}: {
  albums: AlbumDTO[];
  heading: string;
}) {
  const [page, setPage] = useState(0);
  const [drag, setDrag] = useState(0); // offset px saat menyeret
  const [dragging, setDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const moved = useRef(false);

  const pageCount = Math.max(1, Math.ceil(albums.length / PER_PAGE));
  const pages = Array.from({ length: pageCount }, (_, i) =>
    albums.slice(i * PER_PAGE, i * PER_PAGE + PER_PAGE),
  );

  const go = (p: number) => setPage(Math.min(pageCount - 1, Math.max(0, p)));

  function onPointerDown(e: React.PointerEvent) {
    if (pageCount <= 1) return;
    setDragging(true);
    moved.current = false;
    startX.current = e.clientX;
    containerRef.current?.setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    let delta = e.clientX - startX.current;
    if (Math.abs(delta) > DRAG_TAP_SLOP) moved.current = true;
    // tahan (resistance) saat menyeret melewati ujung
    if ((page === 0 && delta > 0) || (page === pageCount - 1 && delta < 0)) {
      delta *= 0.3;
    }
    setDrag(delta);
  }

  function endDrag() {
    if (!dragging) return;
    setDragging(false);
    const width = containerRef.current?.offsetWidth ?? 1;
    const threshold = Math.min(width * 0.15, 80);
    if (drag <= -threshold) go(page + 1);
    else if (drag >= threshold) go(page - 1);
    setDrag(0);
  }

  // Cegah drag ikut memicu klik/navigasi kartu.
  function onClickCapture(e: React.MouseEvent) {
    if (moved.current) {
      e.preventDefault();
      e.stopPropagation();
      moved.current = false;
    }
  }

  return (
    <div>
      {/* Header: judul kiri, kontrol pagination kanan */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
        <h3 className="font-serif text-[24px] text-pine-900">{heading}</h3>
        {pageCount > 1 && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => go(page - 1)}
              disabled={page === 0}
              aria-label="Album sebelumnya"
              className="grid h-9 w-9 place-items-center rounded-full border border-line text-lg text-pine-900 transition-colors hover:bg-paper2/60 disabled:opacity-30"
            >
              ‹
            </button>
            <span className="font-mono text-xs tabular-nums text-inkmut">
              {page + 1} / {pageCount}
            </span>
            <button
              type="button"
              onClick={() => go(page + 1)}
              disabled={page === pageCount - 1}
              aria-label="Album berikutnya"
              className="grid h-9 w-9 place-items-center rounded-full border border-line text-lg text-pine-900 transition-colors hover:bg-paper2/60 disabled:opacity-30"
            >
              ›
            </button>
          </div>
        )}
      </div>

      {albums.length === 0 ? (
        <p className="rounded-sm border border-dashed border-line bg-paper2/30 px-5 py-16 text-center text-sm text-inkmut">
          Belum ada album. Tim media desa dapat menambahkannya lewat CMS.
        </p>
      ) : (
        <>
          {/* Track geser (drag/swipe + panah) */}
          <div
            ref={containerRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onClickCapture={onClickCapture}
            className={`overflow-hidden ${
              pageCount > 1
                ? dragging
                  ? "cursor-grabbing"
                  : "cursor-grab"
                : ""
            }`}
            style={{ touchAction: "pan-y" }}
          >
            <div
              className="flex ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                transform: `translateX(calc(-${page * 100}% + ${drag}px))`,
                transition: dragging ? "none" : "transform 500ms",
              }}
            >
              {pages.map((group, gi) => (
                <div
                  key={gi}
                  className="grid w-full shrink-0 grid-cols-1 gap-6 md:grid-cols-3"
                >
                  {group.map((a) => (
                    <Link
                      key={a.id}
                      href={`/galeri/${a.slug}`}
                      draggable={false}
                      className="group block"
                    >
                      <Seal className="block h-full bg-card transition-shadow duration-500 hover:shadow-md">
                        <div className="relative mb-4 aspect-[4/3] overflow-hidden">
                          {a.coverImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={a.coverImage}
                              alt={a.title}
                              loading="lazy"
                              draggable={false}
                              className="h-full w-full object-cover sd-zoom"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-paper2/40 text-inkmut/30">
                              <span className="font-serif">Album Desa</span>
                            </div>
                          )}
                          <span className="absolute bottom-2 right-2 rounded-full bg-pine-950/80 px-2.5 py-1 text-[11px] font-bold text-paper">
                            {a.photoCount} foto
                          </span>
                        </div>
                        <div className="px-4 pb-4">
                          <span className="mb-2 block font-mono text-[11px] text-brass">
                            {formatTanggal(a.createdAt?.toISOString())}
                          </span>
                          <h4 className="font-serif text-[20px] text-pine-900 transition-colors group-hover:text-brass">
                            {a.title}
                          </h4>
                        </div>
                      </Seal>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Titik indikator */}
          {pageCount > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              {pages.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Halaman ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    i === page ? "w-6 bg-pine-900" : "w-2 bg-line hover:bg-inkmut/40"
                  }`}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
