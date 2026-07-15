import { AppError, pesanAman } from "@/server/utils/appError";
/**
 * @swagger
 * /api/letter-requests/{id}/pdf:
 *   get:
 *     tags:
 *       - E-Surat - Pengajuan
 *     summary: "📄 Unduh surat (PDF)"
 *     description: Mengunduh surat dalam format PDF (dengan QR verifikasi). Hanya untuk surat berstatus DISETUJUI/SELESAI. Warga hanya boleh mengunduh miliknya.
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
 *         description: File PDF surat
 *         content:
 *           application/pdf: {}
 *       400:
 *         description: Surat belum disetujui
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
    const url = new URL(req.url);
    // di balik reverse proxy (Coolify) req.url origin = host internal container → pakai env dulu
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || url.origin;
    const noSignature = url.searchParams.get("nosig") === "1";
    const signatoryId = url.searchParams.get("signatoryId") ?? undefined;
    
    const pdf = await letterRequestService.generatePdf(id, auth, appUrl, noSignature, signatoryId);

    const filename = noSignature ? `surat-${id}-nosig.pdf` : `surat-${id}.pdf`;

    return new Response(pdf as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });
  } catch (error) {
    if (isACLError(error)) return handleACLError(error);
    // pesan kepemilikan dari service (warga bukan pemilik) -> 403
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
