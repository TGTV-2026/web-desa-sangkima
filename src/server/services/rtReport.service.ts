import { AppError } from "../utils/appError";
import { rtReportRepository } from "../repositories/rtReport.repository";
import { siteContentService } from "./siteContent.service";
import {
  BULAN_LABELS,
  hitungJml,
  laporanKosong,
  rtReportDataSchema,
  rtSessionInputSchema,
  type RekapDusunDTO,
  type RtReportData,
  type RtReportDTO,
  type RtSessionDTO,
} from "../types/rtReport";
import type { CmsSessionUser } from "../utils/cmsSession";

type SessionRow = NonNullable<
  Awaited<ReturnType<typeof rtReportRepository.findSessionById>>
>;

function toSessionDTO(row: SessionRow, jumlahLaporan: number): RtSessionDTO {
  return {
    id: row.id,
    tahun: row.tahun,
    bulan: row.bulan,
    bulanLabel: BULAN_LABELS[row.bulan - 1] ?? String(row.bulan),
    active: row.active,
    createdAt: row.createdAt,
    closedAt: row.closedAt,
    jumlahLaporan,
  };
}

/** Parse blob JSON dari DB — data usang/rusak dinormalkan, bukan bikin crash. */
function parseData(raw: unknown): RtReportData {
  const parsed = rtReportDataSchema.safeParse(raw ?? {});
  return parsed.success ? parsed.data : laporanKosong();
}

