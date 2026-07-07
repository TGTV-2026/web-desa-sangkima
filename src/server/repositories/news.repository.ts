import { desc, eq } from "drizzle-orm";
import { db } from "../db";
import { news } from "../db/schema";

// Akses data tabel news. Logika (validasi, slug) ada di service.
export const newsRepository = {
  // Semua berita (admin), terbaru dulu.
  async findAll() {
    return db.select().from(news).orderBy(desc(news.publishedAt));
  },

  // Berita yang published saja (publik), terbaru dulu.
  async findPublished() {
    return db
      .select()
      .from(news)
      .where(eq(news.published, true))
      .orderBy(desc(news.publishedAt));
  },

  async findBySlug(slug: string) {
    const rows = await db.select().from(news).where(eq(news.slug, slug)).limit(1);
    return rows[0];
  },

  async findById(id: string) {
    const rows = await db.select().from(news).where(eq(news.id, id)).limit(1);
    return rows[0];
  },

  async insert(row: typeof news.$inferInsert) {
    await db.insert(news).values(row);
  },

  async update(id: string, patch: Partial<typeof news.$inferInsert>) {
    await db.update(news).set(patch).where(eq(news.id, id));
  },

  async remove(id: string) {
    await db.delete(news).where(eq(news.id, id));
  },
};
