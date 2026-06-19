import { letterTypeRepository } from "../repositories/letterType.repository";
import {
  createLetterTypeSchema,
  updateLetterTypeSchema,
  normalizeRequiredFields,
  type LetterTypeDTO,
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
    if (!row) throw new Error("Jenis surat tidak ditemukan");
    return toDTO(row);
  },

  async create(input: unknown): Promise<LetterTypeDTO> {
    const data = createLetterTypeSchema.parse(input);

    const existing = await letterTypeRepository.findByCode(data.code);
    if (existing) throw new Error("Kode jenis surat sudah digunakan");

    const created = await letterTypeRepository.create(data);
    if (!created) throw new Error("Gagal membuat jenis surat");
    return toDTO(created);
  },

  async update(id: string, input: unknown): Promise<LetterTypeDTO> {
    const data = updateLetterTypeSchema.parse(input);

    const current = await letterTypeRepository.findById(id);
    if (!current) throw new Error("Jenis surat tidak ditemukan");

    // jika kode diubah, pastikan tidak bentrok dengan jenis surat lain
    if (data.code && data.code !== current.code) {
      const duplicate = await letterTypeRepository.findByCode(data.code);
      if (duplicate) throw new Error("Kode jenis surat sudah digunakan");
    }

    // tidak ada field yang diubah -> kembalikan data saat ini
    if (Object.keys(data).length === 0) return toDTO(current);

    const updated = await letterTypeRepository.update(id, data);
    if (!updated) throw new Error("Gagal memperbarui jenis surat");
    return toDTO(updated);
  },
};
