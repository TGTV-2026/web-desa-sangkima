"use client";

// Scrollytelling ber-pin (GSAP ScrollTrigger) untuk seksi Visi & Misi:
//  1. Kotak Visi BERUBAH BENTUK (morph) menjadi pil "Misi Utama" — elemen SAMA,
//     bukan fade replace (width menyusut, height mengecil, border-radius membulat,
//     naik ke atas). Pil ini lalu DIAM di atas (tidak ikut bergulir).
//  2. Chip nomor berserak MERAPAT ke posisi selang-seling, lalu crossfade jadi
//     kartu teks misi.
//  3. Seluruh "rel" timeline (garis + kartu) BERGULIR ke atas di dalam pin, supaya
//     misi 6-7 terungkap tanpa tabrakan dengan pil.
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const SCATTER = [
  { top: "12%", left: "50%" },
  { top: "24%", left: "84%" },
  { top: "50%", left: "92%" },
  { top: "76%", left: "84%" },
  { top: "88%", left: "50%" },
  { top: "76%", left: "16%" },
  { top: "50%", left: "8%" },
];

// Posisi akhir tiap kartu pada "rel" timeline (boleh >100%, terungkap saat rel bergulir)
const ASSEMBLED = [
  { top: "24%", leftSide: true },
  { top: "37%", leftSide: false },
  { top: "50%", leftSide: true },
  { top: "63%", leftSide: false },
  { top: "76%", leftSide: true },
  { top: "89%", leftSide: false },
  { top: "102%", leftSide: true },
] as const;

