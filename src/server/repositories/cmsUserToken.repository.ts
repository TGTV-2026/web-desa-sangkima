import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "../db";
import { cmsUserTokens } from "../db/schema";

type CmsTokenType = "EmailChange" | "PasswordReset";

// Akses data token OTP akun CMS. Logika (hash, kirim email) ada di service.
export const cmsUserTokenRepository = {
  async insert(row: typeof cmsUserTokens.$inferInsert) {
    await db.insert(cmsUserTokens).values(row);
  },

  /** Buang token lama bertipe sama agar hanya satu OTP aktif per alur. */
  async deleteByUserAndType(cmsUserId: string, type: CmsTokenType) {
    await db
      .delete(cmsUserTokens)
      .where(
        and(
          eq(cmsUserTokens.cmsUserId, cmsUserId),
          eq(cmsUserTokens.type, type),
        ),
      );
  },

  /** Token yang cocok, belum dipakai, dan belum kedaluwarsa. */
  async findValid(cmsUserId: string, token: string, type: CmsTokenType) {
    const rows = await db
      .select()
      .from(cmsUserTokens)
      .where(
        and(
          eq(cmsUserTokens.cmsUserId, cmsUserId),
          eq(cmsUserTokens.token, token),
          eq(cmsUserTokens.type, type),
          isNull(cmsUserTokens.usedAt),
          gt(cmsUserTokens.expiresAt, new Date()),
        ),
      )
      .limit(1);
    return rows[0];
  },

  async markUsed(id: number) {
    await db
      .update(cmsUserTokens)
      .set({ usedAt: new Date() })
      .where(eq(cmsUserTokens.id, id));
  },
};
