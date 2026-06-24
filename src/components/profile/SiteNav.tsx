"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Close, Menu } from "./icons";

// Path absolut (diawali `/`) agar tautan seksi tetap jalan dari halaman /profil:
// menavigasi ke beranda lalu scroll ke anchor-nya.
const LINKS = [
  { label: "Beranda", href: "/#beranda" },
  { label: "Layanan", href: "/#layanan" },
  { label: "Profil", href: "/profil" },
  { label: "Galeri", href: "/#galeri" },
  { label: "Kontak", href: "/#kontak" },
];

export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Di halaman tanpa hero gelap (mis. /profil), nav harus selalu "solid"
  // agar teks gelapnya terbaca di atas latar kertas terang.
  const solid = scrolled || pathname !== "/";

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 50);
      // Sembunyikan saat scroll turun (beri ruang seksi), tampilkan saat scroll naik.
      if (y > lastY && y > 120) setHidden(true);
      else if (y < lastY) setHidden(false);
      lastY = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Menu mobile terbuka memaksa nav tetap terlihat.
  const visuallyHidden = hidden && !open;

  return (
    <nav
      className={`fixed top-0 z-50 w-full border-b transition-all duration-500 ease-in-out ${
        visuallyHidden ? "-translate-y-full" : "translate-y-0"
      } ${
        solid
          ? "border-line bg-paper/95 py-2 shadow-[0_4px_20px_rgba(0,0,0,0.05)] backdrop-blur-md"
          : "border-transparent bg-transparent py-4"
      }`}
    >
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 md:px-12">
        {/* Brand */}
        <Link
          href="/#beranda"
          onClick={() => setOpen(false)}
          className={`font-serif text-2xl font-medium tracking-tight transition-colors duration-300 ${
            solid ? "text-pine-900" : "text-paper"
          }`}
        >
          DESA SANGKIMA
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              className={`border-b-2 border-transparent pb-1 text-[11px] font-bold uppercase tracking-[0.18em] transition-all duration-300 ${
                solid
                  ? "text-inkmut hover:border-pine-900 hover:text-pine-900"
                  : `${i === 0 ? "text-paper" : "text-paper/80"} hover:border-paper hover:text-paper`
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Action */}
        <div className="hidden md:block">
          <Link
            href="/esurat"
            className={`inline-flex items-center rounded-sm px-6 py-3 text-[11px] font-bold uppercase tracking-[0.18em] transition-all duration-300 ${
              solid
                ? "bg-pine-900 text-paper hover:bg-pine-800 hover:shadow-lg"
                : "bg-paper text-pine-900 hover:bg-white"
            }`}
          >
            E-Surat
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label="Buka menu"
          onClick={() => setOpen((v) => !v)}
          className={`transition-colors duration-300 md:hidden ${
            solid || open ? "text-pine-900" : "text-paper"
          }`}
        >
          {open ? <Close className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="mx-5 mt-3 rounded-sm border border-line bg-card p-2 shadow-lg md:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-sm px-4 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-inkmut transition-colors hover:bg-paper2/60 hover:text-pine-900"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/esurat"
            onClick={() => setOpen(false)}
            className="mt-1 block rounded-sm bg-pine-900 px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-paper"
          >
            E-Surat
          </Link>
        </div>
      )}
    </nav>
  );
}
