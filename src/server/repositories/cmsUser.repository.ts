import { desc, eq } from "drizzle-orm";
import { db } from "../db";
import { cmsUsers } from "../db/schema";

// Akses data tabel cms_users. Logika (hash, validasi) ada di service.
export const cmsUserRepository = {
  async findAll() {
    return db.select().from(cmsUsers).orderBy(desc(cmsUsers.createdAt));
  },

  async findById(id: string) {
    const rows = await db
      .select()
      .from(cmsUsers)
      .where(eq(cmsUsers.id, id))
      .limit(1);
    return rows[0];
  },

  async findByEmail(email: string) {
    const rows = await db
      .select()
      .from(cmsUsers)
      .where(eq(cmsUsers.email, email))
      .limit(1);
    return rows[0];
  },

  async insert(row: typeof cmsUsers.$inferInsert) {
    await db.insert(cmsUsers).values(row);
  },

  async update(id: string, patch: Partial<typeof cmsUsers.$inferInsert>) {
    await db.update(cmsUsers).set(patch).where(eq(cmsUsers.id, id));
  },

  // Hapus permanen (hard delete) — baris benar-benar dihilangkan dari DB.
  async hardDelete(id: string) {
    await db.delete(cmsUsers).where(eq(cmsUsers.id, id));
  },

  // Hitung super_admin aktif (untuk cegah menonaktifkan super_admin terakhir).
  async countActiveSuperAdmins() {
    const rows = await db
      .select()
      .from(cmsUsers)
      .where(eq(cmsUsers.role, "super_admin"));
    return rows.filter((r) => !r.deletedAt).length;
  },
};
