import { pesanAman } from "@/server/utils/appError";
/**
 * @swagger
 * /api/letter-types/{id}/template:
 *   post:
 *     tags:
 *       - E-Surat - Jenis Surat
 *     summary: "📎 Unggah template DOCX (admin)"
 *     description: Validasi tag template, smoke-render PDF data dummy, lalu jadikan template aktif jenis surat ini.
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Template tersimpan, mengembalikan laporan tag
 *       400:
 *         description: Template tidak valid / tag tak dikenal
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Hanya admin
 *   get:
 *     tags:
 *       - E-Surat - Jenis Surat
 *     summary: "⬇️ Unduh template DOCX aktif (admin)"
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
 *         description: File .docx
 *       404:
 *         description: Belum ada template
 *   delete:
 *     tags:
 *       - E-Surat - Jenis Surat
 *     summary: "🗑️ Lepas template DOCX (admin)"
 *     description: Jenis surat kembali memakai render bawaan; file lama tetap diarsip di server.
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
 *         description: Template dilepas
 */

import { NextResponse } from "next/server";
import { letterTypeService } from "@/server/services/letterType.service";
import { docxTemplateService } from "@/server/services/docxTemplate.service";
import { AppError } from "@/server/utils/appError";
import { MAX_DOC_BYTES, MAX_DOC_LABEL } from "@/lib/uploadLimits";
import {
  requireRole,
  handleACLError,
  isACLError,
} from "@/server/middlewares/acl.middleware";

type RouteContext = { params: Promise<{ id: string }> };

const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export async function POST(req: Request, { params }: RouteContext) {
  try {
    await requireRole(req, ["admin"]);

    const { id } = await params;
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new AppError("File template wajib diunggah");
    if (file.size > MAX_DOC_BYTES)
      throw new AppError(`Ukuran template maksimal ${MAX_DOC_LABEL}`);

    const buffer = Buffer.from(await file.arrayBuffer());
    // magic ZIP "PK" — .docx adalah arsip zip; tolak file lain sedini mungkin
    if (buffer.length < 4 || buffer[0] !== 0x50 || buffer[1] !== 0x4b)
      throw new AppError("File harus berformat .docx (Word)");

    const data = await letterTypeService.uploadTemplate(id, buffer);
    return NextResponse.json(
      { success: true, message: "Template DOCX tersimpan & aktif", data },
      { status: 200 },
    );
  } catch (error) {
    if (isACLError(error)) return handleACLError(error);
    return NextResponse.json(
      {
        success: false,
        message: pesanAman(error, "Gagal mengunggah template"),
        // detail terstruktur (daftar tag/alasan) untuk dirender jadi chip di klien
        ...(error instanceof AppError && error.detail ? { errors: error.detail } : {}),
      },
      { status: 400 },
    );
  }
}

export async function GET(req: Request, { params }: RouteContext) {
  try {
    await requireRole(req, ["admin"]);

    const { id } = await params;
    const type = await letterTypeService.getByIdForAdmin(id);
    if (!type.templateDocx)
      throw new AppError("Jenis surat ini belum punya template DOCX");

    const buffer = await docxTemplateService.readTemplateFile(type.templateDocx);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": DOCX_MIME,
        "Content-Disposition": `attachment; filename="template-${type.code}.docx"`,
      },
    });
  } catch (error) {
    if (isACLError(error)) return handleACLError(error);
    return NextResponse.json(
      {
        success: false,
        message: pesanAman(error, "Template tidak ditemukan"),
      },
      { status: 404 },
    );
  }
}

export async function DELETE(req: Request, { params }: RouteContext) {
  try {
    await requireRole(req, ["admin"]);

    const { id } = await params;
    await letterTypeService.removeTemplate(id);
    return NextResponse.json(
      {
        success: true,
        message: "Template dilepas — jenis surat memakai render bawaan",
      },
      { status: 200 },
    );
  } catch (error) {
    if (isACLError(error)) return handleACLError(error);
    return NextResponse.json(
      {
        success: false,
        message: pesanAman(error, "Gagal melepas template"),
      },
      { status: 400 },
    );
  }
}
