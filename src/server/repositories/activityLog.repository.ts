import { and, count, desc, eq, gte, like, lte, or, type SQL } from "drizzle-orm";
import { db } from "../db";
import { activityLogs, letterRequestLogs, users } from "../db/schema";
import type { ActivityLogInput, AuditFilter } from "../types/activityLog";

// Rentang tanggal inklusif: `from` mulai 00:00, `to` sampai 23:59:59.999.
function dateBounds(from?: string, to?: string) {
  const conds: SQL[] = [];
  if (from) conds.push(gte(activityLogs.createdAt, new Date(`${from}T00:00:00`)));
  if (to) conds.push(lte(activityLogs.createdAt, new Date(`${to}T23:59:59.999`)));
  return conds;
}

export const activityLogRepository = {
  async insert(entry: ActivityLogInput) {
    await db.insert(activityLogs).values({
      actorType: entry.actorType,
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

  // Baris activity_logs sesuai filter, terbaru dulu.
  async listActivity(f: AuditFilter, limit: number) {
    const conds: SQL[] = [];
    if (f.actorType) conds.push(eq(activityLogs.actorType, f.actorType));
    if (f.action) conds.push(eq(activityLogs.action, f.action));
    conds.push(...dateBounds(f.from, f.to));
    if (f.q) {
      const kw = `%${f.q}%`;
      const byKw = or(
        like(activityLogs.summary, kw),
        like(activityLogs.actorName, kw),
        like(activityLogs.action, kw),
      );
      if (byKw) conds.push(byKw);
    }
    return db
      .select()
      .from(activityLogs)
      .where(conds.length ? and(...conds) : undefined)
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit);
  },

  // Ringkasan untuk halaman Overview: total + hitungan login 24 jam + 7 hari.
  async overviewStats() {
    const d1 = new Date(Date.now() - 24 * 3600 * 1000);
    const d7 = new Date(Date.now() - 7 * 24 * 3600 * 1000);
    const c = (w?: SQL) =>
      db
        .select({ n: count() })
        .from(activityLogs)
        .where(w)
        .then((r) => Number(r[0]?.n ?? 0));
    const [total, gagal24, sukses24, act7] = await Promise.all([
      c(),
      c(and(like(activityLogs.action, "%.login.failed"), gte(activityLogs.createdAt, d1))),
      c(and(like(activityLogs.action, "%.login.success"), gte(activityLogs.createdAt, d1))),
      c(gte(activityLogs.createdAt, d7)),
    ]);
    return { total, gagal24, sukses24, act7 };
  },

  // Log status surat (sumber lama) + nama pengubah, untuk ditampilkan menyatu.
  async listLetterLogs(f: AuditFilter, limit: number) {
    const conds: SQL[] = [];
    if (f.from)
      conds.push(gte(letterRequestLogs.createdAt, new Date(`${f.from}T00:00:00`)));
    if (f.to)
      conds.push(
        lte(letterRequestLogs.createdAt, new Date(`${f.to}T23:59:59.999`)),
      );
    if (f.q) {
      const kw = `%${f.q}%`;
      const byKw = or(like(users.name, kw), like(letterRequestLogs.note, kw));
      if (byKw) conds.push(byKw);
    }
    return db
      .select({
        id: letterRequestLogs.id,
        requestId: letterRequestLogs.requestId,
        status: letterRequestLogs.status,
        note: letterRequestLogs.note,
        actorName: users.name,
        createdAt: letterRequestLogs.createdAt,
      })
      .from(letterRequestLogs)
      .leftJoin(users, eq(letterRequestLogs.changedBy, users.id))
      .where(conds.length ? and(...conds) : undefined)
      .orderBy(desc(letterRequestLogs.createdAt))
      .limit(limit);
  },
};
