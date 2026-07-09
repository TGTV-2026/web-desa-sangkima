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
  // Titik = masjid/mushola & sekolah sekitar Sangkima; koordinat dari Google Maps
  // (plus code). Foto placeholder karena belum ada foto asli lokasi.
  petaCenter: [0.3789, 117.5138],
  titik: [
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

/* ------------------------ Surat: Tanda Tangan & Kop ---------------------- */

export const suratContentSchema = z.object({
  kopKabupaten: z.string(),
  kopKecamatan: z.string(),
  kopDesa: z.string(),
  alamatKop: z.string(),
  // Nama & jabatan penandatangan diambil otomatis dari akun yang menyetujui.
  // Di sini hanya gambar TTD (dan opsional nama override kalau perlu).
  signatureImage: z.string().default(""),
  penandatanganNama: z.string().default(""),
});
export type SuratContent = z.infer<typeof suratContentSchema>;

const defaultSurat: SuratContent = {
  kopKabupaten: "PEMERINTAH KABUPATEN KUTAI TIMUR",
  kopKecamatan: "KECAMATAN SANGATTA SELATAN",
  kopDesa: "DESA SANGKIMA",
  alamatKop: "Jl. Poros Sangatta - Bontang, Desa Sangkima, Kutai Timur",
  signatureImage: "",
  penandatanganNama: "",
};

/* ---------------------------------- PPID --------------------------------- */

// Teks halaman PPID (ringkasan, tugas, prosedur, kontak). Daftar dokumennya
// dikelola terpisah lewat tabel ppid_documents (bukan seksi konten ini).
export const ppidContentSchema = z.object({
  ringkasan: z.string().min(1, "Ringkasan wajib diisi"),
  tugas: z.array(z.string().min(1, "Poin tidak boleh kosong")).min(1),
  prosedur: z.array(z.string().min(1, "Poin tidak boleh kosong")).min(1),
  waktuLayanan: z.string().default(""),
  kontakNama: z.string().default(""),
  kontakTelepon: z.string().default(""),
  kontakEmail: z.string().default(""),
  kontakAlamat: z.string().default(""),
});
export type PpidContent = z.infer<typeof ppidContentSchema>;

const defaultPpid: PpidContent = {
  ringkasan:
    "Pejabat Pengelola Informasi dan Dokumentasi (PPID) Desa Sangkima bertugas menyediakan, menyimpan, mendokumentasikan, dan melayani permohonan informasi publik guna mewujudkan penyelenggaraan pemerintahan desa yang transparan dan akuntabel sesuai Undang-Undang Nomor 14 Tahun 2008 tentang Keterbukaan Informasi Publik.",
  tugas: [
    "Menyediakan dan memberikan pelayanan informasi publik kepada masyarakat.",
    "Mengumpulkan, mengelola, dan mendokumentasikan informasi publik desa.",
    "Menyusun dan memutakhirkan Daftar Informasi Publik (DIP) secara berkala.",
    "Melakukan pengujian tentang konsekuensi atas informasi yang dikecualikan.",
  ],
  prosedur: [
    "Pemohon mengajukan permohonan informasi secara tertulis atau lisan kepada PPID Desa.",
    "PPID mencatat permohonan dan memberikan tanda bukti penerimaan.",
    "PPID memproses permohonan dan menyampaikan pemberitahuan tertulis.",
    "Informasi diberikan sesuai ketentuan, atau ditolak disertai alasan bila termasuk informasi yang dikecualikan.",
  ],
  waktuLayanan:
    "Paling lambat 10 hari kerja sejak permohonan diterima, dapat diperpanjang 7 hari kerja dengan pemberitahuan tertulis.",
  kontakNama: "PPID Desa Sangkima",
  kontakTelepon: "",
  kontakEmail: "ppid@sangkima.desa.id",
  kontakAlamat:
    "Kantor Kepala Desa Sangkima, Kec. Sangatta Selatan, Kab. Kutai Timur.",
};

/* -------------------------------- Produk --------------------------------- */

// Pengaturan halaman produk koperasi (teks + nomor WA tujuan pemesanan).
// Daftar produknya dikelola terpisah lewat tabel products.
export const produkContentSchema = z.object({
  judul: z.string().min(1, "Judul wajib diisi"),
  deskripsi: z.string().default(""),
  namaKoperasi: z.string().default(""),
  // nomor WhatsApp tujuan pemesanan (format bebas; dinormalkan ke 62… saat dipakai)
  whatsapp: z.string().default(""),
});
export type ProdukContent = z.infer<typeof produkContentSchema>;

const defaultProduk: ProdukContent = {
  judul: "Produk Koperasi Desa",
  deskripsi:
    "Produk unggulan hasil koperasi dan UMKM Desa Sangkima. Pilih produk, atur jumlah, lalu pesan langsung lewat WhatsApp.",
  namaKoperasi: "Koperasi Desa Sangkima",
  whatsapp: "",
};

/* ---------------------------- Statistik Dusun ----------------------------- */

// Data kependudukan per dusun (diisi manual oleh desa — bukan dihitung dari
// data warga e-surat, karena alamat warga masih berupa teks bebas).
export const dusunStatSchema = z.object({
  nama: z.string().min(1, "Nama dusun wajib diisi"),
  lakiLaki: z.coerce.number().int().min(0).default(0),
  perempuan: z.coerce.number().int().min(0).default(0),
  kk: z.coerce.number().int().min(0).default(0),
});
export type DusunStat = z.infer<typeof dusunStatSchema>;

export const statistikDusunContentSchema = z.object({
  keterangan: z.string().default(""),
  dusun: z.array(dusunStatSchema).min(1, "Minimal satu dusun"),
});
export type StatistikDusunContent = z.infer<typeof statistikDusunContentSchema>;

const defaultStatistikDusun: StatistikDusunContent = {
  keterangan: "",
  dusun: [
    "Dusun Patra",
    "Dusun Lestari Jaya",
    "Dusun Makmur Jaya",
    "Dusun Mekar Jaya",
    "Dusun Sungai Tabuan",
    "Dusun Airport",
    "Dusun Teluk Lombok",
    "Dusun Mari Bangun",
    "Dusun Mekar Baru",
  ].map((nama) => ({ nama, lakiLaki: 0, perempuan: 0, kk: 0 })),
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
  surat: {
    schema: suratContentSchema,
    default: defaultSurat,
    label: "Tanda Tangan & Kop Surat",
  },
  ppid: {
    schema: ppidContentSchema,
    default: defaultPpid,
    label: "PPID: Halaman Informasi Publik",
  },
  produk: {
    schema: produkContentSchema,
    default: defaultProduk,
    label: "Produk: Pengaturan Koperasi",
  },
  statistikDusun: {
    schema: statistikDusunContentSchema,
    default: defaultStatistikDusun,
    label: "Statistik Dusun",
  },
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
  surat: SuratContent;
  ppid: PpidContent;
  produk: ProdukContent;
  statistikDusun: StatistikDusunContent;
};

export const CONTENT_KEYS = Object.keys(CONTENT_SECTIONS) as ContentKey[];
