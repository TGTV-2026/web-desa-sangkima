import {
  bigint,
  datetime,
  json,
  mysqlEnum,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { cmsUsers } from "./cmsUsers";

// Token OTP milik akun CMS: verifikasi email akun baru, ganti email (OTP ke
// email baru), & lupa kata sandi (OTP ke email terdaftar). Tabel TERPISAH dari
// `user_tokens` karena FK di sana menunjuk `users` (akun warga e-surat),
// sedangkan akun CMS hidup di `cms_users`.
// meta = { newEmail } khusus untuk tipe EmailChange.
export const cmsUserTokens = mysqlTable("cms_user_tokens", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  cmsUserId: varchar("cms_user_id", { length: 128 })
    .references(() => cmsUsers.id)
    .notNull(),
  token: varchar({ length: 255 }).notNull(),
  type: mysqlEnum(["EmailVerify", "EmailChange", "PasswordReset"]).notNull(),
  meta: json("meta"),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: datetime("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});
