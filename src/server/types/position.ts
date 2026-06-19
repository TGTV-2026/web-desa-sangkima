import { z } from "zod";
import { positionCategories } from "../db/schema/positions";

/* ---------- */
/* Schemas    */
/* ---------- */

export const createPositionSchema = z.object({
  category: z.enum(positionCategories, "Kategori wajib dipilih"),
  name: z.string().min(1, "Nama jabatan tidak boleh kosong"),
});

export const updatePositionSchema = createPositionSchema.partial();

/* ---------- */
/* Types      */
/* ---------- */

export type TCreatePositionInput = z.infer<typeof createPositionSchema>;
export type TUpdatePositionInput = z.infer<typeof updatePositionSchema>;

export type PositionDTO = {
  id: string;
  category: (typeof positionCategories)[number];
  name: string;
  createdAt: Date;
  updatedAt: Date | null;
};
