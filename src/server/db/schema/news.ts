import { createId } from "@paralleldrive/cuid2";
import {
  boolean,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// Berita / pengumuman desa (dikelola lewat CMS /admin/berita).
// Tiap baris = satu artikel. slug unik dipakai untuk URL /berita/<slug>.
export const news = mysqlTable("news", {
  id: varchar({ length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  slug: varchar({ length: 220 }).notNull().unique(),
  title: varchar({ length: 255 }).notNull(),
  excerpt: varchar({ length: 500 }),
  content: text("content"),
  coverImage: varchar("cover_image", { length: 500 }),
  // Penulis (akun CMS pembuat). authorName = snapshot nama saat menulis,
  // agar byline tetap benar walau akun di-rename/nonaktif.
  authorId: varchar("author_id", { length: 128 }),
  authorName: varchar("author_name", { length: 255 }),
  // false = draf (tidak tampil di publik)
  published: boolean().notNull().default(true),
  publishedAt: timestamp("published_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
