// server/types/letter.ts
//
// Kontrak API modul E-surat — dipakai bersama Backend & Frontend.
// File ini adalah SATU SUMBER KEBENARAN untuk status surat, kode jenis surat,
// dan bentuk data request/response. FE boleh import konstanta & type dari sini
// tanpa menarik kode database (Drizzle).
import { z } from "zod";

/* -------------------------------------------------------------------------- */
/*  Status surat (alur approval 2 tingkat)                                    */
/* -------------------------------------------------------------------------- */

// DIAJUKAN  -> warga baru mengajukan, menunggu diproses operator
// DIPROSES  -> operator (staff) sedang memverifikasi data
// DISETUJUI -> kepala desa (admin) menyetujui; nomor surat & PDF terbit
// DITOLAK   -> ditolak operator/kepala desa, disertai alasan
// SELESAI   -> surat sudah diambil/diunduh warga
export const LETTER_STATUSES = [
  "DIAJUKAN",
  "DIPROSES",
  "DISETUJUI",
  "DITOLAK",
  "SELESAI",
] as const;

export type LetterStatus = (typeof LETTER_STATUSES)[number];

// Label bahasa Indonesia + warna badge (dipakai Frontend untuk tampilan)
export const LETTER_STATUS_META: Record<
  LetterStatus,
  { label: string; color: "gray" | "blue" | "green" | "red" }
> = {
  DIAJUKAN: { label: "Diajukan", color: "gray" },
  DIPROSES: { label: "Diproses", color: "blue" },
  DISETUJUI: { label: "Disetujui", color: "green" },
  DITOLAK: { label: "Ditolak", color: "red" },
  SELESAI: { label: "Selesai", color: "green" },
};

/* -------------------------------------------------------------------------- */
/*  Kode jenis surat MVP                                                      */
/* -------------------------------------------------------------------------- */

// SKU   = Surat Keterangan Usaha
// SKD   = Surat Keterangan Domisili
// SKBM  = Surat Keterangan Belum Menikah
// SKTM  = Surat Keterangan Tidak Mampu
// SPN   = Surat Pengantar Nikah (Model N1-N4)
// SKH   = Surat Kehilangan
// SKM   = Surat Kematian
// SKL   = Surat Kelahiran
export const LETTER_TYPE_CODES = [
  "SKU",
  "SKD",
  "SKBM",
  "SKTM",
  "SPN",
  "SKH",
  "SKM",
  "SKL",
] as const;

export type LetterTypeCode = (typeof LETTER_TYPE_CODES)[number];

/* -------------------------------------------------------------------------- */
/*  Tipe payload `data` per jenis surat (dokumentasi tipe).                    */
/*  Runtime divalidasi oleh buildLetterDataSchema dari requiredFields,         */
/*  interface ini hanya untuk type-safety saat membaca data di kode.          */
/* -------------------------------------------------------------------------- */

export interface SKUData {
  nama_usaha: string;
  jenis_usaha:
    | "Perdagangan" | "Jasa" | "Pertanian" | "Peternakan" | "Kerajinan" | "Lainnya";
  alamat_usaha: string;
  tujuan_surat:
    | "Pengajuan kredit/KUR" | "Perizinan usaha" | "BPJS Ketenagakerjaan" | "Lainnya";
}

export interface SKDData {
  alamat_domisili: string;
  tanggal_domisili: string; // YYYY-MM-DD
  tujuan_surat:
    | "Pindah sekolah" | "Keperluan bank" | "Daftar kuliah" | "Instansi pemerintah" | "Lainnya";
}

export interface SKBMData {
  tujuan_surat:
    | "Melamar pekerjaan" | "Mengurus pernikahan" | "Melanjutkan studi" | "Lainnya";
  catatan_tambahan?: string;
}

export interface SKTMData {
  penghasilan: number;
  jumlah_tanggungan: number;
  kondisi_rumah: "Permanen" | "Semi permanen" | "Tidak permanen";
  tujuan_surat:
    | "Beasiswa" | "BPJS gratis" | "Bantuan sosial" | "Keringanan biaya RS" | "Lainnya";
}

export interface SPNData {
  nama_pasangan: string;
  nik_pasangan: string;
  tempat_lahir_psg: string;
  tgl_lahir_psg: string; // YYYY-MM-DD
  pekerjaan_psg: string;
  alamat_pasangan: string;
  status_perkawinan:
    | "Belum pernah menikah" | "Duda/Janda cerai hidup" | "Duda/Janda cerai mati";
  rencana_tgl_nikah: string; // YYYY-MM-DD
  tempat_nikah: string;
  kua_tujuan: string;
  urutan_pernikahan: number;
}

