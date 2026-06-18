/**
 * @swagger
 * /api/letter-requests/verify/{code}:
 *   get:
 *     tags:
 *       - E-Surat - Pengajuan
 *     summary: "🔎 Verifikasi keaslian surat (publik)"
 *     description: Endpoint publik (tanpa login) untuk memverifikasi keaslian surat lewat kode QR.
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Hasil verifikasi (valid true/false)
 */

import { letterRequestService } from "@/server/services/letterRequest.service";

type RouteContext = { params: Promise<{ code: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const { code } = await params;
    const data = await letterRequestService.verifyByCode(code);
    return Response.json(
      { success: true, message: "Hasil verifikasi", data },
      { status: 200 },
    );
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        message: error.message || "Terjadi kesalahan internal server",
      },
      { status: 500 },
    );
  }
}
