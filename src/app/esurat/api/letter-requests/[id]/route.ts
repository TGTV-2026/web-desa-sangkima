import { AppError, pesanAman } from "@/server/utils/appError";
/**
 * @swagger
 * /api/letter-requests/{id}:
 *   get:
 *     tags:
 *       - E-Surat - Pengajuan
 *     summary: "📄 Detail pengajuan surat"
 *     description: Warga hanya boleh melihat miliknya; petugas boleh melihat semua.
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
 *         description: Detail pengajuan
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tidak ditemukan / tidak berhak
 *   patch:
 *     tags:
 *       - E-Surat - Pengajuan
 *     summary: "⚙️ Aksi petugas (proses/setujui/tolak/selesai/edit data)"
 *     description: >
 *       process = operator menerima (DIAJUKAN→DIPROSES);
 *       approve = kepala desa menyetujui (DIPROSES→DISETUJUI, hanya admin);
 *       reject = tolak (wajib reason);
 *       complete = tandai selesai (DISETUJUI→SELESAI);
 *       updateData = petugas merapikan field dinamis pemohon (wajib data, hanya saat status DIAJUKAN).
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [action]
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [process, approve, reject, complete, updateData]
 *               note:
 *                 type: string
 *               reason:
 *                 type: string
 *                 description: Wajib untuk action=reject
 *               data:
 *                 type: object
 *                 description: Wajib untuk action=updateData; field dinamis sesuai requiredFields jenis surat
 *     responses:
 *       200:
 *         description: Status pengajuan diperbarui
 *       400:
 *         description: Validasi gagal / transisi status tidak valid
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Tidak berhak (role tidak sesuai)
 */

import { NextResponse } from "next/server";
import { z } from "zod";
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
    const data = await letterRequestService.getForActor(id, auth);
    return NextResponse.json(
      { success: true, message: "Detail pengajuan berhasil diambil", data },
      { status: 200 },
    );
  } catch (error) {
    if (isACLError(error)) return handleACLError(error);
    return NextResponse.json(
      {
        success: false,
        message: pesanAman(error, "Terjadi kesalahan internal server"),
      },
      { status: 404 },
    );
  }
}

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    // hanya petugas; aturan lebih rinci (approve = admin) ditegakkan di service
    const auth = await requireRole(req, ["staff", "admin"]);

    const { id } = await params;
    const body = await req.json();
    const appUrl = new URL(req.url).origin;
    const data = await letterRequestService.changeStatus(auth, id, body, appUrl);

    return NextResponse.json(
      { success: true, message: "Status pengajuan diperbarui", data },
      { status: 200 },
    );
  } catch (error) {
    if (isACLError(error)) return handleACLError(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi gagal",
          errors: error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }
    // pesan aturan role dari service (mis. approve hanya admin) -> 403
    const isForbidden =
      error instanceof AppError && /berhak|Hanya/i.test(error.message);
    return NextResponse.json(
      {
        success: false,
        message: pesanAman(error, "Terjadi kesalahan internal server"),
      },
      { status: isForbidden ? 403 : 400 },
    );
  }
}
