/**
 * @swagger
 * /api/position:
 *   get:
 *     tags:
 *       - Position
 *     summary: "📋 Daftar jabatan"
 *     description: Mengambil semua jabatan. Membutuhkan login.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar jabatan
 *       401:
 *         description: Unauthorized
 *   post:
 *     tags:
 *       - Position
 *     summary: "➕ Buat jabatan (admin)"
 *     description: Membuat jabatan baru. Hanya untuk admin (kepala desa).
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [category, name]
 *             properties:
 *               category:
 *                 type: string
 *                 example: "Pemerintahan"
 *               name:
 *                 type: string
 *                 example: "Kepala Desa"
 *     responses:
 *       201:
 *         description: Jabatan berhasil dibuat
 *       400:
 *         description: Validasi gagal atau nama sudah dipakai
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Hanya admin yang boleh membuat jabatan
 */

/**
 * @swagger
 * /api/position:
 *   get:
 *     tags:
 *       - Position
 *     summary: "📋 Daftar jabatan"
 *     description: Mengambil semua jabatan. Membutuhkan login.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar jabatan
 *       401:
 *         description: Unauthorized
 *   post:
 *     tags:
 *       - Position
 *     summary: "➕ Buat jabatan (admin)"
 *     description: Membuat jabatan baru. Hanya untuk admin (kepala desa).
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [category, name]
 *             properties:
 *               category:
 *                 type: string
 *                 example: "Pemerintahan"
 *               name:
 *                 type: string
 *                 example: "Kepala Desa"
 *     responses:
 *       201:
 *         description: Jabatan berhasil dibuat
 *       400:
 *         description: Validasi gagal atau nama sudah dipakai
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Hanya admin yang boleh membuat jabatan
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { positionService } from "@/server/services/position.service";
import { getAuthUser } from "@/server/middlewares/role.middleware";
import {
  requireRole,
  handleACLError,
} from "@/server/middlewares/acl.middleware";

export async function GET(req: Request) {
  try {
    await requireRole(req, ["user", "staff", "admin"]);

    const data = await positionService.list();
    return NextResponse.json(
      { success: true, message: "Daftar jabatan berhasil diambil", data },
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
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    await requireRole(req, ["admin"]);

    const body = await req.json();
    const data = await positionService.create(body);

    return NextResponse.json(
      { success: true, message: "Jabatan berhasil dibuat", data },
      { status: 201 },
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
