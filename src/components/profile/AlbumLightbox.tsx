"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { PhotoDTO } from "@/server/types/gallery";

// Grid foto masonry + lightbox layar penuh (klik perbesar, geser next/prev,
// keyboard Esc/←/→). Dipakai di halaman detail album publik.
export default function AlbumLightbox({ photos }: { photos: PhotoDTO[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const close = useCallback(() => setIndex(null), []);
  const prev = useCallback(
    () => setIndex((i) => (i === null ? i : (i - 1 + photos.length) % photos.length)),
    [photos.length],
  );
  const next = useCallback(
    () => setIndex((i) => (i === null ? i : (i + 1) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    if (index === null) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [index, close, prev, next]);

  if (photos.length === 0) {
    return (
      <p className="rounded-sm border border-dashed border-line bg-paper2/30 px-5 py-16 text-center text-sm text-inkmut">
        Belum ada foto di album ini.
      </p>
    );
  }

  const active = index === null ? null : photos[index];

  return (
    <>
      <div className="columns-2 gap-3 md:columns-3 lg:columns-4 [&>*]:mb-3">
        {photos.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setIndex(i)}
            className="group block w-full overflow-hidden rounded-sm border border-line bg-paper2/40"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.url}
              alt={p.caption ?? ""}
              loading="lazy"
              className="w-full transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </button>
        ))}
      </div>

      {mounted &&
        active &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex flex-col bg-black/90"
            onClick={close}
          >
            {/* Bar atas */}
            <div className="flex shrink-0 items-center justify-between px-5 py-3 text-white/80">
              <span className="font-mono text-xs">
                {index! + 1} / {photos.length}
              </span>
              <button
                type="button"
                onClick={close}
                className="p-2 text-2xl leading-none hover:text-white"
                aria-label="Tutup"
              >
                ×
              </button>
            </div>

            {/* Gambar + navigasi */}
            <div
              className="relative flex flex-1 items-center justify-center px-4 pb-4"
              onClick={(e) => e.stopPropagation()}
            >
              {photos.length > 1 && (
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Sebelumnya"
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-4 py-3 text-2xl text-white hover:bg-white/20"
                >
                  ‹
                </button>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={active.url}
                alt={active.caption ?? ""}
                className="max-h-full max-w-full object-contain"
              />
              {photos.length > 1 && (
                <button
                  type="button"
                  onClick={next}
                  aria-label="Berikutnya"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-4 py-3 text-2xl text-white hover:bg-white/20"
                >
                  ›
                </button>
              )}
            </div>

            {active.caption && (
              <p className="shrink-0 px-5 pb-5 text-center text-sm text-white/80">
                {active.caption}
              </p>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
