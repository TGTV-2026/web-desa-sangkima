import { createId } from "@paralleldrive/cuid2";
import {
  boolean,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// Dokumen Informasi Publik PPID (dikelola lewat CMS /admin/ppid).
// Tiap baris = satu dokumen/informasi, dikelompokkan oleh `category`
// (BERKALA | SERTA_MERTA | SETIAP_SAAT | DIKECUALIKAN — lihat src/server/types/ppid.ts).
// Dokumen bisa berupa berkas PDF terunggah (fileUrl) atau tautan luar (externalUrl).
export const ppidDocuments = mysqlTable("ppid_documents", {
  id: varchar({ length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  category: varchar({ length: 24 }).notNull(),
  title: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 500 }),
  fileUrl: varchar("file_url", { length: 500 }),
  externalUrl: varchar("external_url", { length: 500 }),
  // Tahun/periode informasi (opsional, mis. "2024") untuk pengelompokan visual.
  year: varchar({ length: 9 }),
  // Pengunggah (akun CMS). authorName = snapshot nama saat mengunggah.
  authorId: varchar("author_id", { length: 128 }),
  authorName: varchar("author_name", { length: 255 }),
  // false = draf (tidak tampil di publik)
  published: boolean().notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
