/**
 * @swagger
 * /api/position/{id}:
 *   get:
 *     tags:
 *       - Position
 *     summary: "📋 Detail jabatan"
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
 *         description: Detail jabatan
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Jabatan tidak ditemukan
 *   put:
 *     tags:
 *       - Position
 *     summary: "✏️ Ubah jabatan (admin)"
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
 *             properties:
 *               category:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Jabatan berhasil diperbarui
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
 *       - Position
 *     summary: "🚫 Hapus jabatan (admin)"
 *     description: Menghapus jabatan permanen.
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
 *         description: Jabatan berhasil dihapus
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Hanya admin
 *       404:
 *         description: Tidak ditemukan
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { positionService } from "@/server/services/position.service";
import {
  requireRole,
  handleACLError,
} from "@/server/middlewares/acl.middleware";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: RouteContext) {
  try {
    await requireRole(req, ["user", "staff", "admin"]);

    const { id } = await params;
    const data = await positionService.getById(id);
    return NextResponse.json(
      { success: true, message: "Jabatan berhasil diambil", data },
      { status: 200 },
    );
  } catch (error: any) {
    if (error.name === "ACLError") {
      return handleACLError(error);
    }
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Terjadi kesalahan internal server",
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
    const data = await positionService.update(id, body);

    return NextResponse.json(
      { success: true, message: "Jabatan berhasil diperbarui", data },
      { status: 200 },
    );
  } catch (error: any) {
    if (error.name === "ACLError") {
      return handleACLError(error);
    }
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
        message: error.message || "Terjadi kesalahan internal server",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(req: Request, { params }: RouteContext) {
  try {
    await requireRole(req, ["admin"]);

    const { id } = await params;
    await positionService.delete(id);

    return NextResponse.json(
      { success: true, message: "Jabatan berhasil dihapus" },
      { status: 200 },
    );
  } catch (error: any) {
    if (error.name === "ACLError") {
      return handleACLError(error);
    }
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Terjadi kesalahan internal server",
      },
      { status: 404 },
    );
  }
}
