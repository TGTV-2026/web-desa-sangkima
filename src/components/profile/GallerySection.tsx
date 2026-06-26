"use client";

// Seksi #galeri: arsip visual (masonry + filter) dan potensi ekonomi/UMKM (bento).
// Client karena filter tab menggunakan state. Konten dari CMS (props).
import { useState } from "react";
import Reveal from "./Reveal";
import Seal from "./Seal";
import { ArrowRight } from "./icons";
import type { GaleriContent } from "@/server/types/content";

export default function GallerySection({
  content,
}: {
  content: GaleriContent;
}) {
  const { koleksi: GALERI, potensiUtama: POTENSI_UTAMA, potensi: POTENSI } =
    content;
  // Filter tab diturunkan dari kategori unik yang ada + "Semua".
  const FILTER = ["Semua", ...new Set(GALERI.map((g) => g.kategori))];

  const [filter, setFilter] = useState<string>("Semua");
  const galeri =
    filter === "Semua" ? GALERI : GALERI.filter((g) => g.kategori === filter);

  return (
    <section
      id="galeri"
      className="relative overflow-hidden border-y border-line bg-card py-24 md:py-32"
    >
      <div className="relative z-10 mx-auto max-w-[1280px] px-5 md:px-12">
        {/* Judul seksi */}
        <Reveal className="mb-16">
          <span className="mb-4 block text-[11px] font-bold uppercase tracking-[0.2em] text-brass">
            {content.eyebrow}
          </span>
          <h2 className="mb-4 font-serif text-[32px] font-medium leading-[40px] text-pine-900">
            {content.title}
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-inkmut">
            {content.subtitle}
          </p>
        </Reveal>

        {/* Galeri masonry + filter */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
          <h3 className="font-serif text-[24px] text-pine-900">
            Koleksi Keindahan Alam
          </h3>
          <div className="flex gap-5">
            {FILTER.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`border-b-2 pb-1 text-[11px] font-bold uppercase tracking-[0.18em] transition-colors ${
                  filter === f
                    ? "border-pine-900 text-pine-900"
                    : "border-transparent text-inkmut hover:text-pine-900"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="columns-1 gap-6 md:columns-2 lg:columns-3">
          {galeri.map((g, i) => (
            <Reveal
              key={g.judul}
              delay={i * 80}
              className="mb-6 break-inside-avoid"
            >
              <Seal className="group block bg-card transition-shadow duration-500 hover:shadow-md">
                <div className="mb-4 overflow-hidden">
                  <img
                    src={g.src}
                    alt={g.alt}
                    loading="lazy"
                    className="w-full sd-zoom"
                  />
                </div>
                <div className="px-4 pb-4">
                  <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-brass">
                    {g.kategori}
                  </span>
                  <h4 className="mb-2 font-serif text-[20px] text-pine-900 transition-colors group-hover:text-brass">
                    {g.judul}
                  </h4>
                  <p className="font-mono text-xs text-inkmut">{g.arsip}</p>
                </div>
              </Seal>
            </Reveal>
          ))}
        </div>

        {/* Potensi ekonomi & UMKM (bento) */}
        <div className="mt-24">
          <Reveal className="mb-8 border-b border-line pb-4">
            <h3 className="font-serif text-[24px] text-pine-900">
              Potensi Ekonomi &amp; UMKM
            </h3>
            <p className="mt-2 text-sm leading-6 text-inkmut">
              Mendorong kemandirian ekonomi melalui inisiatif lokal.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Fitur utama */}
            <Reveal className="md:col-span-2">
              <Seal className="group flex h-full flex-col bg-card transition-shadow duration-500 hover:shadow-md">
                <div className="relative overflow-hidden">
                  <img
                    src={POTENSI_UTAMA.src}
                    alt={POTENSI_UTAMA.alt}
                    loading="lazy"
                    className="h-64 w-full object-cover sd-zoom md:h-96"
                  />
                  <span className="absolute right-4 top-4 border border-pine-900/20 bg-paper/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-pine-900 backdrop-blur">
                    {POTENSI_UTAMA.badge}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-8">
                  <h4 className="mb-4 font-serif text-[24px] text-pine-900 transition-colors group-hover:text-brass">
                    {POTENSI_UTAMA.judul}
                  </h4>
                  <p className="mb-6 text-sm leading-6 text-inkmut">
                    {POTENSI_UTAMA.desc}
                  </p>
                  <a
                    href="#kontak"
                    className="mt-auto inline-flex w-fit items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-brass transition-all hover:gap-3"
                  >
                    {POTENSI_UTAMA.cta}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </Seal>
            </Reveal>

            {/* Fitur sekunder */}
            {POTENSI.map((p, i) => (
              <Reveal key={p.judul} delay={i * 100}>
                <Seal className="group flex h-full flex-col bg-card transition-shadow duration-500 hover:shadow-md">
                  <div className="overflow-hidden">
                    <img
                      src={p.src}
                      alt={p.alt}
                      loading="lazy"
                      className="h-40 w-full object-cover sd-zoom"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h5 className="mb-2 font-bold text-pine-900">{p.judul}</h5>
                    <p className="mb-4 flex-1 text-sm leading-6 text-inkmut">
                      {p.desc}
                    </p>
                    <span className="font-mono text-xs text-brass">{p.tag}</span>
                  </div>
                </Seal>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
