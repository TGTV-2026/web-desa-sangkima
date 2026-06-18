/**
 * @swagger
 * /api/letter-types:
 *   get:
 *     tags:
 *       - E-Surat - Jenis Surat
 *     summary: "📄 Daftar jenis surat"
 *     description: Mengambil semua jenis surat. Gunakan query ?active=true untuk hanya yang aktif. Membutuhkan login.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Jika true, hanya jenis surat yang aktif
 *     responses:
 *       200:
 *         description: Daftar jenis surat
 *       401:
 *         description: Unauthorized
 *   post:
 *     tags:
 *       - E-Surat - Jenis Surat
 *     summary: "➕ Buat jenis surat (admin)"
 *     description: Membuat jenis surat baru. Hanya untuk admin (kepala desa).
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, name]
 *             properties:
 *               code:
 *                 type: string
 *                 example: SKD
 *               name:
 *                 type: string
 *                 example: Surat Keterangan Domisili
 *               description:
 *                 type: string
 *               template:
 *                 type: string
 *               requiredFields:
 *                 type: array
 *                 items:
 *                   type: object
 *               active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Jenis surat berhasil dibuat
 *       400:
 *         description: Validasi gagal atau kode sudah dipakai
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Hanya admin yang boleh membuat jenis surat
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { letterTypeService } from "@/server/services/letterType.service";
import {
  requireRole,
  handleACLError,
} from "@/server/middlewares/acl.middleware";

export async function GET(req: Request) {
  try {
    await requireRole(req, ["user", "staff", "admin"]);

    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("active") === "true";

    const data = await letterTypeService.list(activeOnly);
    return NextResponse.json(
      { success: true, message: "Daftar jenis surat berhasil diambil", data },
      { status: 200 },
    );
  } catch (error: any) {
    if (error.name === "ACLError") return handleACLError(error);
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
    const data = await letterTypeService.create(body);

    return NextResponse.json(
      { success: true, message: "Jenis surat berhasil dibuat", data },
      { status: 201 },
    );
  } catch (error: any) {
    if (error.name === "ACLError") return handleACLError(error);
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
