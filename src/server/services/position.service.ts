import { AppError } from "../utils/appError";
import { positionRepository } from "../repositories/position.repository";
import {
  createPositionSchema,
  updatePositionSchema,
  type PositionDTO,
} from "../types/position";
import type { PaginationMeta } from "../types/pagination";

// Bentuk baris dari database -> DTO yang dikirim ke frontend
type PositionRow = NonNullable<
  Awaited<ReturnType<typeof positionRepository.findById>>
>;

function toDTO(row: PositionRow): PositionDTO {
  return {
    id: row.id,
    // kolom DB tetap varchar (lihat db/schema/positions.ts), Zod yang menjamin nilainya valid saat ditulis
    category: row.category as PositionDTO["category"],
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export const positionService = {
  async list(): Promise<PositionDTO[]> {
    const rows = await positionRepository.findAll();
    return rows.map(toDTO);
  },

  async listPaginated(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ data: PositionDTO[]; pagination: PaginationMeta }> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const term = search?.trim() || undefined;

    const { rows, total } = await positionRepository.findAllPaginated(
      safePage,
      safeLimit,
      term,
    );
    return {
      data: rows.map(toDTO),
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  },

  async getById(id: string): Promise<PositionDTO> {
    const row = await positionRepository.findById(id);
    if (!row) throw new AppError("Jabatan tidak ditemukan");
    return toDTO(row);
  },

  async create(input: unknown): Promise<PositionDTO> {
    const data = createPositionSchema.parse(input);

    const existing = await positionRepository.findByName(data.name);
    if (existing) throw new AppError("Nama jabatan sudah digunakan");

    const created = await positionRepository.create(data);
    if (!created) throw new AppError("Gagal membuat jabatan");
    return toDTO(created);
  },

  async update(id: string, input: unknown): Promise<PositionDTO> {
    const data = updatePositionSchema.parse(input);

    const current = await positionRepository.findById(id);
    if (!current) throw new AppError("Jabatan tidak ditemukan");

    // jika nama diubah, pastikan tidak bentrok dengan jabatan lain
    if (data.name && data.name !== current.name) {
      const duplicate = await positionRepository.findByName(data.name);
      if (duplicate) throw new AppError("Nama jabatan sudah digunakan");
    }

    // tidak ada field yang diubah -> kembalikan data saat ini
    if (Object.keys(data).length === 0) return toDTO(current);

    const updated = await positionRepository.update(id, data);
    if (!updated) throw new AppError("Gagal memperbarui jabatan");
    return toDTO(updated);
  },

  async delete(id: string): Promise<boolean> {
    return positionRepository.delete(id);
  },
};
