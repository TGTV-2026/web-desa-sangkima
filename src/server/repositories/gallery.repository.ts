import { asc, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "../db";
import { galleryAlbums, galleryPhotos } from "../db/schema";

// Akses data album + foto galeri. Logika (validasi, slug) ada di service.
export const galleryRepository = {
  async findAllAlbums() {
    return db.select().from(galleryAlbums).orderBy(desc(galleryAlbums.createdAt));
  },

  async findPublishedAlbums() {
    return db
      .select()
      .from(galleryAlbums)
      .where(eq(galleryAlbums.published, true))
      .orderBy(desc(galleryAlbums.createdAt));
  },

  async findAlbumById(id: string) {
    const rows = await db
      .select()
      .from(galleryAlbums)
      .where(eq(galleryAlbums.id, id))
      .limit(1);
    return rows[0];
  },

  async findAlbumBySlug(slug: string) {
    const rows = await db
      .select()
      .from(galleryAlbums)
      .where(eq(galleryAlbums.slug, slug))
      .limit(1);
    return rows[0];
  },

  async insertAlbum(row: typeof galleryAlbums.$inferInsert) {
    await db.insert(galleryAlbums).values(row);
  },

  async updateAlbum(id: string, patch: Partial<typeof galleryAlbums.$inferInsert>) {
    await db.update(galleryAlbums).set(patch).where(eq(galleryAlbums.id, id));
  },

  async removeAlbum(id: string) {
    await db.delete(galleryPhotos).where(eq(galleryPhotos.albumId, id));
    await db.delete(galleryAlbums).where(eq(galleryAlbums.id, id));
  },

  // === Foto ===
  async findPhotosByAlbum(albumId: string) {
    return db
      .select()
      .from(galleryPhotos)
      .where(eq(galleryPhotos.albumId, albumId))
      .orderBy(asc(galleryPhotos.sortOrder), asc(galleryPhotos.createdAt));
  },

  async findPhotoById(id: string) {
    const rows = await db
      .select()
      .from(galleryPhotos)
      .where(eq(galleryPhotos.id, id))
      .limit(1);
    return rows[0];
  },

  async insertPhoto(row: typeof galleryPhotos.$inferInsert) {
    await db.insert(galleryPhotos).values(row);
  },

  async removePhoto(id: string) {
    await db.delete(galleryPhotos).where(eq(galleryPhotos.id, id));
  },

  // Jumlah foto per album (untuk daftar). Map albumId -> count.
  async countPhotosForAlbums(albumIds: string[]): Promise<Record<string, number>> {
    if (albumIds.length === 0) return {};
    const rows = await db
      .select({
        albumId: galleryPhotos.albumId,
        n: sql<number>`count(*)`,
      })
      .from(galleryPhotos)
      .where(inArray(galleryPhotos.albumId, albumIds))
      .groupBy(galleryPhotos.albumId);
    const map: Record<string, number> = {};
    for (const r of rows) map[r.albumId] = Number(r.n);
    return map;
  },
};
