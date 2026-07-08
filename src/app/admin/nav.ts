import type { ContentKey } from "@/server/types/content";

// Daftar menu CMS. `ready` menandai seksi yang editornya sudah tersedia;
// yang belum ditandai "Segera" di UI (dibangun bertahap).
// `key` bisa ContentKey (seksi konten) atau string lain (mis. "berita" = modul tersendiri).
export const ADMIN_NAV: {
  key: ContentKey | string;
  href: string;
  label: string;
  ready: boolean;
}[] = [
  { key: "berita", href: "/admin/berita", label: "Berita & Pengumuman", ready: true },
  { key: "ppid", href: "/admin/ppid", label: "PPID / Informasi Publik", ready: true },
  { key: "produk", href: "/admin/produk", label: "Produk Koperasi", ready: true },
  { key: "hero", href: "/admin/hero", label: "Hero Beranda", ready: true },
  { key: "layanan", href: "/admin/layanan", label: "Layanan & Potensi", ready: true },
  { key: "profil", href: "/admin/profil", label: "Sejarah, Visi & Misi", ready: true },
  { key: "struktur", href: "/admin/struktur", label: "Struktur Organisasi", ready: true },
  { key: "galeri", href: "/admin/galeri", label: "Galeri & Potensi", ready: true },
  { key: "kontak", href: "/admin/kontak", label: "Kontak & Peta", ready: true },
  { key: "footer", href: "/admin/footer", label: "Footer Situs", ready: true },
  { key: "surat", href: "/admin/surat", label: "Tanda Tangan & Kop Surat", ready: true },
];
