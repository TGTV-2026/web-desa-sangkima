import { z } from "zod";

// Bentuk & validasi konten web profil yang dikelola lewat CMS /admin.
// Tiap "seksi" punya skema Zod + nilai default (diambil dari konten awal situs,
// dipakai sebagai fallback bila baris DB belum ada / belum disunting).
// Registry CONTENT_SECTIONS di bawah menyatukan keduanya → dipakai service generik.

/* ------------------------------- Profil ---------------------------------- */

export const profilContentSchema = z.object({
  sejarah: z.array(z.string().min(1, "Paragraf tidak boleh kosong")).min(1),
  visi: z.string().min(1, "Visi wajib diisi"),
  misi: z.array(z.string().min(1, "Poin misi tidak boleh kosong")).min(1),
});
export type ProfilContent = z.infer<typeof profilContentSchema>;

const defaultProfil: ProfilContent = {
  sejarah: [
    "Desa Sangkima lahir dari sebuah pemukiman perintis yang secara bertahap berkembang menjadi entitas administratif otonom. Pada awal pembentukannya, wilayah ini didominasi oleh rimbunan hutan sekunder dan aliran sungai yang menjadi urat nadi kehidupan para pemukim pertama.",
    "Melalui keputusan definitif pada tahun-tahun awal kemerdekaan, Sangkima resmi diakui sebagai desa, membawa serta tanggung jawab untuk menata administrasi kependudukan dan mengelola sumber daya alam secara mandiri. Perjalanan panjang ini terekam dalam berbagai arsip fisik yang kini tersimpan rapi, menjadi saksi transformasi struktural dari sebuah dusun kecil menjadi desa yang berdaya saing.",
    "Seiring berjalannya waktu, struktur organisasi desa terus disempurnakan. Sistem pencatatan yang dahulunya bergantung pada tradisi lisan dan manuskrip sederhana perlahan bertransformasi menjadi sistem tata usaha yang lebih presisi dan terintegrasi, mencerminkan komitmen terhadap pelayanan publik yang transparan dan akuntabel.",
  ],
  visi: "Terciptanya Transparansi Tata Kelola Pemerintahan Untuk Desa Sangkima Yang Profesional, Mandiri, dan Aman",
  misi: [
    "Memperkuat tata kelola pemerintahan desa yang efektif, demokratis, transparan, akuntabel, dan profesional melalui peningkatan kapasitas bagi aparatur desa, kepala desa, BPD, LPM, dan KPMD.",
    "Memperkuat kemandirian ekonomi masyarakat melalui kegiatan pertanian dan pemanfaatan potensi sumber daya alam yang tersedia.",
    "Percepatan pembangunan infrastruktur dan akses layanan dasar untuk meningkatkan derajat kehidupan masyarakat.",
    "Pelestarian lingkungan hidup dan potensi alam untuk mewujudkan desa wisata yang berwawasan lingkungan.",
    "Mengupayakan terwujudnya pemerataan kesempatan kerja bagi masyarakat khususnya usia produktif.",
    "Meningkatkan kesejahteraan masyarakat desa dengan mewujudkan Badan Usaha Milik Desa (BUMDes) dan program lainnya untuk membuka peluang lapangan kerja bagi masyarakat.",
    "Meningkatkan sarana dan prasarana desa dari aspek fisik, ekonomi, pendidikan, kesehatan, olahraga, serta sosial budaya.",
  ],
};

/* --------------------------- Struktur Organisasi ------------------------- */

export const strukturContentSchema = z.object({
  kepalaDesa: z.object({
    nama: z.string().min(1, "Nama kepala desa wajib diisi"),
    nip: z.string(),
    // URL foto; kosong = pakai placeholder ikon. default("") agar data lama aman.
    foto: z.string().default(""),
  }),
  aparatur: z.array(
    z.object({
      jabatan: z.string().min(1, "Jabatan wajib diisi"),
      nama: z.string().min(1, "Nama wajib diisi"),
      foto: z.string().default(""),
    }),
  ),
});
export type StrukturContent = z.infer<typeof strukturContentSchema>;

const defaultStruktur: StrukturContent = {
  kepalaDesa: {
    nama: "H. Ahmad Hidayat",
    nip: "NIP. 19700512 199803 1 004",
    foto: "",
  },
  aparatur: [
    { jabatan: "Sekretaris Desa", nama: "Siti Aminah, S.A.P", foto: "" },
    { jabatan: "Kaur Keuangan", nama: "Budi Santoso", foto: "" },
    { jabatan: "Kasi Pemerintahan", nama: "M. Rahmat", foto: "" },
    { jabatan: "Kasi Kesejahteraan", nama: "Nurhayati", foto: "" },
  ],
};

/* -------------------------------- Kontak --------------------------------- */

