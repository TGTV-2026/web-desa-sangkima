"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { rtReportService } from "@/server/services/rtReport.service";
import { requireRtUser, requireSuperAdmin } from "@/server/utils/cmsSession";
import { pesanAksi } from "@/server/utils/appError";

export type LaporanRtResult =
  | { success: true }
  | { success: false; message: string };

/** Ketua RT menyimpan (atau memperbarui) laporannya di sesi aktif. */
export async function simpanLaporanSaya(input: unknown): Promise<LaporanRtResult> {
  const me = await requireRtUser();
  try {
    await rtReportService.saveMyReport(me, input);
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
    revalidatePath("/admin/laporan-rt");
    revalidatePath("/profil"); // statistik dusun publik ikut berubah
    return { success: true };
  } catch (err) {
    return { success: false, message: pesanAksi(err, "Gagal menutup sesi.") };
  }
}
