import { createId } from "@paralleldrive/cuid2";
import {
    mysqlTable,
    timestamp,
    varchar,
} from "drizzle-orm/mysql-core";

// Daftar kategori jabatan ditegakkan di aplikasi (Zod) saja, bukan di kolom DB
// — kolom tetap varchar supaya tidak perlu migration tiap kali daftar berubah.
export const positionCategories = [
    "Staff",
    "Kepala Urusan",
    "Kepala Seksi",
    "Sekretaris Desa",
    "Wakil Kepala Desa",
    "Kepala Desa",
] as const;

export const positions = mysqlTable("positions", {
    id: varchar({ length: 128 })
        .primaryKey()
        .$defaultFn(() => createId()),
    category: varchar({ length: 255 }).notNull(),
    name: varchar({ length: 255 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
