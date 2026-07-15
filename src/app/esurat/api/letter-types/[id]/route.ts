import { pesanAman } from "@/server/utils/appError";
/**
 * @swagger
 * /api/letter-types/{id}:
 *   get:
 *     tags:
 *       - E-Surat - Jenis Surat
 *     summary: "📄 Detail jenis surat"
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
 *         description: Detail jenis surat
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Jenis surat tidak ditemukan
 *   put:
 *     tags:
 *       - E-Surat - Jenis Surat
 *     summary: "✏️ Ubah jenis surat (admin)"
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Jenis surat berhasil diperbarui
 *       400:
 *         description: Validasi gagal
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Hanya admin
 *       404:
 *         description: Tidak ditemukan
 *   delete:
 *     tags:
 *       - E-Surat - Jenis Surat
 *     summary: "🗑️ Hapus jenis surat (admin)"
 *     description: >
 *       Hapus cerdas: jenis surat yang belum pernah dipakai permohonan dihapus
 *       permanen (baris + file template); yang sudah dipakai di-soft-delete
 *       (disembunyikan) agar permohonan lama tetap utuh. Selalu aman.
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
 *         description: Jenis surat dihapus (permanen atau disembunyikan)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Hanya admin
 *       404:
 *         description: Tidak ditemukan
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { letterTypeService } from "@/server/services/letterType.service";
import {
  requireRole,
  handleACLError,
  isACLError,
} from "@/server/middlewares/acl.middleware";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: RouteContext) {
  try {
    await requireRole(req, ["user", "staff", "admin"]);

    const { id } = await params;
    const data = await letterTypeService.getById(id);
    return NextResponse.json(
      { success: true, message: "Jenis surat berhasil diambil", data },
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

export async function PUT(req: Request, { params }: RouteContext) {
  try {
    await requireRole(req, ["admin"]);

    const { id } = await params;
    const body = await req.json();
    const data = await letterTypeService.update(id, body);

    return NextResponse.json(
      { success: true, message: "Jenis surat berhasil diperbarui", data },
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
    return NextResponse.json(
      {
        success: false,
        message: pesanAman(error, "Terjadi kesalahan internal server"),
      },
      { status: 400 },
    );
  }
}

export async function DELETE(req: Request, { params }: RouteContext) {
  try {
    await requireRole(req, ["admin"]);

    const { id } = await params;
    // hapus cerdas: hapus permanen bila belum dipakai, soft delete bila sudah
    const { mode } = await letterTypeService.remove(id);

    return NextResponse.json(
      {
        success: true,
        message:
          mode === "hard"
            ? "Jenis surat dihapus permanen."
            : "Jenis surat dihapus — permohonan lama tetap tersimpan.",
        data: { mode },
      },
      { status: 200 },
    );
  } catch (error) {
    if (isACLError(error)) return handleACLError(error);
    return NextResponse.json(
      {
        success: false,
        message: pesanAman(error, "Terjadi kesalahan internal server"),
      },
      { status: 400 },
    );
  }
}
