import type { ContentKey } from "@/server/types/content";
import type { CmsRole } from "@/server/types/cmsUser";

// Daftar menu CMS.
// `ready` = editornya sudah tersedia. `superAdminOnly` = hanya super_admin.
// `desc` = penjelasan bahasa awam (dipakai di dashboard agar operator tak bingung).
// `group` = pengelompokan dashboard: "konten" (isi website) vs "pengaturan".
// `roles` = daftar peran yang melihat menu ini; tanpa `roles`, aturan lama
// berlaku (super_admin + editor) — akun rt HANYA melihat menu yang menyebutnya.
export type AdminNavItem = {
  key: ContentKey | string;
  href: string;
  label: string;
  ready: boolean;
  desc: string;
  group: "konten" | "pengaturan";
  superAdminOnly?: boolean;
  roles?: CmsRole[];
};

/** Filter menu sesuai peran — dipakai sidebar & dashboard agar aturannya satu. */
export function navUntukRole(role: CmsRole): AdminNavItem[] {
  return ADMIN_NAV.filter((item) => {
    if (item.roles) return item.roles.includes(role);
    if (item.superAdminOnly) return role === "super_admin";
    // menu konten lama: untuk super_admin & editor, BUKAN ketua RT
    return role !== "rt";
  });
}

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
    key: "laporanRt",
    href: "/admin/laporan-rt",
    label: "Laporan RT",
    desc: "Laporan kependudukan & potensi desa dari tiap ketua RT.",
    group: "konten",
    ready: true,
    roles: ["rt", "super_admin"],
  },
  {
    key: "pengguna",
    href: "/admin/pengguna",
    label: "Akun Pengelola",
    desc: "Buat & atur akun editor dan ketua RT (termasuk unggah CSV massal).",
    group: "pengaturan",
    ready: true,
    superAdminOnly: true,
  },
  {
    // Pintu menuju hub Monitoring yang BERDIRI SENDIRI (di luar CMS): dashboard,
    // audit, infrastruktur, kelola akun. Dibuka super_admin & akun pengawas.
    key: "monitoring",
    href: "/admin/monitoring",
    label: "Monitoring Sistem ↗",
    desc: "Buka hub pengawasan: audit, uptime, performa, kelola akun.",
    group: "pengaturan",
    ready: true,
    superAdminOnly: true,
  },
  {
    key: "akun",
    href: "/admin/akun",
    label: "Akun Saya",
    desc: "Ganti email (dengan verifikasi OTP) & kata sandi akun Anda sendiri.",
    group: "pengaturan",
    ready: true,
    roles: ["super_admin", "editor", "rt"],
  },
];
