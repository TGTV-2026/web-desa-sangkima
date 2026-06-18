/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     tags:
 *       - Users
 *     summary: "👤 Profil user yang sedang login"
 *     description: Mengambil data profil user yang sedang login berdasarkan token.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Data profil berhasil diambil
 *       401:
 *         description: Unauthorized — token tidak ada atau tidak valid
 *   put:
 *     tags:
 *       - Users
 *     summary: "✏️ Update profil sendiri"
 *     description: |
 *       Warga melengkapi/memperbarui data kependudukan profil sendiri.
 *       **Semua field wajib diisi** — endpoint ini khusus untuk memastikan kelengkapan profil.
 *       Tidak bisa mengubah field sensitif (role, password, email, nik).
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [gender, placeOfBirth, birthday, religion, address, job, telp, citizenship, status, education]
 *             properties:
 *               gender:
 *                 type: string
 *                 enum: [L, P]
 *                 example: "L"
 *               placeOfBirth:
 *                 type: string
 *                 example: "Sangkima"
 *               birthday:
 *                 type: string
 *                 pattern: "^\\d{4}-\\d{2}-\\d{2}$"
 *                 example: "1990-01-15"
 *               religion:
 *                 type: string
 *                 enum: [islam, kristen, katolik, hindu, buddha, konghucu]
 *                 example: "islam"
 *               address:
 *                 type: string
 *                 example: "Jl. Merdeka No. 1, Sangkima"
 *               job:
 *                 type: string
 *                 example: "Petani"
 *               telp:
 *                 type: string
 *                 example: "081234567890"
 *               citizenship:
 *                 type: string
 *                 enum: [wni, wna]
 *                 example: "wni"
 *               status:
 *                 type: string
 *                 enum: ["Belum Menikah", "Menikah", "Cerai Hidup", "Cerai Mati"]
 *                 example: "Belum Menikah"
 *               education:
 *                 type: string
 *                 enum: ["SD/Sederajat", "SMP/Sederajat", "SMA/Sederajat", "D1", "D2", "D3", "S1/Setara D4", "S2", "S3"]
 *                 example: "S1/Setara D4"
 *     responses:
 *       200:
 *         description: Profil berhasil diperbarui
 *       400:
 *         description: Validasi gagal
 *       401:
 *         description: Unauthorized — token tidak ada atau tidak valid
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { userService } from "@/server/services/user.service";
import {
  requireRole,
  handleACLError,
} from "@/server/middlewares/acl.middleware";

export async function GET(req: Request) {
  try {
    const auth = await requireRole(req, ["user", "staff", "admin"]);
    const data = await userService.getById(auth.id);

    return NextResponse.json(
      { success: true, message: "Profil berhasil diambil", data },
      { status: 200 },
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "ACLError")
      return handleACLError(error);
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan internal server";
    return NextResponse.json(
      { success: false, message },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const auth = await requireRole(req, ["user", "staff", "admin"]);
    const body = await req.json();
    const data = await userService.updateProfile(auth.id, body);

    return NextResponse.json(
      { success: true, message: "Profil berhasil diperbarui", data },
      { status: 200 },
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "ACLError")
      return handleACLError(error);
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
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan internal server";
    const isNotFound = message.includes("tidak ditemukan");
    return NextResponse.json(
      { success: false, message },
      { status: isNotFound ? 404 : 400 },
    );
  }
}
