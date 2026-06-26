import type { ContentKey } from "@/server/types/content";

// Daftar menu CMS. `ready` menandai seksi yang editornya sudah tersedia;
// yang belum ditandai "Segera" di UI (dibangun bertahap).
export const ADMIN_NAV: {
  key: ContentKey;
  href: string;
  label: string;
  ready: boolean;
}[] = [
  { key: "hero", href: "/admin/hero", label: "Hero Beranda", ready: true },
  { key: "layanan", href: "/admin/layanan", label: "Layanan & Potensi", ready: true },
  { key: "profil", href: "/admin/profil", label: "Sejarah, Visi & Misi", ready: true },
  { key: "struktur", href: "/admin/struktur", label: "Struktur Organisasi", ready: true },
  { key: "galeri", href: "/admin/galeri", label: "Galeri & Potensi", ready: true },
  { key: "kontak", href: "/admin/kontak", label: "Kontak & Peta", ready: true },
  { key: "footer", href: "/admin/footer", label: "Footer Situs", ready: true },
];
