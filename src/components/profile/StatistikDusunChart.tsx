"use client";

// Grafik batang perbandingan penduduk antar dusun. Progressive enhancement
// (mengikuti pola Reveal.tsx): sudah tampil penuh secara default, animasi
// tumbuh dari 0 hanya ditambahkan setelah JS aktif & elemen masuk viewport.
import { useEffect, useRef, useState } from "react";

export default function StatistikDusunChart({
  data,
}: {
  data: { nama: string; total: number }[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(true);

  const max = Math.max(1, ...data.map((d) => d.total));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) return;

    setRevealed(false);
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="flex flex-col gap-4">
      {data.map((d, i) => {
        const pct = Math.round((d.total / max) * 100);
        return (
          <div key={d.nama} className="flex items-center gap-3 sm:gap-4">
            <span className="w-28 shrink-0 truncate text-xs font-semibold text-ink sm:w-40 sm:text-sm">
              {d.nama}
            </span>
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-paper2">
              <div
                className="h-full rounded-full bg-gradient-to-r from-pine-700 to-pine-600 transition-[width] duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                  width: revealed ? `${pct}%` : "0%",
                  transitionDelay: `${i * 70}ms`,
                }}
              />
            </div>
            <span className="w-16 shrink-0 text-right font-mono text-xs text-inkmut sm:text-[13px]">
              {d.total.toLocaleString("id-ID")}
            </span>
          </div>
        );
      })}
    </div>
  );
}
