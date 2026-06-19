import { createId } from "@paralleldrive/cuid2";
import { count, eq, like, or } from "drizzle-orm";
import { db } from "../db";
import { positions, users } from "../db/schema";
import type {
  TCreatePositionInput,
  TUpdatePositionInput,
} from "../types/position";

export const positionRepository = {
  async findAll() {
    return db.select().from(positions);
  },

  async findAllPaginated(page: number, limit: number, search?: string) {
    const offset = (page - 1) * limit;
    const term = `%${search}%`;
    const where = search
      ? or(like(positions.name, term), like(positions.category, term))
      : undefined;

    const [rows, countResult] = await Promise.all([
      db.select().from(positions).where(where).limit(limit).offset(offset),
      db.select({ total: count() }).from(positions).where(where),
    ]);
    return { rows, total: countResult[0]?.total ?? 0 };
  },

  async findById(id: string) {
    const result = await db
      .select()
      .from(positions)
      .where(eq(positions.id, id))
      .limit(1);
    return result[0];
  },

  async findByName(name: string) {
    const result = await db
      .select()
      .from(positions)
      .where(eq(positions.name, name))
      .limit(1);
    return result[0];
  },

  async create(data: TCreatePositionInput) {
    const id = createId();
    await db.insert(positions).values({ id, ...data });
    return this.findById(id);
  },

  async update(id: string, data: TUpdatePositionInput) {
    await db.update(positions).set(data).where(eq(positions.id, id));
    return this.findById(id);
  },

  async delete(id: string) {
    const position = await this.findById(id);
    if (!position) throw new Error("Jabatan tidak ditemukan");
    // lepas dulu referensi pengguna yang masih memakai jabatan ini, baru hapus
    await db.update(users).set({ positionId: null }).where(eq(users.positionId, id));
    await db.delete(positions).where(eq(positions.id, id));
    return true;
  },
};
