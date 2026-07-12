import { z } from "zod";

// Zod + tipe untuk Laporan RT (kependudukan + potensi desa), pengganti template
// Excel "LAPORAN BULANAN RT". Daftar kategori di bawah disalin PERSIS dari
// template itu — kalau perangkat desa mengubah templatenya, ubah di sini dan
// form/rekap otomatis mengikuti (data lama tetap terbaca karena field yang
// hilang diisi 0 saat parse).

// ===== Konstanta kategori (dari template Excel) =====

export const BULAN_LABELS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
] as const;

export const KEADAAN_PENDUDUK = [
  "Jumlah KK", "Jml Penduduk", "Kelahiran", "Datang", "Keluar", "Meninggal",
] as const;

// 0-12 bulan, lalu per tahun 1..70, ditutup 71+ — total 72 kelompok.
export const KELOMPOK_UMUR: readonly string[] = [
  "0 - 12 Bulan",
  ...Array.from({ length: 70 }, (_, i) => `${i + 1} Tahun`),
  "71+ Tahun",
];

export const SUKU = [
  "Bugis", "Jawa", "Kutai", "Dayak", "Banjar", "Makasar",
  "Sunda", "Tator", "Manado", "NTT/NTB", "Padang", "Madura",
  "Bali", "Duri", "Mandar", "Mamuju", "Batak", "Lain-Lain",
] as const;

export const AGAMA = [
  "Islam", "Protestan", "Katolik", "Budha", "Hindu", "Kepercayaan",
] as const;

export const PEKERJAAN = [
  "Tani", "TNI/Polri", "Swasta", "Wiraswasta", "Tukang", "Bidan",
  "Guru", "PNS", "Nelayan", "Masih Sekolah", "DLL",
] as const;

export const STATUS_KAWIN = [
  "Kawin", "Belum Kawin", "Cerai Hidup", "Cerai Mati", "Poligami",
] as const;

export const PENDIDIKAN_TAMAT = [
  "Belum Sekolah", "Tidak Tamat SD", "Tamat SD", "Tamat SMP", "Tamat SMA",
  "Diploma I/II", "Diploma III", "S1", "S2", "S3",
] as const;

export const PENDIDIKAN_BERJALAN = [
  "Paud", "SD", "SMP", "SMA", "Diploma I/II", "Diploma III", "S1", "S2", "S3",
] as const;

// Laporan Potensi Desa — 12 seksi. `desimal` = boleh pecahan (luas dalam Ha).
export const POTENSI_SEKSI: readonly {
  judul: string;
  item: readonly string[];
  desimal?: boolean;
}[] = [
  { judul: "Sarana Transportasi dan Komunikasi", item: ["Televisi", "Radio", "Telephon/HP", "Sepeda Motor", "Sepeda", "Mobil"] },
  { judul: "Sarana Penerangan/Listrik", item: ["Listrik PLN", "Listrik Non-PLN", "Tidak Menggunakan Listrik"] },
  { judul: "Sarana Olah Raga", item: ["Lapangan Sepak Bola", "Lapangan Bulu Tangkis", "Lapangan Bola Volly", "Lapangan Tenis Meja"] },
  { judul: "Sarana Angkutan", item: ["Taksi", "Ojek Sepeda Motor"] },
  { judul: "Jumlah Bangunan", item: ["Bangunan Tempat Tinggal", "Bangunan Warung/Kios"] },
  { judul: "Jumlah Ternak", item: ["Sapi", "Kerbau", "Kambing"] },
  { judul: "Jumlah Ternak Unggas", item: ["Ayam Kampung", "Ayam Ras", "Itik / Bebek"] },
  { judul: "Luas Lahan Pertanian (Ha)", item: ["Perkebunan", "Pekarangan", "Luas Keseluruhan"], desimal: true },
  { judul: "Luas Tanah Bakau (Ha)", item: ["Yang Dikerjakan", "Yang Tidak Dikerjakan", "Luas Keseluruhan"], desimal: true },
  { judul: "Luas Tanah Ladang (Ha)", item: ["Yang Dikerjakan", "Yang Tidak Dikerjakan", "Luas Keseluruhan"], desimal: true },
  { judul: "Penggunaan Air", item: ["Air Pam", "Sumur", "Sumur Bor", "Lain-lain"] },
  { judul: "Perdagangan", item: ["Warung Makan", "Kios Sembako"] },
];

// ===== Schema data laporan =====