const petaTitikSchema = z.object({
  nama: z.string().min(1),
  kategori: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
  gambar: z.string(),
  deskripsi: z.string(),
});

export const kontakContentSchema = z.object({
  alamat: z.string().min(1, "Alamat wajib diisi"),
  email: z.string().email("Email tidak valid"),
  // URL/handle sosial (kosong = tombolnya disembunyikan). default("") agar data lama aman.
  whatsapp: z.string().default(""),
  instagram: z.string().default(""),
  petaCenter: z.tuple([z.number(), z.number()]),
  titik: z.array(petaTitikSchema),
});
export type KontakContent = z.infer<typeof kontakContentSchema>;

const defaultKontak: KontakContent = {
  alamat:
    "Jl. Poros Sangatta – Bontang Km. 18, Kecamatan Sangatta Selatan, Kabupaten Kutai Timur, Kalimantan Timur 75611",
  email: "pemdes@sangkima.desa.id",
  whatsapp: "https://wa.me/6281234567890",
  instagram: "https://instagram.com/desasangkima",
  petaCenter: [0.4067, 117.539],
  titik: [
    {
      nama: "Kantor Desa Sangkima",
      kategori: "Pemerintahan",
      lat: 0.4035,
      lng: 117.538,
      gambar: "/profile/hero-sangkima.jpg",
      deskripsi:
        "Pusat pelayanan administrasi dan pemerintahan Desa Sangkima.",
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
  ],
};

/* --------------------------------- Hero ---------------------------------- */

export const heroContentSchema = z.object({
  eyebrow: z.string(),
  titleLines: z.array(z.string()).min(1),
  subtitle: z.string(),
  primaryLabel: z.string(),
  primaryHref: z.string(),
  secondaryLabel: z.string(),
  secondaryHref: z.string(),
  backgroundImage: z.string(),
});
export type HeroContent = z.infer<typeof heroContentSchema>;

const defaultHero: HeroContent = {
  eyebrow: "Arsip Digital & Administrasi",
  titleLines: ["Merawat Tradisi,", "Menyongsong Masa Depan."],
  subtitle:
    "Pusat informasi dan layanan administratif terpadu Desa Sangkima. Menghadirkan efisiensi modern tanpa meninggalkan akar budaya lokal.",
  primaryLabel: "Eksplorasi Desa",
  primaryHref: "#layanan",
  secondaryLabel: "Layanan Digital",
  secondaryHref: "#layanan",
  backgroundImage: "/profile/hero-sangkima.jpg",
};

/* -------------------------------- Layanan -------------------------------- */

export const LAYANAN_ICONS = ["FileText", "Trees", "Store"] as const;

export const layananContentSchema = z.object({
  eyebrow: z.string(),
  title: z.string(),
  items: z.array(
    z.object({
      icon: z.enum(LAYANAN_ICONS),
      title: z.string().min(1),
      desc: z.string(),
      cta: z.string(),
      href: z.string(),
    }),
  ),
});
export type LayananContent = z.infer<typeof layananContentSchema>;

const defaultLayanan: LayananContent = {
  eyebrow: "Fasilitas Utama",
  title: "Layanan & Potensi",
  items: [
    {
      icon: "FileText",
      title: "Administrasi Digital",
      desc: "Pengurusan surat pengantar, perizinan, dan dokumen kependudukan secara efisien melalui portal satu pintu.",
      cta: "Akses Layanan",
      href: "/esurat",
    },
    {
      icon: "Trees",
      title: "Ekowisata",
      desc: "Jelajahi keindahan alam tersembunyi Sangkima. Area konservasi, jalur tracking, dan wisata budaya lokal.",
      cta: "Lihat Destinasi",
      href: "#galeri",
    },
    {
      icon: "Store",
      title: "Potensi Lokal",
      desc: "Dukung produk unggulan UMKM desa. Dari kerajinan tangan tradisional hingga hasil bumi berkualitas.",
      cta: "Katalog UMKM",
      href: "#galeri",
    },
  ],
};

/* -------------------------------- Galeri --------------------------------- */

export const galeriContentSchema = z.object({
  eyebrow: z.string(),
  title: z.string(),
  subtitle: z.string(),
  koleksi: z.array(
    z.object({
      src: z.string().min(1),
      kategori: z.string().min(1),
      judul: z.string().min(1),
      arsip: z.string(),
      alt: z.string(),
    }),
  ),
  potensiUtama: z.object({
    src: z.string(),
    badge: z.string(),
    judul: z.string(),
    desc: z.string(),
    cta: z.string(),
    alt: z.string(),
  }),
  potensi: z.array(
    z.object({
      src: z.string(),
      judul: z.string(),
      desc: z.string(),
      tag: z.string(),
      alt: z.string(),
    }),
  ),
});
export type GaleriContent = z.infer<typeof galeriContentSchema>;

const defaultGaleri: GaleriContent = {
  eyebrow: "Arsip Desa",
  title: "Galeri & Potensi",
  subtitle:
    "Dokumentasi kekayaan alam, warisan budaya, dan kekuatan ekonomi lokal yang membentuk identitas Desa Sangkima.",
  koleksi: [
    {
      src: "/profile/galeri/hutan-lindung.jpg",
      kategori: "Lanskap",
      judul: "Hutan Lindung Sangkima",
      arsip: "Arsip No. 042/ALM/2024",
      alt: "Kanopi hutan hujan tropis Sangkima dari udara saat cahaya keemasan.",
    },
    {
      src: "/profile/galeri/tari-tradisional.jpg",
      kategori: "Budaya",
      judul: "Tari Tradisional Penyambutan",
      arsip: "Arsip No. 115/BDY/2023",
      alt: "Penari berbusana adat menampilkan tari penyambutan khas Sangkima.",
    },
    {
      src: "/profile/galeri/sungai-sangkima.jpg",
      kategori: "Lanskap",
      judul: "Sungai Sangkima",
      arsip: "Arsip No. 088/ALM/2024",
      alt: "Sungai jernih mengalir membelah rimbunnya hutan Sangkima.",
    },
  ],
  potensiUtama: {
    src: "/profile/galeri/kerajinan-rotan.jpg",
    badge: "Sektor Unggulan",
    judul: "Kerajinan Rotan Tradisional",
    desc: "Pusat produksi kerajinan tangan berbahan dasar rotan kualitas premium, dikelola langsung oleh kelompok pengerajin lokal Desa Sangkima.",
    cta: "Lihat Profil UMKM",
    alt: "Pengrajin menganyam rotan tradisional di sanggar kerja yang terang.",
  },
  potensi: [
    {
      src: "/profile/galeri/kopi-lokal.jpg",
      judul: "Agrikultur: Kopi Lokal",
      desc: "Pengembangan perkebunan kopi robusta dengan metode tanam berkelanjutan.",
      tag: "3 Kelompok Tani",
      alt: "Biji kopi lokal pilihan tertata di atas meja kayu.",
    },
    {
      src: "/profile/galeri/ekowisata.jpg",
      judul: "Ekowisata Terpadu",
      desc: "Fasilitas pariwisata berbasis alam yang dikelola oleh BUMDes.",
      tag: "Dalam Pengembangan",
      alt: "Dek pengamatan kayu menghadap lembah hijau untuk ekowisata.",
    },
  ],
};

/* -------------------------------- Footer --------------------------------- */

export const footerContentSchema = z.object({
  deskripsi: z.string(),
  alamat: z.string(),
  email: z.string(),
});
export type FooterContent = z.infer<typeof footerContentSchema>;

const defaultFooter: FooterContent = {
  deskripsi:
    "Pusat administrasi dan informasi terpadu, mewujudkan pelayanan masyarakat yang modern dan berbudaya.",
  alamat:
    "Kantor Kepala Desa Sangkima, Kec. Sangatta Selatan, Kab. Kutai Timur.",
  email: "admin@sangkima.desa.id",
};

/* ------------------------------ Registry --------------------------------- */

// Satu sumber kebenaran: key seksi → { skema validasi, nilai default, label UI }.
// Service & halaman admin meng-iterasi registry ini, jadi menambah seksi cukup
// di sini (+ editor-nya) tanpa mengubah service.
export const CONTENT_SECTIONS = {
  hero: { schema: heroContentSchema, default: defaultHero, label: "Hero Beranda" },
  layanan: {
    schema: layananContentSchema,
    default: defaultLayanan,
    label: "Layanan & Potensi",
  },
  profil: {
    schema: profilContentSchema,
    default: defaultProfil,
    label: "Profil: Sejarah, Visi & Misi",
  },
  struktur: {
    schema: strukturContentSchema,
    default: defaultStruktur,
    label: "Struktur Organisasi",
  },
  galeri: { schema: galeriContentSchema, default: defaultGaleri, label: "Galeri & Potensi" },
  kontak: { schema: kontakContentSchema, default: defaultKontak, label: "Kontak & Peta" },
  footer: { schema: footerContentSchema, default: defaultFooter, label: "Footer Situs" },
} as const;

export type ContentKey = keyof typeof CONTENT_SECTIONS;

// Pemetaan key → tipe nilai, untuk getContent<K>() yang ter-tipe kuat.
export type ContentValueMap = {
  hero: HeroContent;
  layanan: LayananContent;
  profil: ProfilContent;
  struktur: StrukturContent;
  galeri: GaleriContent;
  kontak: KontakContent;
  footer: FooterContent;
};

export const CONTENT_KEYS = Object.keys(CONTENT_SECTIONS) as ContentKey[];
