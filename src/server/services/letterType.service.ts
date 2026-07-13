import { AppError } from "../utils/appError";
import { letterTypeRepository } from "../repositories/letterType.repository";
import { allowedTags, docxTemplateService } from "./docxTemplate.service";
import {
  createLetterTypeSchema,
  updateLetterTypeSchema,
  normalizeRequiredFields,
  getSupportingDocs,
  type LetterTypeAdminDTO,
  type LetterTypeDTO,
  type TemplateReport,
} from "../types/letter";

// Bentuk baris dari database -> DTO yang dikirim ke frontend
type LetterTypeRow = NonNullable<
  Awaited<ReturnType<typeof letterTypeRepository.findById>>
>;

function toDTO(row: LetterTypeRow): LetterTypeDTO {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description ?? null,
    requiredFields: normalizeRequiredFields(row.requiredFields),
    supportingDocs: getSupportingDocs(row.code, row.supportingDocs),
    hasDocxTemplate: !!row.templateDocx,
    requireManualNumber: row.requireManualNumber,
    active: row.active,
  };
}

export const letterTypeService = {
  async list(activeOnly = false): Promise<LetterTypeDTO[]> {
    const rows = await letterTypeRepository.findAll(activeOnly);
    return rows.map(toDTO);
  },

  async getById(id: string): Promise<LetterTypeDTO> {
    const row = await letterTypeRepository.findById(id);
    if (!row) throw new AppError("Jenis surat tidak ditemukan");
    return toDTO(row);
  },

  // Versi form admin: menyertakan template teks & nama file docx aktif
  async getByIdForAdmin(id: string): Promise<LetterTypeAdminDTO> {
    const row = await letterTypeRepository.findById(id);
    if (!row) throw new AppError("Jenis surat tidak ditemukan");
    return {
      ...toDTO(row),
      template: row.template ?? null,
      templateDocx: row.templateDocx ?? null,
    };
  },

  async create(input: unknown): Promise<LetterTypeDTO> {
    const data = createLetterTypeSchema.parse(input);

    const existing = await letterTypeRepository.findByCode(data.code);
    if (existing) throw new AppError("Kode jenis surat sudah digunakan");

    const created = await letterTypeRepository.create(data);
    if (!created) throw new AppError("Gagal membuat jenis surat");
    return toDTO(created);
  },

  async update(
    id: string,
    input: unknown,
  ): Promise<LetterTypeDTO & { templateWarnings?: string[] }> {
    const data = updateLetterTypeSchema.parse(input);

    const current = await letterTypeRepository.findById(id);
    if (!current) throw new AppError("Jenis surat tidak ditemukan");

    // jika kode diubah, pastikan tidak bentrok dengan jenis surat lain
    if (data.code && data.code !== current.code) {
      const duplicate = await letterTypeRepository.findByCode(data.code);
      if (duplicate) throw new AppError("Kode jenis surat sudah digunakan");
    }

    // tidak ada field yang diubah -> kembalikan data saat ini
    if (Object.keys(data).length === 0) return toDTO(current);

    const updated = await letterTypeRepository.update(id, data);
    if (!updated) throw new AppError("Gagal memperbarui jenis surat");

    // requiredFields berubah + ada template docx terpasang → cek tag yang
    // jadi yatim (akan tercetak "..." di surat). Non-blocking: hanya peringatan.
    let templateWarnings: string[] | undefined;
    if (data.requiredFields && updated.templateDocx) {
      try {
        const buffer = await docxTemplateService.readTemplateFile(updated.templateDocx);
        const report = docxTemplateService.validateTemplate(
          buffer,
          normalizeRequiredFields(updated.requiredFields),
        );
        if (report.unknownTags.length) {
          templateWarnings = [
            `Tag di template DOCX tidak lagi dikenal: ${report.unknownTags.join(", ")} — akan tercetak "..." di surat. Perbarui template atau nama field.`,
          ];
        }
      } catch {
        // file hilang dsb. — biarkan; upload ulang akan memvalidasi penuh
      }
    }

    return { ...toDTO(updated), ...(templateWarnings ? { templateWarnings } : {}) };
  },

  // Unggah template .docx: validasi tag → smoke render dummy → simpan file → set kolom.
  // Tag tak dikenal DITOLAK di sini (kalau lolos, surat asli mencetak "...").
  async uploadTemplate(id: string, buffer: Buffer): Promise<TemplateReport> {
    const row = await letterTypeRepository.findById(id);
    if (!row) throw new AppError("Jenis surat tidak ditemukan");

    const fields = normalizeRequiredFields(row.requiredFields);
    const report = docxTemplateService.validateTemplate(buffer, fields);
    if (report.unknownTags.length) {
      throw new AppError(
        `Tag tidak dikenal di template: ${report.unknownTags.map((t) => `{${t}}`).join(", ")}. ` +
          `Tag yang tersedia: ${allowedTags(fields)
            .map((t) => `{${t}}`)
            .join(", ")}`,
      );
    }

    const fileName = await docxTemplateService.saveTemplateFile(id, buffer);
    // smoke test: render data dummy sampai PDF — menangkap docx rusak atau
    // LibreOffice hilang SEKARANG, bukan nanti saat kepala desa menyetujui surat
    await docxTemplateService.renderLetterPdfFromDocx(
      fileName,
      docxTemplateService.buildDummyInput({ name: row.name, requiredFields: fields }),
    );

    await letterTypeRepository.setTemplateDocx(id, fileName);
    return report;
  },

  // Lepas template docx → jenis surat kembali ke render pdf-lib bawaan.
  // File di disk sengaja dibiarkan (arsip versi).
  async removeTemplate(id: string): Promise<void> {
    const row = await letterTypeRepository.findById(id);
    if (!row) throw new AppError("Jenis surat tidak ditemukan");
    await letterTypeRepository.setTemplateDocx(id, null);
  },

  // Pratinjau PDF template aktif dengan data dummy; placeholder QR/TTD
  // dibiarkan tampak supaya posisinya terlihat.
  async previewTemplate(id: string): Promise<Uint8Array> {
    const row = await letterTypeRepository.findById(id);
    if (!row) throw new AppError("Jenis surat tidak ditemukan");
    if (!row.templateDocx)
      throw new AppError("Jenis surat ini belum punya template DOCX");
    return docxTemplateService.renderLetterPdfFromDocx(
      row.templateDocx,
      docxTemplateService.buildDummyInput({
        name: row.name,
        requiredFields: normalizeRequiredFields(row.requiredFields),
      }),
      { keepPlaceholders: true },
    );
  },
};
