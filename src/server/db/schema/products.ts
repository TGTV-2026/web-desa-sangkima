import { createId } from "@paralleldrive/cuid2";
import {
  boolean,
  int,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// Produk koperasi/UMKM desa (dikelola lewat CMS /admin/produk).
// Tiap baris = satu produk. Pemesanan diarahkan ke WhatsApp koperasi
// (tidak ada checkout/pembayaran di sistem ini).
export const products = mysqlTable("products", {
  id: varchar({ length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  name: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 500 }),
  // harga dalam rupiah (bilangan bulat). 0 = tidak ditampilkan (mis. "hubungi").
  price: int().notNull().default(0),
  // satuan, mis. "per kg", "per botol", "per pcs"
  unit: varchar({ length: 40 }),
  // pengelompokan opsional, mis. "Sembako", "Kerajinan"
  category: varchar({ length: 60 }),
  image: varchar({ length: 500 }),
  // false = disembunyikan dari katalog publik
  published: boolean().notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
