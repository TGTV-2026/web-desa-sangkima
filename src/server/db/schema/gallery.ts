import { createId } from "@paralleldrive/cuid2";
import {
  boolean,
  int,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// Album galeri media desa (dikelola divisi media lewat CMS /admin/album).
// Tiap album punya banyak foto (tabel gallery_photos). authorName = snapshot
// nama editor pengunggah untuk akuntabilitas.
export const galleryAlbums = mysqlTable("gallery_albums", {
  id: varchar({ length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  slug: varchar({ length: 220 }).notNull().unique(),
  title: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 500 }),
  coverImage: varchar("cover_image", { length: 500 }),
  published: boolean().notNull().default(true),
  authorId: varchar("author_id", { length: 128 }),
  authorName: varchar("author_name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Foto di dalam sebuah album. Dihapus manual saat album/foto dihapus.
export const galleryPhotos = mysqlTable("gallery_photos", {
  id: varchar({ length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  albumId: varchar("album_id", { length: 128 }).notNull(),
  url: varchar({ length: 500 }).notNull(),
  caption: varchar({ length: 300 }),
  sortOrder: int("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});
