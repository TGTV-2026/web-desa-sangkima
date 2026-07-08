import { z } from "zod";

// Zod + tipe untuk domain produk koperasi desa. Dipakai di service & form CMS.

export const productInputSchema = z.object({
  name: z.string().min(2, "Nama produk minimal 2 karakter").max(255),
  description: z.string().max(500).optional().default(""),
  // harga rupiah; 0 = tidak ditampilkan (hubungi penjual)
  price: z.coerce.number().int().min(0).default(0),
  unit: z.string().max(40).optional().default(""),
  category: z.string().max(60).optional().default(""),
  image: z.string().optional().default(""),
  published: z.boolean().default(true),
});
export type ProductInput = z.infer<typeof productInputSchema>;

// DTO publik (dari baris DB) — bentuk yang dikirim ke komponen.
export type ProductDTO = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  unit: string | null;
  category: string | null;
  image: string | null;
  published: boolean;
};
