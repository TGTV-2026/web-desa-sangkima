"use client";

// Scrollytelling ber-pin (GSAP ScrollTrigger) untuk seksi Visi & Misi:
//  - Chip nomor 1..n muncul BERSERAK mengelilingi kartu Visi.
//  - Saat di-scroll: kartu Visi MEMUDAR & menyusut sementara pil "Misi Utama"
//    muncul di atas (seolah Visi berubah jadi pil), dan chip MERAPAT jadi kolom
//    rapi DI BAWAH pil (tidak menumpuk).
//  - Seksi "di-pin" sesaat selama animasi, lalu lanjut ke timeline misi di bawah.
//
// Chip & pil default DISEMBUNYIKAN (opacity-0). Hanya GSAP yang memunculkan, jadi
// kalau animasi tak jalan (reduce-motion / tanpa JS) tidak ada elemen berserakan.
//
// CATATAN: SCATTER, `end`, target `top` chip, dan posisi pil mungkin perlu disetel
// sedikit setelah dilihat — ubah angkanya di sini.
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Posisi awal tiap chip (berserak mengelilingi Visi), relatif terhadap panggung.
const SCATTER = [
  { top: "10%", left: "50%" },
  { top: "22%", left: "84%" },
  { top: "50%", left: "92%" },
  { top: "78%", left: "84%" },
  { top: "90%", left: "50%" },
  { top: "78%", left: "16%" },
  { top: "50%", left: "8%" },
];

export default function MisiAssemble({
  visi,
  count = 7,
}: {
  visi: string;
  count?: number;
}) {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const st = stage.current;
    if (!st) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const chips = gsap.utils.toArray<HTMLElement>(".misi-chip");

      // Keadaan awal: chip berserak (miring acak), pil "Misi Utama" tersembunyi.
      chips.forEach((chip) => {
        gsap.set(chip, {
          xPercent: -50,
          yPercent: -50,
          autoAlpha: 1,
          rotation: gsap.utils.random(-14, 14),
          scale: 0.9,
        });
      });
      gsap.set(".misi-pill", { xPercent: -50, autoAlpha: 0, scale: 0.85, y: 10 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: st,
          start: "top top",
          end: "+=160%",
          scrub: 1,
          pin: st,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Visi memudar & menyusut.
      tl.to(
        ".misi-visi-card",
        { scale: 0.8, autoAlpha: 0, duration: 0.5, ease: "power2.inOut" },
        0,
      );
      // Pil "Misi Utama" muncul di atas (seolah Visi berubah jadi pil).
      tl.to(
        ".misi-pill",
        { autoAlpha: 1, scale: 1, y: 0, duration: 0.45, ease: "power2.out" },
        0.1,
      );
      // Chip merapat membentuk susunan SELANG-SELING (kiri-kanan) seperti timeline.
      chips.forEach((chip, i) => {
        const left = i % 2 === 0;
        tl.to(
          chip,
          {
            top: `${30 + i * 8}%`,
            left: left ? "33%" : "67%",
            rotation: 0,
            scale: 1,
            duration: 0.65,
            ease: "power2.inOut",
          },
          0,
        );
      });
      // Lalu chip MEMUDAR — menyerahkan ke kartu timeline berisi teks di bawah.
      tl.to(chips, { autoAlpha: 0, duration: 0.3, ease: "power1.in" }, 0.72);

      ScrollTrigger.refresh();
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="relative">
      <div
        ref={stage}
        className="relative flex h-screen items-center justify-center overflow-hidden"
      >
        {/* Pil "Misi Utama" — muncul saat Visi memudar (default tersembunyi) */}
        <div
          className="misi-pill pointer-events-none absolute left-1/2 top-[13%] z-20 rounded-full border border-line bg-paper px-8 py-3 opacity-0 shadow-sm"
          aria-hidden
        >
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-pine-900">
            Misi Utama
          </span>
        </div>

        {/* Kartu Visi (tengah) */}
        <div className="misi-visi-card relative z-10 mx-auto w-full max-w-2xl rounded-2xl border border-line bg-card/80 px-8 py-12 text-center backdrop-blur">
          <span className="mb-6 block text-[11px] font-bold uppercase tracking-[0.2em] text-brass">
            Pernyataan Visi
          </span>
          <h3 className="font-serif text-[24px] font-medium leading-snug tracking-tight text-pine-900 md:text-[34px] md:leading-[44px]">
            &ldquo;{visi}&rdquo;
          </h3>
        </div>

        {/* Chip nomor — default tersembunyi, dimunculkan & digerakkan oleh GSAP */}
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="misi-chip absolute flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-card font-serif text-lg font-semibold text-pine-900 opacity-0 shadow-[0_8px_24px_-8px_rgba(20,41,31,0.3)]"
            style={{ top: SCATTER[i]?.top, left: SCATTER[i]?.left }}
          >
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}
