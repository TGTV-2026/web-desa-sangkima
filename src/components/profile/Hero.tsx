"use client";

import { useEffect, useRef } from "react";
import { ArrowRight } from "./icons";

export default function Hero() {
  const bgRef = useRef<HTMLDivElement>(null);

  // Parallax halus: latar bergerak lebih lambat dari konten saat scroll.
  useEffect(() => {
    const el = bgRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y < window.innerHeight) {
          el.style.transform = `translateY(${y * 0.3}px)`;
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      id="beranda"
      className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20"
    >
      {/* Latar + parallax */}
      <div className="absolute inset-0 z-0">
        <div
          ref={bgRef}
          className="relative -top-[10%] h-[120%] w-full bg-cover bg-center"
          style={{ backgroundImage: "url('/profile/hero-sangkima.jpg')" }}
        />
        {/* Overlay hijau pinus + gradien ke kertas agar teks terbaca */}
        <div className="absolute inset-0 bg-pine-800/70 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/20 to-transparent" />
      </div>

      {/* Konten */}
      <div className="relative z-10 mx-auto max-w-[1280px] px-5 text-center md:px-12">
        <span className="mb-4 block text-[11px] font-bold uppercase tracking-[0.2em] text-[#e6c07a]">
          Arsip Digital &amp; Administrasi
        </span>
        <h1 className="mx-auto mb-6 max-w-4xl font-serif text-[40px] font-medium leading-[44px] tracking-[-0.02em] text-paper md:text-[60px] md:leading-[64px]">
          Merawat Tradisi,
          <br />
          Menyongsong Masa Depan.
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-sm leading-6 text-paper/90">
          Pusat informasi dan layanan administratif terpadu Desa Sangkima.
          Menghadirkan efisiensi modern tanpa meninggalkan akar budaya lokal.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#layanan"
            className="inline-flex items-center gap-2 rounded-sm bg-paper px-6 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-pine-900 transition-all duration-300 hover:scale-[1.03] hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.35)]"
          >
            Eksplorasi Desa
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#layanan"
            className="inline-flex items-center rounded-sm border border-paper px-6 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-paper transition-all duration-300 hover:bg-paper hover:text-pine-900"
          >
            Layanan Digital
          </a>
        </div>
      </div>
    </section>
  );
}
