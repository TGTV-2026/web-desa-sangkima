import { pesanAman } from "@/server/utils/appError";
/**
 * @swagger
 * /api/letter-types/{id}/template/preview:
 *   get:
 *     tags:
 *       - E-Surat - Jenis Surat
 *     summary: "👁️ Pratinjau PDF template DOCX (admin)"
 *     description: Render template aktif dengan data contoh + watermark PRATINJAU; placeholder QR/TTD dibiarkan tampak.
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
 *         description: PDF pratinjau
 *       404:
 *         description: Belum ada template
 */

import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { letterTypeService } from "@/server/services/letterType.service";
import {
  requireRole,
  handleACLError,
  isACLError,
} from "@/server/middlewares/acl.middleware";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: RouteContext) {
  try {
    await requireRole(req, ["admin"]);

    const { id } = await params;
    const pdf = await letterTypeService.previewTemplate(id);
    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=\"pratinjau-template.pdf\"",
        // pratinjau selalu dirender ulang dari template terbaru
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (isACLError(error)) return handleACLError(error);
    return NextResponse.json(
      {
        success: false,
        message: pesanAman(error, "Gagal membuat pratinjau"),
      },
      { status: 404 },
    );
  }
}
