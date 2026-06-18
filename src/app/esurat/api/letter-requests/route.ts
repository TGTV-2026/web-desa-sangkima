/**
 * @swagger
 * /api/letter-requests:
 *   get:
 *     tags:
 *       - E-Surat - Pengajuan
 *     summary: "📨 Daftar pengajuan surat"
 *     description: Warga melihat pengajuan miliknya sendiri; petugas (staff/admin) melihat semua. Filter dengan ?status=.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DIAJUKAN, DIPROSES, DISETUJUI, DITOLAK, SELESAI]
 *     responses:
 *       200:
 *         description: Daftar pengajuan
 *       401:
 *         description: Unauthorized
 *   post:
 *     tags:
 *       - E-Surat - Pengajuan
 *     summary: "➕ Ajukan surat (warga)"
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [letterTypeId, purpose]
 *             properties:
 *               letterTypeId:
 *                 type: string
 *               purpose:
 *                 type: string
 *                 example: Persyaratan beasiswa
 *               data:
 *                 type: object
 *                 description: Jawaban field tambahan sesuai jenis surat
 *     responses:
 *       201:
 *         description: Pengajuan berhasil dibuat
 *       400:
 *         description: Validasi gagal
 *       401:
 *         description: Unauthorized
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { letterRequestService } from "@/server/services/letterRequest.service";
import {
  requireRole,
  handleACLError,
} from "@/server/middlewares/acl.middleware";
import { LETTER_STATUSES, type LetterStatus } from "@/server/types/letter";
import {
  validateAttachments,
  saveAttachments,
  deleteAttachments,
  type IncomingFile,
} from "@/server/utils/upload";

// Baca body JSON biasa ATAU multipart/form-data (saat ada lampiran).
// Multipart: field teks letterTypeId, purpose, data (JSON string),
// dan file pada key "lampiran" (boleh lebih dari satu).
async function parseCreateBody(req: Request): Promise<{
  body: unknown;
  files: IncomingFile[];
}> {
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return { body: await req.json(), files: [] };
  }

  const fd = await req.formData();
  const rawData = fd.get("data");
  const body = {
    letterTypeId: fd.get("letterTypeId"),
    purpose: fd.get("purpose"),
    data: typeof rawData === "string" && rawData ? JSON.parse(rawData) : undefined,
  };

  const files: IncomingFile[] = [];
  for (const entry of fd.getAll("lampiran")) {
    if (entry instanceof File && entry.size > 0) {
      files.push({
        name: entry.name,
        mime: entry.type,
        size: entry.size,
        buffer: Buffer.from(await entry.arrayBuffer()),
      });
    }
  }
  return { body, files };
}

export async function GET(req: Request) {
  try {
    const auth = await requireRole(req, ["user", "staff", "admin"]);

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");
    const status =
      statusParam && LETTER_STATUSES.includes(statusParam as LetterStatus)
        ? (statusParam as LetterStatus)
        : undefined;

    const data =
      auth.role === "user"
        ? await letterRequestService.listForUser(auth.id, status)
        : await letterRequestService.listAll(status);

    return NextResponse.json(
      { success: true, message: "Daftar pengajuan berhasil diambil", data },
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
  let saved: Awaited<ReturnType<typeof saveAttachments>> = [];
  try {
    const auth = await requireRole(req, ["user", "staff", "admin"]);

    const { body, files } = await parseCreateBody(req);
    validateAttachments(files);
    saved = await saveAttachments(files);

    const data = await letterRequestService.create(auth, body, saved);

    return NextResponse.json(
      { success: true, message: "Pengajuan surat berhasil dibuat", data },
      { status: 201 },
    );
  } catch (error: any) {
    // rollback file yang terlanjur tersimpan bila pengajuan gagal dibuat
    if (saved.length > 0) await deleteAttachments(saved);
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