export interface SKHData {
  jenis_barang:
    | "KTP" | "SIM" | "STNK" | "Buku tabungan" | "Ijazah" | "BPJS" | "HP" | "Lainnya";
  nomor_dokumen?: string;
  tanggal_hilang: string; // YYYY-MM-DD
  lokasi_kejadian: string;
  kronologi: string;
  tujuan_surat: "Laporan polisi" | "Penggantian dokumen" | "Lainnya";
}

export interface SKMData {
  nama_almarhum: string;
  nik_almarhum: string;
  hubungan_pelapor: "Suami/Istri" | "Anak" | "Orang tua" | "Saudara" | "Lainnya";
  tanggal_meninggal: string; // YYYY-MM-DD
  waktu_meninggal?: string; // HH:MM
  tempat_meninggal: "Di rumah" | "Di rumah sakit / klinik" | "Di tempat lain";
  nama_rs?: string;
  penyebab_kematian?: string;
  tujuan_surat:
    | "Pengurusan warisan" | "Klaim asuransi" | "Administrasi bank" | "Pensiun" | "Lainnya";
}

export interface SKLData {
  nama_bayi: string;
  jenis_kelamin: "Laki-laki" | "Perempuan";
  tanggal_lahir: string; // YYYY-MM-DD
  waktu_lahir: string; // HH:MM
  tempat_lahir: "Rumah" | "RS / Klinik / Puskesmas" | "Lainnya";
  nama_faskes?: string;
  anak_ke: number;
  berat_badan?: number; // gram
  penolong_lahir?: string;
  nama_ibu: string;
  nik_ibu: string;
}

// Satu dokumen pendukung: label tampilan + apakah wajib diunggah.
export type SupportingDoc = { label: string; required: boolean };

export const supportingDocSchema = z.object({
  label: z.string().min(1, "Label dokumen wajib diisi"),
  required: z.boolean().default(true),
});

// Daftar dokumen pendukung per jenis surat — LEGACY FALLBACK. Sumber kebenaran
// sekarang kolom letter_types.supportingDocs (dikelola admin lewat UI); konstanta
// ini hanya dipakai untuk baris lama yang kolomnya masih NULL (lihat
// getSupportingDocs). Index dalam array = docIndex yang disimpan di tiap
// LetterAttachment; urutan TIDAK boleh diubah-acak agar lampiran lama tetap
// merujuk dokumen yang benar (tambah dokumen baru di akhir array).
export const SUPPORTING_DOCS: Record<string, SupportingDoc[]> = {
  SKU: [
    { label: "Fotokopi KTP pemohon", required: true },
    { label: "Fotokopi Kartu Keluarga (KK)", required: true },
    { label: "Surat Pengantar RT/RW", required: true },
    { label: "Surat Permohonan", required: true },
    { label: "Foto / bukti lokasi usaha", required: true },
  ],
  SKD: [
    { label: "Fotokopi KTP pemohon", required: true },
    { label: "Fotokopi Kartu Keluarga (KK)", required: true },
    { label: "Surat Pengantar RT/RW", required: true },
    { label: "Surat Permohonan", required: true },
  ],
  SKBM: [
    { label: "Fotokopi KTP pemohon", required: true },
    { label: "Fotokopi Kartu Keluarga (KK)", required: true },
    { label: "Surat Pengantar RT/RW", required: true },
    { label: "Surat Permohonan", required: true },
    { label: "Akta Kelahiran (jika ada)", required: false },
  ],
  SKTM: [
    { label: "Fotokopi KTP pemohon", required: true },
    { label: "Fotokopi Kartu Keluarga (KK)", required: true },
    { label: "Surat Pengantar RT/RW", required: true },
    { label: "Surat Permohonan", required: true },
    { label: "Foto kondisi rumah", required: false },
  ],
  SPN: [
    { label: "Fotokopi KTP pemohon & calon pasangan", required: true },
    { label: "Fotokopi Kartu Keluarga (KK)", required: true },
    { label: "Akta Kelahiran pemohon", required: true },
    { label: "Surat Pengantar RT/RW", required: true },
    { label: "Surat Permohonan", required: true },
    { label: "Pas Foto 2x3 dan 3x4", required: true },
    { label: "Akta Cerai / Surat Kematian (jika berstatus Duda/Janda)", required: false },
  ],
  SKH: [
    { label: "Fotokopi KTP pemohon", required: true },
    { label: "Fotokopi Kartu Keluarga (KK)", required: true },
    { label: "Surat Pengantar RT/RW", required: true },
    { label: "Surat Permohonan", required: true },
    { label: "Deskripsi / bukti pendukung terkait barang yang hilang", required: false },
  ],
  SKM: [
    { label: "Fotokopi KTP almarhum/almarhumah", required: true },
    { label: "Fotokopi Kartu Keluarga (KK)", required: true },
    { label: "Surat Pengantar RT/RW", required: true },
    { label: "Surat Permohonan dari keluarga", required: true },
    { label: "Surat Keterangan Kematian dari instansi medis (Dokter/Bidan/Puskesmas)", required: true },
  ],
  SKL: [
    { label: "Fotokopi KTP orang tua", required: true },
    { label: "Fotokopi Kartu Keluarga (KK)", required: true },
    { label: "Surat Pengantar RT/RW", required: true },
    { label: "Surat Keterangan Lahir dari penolong (Bidan/RS/Puskesmas)", required: true },
    { label: "Surat Permohonan", required: true },
    { label: "Buku Nikah / Surat Nikah orang tua", required: true },
  ],
};

