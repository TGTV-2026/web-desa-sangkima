import { eq } from "drizzle-orm";
import { db } from "../db";
import { siteContent } from "../db/schema";

// Akses data mentah tabel site_content (key-value JSON). Logika bentuk/fallback
// ada di service; di sini hanya baca/tulis baris.
export const siteContentRepository = {
  async findByKey(key: string) {
    const rows = await db
      .select()
      .from(siteContent)
      .where(eq(siteContent.key, key))
      .limit(1);
    return rows[0];
  },

  async findAll() {
    return db.select().from(siteContent);
  },

  // Upsert: buat baris bila belum ada, kalau ada perbarui value + jejak audit.
  async upsert(key: string, value: unknown, updatedBy: string | null) {
    await db
      .insert(siteContent)
      .values({ key, value, updatedBy })
      .onDuplicateKeyUpdate({ set: { value, updatedBy } });
  },
};
