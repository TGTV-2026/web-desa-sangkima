"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";

// Tur berpandu CMS untuk operator awam: sorot elemen + penjelasan langkah demi
// langkah. Muncul otomatis saat kunjungan pertama (disimpan di localStorage),
// dan bisa diputar ulang lewat tombol "Panduan" (event window "cms-tour:start").
const STORAGE_KEY = "cms-tour-v1";
export const TOUR_EVENT = "cms-tour:start";

type Step = {
  sel?: string; // selektor target; kosong = kartu di tengah layar
  title: string;
  body: string;
};

const ALL_STEPS: Step[] = [
  {
    title: "Selamat datang",
    body: "Ini pusat kelola isi website desa. Di sini Anda bisa mengubah teks, foto, dan pengumuman — tanpa perlu tahu kode sama sekali.",
  },
  {
    sel: '[data-tour="nav"]',
    title: "Menu semua bagian",
    body: "Setiap bagian website ada di daftar ini. Klik salah satu untuk membukanya.",
  },
  {
    sel: '[data-tour="nav-berita"]',
    title: "Contoh: menulis berita",
    body: "Misalnya untuk mengumumkan kegiatan: buka “Berita & Pengumuman”, klik “+ Tambah”, isi judul & isi, lalu Simpan.",
  },
  {
    sel: '[data-tour="cards"]',
    title: "Atau pilih dari kartu",
    body: "Tiap kartu di halaman ini punya penjelasan singkat tentang isinya. Klik kartunya untuk mulai menyunting.",
  },
  {
    title: "Menyimpan perubahan",
    body: "Di setiap halaman ada tombol “Simpan Perubahan” di bagian bawah. Begitu disimpan, perubahan langsung tampil di website.",
  },
  {
    sel: '[data-tour="view-site"]',
    title: "Lihat hasilnya",
    body: "Klik “Lihat situs publik” untuk membuka website di tab baru dan mengecek hasil suntingan Anda.",
  },
  {
    sel: '[data-tour="help"]',
    title: "Bingung? Ulangi kapan saja",
    body: "Klik tombol “Panduan” ini untuk memutar ulang tutorial ini kapan pun Anda mau.",
  },
  {
    title: "Siap! ",
    body: "Silakan mulai dari bagian yang paling sering dipakai. Tenang semua perubahan bisa diubah lagi kapan saja.",
  },
];

type Rect = { top: number; left: number; width: number; height: number };

