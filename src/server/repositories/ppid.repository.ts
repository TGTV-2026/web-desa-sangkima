import { asc, desc, eq } from "drizzle-orm";
import { db } from "../db";
import { ppidDocuments } from "../db/schema";

// Akses data tabel ppid_documents. Logika (validasi) ada di service.
export const ppidRepository = {
  // Semua dokumen (admin): kelompokkan per kategori, terbaru dulu.
  async findAll() {
    return db
      .select()
      .from(ppidDocuments)
      .orderBy(asc(ppidDocuments.category), desc(ppidDocuments.createdAt));
  },

  // Dokumen yang published saja (publik).
  async findPublished() {
    return db
      .select()
      .from(ppidDocuments)
      .where(eq(ppidDocuments.published, true))
      .orderBy(asc(ppidDocuments.category), desc(ppidDocuments.createdAt));
  },

  async findById(id: string) {
    const rows = await db
      .select()
      .from(ppidDocuments)
      .where(eq(ppidDocuments.id, id))
      .limit(1);
    return rows[0];
  },

  async insert(row: typeof ppidDocuments.$inferInsert) {
    await db.insert(ppidDocuments).values(row);
  },

  async update(id: string, patch: Partial<typeof ppidDocuments.$inferInsert>) {
    await db.update(ppidDocuments).set(patch).where(eq(ppidDocuments.id, id));
  },

  async remove(id: string) {
    await db.delete(ppidDocuments).where(eq(ppidDocuments.id, id));
  },
};