// Resolusi dokumen pendukung: kolom DB non-null (termasuk []) = otoritatif,
// NULL = fallback konstanta lama. Seed TIDAK aman dijalankan ulang di produksi
// (membuat akun demo), jadi fallback ini wajib untuk baris pra-migrasi.
export function getSupportingDocs(code: string, raw: unknown): SupportingDoc[] {
  const parsed = parseJsonColumn<unknown>(raw, null);
  if (Array.isArray(parsed)) return parsed as SupportingDoc[];
  return SUPPORTING_DOCS[code] ?? [];
}

/* -------------------------------------------------------------------------- */
/*  Kamus tag template .docx                                                  */
/* -------------------------------------------------------------------------- */

// Tag tetap yang selalu tersedia di template .docx apa pun jenis suratnya
// (di luar ini: nama tiap requiredFields juga jadi tag). Dipakai validasi
// upload template + panel Kamus Tag di UI admin.
export const FIXED_LETTER_TAGS: { tag: string; label: string }[] = [
  { tag: "nomor_surat", label: "Nomor surat (terbit saat diproses)" },
  { tag: "tanggal_surat", label: "Tanggal surat, mis. 12 Juli 2026" },
  { tag: "nama", label: "Nama lengkap pemohon" },
  { tag: "nik", label: "NIK pemohon" },
  { tag: "alamat", label: "Alamat pemohon (sesuai profil)" },
  { tag: "tempat_lahir", label: "Tempat lahir pemohon" },
  { tag: "tanggal_lahir", label: "Tanggal lahir pemohon" },
  { tag: "tempat_tanggal_lahir", label: "Tempat, tanggal lahir (gabung)" },
  { tag: "pekerjaan", label: "Pekerjaan pemohon" },
  { tag: "agama", label: "Agama pemohon" },
  { tag: "jenis_kelamin", label: "Jenis kelamin pemohon" },
  { tag: "kewarganegaraan", label: "Kewarganegaraan pemohon" },
  { tag: "status_pernikahan", label: "Status pernikahan pemohon" },
  { tag: "pendidikan", label: "Pendidikan terakhir pemohon" },
  { tag: "keperluan", label: "Keperluan pengajuan" },
  { tag: "nama_penandatangan", label: "Nama penandatangan (Kades/Sekdes)" },
  { tag: "jabatan_penandatangan", label: "Jabatan penandatangan" },
  { tag: "is_sekdes", label: "Blok kondisi: hanya tampil bila ditandatangani Sekdes, mis. {#is_sekdes}a.n Kepala Desa{/is_sekdes}" },
  { tag: "kop_kabupaten", label: "Kop: nama kabupaten" },
  { tag: "kop_kecamatan", label: "Kop: nama kecamatan" },
  { tag: "kop_desa", label: "Kop: nama desa" },
  { tag: "alamat_kop", label: "Kop: alamat kantor desa" },
];

/* -------------------------------------------------------------------------- */
/*  Definisi field tambahan per jenis surat                                   */
/*  (mis. SKU butuh "nama usaha"). Disimpan di letter_types.requiredFields    */
/*  dan jawabannya disimpan di letter_requests.data                           */
/* -------------------------------------------------------------------------- */

export const letterFieldDefSchema = z.object({
  // key di object `data` sekaligus nama tag {snake_case} di template docx
  name: z
    .string()
    .min(1, "Nama field wajib diisi")
    .regex(/^[a-z0-9_]+$/, "Nama field hanya huruf kecil, angka, dan _"),
  label: z.string().min(1), // teks yang ditampilkan ke warga
  type: z
    .enum(["text", "number", "date", "time", "textarea", "select"])
    .default("text"),
  required: z.boolean().default(true),
  placeholder: z.string().optional(), // dipakai juga sebagai teks "Catatan" di UI
  options: z.array(z.string()).optional(), // wajib untuk type "select"
});

