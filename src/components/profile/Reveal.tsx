"use client";

// Animasi "rise + fade" saat elemen masuk viewport (meniru reveal-up desain Stitch).
// Progressive enhancement: konten render TAMPIL secara default, jadi tetap terlihat
// walau JS gagal/lambat ter-hydrate atau IntersectionObserver tak didukung. Animasi
// hanya ditambahkan setelah JS aktif — elemen di bawah fold disembunyikan dulu (di luar
// layar, tanpa flash) lalu dianimasikan saat discroll masuk.
import { useEffect, useRef, useState, type ReactNode } from "react";

export default function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Reduce-motion atau tanpa IntersectionObserver: biarkan tampil, tanpa animasi.
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    // Sudah di viewport saat mount (mis. di atas fold): biarkan tampil tanpa flash.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) return;

    // Di bawah fold: sembunyikan dulu lalu animasikan saat masuk viewport.
    setHidden(true);
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHidden(false);
          obs.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        hidden ? "opacity-0 translate-y-8" : "opacity-100 translate-y-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}
