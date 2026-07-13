"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { rtReportService } from "@/server/services/rtReport.service";
import { requireRtUser, requireSuperAdmin } from "@/server/utils/cmsSession";
import { pesanAksi } from "@/server/utils/appError";
import { catatAksiCms } from "@/server/utils/audit";
import { rtSessionInputSchema, BULAN_LABELS } from "@/server/types/rtReport";

export type LaporanRtResult =
  | { success: true }
  | { success: false; message: string };

/** Ketua RT menyimpan (atau memperbarui) laporannya di sesi aktif. */
export async function simpanLaporanSaya(input: unknown): Promise<LaporanRtResult> {
  const me = await requireRtUser();
  try {
    // baru = belum pernah setor di sesi aktif → aksi "submit", selain itu "update"
    const { report } = await rtReportService.getMyReport(me);
    await rtReportService.saveMyReport(me, input);
    await catatAksiCms(me, report ? "rt_report.update" : "rt_report.submit", {
      targetType: "RT",
      targetId: `${me.dusun ?? "-"} RT ${me.rt ?? "-"}`,
      summary: report
        ? `Memperbarui laporan kependudukan RT ${me.rt} ${me.dusun}.`
        : `Mengumpulkan laporan kependudukan RT ${me.rt} ${me.dusun}.`,
    });
    revalidatePath("/admin/laporan-rt");
    return { success: true };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        success: false,
        message: "Periksa kembali isian — ada angka yang belum valid.",
      };
    }
    return { success: false, message: pesanAksi(err, "Gagal menyimpan laporan.") };
  }
}

/** Super_admin membuka sesi pelaporan (tahun + bulan). */
export async function bukaSesi(input: unknown): Promise<LaporanRtResult> {
  const me = await requireSuperAdmin();
  try {
    await rtReportService.openSession(input, me.id);
    const p = rtSessionInputSchema.safeParse(input);
    const periode = p.success
      ? `${BULAN_LABELS[p.data.bulan - 1]} ${p.data.tahun}`
      : "";
    await catatAksiCms(me, "rt_session.open", {
      targetType: "Sesi RT",
      targetId: periode,
      summary: `Membuka sesi pelaporan RT ${periode}.`,
    });
    revalidatePath("/admin/laporan-rt");
    return { success: true };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, message: "Tahun/bulan tidak valid." };
    }
    return { success: false, message: pesanAksi(err, "Gagal membuka sesi.") };
  }
}

/**
 * Super_admin menutup sesi → arsip terkunci + rekap otomatis ditulis ke
 * statistik dusun publik (service). Halaman profil di-revalidate di sini
 * supaya angka baru langsung tampil ke pengunjung.
 */
export async function tutupSesi(sessionId: string): Promise<LaporanRtResult> {
  const me = await requireSuperAdmin();
  try {
    await rtReportService.closeSession(sessionId, me.id);
    await catatAksiCms(me, "rt_session.close", {
      targetType: "Sesi RT",
      targetId: sessionId,
      summary:
        "Menutup sesi pelaporan RT — rekap kependudukan terbit ke Statistik Dusun publik.",
    });
    revalidatePath("/admin/laporan-rt");
    revalidatePath("/profil"); // statistik dusun publik ikut berubah
    return { success: true };
  } catch (err) {
    return { success: false, message: pesanAksi(err, "Gagal menutup sesi.") };
  }
}