export type LetterFieldDef = z.infer<typeof letterFieldDefSchema>;

// Bangun skema Zod validasi `data` dari requiredFields jenis surat. Satu builder
// ini menggantikan 8 skema manual: required, enum (select), & angka ditegakkan
// sesuai definisi tiap jenis surat; hasil parse meng-coerce field angka.
export function buildLetterDataSchema(fields: LetterFieldDef[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const f of fields) {
    const req = `${f.label} wajib diisi`;
    let base: z.ZodTypeAny;
    if (f.type === "number") {
      base = z.coerce.number({ error: `${f.label} harus berupa angka` });
    } else if (f.type === "select" && f.options?.length) {
      // opsi "Lainnya" → user boleh mengetik nilai manual, jadi terima teks bebas
      // (nilai literal "Lainnya" ditolak supaya tidak tersimpan tanpa keterangan)
      base = f.options.includes("Lainnya")
        ? z
            .string({ error: req })
            .min(1, req)
            .refine((v) => v !== "Lainnya", `Harap sebutkan ${f.label} secara manual`)
        : z.enum(f.options as [string, ...string[]], {
            error: `Pilihan ${f.label} tidak valid`,
          });
    } else {
      base = z.string({ error: req }).min(1, req);
    }
    // "" / null dari form diperlakukan sebagai "tidak diisi"
    shape[f.name] = z.preprocess(
      (v) => (v === "" || v === null ? undefined : v),
      f.required ? base : base.optional(),
    );
  }
  return z.object(shape);
}


// Kolom JSON MySQL kadang dikembalikan driver mysql2 sebagai string mentah
// (bukan hasil parse). Normalisasi di satu tempat ini dipakai tiap kali baca
// kolom json() dari Drizzle (requiredFields, data, attachments).
export function parseJsonColumn<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string") return (value as T) ?? fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function normalizeRequiredFields(value: unknown): LetterFieldDef[] {
  const parsed = parseJsonColumn<unknown>(value, []);
  return Array.isArray(parsed) ? (parsed as LetterFieldDef[]) : [];
}

// Nilai jawaban field tambahan dari warga
export type LetterRequestData = Record<string, string | number | null>;

/* -------------------------------------------------------------------------- */
/*  Lampiran pendukung (mis. scan KTP/KK)                                     */
/* -------------------------------------------------------------------------- */

// Metadata lampiran yang disimpan di DB. File fisiknya ada di folder privat
// `uploads/lampiran` dan hanya bisa diakses lewat endpoint berotentikasi.
export type LetterAttachment = {
  name: string; // nama asli file dari warga (sudah disanitasi)
  storedName: string; // nama file di disk (cuid + ekstensi)
  mime: string;
  size: number; // bytes
  // index dokumen yang dipenuhi file ini (sesuai SUPPORTING_DOCS[code]);
  // opsional demi kompat baris lama yang diunggah sebagai dropzone gabungan
  docIndex?: number;
};

// Versi yang dikirim ke frontend (tanpa storedName — lokasi disk tak perlu bocor)
export type LetterAttachmentDTO = {
  name: string;
  mime: string;
  size: number;
  docIndex?: number;
};

/* -------------------------------------------------------------------------- */
/*  Kontrak: kelola jenis surat (admin / kepala desa)                         */
/* -------------------------------------------------------------------------- */

const baseLetterTypeSchema = z.object({
  code: z
    .string()
    .min(2, "Kode minimal 2 karakter")
    .max(20)
    .regex(/^[A-Z0-9]+$/, "Kode hanya boleh huruf kapital & angka"),
  name: z.string().min(3, "Nama jenis surat minimal 3 karakter"),
  description: z.string().max(500).optional(),
  template: z.string().optional(), // isi surat dengan placeholder, mis. {{name}}
  requiredFields: z.array(letterFieldDefSchema),
  // templateDocx sengaja TIDAK ada di sini — hanya route upload template yang boleh set
  supportingDocs: z.array(supportingDocSchema).optional(),
  active: z.boolean(),
});

export const createLetterTypeSchema = baseLetterTypeSchema.extend({
  requiredFields: z.array(letterFieldDefSchema).default([]),
  supportingDocs: z.array(supportingDocSchema).default([]),
  active: z.boolean().default(true),
});

export const updateLetterTypeSchema = baseLetterTypeSchema.partial();

