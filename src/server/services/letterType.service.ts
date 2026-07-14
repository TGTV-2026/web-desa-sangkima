import { AppError } from "../utils/appError";
import { letterTypeRepository } from "../repositories/letterType.repository";
import { letterRequestRepository } from "../repositories/letterRequest.repository";
import { docxTemplateService } from "./docxTemplate.service";
import {
  createLetterTypeSchema,
  updateLetterTypeSchema,
  normalizeRequiredFields,
  parseJsonColumn,
  getSupportingDocs,
  type LetterFieldDef,
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
    if (!row || row.deletedAt) throw new AppError("Jenis surat tidak ditemukan");
    return toDTO(row);
  },

  // Versi form admin: menyertakan template teks & nama file docx aktif
  async getByIdForAdmin(id: string): Promise<LetterTypeAdminDTO> {
    const row = await letterTypeRepository.findById(id);
    if (!row || row.deletedAt) throw new AppError("Jenis surat tidak ditemukan");
    return {
      ...toDTO(row),
      template: row.template ?? null,
      templateDocx: row.templateDocx ?? null,
      templateReport: parseJsonColumn<TemplateReport | null>(row.templateReport, null),
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

  // Validasi TAG saja (tanpa LibreOffice): compile docx + tag dikenal. Dipakai
  // sebagai gate sebelum jenis surat dibuat — tag terpenuhi = boleh dibuat.
  validateTemplateTags(buffer: Buffer, fields: LetterFieldDef[]): TemplateReport {
    const full = docxTemplateService.validateTemplate(buffer, fields);
    if (full.unknownTags.length) {
      // pesan ringkas; klien merender jadi chip: tag bermasalah + tag template yang
      // sudah aman, plus status placeholder QR/TTD (sudah terdeteksi walau tag salah).
      throw new AppError("Ada tag yang tidak dikenal di template.", {
        code: "TEMPLATE_TAGS",
        detail: {
          unknownTags: full.unknownTags,
          knownTags: full.tags.filter((t) => !full.unknownTags.includes(t)),
          hasQr: full.hasQr,
          hasTtd: full.hasTtd,
        },
      });
    }
    return { tags: full.tags, hasQr: full.hasQr, hasTtd: full.hasTtd };
  },

  // Unggah template .docx: validasi tag → smoke render (LibreOffice) → simpan & set kolom.
  async uploadTemplate(id: string, buffer: Buffer): Promise<TemplateReport> {
    const row = await letterTypeRepository.findById(id);
    if (!row) throw new AppError("Jenis surat tidak ditemukan");

    const fields = normalizeRequiredFields(row.requiredFields);
    const report = this.validateTemplateTags(buffer, fields);
    // smoke test dari buffer — menangkap docx rusak / LibreOffice hilang SEKARANG,
    // bukan nanti saat kepala desa menyetujui surat.
    await docxTemplateService.renderLetterPdfFromBuffer(
      buffer,
      docxTemplateService.buildDummyInput({ name: row.name, requiredFields: fields }),
    );

    const fileName = await docxTemplateService.saveTemplateFile(id, buffer);
    await letterTypeRepository.setTemplateDocx(id, fileName, report);
    return report;
  },

  // Lepas template docx → jenis surat kembali ke render pdf-lib bawaan.
  // File di disk sengaja dibiarkan (arsip versi).
  async removeTemplate(id: string): Promise<void> {
    const row = await letterTypeRepository.findById(id);
    if (!row) throw new AppError("Jenis surat tidak ditemukan");
    await letterTypeRepository.setTemplateDocx(id, null, null);
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

  // Hapus cerdas: belum pernah dipakai permohonan → hapus permanen (baris + file
  // template, kode bebas lagi); sudah dipakai → soft delete (FK NOT NULL melarang
  // hapus permanen; permohonan lama tetap resolve lewat join). Selalu aman.
  async remove(id: string): Promise<{ mode: "hard" | "soft" }> {
    const row = await letterTypeRepository.findById(id);
    if (!row || row.deletedAt) throw new AppError("Jenis surat tidak ditemukan");

    const refs = await letterRequestRepository.countByLetterType(id);
    if (refs > 0) {
      await letterTypeRepository.softDelete(id);
      return { mode: "soft" };
    }

    if (row.templateDocx) await docxTemplateService.deleteTemplateFile(row.templateDocx);
    await letterTypeRepository.hardDelete(id);
    return { mode: "hard" };
  },
};
