import { and, desc, eq, gte, like, lte, or, type SQL } from "drizzle-orm";
import { db } from "../db";
import {
  activityLogs,
  letterRequestLogs,
  letterRequests,
  users,
} from "../db/schema";
import type { ActivityLogInput } from "../types/activityLog";

// Akses data audit log. Penggabungan dua sumber (activity_logs +
// letter_request_logs) & pembentukan DTO ada di service.
export const activityLogRepository = {
  async insert(entry: ActivityLogInput & { actorType: string }) {
    await db.insert(activityLogs).values({
      actorType: entry.actorType as "warga" | "cms" | "system",
      actorId: entry.actorId ?? null,
      actorName: entry.actorName ?? null,
      action: entry.action,
      targetType: entry.targetType ?? null,
      targetId: entry.targetId ?? null,
      summary: entry.summary,
      metadata: entry.metadata ?? null,
      ipAddress: entry.ipAddress ?? null,
    });
  },

  /** Baris activity_logs dalam rentang waktu. Filter aktor/aksi/teks di sini. */
  async listActivity(opts: {
    actorType?: string;
    actions?: string[];
    dari?: Date;
    sampai?: Date;
    q?: string;
    limit: number;
  }) {
    const conds: SQL[] = [];
    if (opts.actorType) {
      conds.push(eq(activityLogs.actorType, opts.actorType as "warga" | "cms" | "system"));
    }
    if (opts.actions && opts.actions.length > 0) {
      const ors = opts.actions.map((a) => eq(activityLogs.action, a));
      const combined = or(...ors);
      if (combined) conds.push(combined);
    }
    if (opts.dari) conds.push(gte(activityLogs.createdAt, opts.dari));
    if (opts.sampai) conds.push(lte(activityLogs.createdAt, opts.sampai));
    if (opts.q) {
      const q = `%${opts.q}%`;
      const combined = or(
        like(activityLogs.summary, q),
        like(activityLogs.actorName, q),
        like(activityLogs.action, q),
      );
      if (combined) conds.push(combined);
    }
    return db
      .select()
      .from(activityLogs)
      .where(conds.length ? and(...conds) : undefined)
      .orderBy(desc(activityLogs.createdAt))
      .limit(opts.limit);
  },

  /**
   * Baris letter_request_logs (status surat) + nama pengubah + nomor surat,
   * untuk ditampilkan menyatu di halaman audit. Rentang waktu diterapkan;
   * filter aktor/aksi non-surat ditangani di service (kalau memfilter kategori
   * selain "surat", sumber ini dilewati).
   */
  async listLetterLogs(opts: { dari?: Date; sampai?: Date; q?: string; limit: number }) {
    const conds: SQL[] = [];
    if (opts.dari) conds.push(gte(letterRequestLogs.createdAt, opts.dari));
    if (opts.sampai) conds.push(lte(letterRequestLogs.createdAt, opts.sampai));
    if (opts.q) {
      const q = `%${opts.q}%`;
      const combined = or(
        like(users.name, q),
        like(letterRequests.letterNumber, q),
        like(letterRequestLogs.note, q),
      );
      if (combined) conds.push(combined);
    }
    return db
      .select({
        id: letterRequestLogs.id,
        status: letterRequestLogs.status,
        note: letterRequestLogs.note,
        actorName: users.name,
        letterNumber: letterRequests.letterNumber,
        requestId: letterRequestLogs.requestId,
        createdAt: letterRequestLogs.createdAt,
      })
      .from(letterRequestLogs)
      .leftJoin(users, eq(letterRequestLogs.changedBy, users.id))
      .leftJoin(letterRequests, eq(letterRequestLogs.requestId, letterRequests.id))
      .where(conds.length ? and(...conds) : undefined)
      .orderBy(desc(letterRequestLogs.createdAt))
      .limit(opts.limit);
  },
};
