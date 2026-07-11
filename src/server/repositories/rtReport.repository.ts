import { and, count, desc, eq } from "drizzle-orm";
import { db } from "../db";
import { cmsUsers, rtReports, rtReportSessions } from "../db/schema";

// Akses data sesi pelaporan & laporan RT. Aturan (sesi aktif, kepemilikan,
// rekap) ada di service.
export const rtReportRepository = {
  // ===== Sesi =====

  async findAllSessions() {
    return db
      .select()
      .from(rtReportSessions)
      .orderBy(desc(rtReportSessions.tahun), desc(rtReportSessions.bulan));
  },

  async findSessionById(id: string) {
    const rows = await db
      .select()
      .from(rtReportSessions)
      .where(eq(rtReportSessions.id, id))
      .limit(1);
    return rows[0];
  },

  async findSessionByPeriode(tahun: number, bulan: number) {
    const rows = await db
      .select()
      .from(rtReportSessions)
      .where(
        and(eq(rtReportSessions.tahun, tahun), eq(rtReportSessions.bulan, bulan)),
      )
      .limit(1);
    return rows[0];
  },

  /** Sesi yang sedang dibuka (harusnya maksimal satu, ditegakkan di service). */
  async findActiveSessions() {
    return db
      .select()
      .from(rtReportSessions)
      .where(eq(rtReportSessions.active, true))
      .orderBy(desc(rtReportSessions.tahun), desc(rtReportSessions.bulan));
  },

  async insertSession(row: typeof rtReportSessions.$inferInsert) {
    await db.insert(rtReportSessions).values(row);
  },

  async updateSession(
    id: string,
    patch: Partial<typeof rtReportSessions.$inferInsert>,
  ) {
    await db.update(rtReportSessions).set(patch).where(eq(rtReportSessions.id, id));
  },

  /** Jumlah laporan per sesi (satu query, untuk daftar sesi & monitoring). */
  async countReportsPerSession() {
    return db
      .select({ sessionId: rtReports.sessionId, jumlah: count() })
      .from(rtReports)
      .groupBy(rtReports.sessionId);
  },

  // ===== Laporan =====

  /** Semua laporan satu sesi + nama ketua RT (join akun) — untuk super_admin. */
  async findReportsBySession(sessionId: string) {
    return db
      .select({
        report: rtReports,
        namaKetua: cmsUsers.name,
      })
      .from(rtReports)
      .innerJoin(cmsUsers, eq(rtReports.cmsUserId, cmsUsers.id))
      .where(eq(rtReports.sessionId, sessionId))
      .orderBy(rtReports.dusun, rtReports.rt);
  },

  /** Laporan milik satu akun RT pada satu sesi (dipakai form RT). */
  async findReportByUser(sessionId: string, cmsUserId: string) {
    const rows = await db
      .select()
      .from(rtReports)
      .where(
        and(
          eq(rtReports.sessionId, sessionId),
          eq(rtReports.cmsUserId, cmsUserId),
        ),
      )
      .limit(1);
    return rows[0];
  },

  /** Riwayat laporan satu akun RT lintas sesi (join sesi untuk label periode). */
  async findReportsByUser(cmsUserId: string) {
    return db
      .select({
        report: rtReports,
        session: rtReportSessions,
      })
      .from(rtReports)
      .innerJoin(rtReportSessions, eq(rtReports.sessionId, rtReportSessions.id))
      .where(eq(rtReports.cmsUserId, cmsUserId))
      .orderBy(desc(rtReportSessions.tahun), desc(rtReportSessions.bulan));
  },

  async insertReport(row: typeof rtReports.$inferInsert) {
    await db.insert(rtReports).values(row);
  },

  /**
   * Update isi laporan. dikumpulkanPada TIDAK ikut di-patch — dicap sekali saat
   * insert dan tak pernah berubah; diperbaruiPada bergerak otomatis (onUpdateNow).
   */
  async updateReportData(id: string, data: unknown) {
    await db.update(rtReports).set({ data }).where(eq(rtReports.id, id));
  },

  /** Semua akun ber-role rt yang aktif — untuk monitoring "siapa belum setor". */
  async findAllRtAccounts() {
    const rows = await db
      .select()
      .from(cmsUsers)
      .where(eq(cmsUsers.role, "rt"))
      .orderBy(cmsUsers.dusun, cmsUsers.rt);
    return rows.filter((r) => !r.deletedAt);
  },
};
