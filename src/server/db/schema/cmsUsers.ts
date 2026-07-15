import { createId } from "@paralleldrive/cuid2";
import {
  boolean,
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
// - rt: ketua RT — HANYA modul Laporan RT (isi laporan RT-nya sendiri), tanpa
//   akses konten lain. Dibuat massal oleh super_admin lewat unggah CSV.
// - monitoring: akun pengawas — HANYA hub /admin/monitoring (audit, uptime,
//   kelola akun), tidak bisa membuka CMS konten.
// deletedAt = nonaktif (soft delete) supaya jejak penulis lama tetap ada.
export const cmsUsers = mysqlTable("cms_users", {
  id: varchar({ length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  role: mysqlEnum(["super_admin", "editor", "rt", "monitoring"])
    .notNull()
    .default("editor"),
  // Identitas wilayah — hanya terisi untuk role "rt" (mis. dusun "Lestari Jaya",
  // rt "05"). rt disimpan varchar agar nol di depan tidak hilang.
  dusun: varchar({ length: 100 }),
  rt: varchar({ length: 10 }),
  // Akun hasil bulk-CSV diberi sandi sementara oleh super_admin → wajib ganti
  // sendiri saat login pertama sebelum boleh melakukan apa pun.
  mustChangePassword: boolean("must_change_password").notNull().default(false),
  // null = email belum diverifikasi lewat OTP → akun hanya bisa MELIHAT isi CMS,
  // semua aksi tulis ditolak (lihat requireVerifiedCmsUser). Editor baru selalu
  // mulai dari null; super_admin otomatis terverifikasi saat dibuat karena dia
  // sendiri yang menentukan kredensialnya. Akun rt hasil bulk-CSV juga langsung
  // terverifikasi — super_admin yang menjamin identitasnya; gerbangnya diganti
  // wajib-ganti-sandi di atas.
  emailVerifiedAt: datetime("email_verified_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  deletedAt: datetime("deleted_at"),
});