export const rtReportService = {
  // ===== Sesi (super_admin) =====

  async listSessions(): Promise<RtSessionDTO[]> {
    const [sessions, counts] = await Promise.all([
      rtReportRepository.findAllSessions(),
      rtReportRepository.countReportsPerSession(),
    ]);
    const byId = new Map(counts.map((c) => [c.sessionId, c.jumlah]));
    return sessions.map((s) => toSessionDTO(s, byId.get(s.id) ?? 0));
  },

  /**
   * Buka sesi baru. Hanya boleh ada SATU sesi aktif — kalau dua sesi terbuka
   * bersamaan, ketua RT tidak tahu sedang mengisi periode yang mana.
   */
  async openSession(input: unknown, createdBy: string): Promise<void> {
    const { tahun, bulan } = rtSessionInputSchema.parse(input);

    const aktif = await rtReportRepository.findActiveSessions();
    if (aktif.length > 0) {
      const a = aktif[0];
      throw new AppError(
        `Masih ada sesi aktif (${BULAN_LABELS[a.bulan - 1]} ${a.tahun}). Tutup dulu sebelum membuka sesi baru.`,
      );
    }

    const existing = await rtReportRepository.findSessionByPeriode(tahun, bulan);
    if (existing) {
      // Periode lama dibuka ulang (mis. ada RT yang telat setor) — bukan bikin
      // baris baru, cukup diaktifkan lagi.
      await rtReportRepository.updateSession(existing.id, {
        active: true,
        closedAt: null,
      });
      return;
    }

    await rtReportRepository.insertSession({ tahun, bulan, createdBy });
  },

  /**
   * Tutup sesi → arsip terkunci. Di momen inilah rekap ditulis ke statistik
   * dusun publik — bukan tiap kali RT menyimpan, supaya pengunjung tidak pernah
   * melihat angka setengah jadi saat baru sebagian RT setor.
   */
  async closeSession(sessionId: string, closedBy: string): Promise<void> {
    const session = await rtReportRepository.findSessionById(sessionId);
    if (!session) throw new AppError("Sesi tidak ditemukan");
    if (!session.active) throw new AppError("Sesi sudah ditutup");

    await rtReportRepository.updateSession(sessionId, {
      active: false,
      closedAt: new Date(),
    });

    await this.terbitkanRekapKeStatistik(sessionId, closedBy);
  },

  /** Rekap KK/Lk/Pr per dusun dari seluruh laporan satu sesi. */
  async rekapPerDusun(sessionId: string): Promise<RekapDusunDTO[]> {
    const rows = await rtReportRepository.findReportsBySession(sessionId);
    const byDusun = new Map<string, RekapDusunDTO>();
    for (const { report } of rows) {
      const data = parseData(report.data);
      const kk = data.kependudukan.keadaanPenduduk["Jumlah KK"];
      const penduduk = data.kependudukan.keadaanPenduduk["Jml Penduduk"];
      const cur = byDusun.get(report.dusun) ?? {
        dusun: report.dusun,
        kk: 0,
        lakiLaki: 0,
        perempuan: 0,
        jumlahRtSetor: 0,
      };
      cur.kk += hitungJml(kk);
      cur.lakiLaki += penduduk.lk;
      cur.perempuan += penduduk.pr;
      cur.jumlahRtSetor += 1;
      byDusun.set(report.dusun, cur);
    }
    return [...byDusun.values()].sort((a, b) => a.dusun.localeCompare(b.dusun));
  },

  /**
   * Tulis rekap sesi ke konten statistikDusun (halaman profil publik).
   * Dusun yang tak punya laporan di sesi ini TIDAK di-nol-kan — angka lamanya
   * dipertahankan, karena tak setor ≠ penduduknya hilang.
   */
  async terbitkanRekapKeStatistik(
    sessionId: string,
    updatedBy: string,
  ): Promise<void> {
    const session = await rtReportRepository.findSessionById(sessionId);
    if (!session) throw new AppError("Sesi tidak ditemukan");

    const rekap = await this.rekapPerDusun(sessionId);
    if (rekap.length === 0) return; // tak ada laporan → statistik tak disentuh

    const statistik = await siteContentService.get("statistikDusun");
    const byDusun = new Map(rekap.map((r) => [r.dusun, r]));
    const dusunBaru = statistik.dusun.map((d) => {
      const r = byDusun.get(d.nama);
      return r
        ? { nama: d.nama, lakiLaki: r.lakiLaki, perempuan: r.perempuan, kk: r.kk }
        : d;
    });

    await siteContentService.update(
      "statistikDusun",
      {
        keterangan: `Sumber: Laporan RT periode ${BULAN_LABELS[session.bulan - 1]} ${session.tahun}`,
        dusun: dusunBaru,
      },
      updatedBy,
    );
  },

  // ===== Laporan (super_admin melihat; RT mengisi) =====

  async getSessionDetail(sessionId: string): Promise<{
    session: RtSessionDTO;
    reports: RtReportDTO[];
    /** akun RT aktif yang BELUM setor di sesi ini — untuk monitoring */
    belumSetor: { nama: string; dusun: string; rt: string }[];
  }> {
    const session = await rtReportRepository.findSessionById(sessionId);
    if (!session) throw new AppError("Sesi tidak ditemukan");

    const [rows, semuaRt] = await Promise.all([
      rtReportRepository.findReportsBySession(sessionId),
      rtReportRepository.findAllRtAccounts(),
    ]);

    const reports: RtReportDTO[] = rows.map(({ report, namaKetua }) => ({
      id: report.id,
      sessionId: report.sessionId,
      cmsUserId: report.cmsUserId,
      namaKetua,
      dusun: report.dusun,
      rt: report.rt,
      data: parseData(report.data),
      dikumpulkanPada: report.dikumpulkanPada,
      diperbaruiPada: report.diperbaruiPada,
    }));

    const sudah = new Set(rows.map((r) => r.report.cmsUserId));
    const belumSetor = semuaRt
      .filter((u) => !sudah.has(u.id))
      .map((u) => ({ nama: u.name, dusun: u.dusun ?? "-", rt: u.rt ?? "-" }));

    return {
      session: toSessionDTO(session, reports.length),
      reports,
      belumSetor,
    };
  },

  // ===== Sisi ketua RT =====

  /** Sesi yang sedang dibuka (null bila tidak ada). */
  async getActiveSession(): Promise<RtSessionDTO | null> {
    const aktif = await rtReportRepository.findActiveSessions();
    if (aktif.length === 0) return null;
    const counts = await rtReportRepository.countReportsPerSession();
    const jumlah = counts.find((c) => c.sessionId === aktif[0].id)?.jumlah ?? 0;
    return toSessionDTO(aktif[0], jumlah);
  },

  /** Laporan milik akun RT pada sesi aktif; null bila belum pernah menyimpan. */
  async getMyReport(user: CmsSessionUser): Promise<{
    session: RtSessionDTO | null;
    report: RtReportDTO | null;
  }> {
    const session = await this.getActiveSession();
    if (!session) return { session: null, report: null };

    const row = await rtReportRepository.findReportByUser(session.id, user.id);
    if (!row) return { session, report: null };

    return {
      session,
      report: {
        id: row.id,
        sessionId: row.sessionId,
        cmsUserId: row.cmsUserId,
        namaKetua: user.name,
        dusun: row.dusun,
        rt: row.rt,
        data: parseData(row.data),
        dikumpulkanPada: row.dikumpulkanPada,
        diperbaruiPada: row.diperbaruiPada,
      },
    };
  },

  /**
   * Simpan (atau perbarui) laporan milik akun RT pada sesi aktif.
   * dikumpulkanPada dicap sekali saat simpan pertama; edit berikutnya hanya
   * menggeser diperbaruiPada — dua-duanya jejak audit yang diminta desa.
   */
  async saveMyReport(user: CmsSessionUser, input: unknown): Promise<void> {
    if (user.role !== "rt") {
      throw new AppError("Hanya akun Ketua RT yang boleh mengisi laporan");
    }
    if (!user.dusun || !user.rt) {
      throw new AppError(
        "Akun Anda belum punya data dusun/RT — hubungi admin desa.",
      );
    }

    const aktif = await rtReportRepository.findActiveSessions();
    if (aktif.length === 0) {
      throw new AppError(
        "Belum ada sesi pelaporan yang dibuka. Tunggu admin desa membuka sesi.",
      );
    }
    const session = aktif[0];

    const data = rtReportDataSchema.parse(input);

    const existing = await rtReportRepository.findReportByUser(
      session.id,
      user.id,
    );
    if (existing) {
      await rtReportRepository.updateReportData(existing.id, data);
    } else {
      await rtReportRepository.insertReport({
        sessionId: session.id,
        cmsUserId: user.id,
        dusun: user.dusun,
        rt: user.rt,
        data,
      });
    }
  },

  /** Riwayat laporan akun RT sendiri lintas sesi (arsip yang sudah ditutup). */
  async getMyHistory(
    user: CmsSessionUser,
  ): Promise<{ periode: string; dikumpulkanPada: Date; diperbaruiPada: Date }[]> {
    const rows = await rtReportRepository.findReportsByUser(user.id);
    return rows.map(({ report, session }) => ({
      periode: `${BULAN_LABELS[session.bulan - 1]} ${session.tahun}`,
      dikumpulkanPada: report.dikumpulkanPada,
      diperbaruiPada: report.diperbaruiPada,
    }));
  },
};
