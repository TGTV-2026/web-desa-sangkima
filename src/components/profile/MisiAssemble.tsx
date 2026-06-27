"use client";

// Scrollytelling ber-pin (GSAP ScrollTrigger) untuk seksi Visi & Misi:
//  1. Kotak Visi MORPH jadi pil "Misi Utama" (elemen sama; pil parkir di rel timeline,
//     ikut tergulir di fase akhir — tidak menempel di viewport).
//  2. Tiap misi adalah SATU elemen (.misi-item): mula-mula kotak kecil ber-angka yang
//     berserak, lalu merapat selang-seling, lalu MELEBAR jadi kartu teks penuh
//     (angka besar memudar → jadi watermark sudut, teks muncul). Tanpa crossfade dua
//     kotak terpisah, jadi transisinya menyatu.
//  3. Seluruh rel (garis + kartu + pil) bergulir mengungkap misi 6-7.
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

// Posisi akhir tiap kartu pada rel timeline (boleh >100%, terungkap saat rel bergulir)
const ASSEMBLED = [
  { top: "24%", leftSide: true },
  { top: "37%", leftSide: false },
  { top: "50%", leftSide: true },
  { top: "63%", leftSide: false },
  { top: "76%", leftSide: true },
  { top: "89%", leftSide: false },
  { top: "102%", leftSide: true },
] as const;

