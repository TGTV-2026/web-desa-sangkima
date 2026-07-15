import { createId } from "@paralleldrive/cuid2";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "../db";
import { letterTypes } from "../db/schema";
import type {
  TCreateLetterTypeInput,
  TUpdateLetterTypeInput,
  TemplateReport,
} from "../types/letter";

export const letterTypeRepository = {
  // Listing selalu menyembunyikan yang soft-deleted (deletedAt != null)
  async findAll(activeOnly = false) {
    if (activeOnly) {
      return db
        .select()
        .from(letterTypes)
        .where(and(eq(letterTypes.active, true), isNull(letterTypes.deletedAt)));
    }
    return db.select().from(letterTypes).where(isNull(letterTypes.deletedAt));
  },

  async findById(id: string) {
    const result = await db
      .select()
      .from(letterTypes)
      .where(eq(letterTypes.id, id))
      .limit(1);
    return result[0];
  },

  async findByCode(code: string) {
    const result = await db
      .select()
      .from(letterTypes)
      .where(eq(letterTypes.code, code))
      .limit(1);
    return result[0];
  },

  async create(data: TCreateLetterTypeInput) {
    const id = createId();
    await db.insert(letterTypes).values({ id, ...data });
    return this.findById(id);
  },

  async update(id: string, data: TUpdateLetterTypeInput) {
    await db.update(letterTypes).set(data).where(eq(letterTypes.id, id));
    return this.findById(id);
  },

  // setter khusus templateDocx — sengaja di luar update() agar jalur update JSON
  // biasa tak pernah bisa menyentuh kolom ini (hanya route upload template)
  async setTemplateDocx(id: string, fileName: string | null, report: TemplateReport | null) {
    await db
      .update(letterTypes)
      .set({ templateDocx: fileName, templateReport: report })
      .where(eq(letterTypes.id, id));
    return this.findById(id);
  },

  // soft delete: baris tetap ada agar permohonan lama (FK) tetap resolve
  async softDelete(id: string) {
    await db
      .update(letterTypes)
      .set({ deletedAt: new Date() })
      .where(eq(letterTypes.id, id));
  },

  // hard delete: hanya aman bila tak ada permohonan yang mereferensikan
  async hardDelete(id: string) {
    await db.delete(letterTypes).where(eq(letterTypes.id, id));
  },
};
