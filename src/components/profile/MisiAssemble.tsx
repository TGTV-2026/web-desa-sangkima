"use client";

// Scrollytelling ber-pin (GSAP ScrollTrigger): chip nomor 1..n mulai BERSERAK
// mengelilingi kartu Visi, lalu MERAPAT jadi kolom rapi saat seksi di-scroll
// (efek ala Huawei). Seksi "di-pin" sesaat selama animasi berjalan.
//
// Reduce-motion / tanpa JS: tidak nge-pin, chip tampil statis mengelilingi Visi
// (tetap terlihat sebagai dekorasi, tidak ada yang patah).
//
// CATATAN: posisi (SCATTER), `end`, dan target rapinya kemungkinan perlu
// disetel sedikit setelah dilihat di browser — ubah angkanya di sini.
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Posisi awal tiap chip (berserak mengelilingi Visi), relatif terhadap panggung.
const SCATTER = [
  { top: "9%", left: "50%" },
  { top: "20%", left: "85%" },
  { top: "50%", left: "93%" },
  { top: "80%", left: "84%" },
  { top: "91%", left: "50%" },
  { top: "80%", left: "16%" },
  { top: "50%", left: "7%" },
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
    const el = root.current;
    const st = stage.current;
    if (!el || !st) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const chips = gsap.utils.toArray<HTMLElement>(".misi-chip");

      // Keadaan awal: berserak + miring acak + sedikit kecil.
      chips.forEach((chip) => {
        gsap.set(chip, {
          xPercent: -50,
          yPercent: -50,
          rotation: gsap.utils.random(-14, 14),
          scale: 0.9,
        });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "+=140%",
          scrub: 0.7,
          pin: st,
          anticipatePin: 1,
        },
      });

      // Chip merapat membentuk kolom vertikal rapi di tengah.
      chips.forEach((chip, i) => {
        tl.to(
          chip,
          {
            top: `${15 + i * 10}%`,
            left: "50%",
            rotation: 0,
            scale: 1,
            ease: "power2.inOut",
          },
          0,
        );
      });

      // Kartu Visi sedikit mengecil & meredup saat chip merapat.
      tl.to(
        ".misi-visi-card",
        { scale: 0.92, opacity: 0.45, ease: "power1.inOut" },
        0,
      );

      // Pastikan posisi pin akurat setelah font/gambar selesai layout.
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
        {/* Kartu Visi (tengah) */}
        <div className="misi-visi-card relative z-10 mx-auto w-full max-w-2xl rounded-2xl border border-line bg-card/80 px-8 py-12 text-center backdrop-blur">
          <span className="mb-6 block text-[11px] font-bold uppercase tracking-[0.2em] text-brass">
            Pernyataan Visi
          </span>
          <h3 className="font-serif text-[24px] font-medium leading-snug tracking-tight text-pine-900 md:text-[34px] md:leading-[44px]">
            &ldquo;{visi}&rdquo;
          </h3>
        </div>

        {/* Chip nomor berserak */}
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="misi-chip absolute flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-card font-serif text-lg font-semibold text-pine-900 shadow-[0_8px_24px_-8px_rgba(20,41,31,0.3)]"
            style={{
              top: SCATTER[i]?.top,
              left: SCATTER[i]?.left,
              transform: "translate(-50%, -50%)",
            }}
          >
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}
