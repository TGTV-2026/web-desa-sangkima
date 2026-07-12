import {
  bigint,
  index,
  json,
  mysqlEnum,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { ACTOR_TYPES } from "../../types/activityLog";

// Audit log terpusat (PRD AuditLog v0.2, bagian 9.1). Append-only secara aplikasi:
// tak ada jalur update/hapus di kode. Ikut backup DB yang sama.
export const activityLogs = mysqlTable(
  "activity_logs",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    // sistem akun mana, atau event yang dihasilkan sistem
    actorType: mysqlEnum("actor_type", ACTOR_TYPES).notNull(),
    // id di tabel users / cms_users (NULL untuk login gagal email tak dikenal / system)
    actorId: varchar("actor_id", { length: 128 }),
    // SNAPSHOT nama — bertahan terbaca walau akun dihapus (pola author_name)
    actorName: varchar("actor_name", { length: 255 }),
    // kode aksi terstruktur, lihat types/activityLog.ts
    action: varchar("action", { length: 64 }).notNull(),
    targetType: varchar("target_type", { length: 40 }),
    targetId: varchar("target_id", { length: 128 }),
    // ringkasan bahasa manusia untuk tampilan cepat
    summary: varchar("summary", { length: 500 }).notNull(),
    // { before, after, jumlah, key, ... }
    metadata: json("metadata").$type<Record<string, unknown>>(),
    ipAddress: varchar("ip_address", { length: 45 }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [
    index("idx_activity_actor").on(t.actorType, t.actorId),
    index("idx_activity_action").on(t.action),
    index("idx_activity_created").on(t.createdAt),
  ],
);
