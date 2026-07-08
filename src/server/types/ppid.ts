import { z } from "zod";

// Zod + tipe untuk domain PPID (Pejabat Pengelola Informasi & Dokumentasi).
// Dipakai di service & form CMS.

// 4 jenis informasi publik sesuai UU No. 14/2008 tentang Keterbukaan Informasi Publik.
// Deskripsi bersifat definisi hukum (tidak diedit lewat CMS) — dipakai sebagai
// penjelasan pada halaman /ppid.
export const PPID_CATEGORIES = [
  {
    key: "BERKALA",
    label: "Informasi Berkala",
    desc: "Informasi yang wajib disediakan dan diumumkan secara berkala, sekurang-kurangnya enam bulan sekali.",
  },
  {
    key: "SERTA_MERTA",
    label: "Informasi Serta Merta",
    desc: "Informasi yang wajib diumumkan tanpa penundaan karena dapat mengancam hajat hidup orang banyak dan ketertiban umum.",
  },
  {
    key: "SETIAP_SAAT",
    label: "Informasi Setiap Saat",
    desc: "Informasi yang wajib disediakan dan dapat diakses oleh pemohon informasi setiap saat.",
  },
  {
    key: "DIKECUALIKAN",
    label: "Informasi Dikecualikan",
    desc: "Informasi yang dikecualikan/rahasia sesuai peraturan perundang-undangan berdasarkan uji konsekuensi.",
  },
] as const;

export type PpidCategory = (typeof PPID_CATEGORIES)[number]["key"];

export const PPID_CATEGORY_KEYS = PPID_CATEGORIES.map((c) => c.key) as [
  PpidCategory,
  ...PpidCategory[],
];

export function ppidCategoryLabel(key: string): string {
  return PPID_CATEGORIES.find((c) => c.key === key)?.label ?? key;
}

export const ppidDocInputSchema = z
  .object({
    category: z.enum(PPID_CATEGORY_KEYS),
    title: z.string().min(3, "Judul minimal 3 karakter").max(255),
    description: z.string().max(500).optional().default(""),
    // Berkas terunggah (hasil upload) ATAU tautan luar — minimal salah satu terisi.
    fileUrl: z.string().optional().default(""),
    externalUrl: z.string().optional().default(""),
    year: z.string().max(9).optional().default(""),
    published: z.boolean().default(true),
  })
  .refine((d) => Boolean(d.fileUrl || d.externalUrl), {
    message: "Lampirkan berkas PDF atau isi tautan dokumen.",
    path: ["fileUrl"],
  });
export type PpidDocInput = z.infer<typeof ppidDocInputSchema>;

// DTO publik (dari baris DB) — bentuk yang dikirim ke komponen.
export type PpidDocDTO = {
  id: string;
  category: PpidCategory;
  title: string;
  description: string | null;
  fileUrl: string | null;
  externalUrl: string | null;
  year: string | null;
  authorId: string | null;
  authorName: string | null;
  published: boolean;
  createdAt: Date | null;
};

// Pengunggah (akun CMS) yang dilampirkan saat membuat dokumen.
export type PpidAuthor = { id: string; name: string };
