import { pesanAman } from "@/server/utils/appError";
/**
 * @swagger
 * /api/letter-types/validate-template:
 *   post:
 *     tags:
 *       - E-Surat - Jenis Surat
 *     summary: "🔎 Validasi tag template DOCX tanpa menyimpan (admin)"
 *     description: >
 *       Cek tag template terhadap field yang dikirim (tanpa LibreOffice / tanpa
 *       menyimpan berkas atau menyentuh jenis surat). Dipakai untuk menggerbangi
 *       pembuatan jenis surat: jangan buat bila template masih punya tag tak dikenal.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               fields:
 *                 type: string
 *                 description: JSON array requiredFields jenis surat
 *     responses:
 *       200:
 *         description: Template valid, mengembalikan laporan tag
 *       400:
 *         description: Template tidak valid / tag tak dikenal
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Hanya admin
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { letterTypeService } from "@/server/services/letterType.service";
import { AppError } from "@/server/utils/appError";
import { letterFieldDefSchema } from "@/server/types/letter";
import { MAX_DOC_BYTES, MAX_DOC_LABEL } from "@/lib/uploadLimits";
import {
  requireRole,
  handleACLError,
  isACLError,
} from "@/server/middlewares/acl.middleware";

export async function POST(req: Request) {
  try {
    await requireRole(req, ["admin"]);

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new AppError("File template wajib diunggah");
    if (file.size > MAX_DOC_BYTES)
      throw new AppError(`Ukuran template maksimal ${MAX_DOC_LABEL}`);

    const buffer = Buffer.from(await file.arrayBuffer());
    // magic ZIP "PK" — .docx adalah arsip zip; tolak file lain sedini mungkin
    if (buffer.length < 4 || buffer[0] !== 0x50 || buffer[1] !== 0x4b)
      throw new AppError("File harus berformat .docx (Word)");

    const rawFields = form.get("fields");
    const fields = z
      .array(letterFieldDefSchema)
      .parse(typeof rawFields === "string" && rawFields ? JSON.parse(rawFields) : []);

    // Gate hanya cek tag (tanpa LibreOffice) — smoke render terjadi saat unggah/simpan.
    const data = letterTypeService.validateTemplateTags(buffer, fields);
    return NextResponse.json(
      { success: true, message: "Template valid", data },
      { status: 200 },
    );
  } catch (error) {
    if (isACLError(error)) return handleACLError(error);
    return NextResponse.json(
      {
        success: false,
        message: pesanAman(error, "Gagal memvalidasi template"),
        ...(error instanceof AppError && error.detail ? { errors: error.detail } : {}),
      },
      { status: 400 },
    );
  }
}
