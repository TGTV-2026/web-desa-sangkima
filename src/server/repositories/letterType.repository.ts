import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { letterTypes } from "../db/schema";
import type {
  TCreateLetterTypeInput,
  TUpdateLetterTypeInput,
} from "../types/letter";

export const letterTypeRepository = {
  async findAll(activeOnly = false) {
    if (activeOnly) {
      return db
        .select()
        .from(letterTypes)
        .where(eq(letterTypes.active, true));
    }
    return db.select().from(letterTypes);
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
  async setTemplateDocx(id: string, fileName: string | null) {
    await db
      .update(letterTypes)
      .set({ templateDocx: fileName })
      .where(eq(letterTypes.id, id));
    return this.findById(id);
  },
};
