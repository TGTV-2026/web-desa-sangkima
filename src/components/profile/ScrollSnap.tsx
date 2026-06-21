"use client";

// Memasang scroll-snap lembut HANYA selama halaman profil aktif, dengan menambah
// kelas `.snap-sections` ke <html> (lihat globals.css). Dilepas saat unmount supaya
// tidak bocor ke halaman /esurat. Scroller tetap root <html> → progress bar &
// animasi scroll-driven tetap bekerja normal.
import { useEffect } from "react";

export default function ScrollSnap() {
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("snap-sections");
    return () => html.classList.remove("snap-sections");
  }, []);

  return null;
}
