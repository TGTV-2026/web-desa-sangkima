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

// SKD   = Surat Keterangan Domisili
// SKTM  = Surat Keterangan Tidak Mampu
// SKU   = Surat Keterangan Usaha
// SKBM  = Surat Keterangan Belum Menikah
// SP    = Surat Pengantar (umum)
// SKP   = Surat Keterangan Penghasilan
export const LETTER_TYPE_CODES = [
  "SKD",
  "SKTM",
  "SKU",
  "SKBM",
  "SP",
  "SKP",
] as const;

export type LetterTypeCode = (typeof LETTER_TYPE_CODES)[number];

/* -------------------------------------------------------------------------- */
/*  Definisi field tambahan per jenis surat                                   */
/*  (mis. SKU butuh "nama usaha"). Disimpan di letter_types.requiredFields    */
/*  dan jawabannya disimpan di letter_requests.data                           */
/* -------------------------------------------------------------------------- */

export const letterFieldDefSchema = z.object({
  name: z.string().min(1), // key di object `data`, mis. "namaUsaha"
  label: z.string().min(1), // teks yang ditampilkan ke warga
  type: z.enum(["text", "number", "date", "textarea"]).default("text"),
  required: z.boolean().default(true),
  placeholder: z.string().optional(),
});

export type LetterFieldDef = z.infer<typeof letterFieldDefSchema>;


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
};

// Versi yang dikirim ke frontend (tanpa storedName — lokasi disk tak perlu bocor)
export type LetterAttachmentDTO = {
  name: string;
  mime: string;
  size: number;
};

/* -------------------------------------------------------------------------- */
/*  Kontrak: kelola jenis surat (admin / kepala desa)                         */
/* -------------------------------------------------------------------------- */

export const createLetterTypeSchema = z.object({
  code: z
    .string()
    .min(2, "Kode minimal 2 karakter")
    .max(20)
    .regex(/^[A-Z0-9]+$/, "Kode hanya boleh huruf kapital & angka"),
  name: z.string().min(3, "Nama jenis surat minimal 3 karakter"),
  description: z.string().max(500).optional(),
  template: z.string().optional(), // isi surat dengan placeholder, mis. {{name}}
  requiredFields: z.array(letterFieldDefSchema).default([]),
  active: z.boolean().default(true),
});

export const updateLetterTypeSchema = createLetterTypeSchema.partial();

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

// Staff/admin merapikan field dinamis warga sebelum surat diproses (DIAJUKAN saja)
export const updateLetterRequestDataSchema = z.object({
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
  active: boolean;
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
  letterType: Pick<LetterTypeDTO, "id" | "code" | "name" | "requiredFields">;
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