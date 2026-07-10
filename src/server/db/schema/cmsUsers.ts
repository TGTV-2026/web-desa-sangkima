import { createId } from "@paralleldrive/cuid2";
import {
  datetime,
  mysqlEnum,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// Akun pengelola web profil (CMS) — TERPISAH dari akun warga/e-surat (tabel users).
// Tujuannya akuntabilitas: tahu siapa menulis/mengunggah konten.
// - super_admin: kelola akun editor + semua konten (termasuk tanda tangan surat).
// - editor: kelola konten (berita, produk, PPID) saja.
// deletedAt = nonaktif (soft delete) supaya jejak penulis lama tetap ada.
export const cmsUsers = mysqlTable("cms_users", {
  id: varchar({ length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  role: mysqlEnum(["super_admin", "editor"]).notNull().default("editor"),
  // null = email belum diverifikasi lewat OTP → akun hanya bisa MELIHAT isi CMS,
  // semua aksi tulis ditolak (lihat requireVerifiedCmsUser). Editor baru selalu
  // mulai dari null; super_admin otomatis terverifikasi saat dibuat karena dia
  // sendiri yang menentukan kredensialnya.
  emailVerifiedAt: datetime("email_verified_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  deletedAt: datetime("deleted_at"),
});