export type TCreateLetterTypeInput = z.infer<typeof createLetterTypeSchema>;
export type TUpdateLetterTypeInput = z.infer<typeof updateLetterTypeSchema>;

/* -------------------------------------------------------------------------- */
/*  Kontrak: warga mengajukan surat                                           */
/* -------------------------------------------------------------------------- */

export const createLetterRequestSchema = z.object({
  letterTypeId: z.string().min(1, "Jenis surat wajib dipilih"),
  purpose: z.string().min(3, "Keperluan wajib diisi"),
  // jawaban field tambahan; divalidasi lebih lanjut di service sesuai requiredFields
  data: z
    .record(z.string(), z.union([z.string(), z.number(), z.null()]))
    .optional(),
  // hanya dipakai staff/admin saat mengajukan atas nama warga; diabaikan untuk role "user"
  userId: z.string().min(1).optional(),
});

export type TCreateLetterRequestInput = z.infer<
  typeof createLetterRequestSchema
>;

/* -------------------------------------------------------------------------- */
/*  Kontrak: aksi petugas (alur approval 2 tingkat)                           */
/* -------------------------------------------------------------------------- */

// Operator menerima & mulai memproses (DIAJUKAN -> DIPROSES)
export const processLetterRequestSchema = z.object({
  note: z.string().max(500).optional(),
  sequence: z.string().regex(/^\d+$/, "Nomor urut hanya boleh berisi angka").min(1, "Nomor urut surat wajib diisi"),
});

// Kepala desa menyetujui (DIPROSES -> DISETUJUI). Nomor surat dibuat sistem.
export const approveLetterRequestSchema = z.object({
  note: z.string().max(500).optional(),
});

// Tolak (DIAJUKAN/DIPROSES -> DITOLAK), wajib alasan
export const rejectLetterRequestSchema = z.object({
  reason: z.string().min(3, "Alasan penolakan wajib diisi"),
});

export type TProcessLetterRequestInput = z.infer<
  typeof processLetterRequestSchema
>;
export type TApproveLetterRequestInput = z.infer<
  typeof approveLetterRequestSchema
>;
export type TRejectLetterRequestInput = z.infer<
  typeof rejectLetterRequestSchema
>;

// Staff/admin merapikan keperluan & field dinamis warga sebelum surat diproses (DIAJUKAN saja)
export const updateLetterRequestDataSchema = z.object({
  purpose: z.string().min(3, "Keperluan wajib diisi"),
  data: z.record(z.string(), z.union([z.string(), z.number(), z.null()])),
});

export type TUpdateLetterRequestDataInput = z.infer<
  typeof updateLetterRequestDataSchema
>;

/* -------------------------------------------------------------------------- */
/*  Bentuk response (DTO) yang dikembalikan API ke Frontend                   */
/* -------------------------------------------------------------------------- */

export type LetterTypeDTO = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  requiredFields: LetterFieldDef[];
  supportingDocs: SupportingDoc[]; // sudah ter-resolve (kolom DB atau fallback konstanta)
  hasDocxTemplate: boolean;
  active: boolean;
};

// Versi lengkap untuk form admin (template teks + nama file docx aktif)
export type LetterTypeAdminDTO = LetterTypeDTO & {
  template: string | null;
  templateDocx: string | null;
};

// Laporan hasil validasi template .docx yang diunggah admin
export type TemplateReport = {
  tags: string[];
  hasQr: boolean;
  hasTtd: boolean;
};

// Ringkasan pemohon (diambil dari profil user) untuk ditampilkan ke petugas
export type RequesterDTO = {
  id: string;
  name: string;
  nik: string;
};

export type LetterRequestDTO = {
  id: string;
  status: LetterStatus;
  purpose: string;
  data: LetterRequestData | null;
  attachments: LetterAttachmentDTO[];
  letterNumber: string | null;
  rejectionReason: string | null;
  verificationCode: string | null;
  requester: RequesterDTO;
  letterType: Pick<
    LetterTypeDTO,
    "id" | "code" | "name" | "requiredFields" | "supportingDocs"
  >;
  createdAt: string; // ISO string
  approvedAt: string | null;
};

// Satu entri riwayat perubahan status (timeline) pengajuan
export type LetterLogDTO = {
  id: number;
  status: LetterStatus;
  note: string | null;
  changedByName: string | null;
  createdAt: string; // ISO string
};

// Hasil verifikasi publik via QR code (tanpa data pribadi sensitif)
export type LetterVerificationDTO = {
  valid: boolean;
  letterNumber: string | null;
  letterTypeName: string | null;
  requesterName: string | null; // boleh disamarkan sebagian di FE
  approvedAt: string | null;
};