export default function MisiAssemble({
  visi,
  misi,
}: {
  visi: string;
  misi: string[];
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
      const cards = gsap.utils.toArray<HTMLElement>(".misi-card");
      const cardEl = st.querySelector<HTMLElement>(".misi-visi-card");

      // Kunci dimensi awal kartu Visi (px) agar bisa di-morph oleh GSAP
      gsap.set(".misi-visi-card", {
        xPercent: -50,
        yPercent: -50,
        borderRadius: "1rem",
        ...(cardEl
          ? { width: cardEl.offsetWidth, height: cardEl.offsetHeight }
          : {}),
      });
      gsap.set(".misi-visi-text", { autoAlpha: 1 });
      gsap.set(".misi-pill-text", { autoAlpha: 0 });

      chips.forEach((chip, i) => {
        gsap.set(chip, {
          top: SCATTER[i % SCATTER.length]?.top,
          left: SCATTER[i % SCATTER.length]?.left,
          xPercent: -50,
          yPercent: -50,
          autoAlpha: 1,
          rotation: gsap.utils.random(-14, 14),
          scale: 0.9,
        });
      });
      gsap.set(cards, { autoAlpha: 0 });
      gsap.set(".misi-track", { y: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: st,
          start: "top top",
          end: "+=240%",
          scrub: 1,
          pin: st,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Fase 1 (0 → 0.4): teks Visi memudar, kotak MORPH jadi pil, chip merapat
      tl.to(".misi-visi-text", { autoAlpha: 0, duration: 0.12, ease: "power1.in" }, 0);
      // Pil mengecil jadi oval ramping & parkir di tempatnya pada rel timeline
      // (bukan menempel di viewport — ia ikut tergulir di fase 3). Padding py-12
      // (96px) ikut diciutkan ke 0 — kalau tidak, border-box menahan tinggi tetap besar.
      tl.to(
        ".misi-visi-card",
        {
          top: 28,
          yPercent: 0,
          width: 220,
          height: 52,
          paddingTop: 0,
          paddingBottom: 0,
          paddingLeft: 32,
          paddingRight: 32,
          borderRadius: "9999px",
          duration: 0.26,
          ease: "power2.inOut",
        },
        0,
      );
      tl.to(".misi-pill-text", { autoAlpha: 1, duration: 0.16, ease: "power1.out" }, 0.14);
      chips.forEach((chip, i) => {
        const a = ASSEMBLED[i % ASSEMBLED.length]!;
        tl.to(
          chip,
          {
            top: a.top,
            left: a.leftSide ? "25%" : "75%",
            xPercent: -50,
            yPercent: -50,
            rotation: 0,
            scale: 1,
            duration: 0.5,
            ease: "power2.inOut",
          },
          i * 0.008,
        );
      });

      // Fase 2 (0.4 → 0.5): chip crossfade jadi kartu teks
      tl.to(chips, { autoAlpha: 0, duration: 0.18, ease: "power1.in" }, 0.4);
      tl.to(
        cards,
        { autoAlpha: 1, duration: 0.22, ease: "power2.out", stagger: 0.02 },
        0.42,
      );

      // Fase 3 (0.55 → 1.0): seluruh rel (garis + kartu + pil) bergulir ke atas untuk
      // mengungkap misi 6-7 — pil ikut tergulir, tidak menempel di tepi atas viewport.
      tl.to(
        ".misi-track",
        {
          y: () => -0.22 * window.innerHeight,
          duration: 0.45,
          ease: "none",
        },
        0.55,
      );

      ScrollTrigger.refresh();
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="relative">
      <div ref={stage} className="relative h-screen overflow-hidden">
        {/* Rel timeline (garis + kartu) — bergulir ke atas di fase akhir */}
        <div className="misi-track absolute inset-0 z-20">
          {/* Garis timeline vertikal (desktop) */}
          <div
            className="pointer-events-none absolute left-1/2 top-[16%] z-10 hidden w-px -translate-x-1/2 border-l-2 border-dashed border-line lg:block"
            style={{ height: "100%" }}
            aria-hidden
          />

          {/* Kartu teks misi — fade in setelah chip tiba (timeline final) */}
          {misi.map((m, i) => {
            const a = ASSEMBLED[i % ASSEMBLED.length]!;
            return (
              <div
                key={`card-${i}`}
                className="misi-card absolute z-20 opacity-0"
                style={{
                  top: a.top,
                  transform: "translateY(-50%)",
                  ...(a.leftSide
                    ? { right: "calc(50% + 10px)", width: "46%" }
                    : { left: "calc(50% + 10px)", width: "46%" }),
                }}
              >
                <div className="relative overflow-hidden rounded-xl border border-line bg-card/80 p-6 backdrop-blur">
                  <span className="pointer-events-none absolute -right-2 -top-5 select-none font-serif text-[80px] font-bold leading-none text-pine-900/5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="relative z-10 line-clamp-4 text-[13px] leading-relaxed text-ink">
                    {m}
                  </p>
                </div>
                <span
                  className="absolute top-1/2 z-40 hidden h-3 w-3 -translate-y-1/2 rounded-full border-2 border-line bg-paper lg:block"
                  style={a.leftSide ? { right: "-18px" } : { left: "-18px" }}
                />
              </div>
            );
          })}

          {/* Pil "Misi Utama" — DI DALAM track agar IKUT tergulir saat fase akhir
              (tidak menempel di tepi atas viewport). Morph dari kotak Visi. */}
          <div
            className="misi-visi-card absolute left-1/2 top-1/2 z-30 overflow-hidden rounded-2xl border border-line bg-card/80 px-8 py-12 text-center backdrop-blur"
            style={{ width: "min(100%, 42rem)" }}
          >
            <div className="misi-visi-text">
              <span className="mb-6 block text-[11px] font-bold uppercase tracking-[0.2em] text-brass">
                Pernyataan Visi
              </span>
              <h3 className="font-serif text-[24px] font-medium leading-snug tracking-tight text-pine-900 md:text-[34px] md:leading-[44px]">
                &ldquo;{visi}&rdquo;
              </h3>
            </div>
            <div className="misi-pill-text absolute inset-0 flex items-center justify-center opacity-0">
              <span className="whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.2em] text-pine-900">
                Misi Utama
              </span>
            </div>
          </div>
        </div>

        {/* Chip nomor berserak — GSAP atur posisi awal & rapat */}
        {misi.map((_, i) => (
          <div
            key={`chip-${i}`}
            className="misi-chip absolute z-40 flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-card font-serif text-lg font-semibold text-pine-900 opacity-0 shadow-[0_8px_24px_-8px_rgba(20,41,31,0.3)]"
          >
            {String(i + 1).padStart(2, "0")}
          </div>
        ))}
      </div>
    </div>
  );
}
