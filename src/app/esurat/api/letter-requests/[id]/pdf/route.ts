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
} from "@/server/middlewares/acl.middleware";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: RouteContext) {
  try {
    const auth = await requireRole(req, ["user", "staff", "admin"]);

    const { id } = await params;
    const appUrl = new URL(req.url).origin;
    const pdf = await letterRequestService.generatePdf(id, auth, appUrl);

    return new Response(pdf as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="surat-${id}.pdf"`,
      },
    });
  } catch (error: any) {
    if (error.name === "ACLError") return handleACLError(error);
    // pesan kepemilikan dari service (warga bukan pemilik) -> 403
    const isForbidden = /berhak/i.test(error.message || "");
    return Response.json(
      {
        success: false,
        message: error.message || "Terjadi kesalahan internal server",
      },
      { status: isForbidden ? 403 : 400 },
    );
  }
}
