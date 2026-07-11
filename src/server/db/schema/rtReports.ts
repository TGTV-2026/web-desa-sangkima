import { createId } from "@paralleldrive/cuid2";
import {
  boolean,
  datetime,
  int,
  json,
  mysqlTable,
  timestamp,
  tinyint,
  unique,
  varchar,
} from "drizzle-orm/mysql-core";
import { cmsUsers } from "./cmsUsers";

// Sesi pelaporan RT — pengganti "sheet bulanan" di Excel lama. Super_admin
// membuka sesi untuk satu (tahun, bulan); ketua RT hanya bisa mengisi/mengedit
// selama sesi aktif. Sesi yang ditutup jadi arsip terkunci, dan rekapnya
// dipakai mengisi statistik dusun publik. Tak harus berurutan (boleh Januari
// lalu April) — riwayat antar-sesi tetap bisa dibandingkan.
export const rtReportSessions = mysqlTable(
  "rt_report_sessions",
  {
    id: varchar({ length: 128 })
      .primaryKey()
      .$defaultFn(() => createId()),
    tahun: int().notNull(),
    bulan: tinyint().notNull(), // 1-12, divalidasi Zod di service
    active: boolean().notNull().default(true),
    createdBy: varchar("created_by", { length: 128 })
      .references(() => cmsUsers.id)
      .notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    closedAt: datetime("closed_at"),
  },
  (t) => [unique("uq_sesi_tahun_bulan").on(t.tahun, t.bulan)],
);

// Laporan satu RT dalam satu sesi (Kependudukan + Potensi Desa). Isinya blob
// JSON divalidasi Zod (src/server/types/rtReport.ts) — pola sama dengan
// site_content: ~240 angka per laporan tidak dijadikan kolom masing-masing.
// dusun/rt disalin dari akun saat simpan pertama (snapshot) supaya jejak audit
// tetap benar walau akunnya kelak dipindah wilayah.
export const rtReports = mysqlTable(
  "rt_reports",
  {
    id: varchar({ length: 128 })
      .primaryKey()
      .$defaultFn(() => createId()),
    sessionId: varchar("session_id", { length: 128 })
      .references(() => rtReportSessions.id)
      .notNull(),
    cmsUserId: varchar("cms_user_id", { length: 128 })
      .references(() => cmsUsers.id)
      .notNull(),
    dusun: varchar({ length: 100 }).notNull(),
    rt: varchar({ length: 10 }).notNull(),
    data: json("data").$type<unknown>(),
    // Dicap SEKALI saat laporan pertama kali disimpan — tidak pernah berubah.
    dikumpulkanPada: timestamp("dikumpulkan_pada").defaultNow().notNull(),
    // Bergerak tiap kali diedit; bersama dikumpulkanPada jadi jejak audit
    // "kapan setor, kapan terakhir diubah".
    diperbaruiPada: timestamp("diperbarui_pada").defaultNow().onUpdateNow().notNull(),
  },
  (t) => [unique("uq_laporan_sesi_user").on(t.sessionId, t.cmsUserId)],
);
