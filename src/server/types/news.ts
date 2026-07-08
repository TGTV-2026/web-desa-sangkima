import { z } from "zod";

// Zod + tipe untuk domain berita/pengumuman. Dipakai di service & form CMS.

export const newsInputSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter").max(255),
  excerpt: z.string().max(500).optional().default(""),
  content: z.string().min(1, "Isi berita wajib diisi"),
  coverImage: z.string().optional().default(""),
  published: z.boolean().default(true),
});
export type NewsInput = z.infer<typeof newsInputSchema>;

// DTO publik (dari baris DB) — bentuk yang dikirim ke komponen.
export type NewsDTO = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  coverImage: string | null;
  authorId: string | null;
  authorName: string | null;
  published: boolean;
  publishedAt: Date | null;
};

// Penulis (akun CMS) yang dilampirkan saat membuat konten.
export type ContentAuthor = { id: string; name: string };

/** Ubah judul jadi slug URL-aman, dengan sufiks unik agar tidak bentrok. */
export function makeSlug(title: string, id: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 180);
  return `${base || "berita"}-${id.slice(-6)}`;
}