const angka = z.coerce.number().int().min(0, "Tidak boleh negatif").default(0);
const angkaDesimal = z.coerce.number().min(0, "Tidak boleh negatif").default(0);

export const lkPrSchema = z.object({ lk: angka, pr: angka });
export type LkPr = z.infer<typeof lkPrSchema>;

/** Jml selalu dihitung, tidak pernah disimpan — mencegah Lk+Pr ≠ Jml. */
export const hitungJml = (v: LkPr) => v.lk + v.pr;

/**
 * Satu bagian berkelompok Lk/Pr (umur, suku, dst). Dinormalkan saat parse:
 * kunci yang hilang diisi {0,0}, kunci tak dikenal dibuang — form dan data lama
 * sama-sama aman walau daftar kategorinya berubah.
 */
function bagianLkPr(kunci: readonly string[]) {
  return z
    .record(z.string(), lkPrSchema)
    .default({})
    .transform((val) => {
      const out: Record<string, LkPr> = {};
      for (const k of kunci) out[k] = val[k] ?? { lk: 0, pr: 0 };
      return out;
    });
}

export const sarangWaletSchema = z.object({
  namaPemilik: z.string().trim().max(255).default(""),
  alamat: z.string().trim().max(255).default(""),
  hasilKg: angkaDesimal,
});
export type SarangWalet = z.infer<typeof sarangWaletSchema>;

const kependudukanSchema = z.object({
  keadaanPenduduk: bagianLkPr(KEADAAN_PENDUDUK),
  umur: bagianLkPr(KELOMPOK_UMUR),
  suku: bagianLkPr(SUKU),
  agama: bagianLkPr(AGAMA),
  pekerjaan: bagianLkPr(PEKERJAAN),
  statusKawin: bagianLkPr(STATUS_KAWIN),
  // baris kosong (tanpa nama/alamat/hasil) dibuang otomatis
  sarangWalet: z
    .array(sarangWaletSchema)
    .max(20, "Maksimal 20 baris")
    .default([])
    .transform((rows) =>
      rows.filter((r) => r.namaPemilik || r.alamat || r.hasilKg > 0),
    ),
  pendidikanTamat: bagianLkPr(PENDIDIKAN_TAMAT),
  pendidikanBerjalan: bagianLkPr(PENDIDIKAN_BERJALAN),
});

// Potensi: { "judul seksi": { "nama item": angka } } — dinormalkan seperti bagianLkPr.
const potensiSchema = z
  .record(z.string(), z.record(z.string(), angkaDesimal).default({}))
  .default({})
  .transform((val) => {
    const out: Record<string, Record<string, number>> = {};
    for (const seksi of POTENSI_SEKSI) {
      out[seksi.judul] = {};
      for (const item of seksi.item) {
        out[seksi.judul][item] = val[seksi.judul]?.[item] ?? 0;
      }
    }
    return out;
  });

export const rtReportDataSchema = z.object({
  kependudukan: kependudukanSchema,
  potensi: potensiSchema,
});
export type RtReportData = z.infer<typeof rtReportDataSchema>;

/** Kerangka kosong (semua 0) — untuk form RT yang belum pernah menyimpan. */
export function laporanKosong(): RtReportData {
  return rtReportDataSchema.parse({ kependudukan: {}, potensi: {} });
}

// ===== Sesi pelaporan =====

export const rtSessionInputSchema = z.object({
  tahun: z.coerce.number().int().min(2020, "Tahun tidak valid").max(2100, "Tahun tidak valid"),
  bulan: z.coerce.number().int().min(1).max(12),
});
export type RtSessionInput = z.infer<typeof rtSessionInputSchema>;

export type RtSessionDTO = {
  id: string;
  tahun: number;
  bulan: number;
  /** "Januari" dst — dari BULAN_LABELS */
  bulanLabel: string;
  active: boolean;
  createdAt: Date | null;
  closedAt: Date | null;
  /** jumlah RT yang sudah setor di sesi ini (untuk monitoring) */
  jumlahLaporan: number;
};

// ===== DTO laporan =====

export type RtReportDTO = {
  id: string;
  sessionId: string;
  cmsUserId: string;
  namaKetua: string;
  dusun: string;
  rt: string;
  data: RtReportData;
  dikumpulkanPada: Date;
  diperbaruiPada: Date;
};

/** Rekap agregat per dusun — sumber statistik publik saat sesi ditutup. */
export type RekapDusunDTO = {
  dusun: string;
  kk: number;
  lakiLaki: number;
  perempuan: number;
  jumlahRtSetor: number;
};
