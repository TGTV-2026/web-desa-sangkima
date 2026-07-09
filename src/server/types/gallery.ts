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

export type VideoPlatform = "youtube" | "instagram";

export type VideoDTO = {
  id: string;
  albumId: string;
  platform: VideoPlatform;
  externalId: string;
  url: string;
  caption: string | null;
  thumbnailUrl: string | null;
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

export type AlbumDetailDTO = AlbumDTO & {
  photos: PhotoDTO[];
  videos: VideoDTO[];
};

export type GalleryAuthor = { id: string; name: string };

export const videoInputSchema = z.object({
  url: z.string().trim().min(1, "Link video kosong").max(500),
  caption: z.string().max(300).optional().default(""),
});
export type VideoInput = z.infer<typeof videoInputSchema>;

type ParsedVideoUrl =
  | { platform: "youtube"; id: string }
  | { platform: "instagram"; id: string }
  | null;

/**
 * Deteksi platform + ID dari URL video yang di-paste admin. Return null kalau
 * tidak cocok pola manapun — dipakai untuk validasi Zod & pesan error di form.
 *
 * YouTube: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/shorts/ID,
 *          youtube.com/embed/ID
 * Instagram: instagram.com/p/CODE, instagram.com/reel/CODE, instagram.com/tv/CODE
 */
export function parseVideoUrl(input: string): ParsedVideoUrl {
  const raw = input.trim();
  if (!raw) return null;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  const segments = url.pathname.split("/").filter(Boolean);

  // ID YouTube: 11 karakter alfanumerik + - _
  const isYoutubeId = (v: string) => /^[\w-]{11}$/.test(v);
  // Shortcode Instagram: alfanumerik + - _
  const isInstagramCode = (v: string) => /^[\w-]+$/.test(v);

  if (host === "youtu.be") {
    const id = segments[0];
    return id && isYoutubeId(id) ? { platform: "youtube", id } : null;
  }

  if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
    const v = url.searchParams.get("v");
    if (v && isYoutubeId(v)) return { platform: "youtube", id: v };
    // pola path: /shorts/ID, /embed/ID, /live/ID
    if (["shorts", "embed", "live"].includes(segments[0] ?? "")) {
      const id = segments[1];
      if (id && isYoutubeId(id)) return { platform: "youtube", id };
    }
    return null;
  }

  if (host === "instagram.com" || host.endsWith(".instagram.com")) {
    const idx = segments.findIndex((s) => ["p", "reel", "reels", "tv"].includes(s));
    if (idx !== -1) {
      const code = segments[idx + 1];
      if (code && isInstagramCode(code)) return { platform: "instagram", id: code };
    }
    return null;
  }

  return null;
}

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
