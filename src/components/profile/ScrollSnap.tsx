"use client";

// Memasang scroll-snap lembut HANYA di Beranda ("/"). Di halaman lain (mis. /profil)
// snap + scroll-behavior:smooth TIDAK dipasang karena mematahkan pin GSAP ScrollTrigger.
// Kelas `.snap-sections` ditambah ke <html> (lihat globals.css), dilepas saat pindah/keluar.
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollSnap() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;
    const html = document.documentElement;
    html.classList.add("snap-sections");
    return () => html.classList.remove("snap-sections");
  }, [pathname]);

  return null;
}
