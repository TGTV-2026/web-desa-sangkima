import {
  bigint,
  index,
  json,
  mysqlEnum,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// Audit log aktivitas akun & data (lihat PRD Audit Log v0.2). Satu tabel
// terpusat untuk aksi penting dari DUA sistem akun (warga E-Surat & CMS) plus
// modul CMS/RT. Log status surat tetap di letter_request_logs — di halaman
// audit keduanya ditampilkan menyatu, bukan diduplikasi ke sini.
//
// Sengaja TANPA foreign key ke users/cms_users: actor_id boleh menunjuk salah
// satu tabel (dibedakan actor_type) atau NULL (login gagal / event sistem),
// dan actor_name disimpan sebagai snapshot supaya jejak "siapa" tetap terbaca
// walau akunnya kelak dihapus.
export const activityLogs = mysqlTable(
  "activity_logs",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    // sistem akun mana, atau event yang dibuat sistem
    actorType: mysqlEnum("actor_type", ["warga", "cms", "system"]).notNull(),
    // id di tabel users / cms_users; NULL untuk login gagal email tak dikenal / system
    actorId: varchar("actor_id", { length: 128 }),
    // snapshot nama pelaku — bertahan walau akun dihapus
    actorName: varchar("actor_name", { length: 255 }),
    // kode aksi terstruktur, mis. "cms_user.role_change" (lihat ACTION_LABELS)
    action: varchar({ length: 64 }).notNull(),
    // jenis & id objek yang dikenai aksi (opsional)
    targetType: varchar("target_type", { length: 40 }),
    targetId: varchar("target_id", { length: 128 }),
    // ringkasan bahasa manusia untuk tampilan cepat
    summary: varchar({ length: 500 }).notNull(),
    // detail tambahan: { before, after, jumlah, key, ... } — tak menyimpan sandi/token
    metadata: json("metadata").$type<Record<string, unknown>>(),
    // IPv4/IPv6, dicatat seperlunya
    ipAddress: varchar("ip_address", { length: 45 }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [
    index("idx_activity_actor").on(t.actorType, t.actorId),
    index("idx_activity_action").on(t.action),
    index("idx_activity_created").on(t.createdAt),
  ],
);
