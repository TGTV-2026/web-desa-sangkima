// Konfigurasi peta kontak — modul biasa (bukan "use client") agar bisa dipakai
// Server Component (ContactSection) maupun Client Component (ContactMap).
//
// CATATAN: sumber titik peta yang tampil di publik adalah konten CMS
// (`content.titik`, default `defaultKontak` di src/server/types/content.ts),
// BUKAN konstanta TITIK di bawah — TITIK/PETA_CENTER hanya cadangan/referensi.
// Yang benar-benar dipakai lintas komponen dari file ini: KATEGORI_WARNA.

export interface TitikPeta {
  nama: string;
  lat: number;
  lng: number;
  gambar: string; // path di /public, mis. "/profile/galeri/foo.jpg"
  deskripsi: string;
  kategori: string; // harus salah satu key KATEGORI_WARNA
}

// Warna fallback bila kategori titik tak terdaftar di KATEGORI_WARNA (pine-700).
export const WARNA_DEFAULT = "#275138";

// Warna marker per kategori (selaras palet desain). Tambah kategori baru di sini.
export const KATEGORI_WARNA: Record<string, string> = {
  "Wisata Alam": "#275138", // pine-700
  Budaya: "#8f6a1e", // brass
  UMKM: "#9c3a28", // oxide
  Pemerintahan: "#14291f", // pine-900
  Ibadah: "#2f7a63", // hijau-teal — rumah ibadah
  Pendidikan: "#35618e", // biru arsip — sekolah
};

// Pusat & zoom awal peta — cadangan; sumber publik ada di content.ts (petaCenter).
export const PETA_CENTER: [number, number] = [0.3789, 117.5138];

// Cadangan/referensi titik (lihat catatan di atas). Titik = masjid/mushola &
// sekolah di sekitar Sangkima, koordinat dari Google Maps (plus code). Foto
// memakai placeholder karena belum ada foto asli lokasi.
export const TITIK: TitikPeta[] = [
  {
    nama: "Kantor Desa & BPD Sangkima",
    kategori: "Pemerintahan",
    lat: 0.38081,
    lng: 117.51381,
    gambar: "/profile/peta/placeholder.svg",
    deskripsi:
      "Pusat pelayanan administrasi dan pemerintahan Desa Sangkima (kantor BPD).",
  },
  {
    nama: "Masjid Miftahul Khair",
    kategori: "Ibadah",
    lat: 0.37731,
    lng: 117.51606,
    gambar: "/profile/peta/placeholder.svg",
    deskripsi: "Masjid warga di lingkungan Desa Sangkima.",
  },
  {
    nama: "Masjid Baitul Ma'mur Sangkima",
    kategori: "Ibadah",
    lat: 0.38106,
    lng: 117.51581,
    gambar: "/profile/peta/placeholder.svg",
    deskripsi: "Masjid jamaah di kawasan Desa Sangkima.",
  },
  {
    nama: "Masjid Al Hikmah PT Pertamina",
    kategori: "Ibadah",
    lat: 0.37831,
    lng: 117.51094,
    gambar: "/profile/peta/placeholder.svg",
    deskripsi: "Masjid di area PT Pertamina, Sangkima.",
  },
  {
    nama: "Mushola Ar Royyan",
    kategori: "Ibadah",
    lat: 0.379,
    lng: 117.514,
    gambar: "/profile/peta/placeholder.svg",
    deskripsi: "Mushola warga RT 09, Desa Sangkima.",
  },
  {
    nama: "SDN 005 Sangatta Selatan",
    kategori: "Pendidikan",
    lat: 0.37794,
    lng: 117.51744,
    gambar: "/profile/peta/placeholder.svg",
    deskripsi: "Sekolah Dasar Negeri di Desa Sangkima.",
  },
  {
    nama: "SMPN 2 Sangatta Selatan",
    kategori: "Pendidikan",
    lat: 0.37669,
    lng: 117.51006,
    gambar: "/profile/peta/placeholder.svg",
    deskripsi: "Sekolah Menengah Pertama Negeri di Sangkima.",
  },
];
