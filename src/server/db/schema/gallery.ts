import { createId } from "@paralleldrive/cuid2";
import {
  boolean,
  int,
  mysqlEnum,
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

// Video referensi eksternal (YouTube/Instagram) di dalam album — bukan file
// yang diunggah, hanya metadata + embed. externalId = video ID YouTube atau
// shortcode Instagram; url = link asli yang di-paste admin (fallback link).
export const galleryVideos = mysqlTable("gallery_videos", {
  id: varchar({ length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  albumId: varchar("album_id", { length: 128 }).notNull(),
  platform: mysqlEnum(["youtube", "instagram"]).notNull(),
  externalId: varchar("external_id", { length: 128 }).notNull(),
  url: varchar({ length: 500 }).notNull(),
  caption: varchar({ length: 300 }),
  // Dari YouTube thumbnail API; null utk Instagram (embed bawa preview sendiri).
  thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
  sortOrder: int("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});
