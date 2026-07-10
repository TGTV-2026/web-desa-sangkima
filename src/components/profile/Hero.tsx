"use client";

import { useEffect, useRef } from "react";
import { ArrowRight } from "./icons";
import type { HeroContent } from "@/server/types/content";

// Tipe minimal untuk Network Information API (belum ada di lib.dom).
type ConnectionInfo = { saveData?: boolean };

export default function Hero({ content }: { content: HeroContent }) {
  const bgRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // `src` sengaja dipasang lewat ref, bukan atribut JSX: selama belum di-set,
  // browser tidak mengunduh apa pun. Video dilewati bila pengunjung sendiri
  // minta hemat data atau kurangi animasi — dua sinyal eksplisit dari mereka.
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !content.backgroundVideo) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const conn = (navigator as Navigator & { connection?: ConnectionInfo })
      .connection;
    if (conn?.saveData) return;

    el.src = content.backgroundVideo;
    // Autoplay bisa ditolak (mis. mode hemat baterai) — abaikan, gambar latar
    // tetap tampil di belakangnya.
    void el.play().catch(() => {});
  }, [content.backgroundVideo]);

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
      className="snap-start relative flex min-h-screen items-center justify-center overflow-hidden pt-20"
    >
      {/* Latar + parallax */}
      <div className="absolute inset-0 z-0">
        <div
          ref={bgRef}
          className="relative -top-[10%] h-[120%] w-full bg-cover bg-center"
          style={{ backgroundImage: `url('${content.backgroundImage}')` }}
        >
          {/* Video latar menimpa gambar. Gambar di belakangnya tetap jadi
              fallback, jadi hero langsung tampil walau video belum/gagal
              termuat. muted wajib agar autoplay diizinkan browser. */}
          {content.backgroundVideo && (
            <video
              ref={videoRef}
              loop
              muted
              playsInline
              preload="none"
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </div>
        {/* Overlay hijau pinus + gradien ke kertas agar teks terbaca */}
        <div className="absolute inset-0 bg-pine-800/70 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/20 to-transparent" />
      </div>

      {/* Konten */}
      <div className="sd-hero-out relative z-10 mx-auto max-w-[1280px] px-5 text-center md:px-12">
        <span className="mb-4 block text-[11px] font-bold uppercase tracking-[0.2em] text-[#e6c07a]">
          {content.eyebrow}
        </span>
        <h1 className="mx-auto mb-6 max-w-4xl font-serif text-[40px] font-medium leading-[44px] tracking-[-0.02em] text-paper md:text-[60px] md:leading-[64px]">
          {content.titleLines.map((line, i) => (
            <span key={i}>
              {line}
              {i < content.titleLines.length - 1 && <br />}
            </span>
          ))}
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-sm leading-6 text-paper/90">
          {content.subtitle}
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={content.primaryHref}
            className="inline-flex items-center gap-2 rounded-sm bg-paper px-6 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-pine-900 transition-all duration-300 hover:scale-[1.03] hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.35)]"
          >
            {content.primaryLabel}
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href={content.secondaryHref}
            className="inline-flex items-center rounded-sm border border-paper px-6 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-paper transition-all duration-300 hover:bg-paper hover:text-pine-900"
          >
            {content.secondaryLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
