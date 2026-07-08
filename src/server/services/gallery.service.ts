import { createId } from "@paralleldrive/cuid2";
import { galleryRepository } from "../repositories/gallery.repository";
import {
  albumInputSchema,
  makeAlbumSlug,
  type AlbumDTO,
  type AlbumDetailDTO,
  type GalleryAuthor,
  type PhotoDTO,
} from "../types/gallery";

type AlbumRow = NonNullable<
  Awaited<ReturnType<typeof galleryRepository.findAlbumById>>
>;
type PhotoRow = NonNullable<
  Awaited<ReturnType<typeof galleryRepository.findPhotoById>>
>;

function albumToDTO(row: AlbumRow, photoCount: number): AlbumDTO {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    coverImage: row.coverImage,
    published: row.published,
    authorId: row.authorId,
    authorName: row.authorName,
    photoCount,
    createdAt: row.createdAt,
  };
}

function photoToDTO(row: PhotoRow): PhotoDTO {
  return {
    id: row.id,
    albumId: row.albumId,
    url: row.url,
    caption: row.caption,
    sortOrder: row.sortOrder,
  };
}

async function withCounts(rows: AlbumRow[]): Promise<AlbumDTO[]> {
  const counts = await galleryRepository.countPhotosForAlbums(
    rows.map((r) => r.id),
  );
  return rows.map((r) => albumToDTO(r, counts[r.id] ?? 0));
}

export const galleryService = {
  async listAllAlbums(): Promise<AlbumDTO[]> {
    try {
      return await withCounts(await galleryRepository.findAllAlbums());
    } catch {
      return [];
    }
  },

  async listPublishedAlbums(limit?: number): Promise<AlbumDTO[]> {
    try {
      const rows = await galleryRepository.findPublishedAlbums();
      const sliced = limit ? rows.slice(0, limit) : rows;
      return await withCounts(sliced);
    } catch {
      return [];
    }
  },

  async getAlbumBySlug(slug: string): Promise<AlbumDetailDTO | null> {
    const row = await galleryRepository.findAlbumBySlug(slug);
    if (!row) return null;
    const photos = await galleryRepository.findPhotosByAlbum(row.id);
    return { ...albumToDTO(row, photos.length), photos: photos.map(photoToDTO) };
  },

  async getAlbumById(id: string): Promise<AlbumDetailDTO | null> {
    const row = await galleryRepository.findAlbumById(id);
    if (!row) return null;
    const photos = await galleryRepository.findPhotosByAlbum(id);
    return { ...albumToDTO(row, photos.length), photos: photos.map(photoToDTO) };
  },

  async createAlbum(input: unknown, author: GalleryAuthor): Promise<AlbumDTO> {
    const data = albumInputSchema.parse(input);
    const id = createId();
    const slug = makeAlbumSlug(data.title, id);
    await galleryRepository.insertAlbum({
      id,
      slug,
      title: data.title,
      description: data.description || null,
      coverImage: data.coverImage || null,
      published: data.published,
      authorId: author.id,
      authorName: author.name,
    });
    const created = await galleryRepository.findAlbumById(id);
    return albumToDTO(created!, 0);
  },

  async updateAlbum(id: string, input: unknown): Promise<void> {
    const data = albumInputSchema.parse(input);
    await galleryRepository.updateAlbum(id, {
      title: data.title,
      description: data.description || null,
      coverImage: data.coverImage || null,
      published: data.published,
    });
  },

  async removeAlbum(id: string): Promise<void> {
    await galleryRepository.removeAlbum(id);
  },

  // === Foto ===
  async addPhoto(
    albumId: string,
    url: string,
    caption?: string,
  ): Promise<void> {
    if (!url) throw new Error("URL foto kosong");
    await galleryRepository.insertPhoto({
      id: createId(),
      albumId,
      url,
      caption: caption || null,
      sortOrder: Date.now() % 1_000_000_000,
    });
  },

  async removePhoto(id: string): Promise<void> {
    await galleryRepository.removePhoto(id);
  },

  /** Jadikan sebuah foto sebagai sampul albumnya. */
  async setCover(photoId: string): Promise<void> {
    const photo = await galleryRepository.findPhotoById(photoId);
    if (!photo) return;
    await galleryRepository.updateAlbum(photo.albumId, {
      coverImage: photo.url,
    });
  },
};
