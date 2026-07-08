import { z } from "zod";

// Zod + tipe untuk domain album galeri. Dipakai di service & form CMS.

export const albumInputSchema = z.object({
  title: z.string().min(2, "Judul album minimal 2 karakter").max(255),
  description: z.string().max(500).optional().default(""),
  coverImage: z.string().optional().default(""),
  published: z.boolean().default(true),
});
export type AlbumInput = z.infer<typeof albumInputSchema>;

export type PhotoDTO = {
  id: string;
  albumId: string;
  url: string;
  caption: string | null;
  sortOrder: number;
};

export type AlbumDTO = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  published: boolean;
  authorId: string | null;
  authorName: string | null;
  photoCount: number;
  createdAt: Date | null;
};

export type AlbumDetailDTO = AlbumDTO & { photos: PhotoDTO[] };

export type GalleryAuthor = { id: string; name: string };

/** Ubah judul jadi slug URL-aman, dengan sufiks unik agar tidak bentrok. */
export function makeAlbumSlug(title: string, id: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 180);
  return `${base || "album"}-${id.slice(-6)}`;
}