const CARD_HEIGHT = 132;

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
      const items = gsap.utils.toArray<HTMLElement>(".misi-item");
      const cardEl = st.querySelector<HTMLElement>(".misi-visi-card");

      // Responsif: mobile = 1 kolom (kartu lebar) supaya tidak jadi sliver sempit;
      // desktop = 2 kolom selang-seling. Animasinya sama persis.
      const mobile = window.innerWidth < 1024;
      const chipW = mobile ? "15%" : "5%";
      const cardW = mobile ? "86%" : "46%";
      const cardH = mobile ? 122 : CARD_HEIGHT;
      const posOf = (i: number) =>
        mobile
          ? { top: `${24 + i * 22}%`, left: "50%" } // mulai 24% agar kartu 1 di bawah pil
          : {
              top: ASSEMBLED[i % ASSEMBLED.length]!.top,
              left: ASSEMBLED[i % ASSEMBLED.length]!.leftSide ? "25%" : "75%",
            };
      const trackY = mobile ? -0.74 : -0.22;

      // Kartu Visi: kunci dimensi awal (px) agar bisa di-morph.
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

      // Tiap item dimulai sebagai kotak kecil ber-angka, berserak & miring.
      items.forEach((item, i) => {
        gsap.set(item, {
          top: SCATTER[i % SCATTER.length]?.top,
          left: SCATTER[i % SCATTER.length]?.left,
          xPercent: -50,
          yPercent: -50,
          autoAlpha: 1,
          rotation: gsap.utils.random(-14, 14),
          width: chipW,
          height: 56,
        });
      });
      gsap.set(".misi-num-big", { autoAlpha: 1 });
      gsap.set(".misi-num-wm", { autoAlpha: 0 });
      gsap.set(".misi-text", { autoAlpha: 0 });
      gsap.set(".misi-dot", { autoAlpha: 0 });
      gsap.set(".misi-track", { y: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: st,
          start: "top top",
          end: mobile ? "+=340%" : "+=250%",
          scrub: 1,
          pin: st,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Fase 1: kotak Visi MORPH jadi pil oval ramping (padding py-12 ikut ke 0,
      // kalau tidak border-box menahan tinggi kotak tetap besar).
      tl.to(".misi-visi-text", { autoAlpha: 0, duration: 0.1, ease: "power1.in" }, 0);
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
          duration: 0.24,
          ease: "power2.inOut",
        },
        0,
      );
      tl.to(".misi-pill-text", { autoAlpha: 1, duration: 0.14, ease: "power1.out" }, 0.14);

      // Fase 2: kotak kecil merapat ke posisi selang-seling (masih kotak angka).
      items.forEach((item, i) => {
        const p = posOf(i);
        tl.to(
          item,
          {
            top: p.top,
            left: p.left,
            xPercent: -50,
            yPercent: -50,
            rotation: 0,
            duration: 0.4,
            ease: "power2.inOut",
          },
          0.06 + i * 0.01,
        );
      });

      // Fase 3: kotak MELEBAR jadi kartu (lebar & tinggi tumbuh dari kotak yang sama).
      // Angka besar memudar, watermark sudut & teks muncul saat kotak sudah melebar.
      items.forEach((item, i) => {
        tl.to(
          item,
          {
            width: cardW,
            height: cardH,
            duration: 0.3,
            ease: "power3.inOut",
          },
          0.5 + i * 0.012,
        );
      });
      tl.to(".misi-num-big", { autoAlpha: 0, duration: 0.18, ease: "power1.in" }, 0.52);
      tl.to(".misi-num-wm", { autoAlpha: 1, duration: 0.26, ease: "power1.out" }, 0.6);
      tl.to(".misi-text", { autoAlpha: 1, duration: 0.26, ease: "power2.out" }, 0.64);
      tl.to(".misi-dot", { autoAlpha: 1, duration: 0.2, ease: "power1.out" }, 0.66);

      // Fase 4: seluruh rel (garis + kartu + pil) bergulir mengungkap misi 6-7.
      tl.to(
        ".misi-track",
        { y: () => trackY * window.innerHeight, duration: 0.4, ease: "none" },
        0.8,
      );

      ScrollTrigger.refresh();
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="relative">
      <div ref={stage} className="relative h-screen overflow-hidden">
        {/* Rel timeline — garis + kartu + pil; bergulir ke atas di fase akhir */}
        <div className="misi-track absolute inset-0 z-20">
          {/* Wrapper ter-pusat ber-lebar tetap: semua persen (posisi & lebar kartu)
              mengacu ke sini, BUKAN ke stage yang lebarnya berubah saat di-pin. */}
          <div className="relative mx-auto h-full w-full max-w-5xl px-4">
          {/* Garis timeline vertikal (desktop) */}
          <div
            className="pointer-events-none absolute left-1/2 top-[16%] z-10 hidden w-px -translate-x-1/2 border-l-2 border-dashed border-line lg:block"
            style={{ height: "100%" }}
            aria-hidden
          />

          {/* Dot di garis tengah (default tampil; saat animasi: muncul di fase melebar) */}
          {misi.map((_, i) => {
            const a = ASSEMBLED[i % ASSEMBLED.length]!;
            return (
              <span
                key={`dot-${i}`}
                className="misi-dot absolute z-30 hidden h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-line bg-paper lg:block"
                style={{ top: a.top, left: "50%" }}
                aria-hidden
              />
            );
          })}

          {/* Tiap misi = SATU kotak: angka kecil → melebar jadi kartu teks.
              Default (reduce-motion / tanpa JS) = kartu penuh statis. GSAP yang
              menyusutkannya jadi kotak angka di awal animasi. */}
          {misi.map((m, i) => {
            const a = ASSEMBLED[i % ASSEMBLED.length]!;
            const nn = String(i + 1).padStart(2, "0");
            return (
              <div
                key={`item-${i}`}
                className="misi-item absolute z-20 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-line bg-card/80 shadow-[0_8px_24px_-10px_rgba(20,41,31,0.25)] backdrop-blur"
                style={{
                  top: a.top,
                  left: a.leftSide ? "25%" : "75%",
                  width: "46%",
                  height: CARD_HEIGHT,
                }}
              >
                {/* Angka watermark sudut (kartu) */}
                <span className="misi-num-wm pointer-events-none absolute -right-2 -top-5 select-none font-serif text-[80px] font-bold leading-none text-pine-900/5">
                  {nn}
                </span>
                {/* Angka besar di tengah (saat masih kotak kecil) */}
                <span className="misi-num-big pointer-events-none absolute inset-0 flex select-none items-center justify-center font-serif text-lg font-semibold text-pine-900 opacity-0">
                  {nn}
                </span>
                {/* Teks misi (muncul saat kotak melebar) */}
                <p className="misi-text absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 line-clamp-4 text-[13px] leading-relaxed text-ink">
                  {m}
                </p>
              </div>
            );
          })}

          {/* Pil "Misi Utama" — morph dari kotak Visi; parkir di rel & ikut tergulir */}
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
        </div>
      </div>
    </div>
  );
}
