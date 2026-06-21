/**
 * @swagger
 * /api/letter-requests/pending-types:
 *   get:
 *     tags:
 *       - E-Surat - Pengajuan
 *     summary: "🔎 Jenis surat dengan pengajuan berjalan milik seorang warga"
 *     description: >
 *       Dipakai petugas saat membuat pengajuan atas nama warga, untuk mengecek lebih dulu
 *       apakah warga yang dipilih masih punya pengajuan jenis surat ini yang belum disetujui.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Daftar letterTypeId yang masih berjalan
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Tidak berhak
 */

import { NextResponse } from "next/server";
import { letterRequestService } from "@/server/services/letterRequest.service";
import {
  requireRole,
  handleACLError,
} from "@/server/middlewares/acl.middleware";

export async function GET(req: Request) {
  try {
    await requireRole(req, ["staff", "admin"]);

    const userId = new URL(req.url).searchParams.get("userId");
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Parameter userId wajib diisi" },
        { status: 400 },
      );
    }

    const data = await letterRequestService.getPendingTypeIds(userId);
    return NextResponse.json(
      { success: true, message: "Daftar jenis surat berjalan berhasil diambil", data },
      { status: 200 },
    );
  } catch (error: any) {
    if (error.name === "ACLError") return handleACLError(error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Terjadi kesalahan internal server",
      },
      { status: 400 },
    );
  }
}
