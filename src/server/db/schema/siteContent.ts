import { json, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

// Konten dinamis web profil (dikelola lewat CMS /admin). Pola key-value:
// satu baris per "seksi" (mis. "profil", "struktur", "kontak", "galeri"),
// nilainya blob JSON sesuai bentuk seksi tersebut (divalidasi Zod di service,
// lihat src/server/types/content.ts). Dipilih key-value, bukan satu tabel per
// seksi, supaya menambah seksi baru tidak butuh migration.
export const siteContent = mysqlTable("site_content", {
  key: varchar({ length: 64 }).primaryKey(),
  value: json("value").$type<unknown>(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  // id user (staff/admin) terakhir yang menyunting — untuk jejak audit ringan
  updatedBy: varchar("updated_by", { length: 128 }),
});
