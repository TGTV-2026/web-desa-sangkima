import { asc, desc, eq } from "drizzle-orm";
import { db } from "../db";
import { products } from "../db/schema";

// Akses data tabel products. Logika (validasi) ada di service.
export const productRepository = {
  // Semua produk (admin): kategori lalu terbaru dulu.
  async findAll() {
    return db
      .select()
      .from(products)
      .orderBy(asc(products.category), desc(products.createdAt));
  },

  // Produk yang published saja (publik).
  async findPublished() {
    return db
      .select()
      .from(products)
      .where(eq(products.published, true))
      .orderBy(asc(products.category), desc(products.createdAt));
  },

  async findById(id: string) {
    const rows = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
    return rows[0];
  },

  async insert(row: typeof products.$inferInsert) {
    await db.insert(products).values(row);
  },

  async update(id: string, patch: Partial<typeof products.$inferInsert>) {
    await db.update(products).set(patch).where(eq(products.id, id));
  },

  async remove(id: string) {
    await db.delete(products).where(eq(products.id, id));
  },
};
