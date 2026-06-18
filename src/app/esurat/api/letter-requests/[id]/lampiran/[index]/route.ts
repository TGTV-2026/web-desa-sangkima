/**
 * @swagger
 * /api/letter-requests/{id}/lampiran/{index}:
 *   get:
 *     tags:
 *       - E-Surat - Pengajuan
 *     summary: "📎 Unduh lampiran pendukung"
 *     description: Mengunduh lampiran ke-{index} (mulai 0). Warga hanya boleh mengakses lampiran miliknya; petugas boleh semua.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: index
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: File lampiran
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Tidak berhak
 *       404:
 *         description: Lampiran tidak ditemukan
 */

import {
  requireRole,
  handleACLError,
} from "@/server/middlewares/acl.middleware";
import { letterRequestRepository } from "@/server/repositories/letterRequest.repository";
import { readAttachment } from "@/server/utils/upload";

type RouteContext = { params: Promise<{ id: string; index: string }> };

export async function GET(req: Request, { params }: RouteContext) {
  try {
    const auth = await requireRole(req, ["user", "staff", "admin"]);

    const { id, index } = await params;
    const row = await letterRequestRepository.findById(id);
    if (!row) {
      return Response.json(
        { success: false, message: "Pengajuan tidak ditemukan" },
        { status: 404 },
      );
    }
    if (auth.role === "user" && row.request.userId !== auth.id) {
      return Response.json(
        { success: false, message: "Anda tidak berhak mengakses lampiran ini" },
        { status: 403 },
      );
    }

    const attachments = row.request.attachments ?? [];
    const att = attachments[Number(index)];
    if (!att) {
      return Response.json(
        { success: false, message: "Lampiran tidak ditemukan" },
        { status: 404 },
      );
    }

    const file = await readAttachment(att.storedName);
    if (!file) {
      return Response.json(
        { success: false, message: "File lampiran tidak ditemukan di server" },
        { status: 404 },
      );
    }

    return new Response(file as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": att.mime,
        "Content-Disposition": `inline; filename="${att.name}"`,
      },
    });
  } catch (error: any) {
    if (error.name === "ACLError") return handleACLError(error);
    return Response.json(
      {
        success: false,
        message: error.message || "Terjadi kesalahan internal server",
      },
      { status: 500 },
    );
  }
}