export default function CmsTour() {
  const pathname = usePathname();
  const [steps, setSteps] = useState<Step[]>([]);
  const [i, setI] = useState(0);
  const [active, setActive] = useState(false);
  const [rect, setRect] = useState<Rect | null>(null);
  const [mounted, setMounted] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => setMounted(true), []);

  const start = useCallback(() => {
    // Ambil hanya langkah yang targetnya ada di halaman ini.
    const usable = ALL_STEPS.filter(
      (s) => !s.sel || document.querySelector(s.sel),
    );
    setSteps(usable);
    setI(0);
    setActive(true);
  }, []);

  const finish = useCallback(() => {
    setActive(false);
    try {
      localStorage.setItem(STORAGE_KEY, "done");
    } catch {
      /* localStorage bisa diblokir — abaikan */
    }
  }, []);

  // Auto-start sekali di halaman ringkasan (/admin).
  useEffect(() => {
    if (startedRef.current) return;
    if (pathname !== "/admin") return;
    let done = false;
    try {
      done = localStorage.getItem(STORAGE_KEY) === "done";
    } catch {
      /* abaikan */
    }
    if (done) return;
    startedRef.current = true;
    const t = setTimeout(start, 650);
    return () => clearTimeout(t);
  }, [pathname, start]);

  // Tombol "Panduan" memicu event ini.
  useEffect(() => {
    const handler = () => start();
    window.addEventListener(TOUR_EVENT, handler);
    return () => window.removeEventListener(TOUR_EVENT, handler);
  }, [start]);

  // Ukur posisi target langkah aktif (+ ikuti scroll/resize).
  useEffect(() => {
    if (!active || steps.length === 0) return;
    const step = steps[i];
    const measure = () => {
      if (!step.sel) {
        setRect(null);
        return;
      }
      const el = document.querySelector(step.sel);
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    const step0 = steps[i];
    if (step0.sel) {
      const el = document.querySelector(step0.sel);
      el?.scrollIntoView({ block: "center", inline: "nearest" });
    }
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [active, i, steps]);

  // Keyboard: Esc = tutup, ← → = navigasi.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
      else if (e.key === "ArrowRight") setI((v) => Math.min(steps.length - 1, v + 1));
      else if (e.key === "ArrowLeft") setI((v) => Math.max(0, v - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, steps.length, finish]);

  if (!mounted || !active || steps.length === 0) return null;

  const isLast = i === steps.length - 1;
  const PAD = 8;

  // Posisi kartu tooltip.
  const tipW = 340;
  let tipStyle: CSSProperties;
  if (rect) {
    const spaceBelow = window.innerHeight - (rect.top + rect.height);
    const below = spaceBelow > 240;
    const top = below ? rect.top + rect.height + PAD + 12 : rect.top - PAD - 12;
    const left = Math.min(
      Math.max(16, rect.left),
      window.innerWidth - tipW - 16,
    );
    tipStyle = below
      ? { top, left, width: tipW }
      : { top, left, width: tipW, transform: "translateY(-100%)" };
  } else {
    tipStyle = {
      top: "50%",
      left: "50%",
      width: Math.min(tipW, window.innerWidth - 32),
      transform: "translate(-50%,-50%)",
    };
  }

  return createPortal(
    <div className="fixed inset-0 z-[100]" aria-live="polite">
      {/* Peredup + penangkap klik. Tanpa target → latar gelap penuh. */}
      {!rect && (
        <div className="absolute inset-0 bg-pine-950/70 backdrop-blur-[1px]" />
      )}
      {/* Sorotan: kotak di posisi target dengan bayangan besar untuk menggelapkan sekeliling */}
      {rect && (
        <div
          className="pointer-events-none absolute rounded-lg"
          style={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            boxShadow:
              "0 0 0 2px var(--color-brass), 0 0 0 9999px rgba(14,31,24,0.68)",
            transition: "all .3s cubic-bezier(0.16,1,0.3,1)",
          }}
        />
      )}

      {/* Kartu penjelasan */}
      <div
        className="absolute animate-[popIn_.35s_cubic-bezier(0.16,1,0.3,1)] rounded-lg border border-line bg-card p-5 shadow-2xl"
        style={tipStyle}
      >
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brass">
            Panduan · Langkah {i + 1}/{steps.length}
          </span>
          <button
            type="button"
            onClick={finish}
            className="text-lg leading-none text-inkmut transition-colors hover:text-ink"
            aria-label="Tutup panduan"
          >
            ×
          </button>
        </div>
        <h3 className="font-serif text-xl text-pine-900">{steps[i].title}</h3>
        <p className="mt-2 text-sm leading-6 text-inkmut">{steps[i].body}</p>

        {/* Titik progres */}
        <div className="mt-4 flex gap-1.5">
          {steps.map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                idx === i ? "w-5 bg-pine-800" : "w-1.5 bg-line"
              }`}
            />
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <button
            type="button"
            onClick={finish}
            className="text-xs font-semibold text-inkmut hover:text-ink"
          >
            Lewati
          </button>
          <div className="flex items-center gap-2">
            {i > 0 && (
              <button
                type="button"
                onClick={() => setI((v) => Math.max(0, v - 1))}
                className="btn-outline px-4 py-2 text-xs"
              >
                Kembali
              </button>
            )}
            <button
              type="button"
              onClick={() => (isLast ? finish() : setI((v) => v + 1))}
              className="btn-primary px-4 py-2 text-xs"
            >
              {isLast ? "Selesai" : "Lanjut"}
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes popIn{from{opacity:0}to{opacity:1}}`}</style>
    </div>,
    document.body,
  );
}
