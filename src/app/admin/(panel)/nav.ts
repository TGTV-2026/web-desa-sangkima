import type { ContentKey } from "@/server/types/content";

// Daftar menu CMS.
// `ready` = editornya sudah tersedia. `superAdminOnly` = hanya super_admin.
// `desc` = penjelasan bahasa awam (dipakai di dashboard agar operator tak bingung).
// `group` = pengelompokan dashboard: "konten" (isi website) vs "pengaturan".
export type AdminNavItem = {
  key: ContentKey | string;
  href: string;
  label: string;
  ready: boolean;
  desc: string;
  group: "konten" | "pengaturan";
  superAdminOnly?: boolean;
};

export const ADMIN_NAV: AdminNavItem[] = [
  {
    key: "berita",
    href: "/admin/berita",
    label: "Berita & Pengumuman",
    desc: "Umumkan kegiatan, acara, dan kabar terbaru desa.",
    group: "konten",
    ready: true,
  },
  {
    key: "album",
    href: "/admin/album",
    label: "Album Galeri",
    desc: "Kumpulan foto kegiatan, termasuk footage drone.",
    group: "konten",
    ready: true,
  },
  {
    key: "produk",
    href: "/admin/produk",
    label: "Produk Koperasi",
    desc: "Etalase produk koperasi/UMKM warga.",
    group: "konten",
    ready: true,
  },
  {
    key: "ppid",
    href: "/admin/ppid",
    label: "PPID / Informasi Publik",
    desc: "Dokumen keterbukaan informasi publik (PPID).",
    group: "konten",
    ready: true,
  },
  {
    key: "hero",
    href: "/admin/hero",
    label: "Hero Beranda",
    desc: "Gambar besar & kalimat sambutan di halaman depan.",
    group: "konten",
    ready: true,
  },
  {
    key: "layanan",
    href: "/admin/layanan",
    label: "Layanan & Potensi",
    desc: "Tiga kartu layanan unggulan di beranda.",
    group: "konten",
    ready: true,
  },
  {
    key: "profil",
    href: "/admin/profil",
    label: "Sejarah, Visi & Misi",
    desc: "Cerita sejarah, visi, dan misi desa.",
    group: "konten",
    ready: true,
  },
  {
    key: "struktur",
    href: "/admin/struktur",
    label: "Struktur Organisasi",
    desc: "Susunan perangkat & jabatan desa.",
    group: "konten",
    ready: true,
  },
  {
    key: "statistikDusun",
    href: "/admin/statistik",
    label: "Statistik Dusun",
    desc: "Jumlah penduduk & KK tiap dusun.",
    group: "konten",
    ready: true,
  },
  {
    key: "galeri",
    href: "/admin/galeri",
    label: "Galeri & Potensi",
    desc: "Bagian galeri & potensi ekonomi di beranda.",
    group: "konten",
    ready: true,
  },
  {
    key: "kontak",
    href: "/admin/kontak",
    label: "Kontak & Peta",
    desc: "Alamat, peta, WhatsApp, dan Instagram desa.",
    group: "konten",
    ready: true,
  },
  {
    key: "footer",
    href: "/admin/footer",
    label: "Footer Situs",
    desc: "Teks & tautan di bagian paling bawah situs.",
    group: "konten",
    ready: true,
  },
  {
    key: "surat",
    href: "/admin/surat",
    label: "Tanda Tangan & Kop Surat",
    desc: "Tanda tangan & kop untuk PDF surat (e-surat).",
    group: "pengaturan",
    ready: true,
    superAdminOnly: true,
  },
  {
    key: "pengguna",
    href: "/admin/pengguna",
    label: "Akun Editor",
    desc: "Buat & atur akun editor pengelola website.",
    group: "pengaturan",
    ready: true,
    superAdminOnly: true,
  },
];
