// Konfigurasi peta kontak — modul biasa (bukan "use client") agar bisa dipakai
// Server Component (ContactSection) maupun Client Component (ContactMap).
//
// >>> EDIT DAFTAR PIN DI BAWAH (TITIK) untuk menambah/mengubah titik peta. <<<

export interface TitikPeta {
  nama: string;
  lat: number;
  lng: number;
  gambar: string; // path di /public, mis. "/profile/galeri/foo.jpg"
  deskripsi: string;
  kategori: string; // harus salah satu key KATEGORI_WARNA
}

// Warna marker per kategori (selaras palet desain). Tambah kategori baru di sini.
export const KATEGORI_WARNA: Record<string, string> = {
  "Wisata Alam": "#275138", // pine-700
  Budaya: "#8f6a1e", // brass
  UMKM: "#9c3a28", // oxide
  Pemerintahan: "#14291f", // pine-900
};

// Pusat & zoom awal peta — ganti dengan koordinat tengah area desa.
export const PETA_CENTER: [number, number] = [0.4067, 117.539];

// Daftar pin. Koordinat di bawah masih PERKIRAAN area Sangkima — ganti dengan
// lat/lng asli tiap lokasi. Hover marker memunculkan gambar + nama + deskripsi.
export const TITIK: TitikPeta[] = [
  {
    nama: "Kantor Desa Sangkima",
    kategori: "Pemerintahan",
    lat: 0.4035,
    lng: 117.538,
    gambar: "/profile/hero-sangkima.jpg",
    deskripsi: "Pusat pelayanan administrasi dan pemerintahan Desa Sangkima.",
  },
  {
    nama: "Hutan Lindung Sangkima",
    kategori: "Wisata Alam",
    lat: 0.4112,
    lng: 117.529,
    gambar: "/profile/galeri/hutan-lindung.jpg",
    deskripsi: "Kawasan konservasi dengan kanopi hutan hujan tropis Borneo.",
  },
  {
    nama: "Sungai Sangkima",
    kategori: "Wisata Alam",
    lat: 0.398,
    lng: 117.547,
    gambar: "/profile/galeri/sungai-sangkima.jpg",
    deskripsi: "Aliran sungai jernih untuk susur sungai dan ekowisata.",
  },
  {
    nama: "Sentra Kerajinan Rotan",
    kategori: "UMKM",
    lat: 0.406,
    lng: 117.544,
    gambar: "/profile/galeri/kerajinan-rotan.jpg",
    deskripsi: "Pusat produksi anyaman rotan kelompok pengrajin lokal.",
  },
  {
    nama: "Dek Ekowisata Terpadu",
    kategori: "Wisata Alam",
    lat: 0.415,
    lng: 117.54,
    gambar: "/profile/galeri/ekowisata.jpg",
    deskripsi: "Dek pengamatan alam yang dikelola BUMDes.",
  },
];
