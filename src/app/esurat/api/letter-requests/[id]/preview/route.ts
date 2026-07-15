import { AppError, pesanAman } from "@/server/utils/appError";
/**
 * @swagger
 * /api/letter-requests/{id}/preview:
 *   get:
 *     tags:
 *       - E-Surat - Pengajuan
 *     summary: "👁️ Pratinjau surat (semua status)"
 *     description: >
 *       Pratinjau bentuk jadi surat sebelum disetujui. Untuk status DISETUJUI/SELESAI
 *       menampilkan PDF resmi yang sudah terbit; status lain dirender langsung sebagai
 *       draft (tanpa nomor surat/QR resmi, ditandai watermark "PRATINJAU"). Warga hanya
 *       boleh melihat miliknya.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File PDF pratinjau
 *         content:
 *           application/pdf: {}
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Tidak berhak
 */

import { letterRequestService } from "@/server/services/letterRequest.service";
import {
  requireRole,
  handleACLError,
  isACLError,
} from "@/server/middlewares/acl.middleware";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: RouteContext) {
  try {
    const auth = await requireRole(req, ["user", "staff", "admin"]);

    const { id } = await params;
    // di balik reverse proxy (Coolify) req.url origin = host internal container → pakai env dulu
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
    const pdf = await letterRequestService.previewPdf(id, auth, appUrl);

    return new Response(pdf as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="pratinjau-surat-${id}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (isACLError(error)) return handleACLError(error);
    const isForbidden =
      error instanceof AppError && /berhak/i.test(error.message);
    return Response.json(
      {
        success: false,
        message: pesanAman(error, "Terjadi kesalahan internal server"),
      },
      { status: isForbidden ? 403 : 400 },
    );
  }
}
