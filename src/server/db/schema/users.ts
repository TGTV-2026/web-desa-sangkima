import { createId } from "@paralleldrive/cuid2";
import {
  date,
  datetime,
  mysqlEnum,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { positions } from "./positions";

const roles = mysqlEnum(["user", "staff", "admin"]);
export const religions = [
  "islam",
  "kristen",
  "katolik",
  "hindu",
  "buddha",
  "konghucu",
] as const;

export const maritalStatus = [
  "Belum Menikah",
  "Menikah",
  "Cerai Hidup",
  "Cerai Mati",
] as const;

export const educations = [
  "SD/Sederajat",
  "SMP/Sederajat",
  "SMA/Sederajat",
  "D1",
  "D2",
  "D3",
  "S1/Setara D4",
  "S2",
  "S3",
] as const;

export const users = mysqlTable("users", {
  id: varchar({ length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  positionId: varchar("position_id", { length: 128 }).references(
    () => positions.id,
  ),
  name: varchar({ length: 255 }).notNull(),
  nik: varchar({ length: 255 }).notNull().unique(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  role: roles.notNull().default("user"),
  religion: mysqlEnum(religions),
  address: varchar({ length: 255 }),
  birthday: date(),
  placeOfBirth: varchar("place_of_birth", { length: 255 }),
  job: varchar({ length: 255 }),
  gender: mysqlEnum(["L", "P"]),
  telp: varchar({ length: 255 }),
  citizenship: mysqlEnum(["wni", "wna"]),
  status: mysqlEnum(maritalStatus),
  education: mysqlEnum(educations),
  emailVerifiedAt: datetime("email_verified_at"),
  signatureUrl: varchar("signature_url", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  deletedAt: datetime("deleted_at"),
});
