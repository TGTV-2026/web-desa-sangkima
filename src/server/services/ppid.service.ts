import { createId } from "@paralleldrive/cuid2";
import { ppidRepository } from "../repositories/ppid.repository";
import {
  ppidDocInputSchema,
  type PpidAuthor,
  type PpidCategory,
  type PpidDocDTO,
} from "../types/ppid";

function toDTO(
  row: NonNullable<Awaited<ReturnType<typeof ppidRepository.findById>>>,
): PpidDocDTO {
  return {
    id: row.id,
    category: row.category as PpidCategory,
    title: row.title,
    description: row.description,
    fileUrl: row.fileUrl,
    externalUrl: row.externalUrl,
    year: row.year,
    authorId: row.authorId,
    authorName: row.authorName,
    published: row.published,
    createdAt: row.createdAt,
  };
}

export const ppidService = {
  async listAll(): Promise<PpidDocDTO[]> {
    try {
      return (await ppidRepository.findAll()).map(toDTO);
    } catch {
      return [];
    }
  },

  async listPublished(): Promise<PpidDocDTO[]> {
    try {
      return (await ppidRepository.findPublished()).map(toDTO);
    } catch {
      return [];
    }
  },

  async getById(id: string): Promise<PpidDocDTO | null> {
    const row = await ppidRepository.findById(id);
    return row ? toDTO(row) : null;
  },

  async create(input: unknown, author: PpidAuthor): Promise<PpidDocDTO> {
    const data = ppidDocInputSchema.parse(input);
    const id = createId();
    await ppidRepository.insert({
      id,
      category: data.category,
      title: data.title,
      description: data.description || null,
      fileUrl: data.fileUrl || null,
      externalUrl: data.externalUrl || null,
      year: data.year || null,
      authorId: author.id,
      authorName: author.name,
      published: data.published,
    });
    const created = await ppidRepository.findById(id);
    return toDTO(created!);
  },

  async update(id: string, input: unknown): Promise<void> {
    const data = ppidDocInputSchema.parse(input);
    await ppidRepository.update(id, {
      category: data.category,
      title: data.title,
      description: data.description || null,
      fileUrl: data.fileUrl || null,
      externalUrl: data.externalUrl || null,
      year: data.year || null,
      published: data.published,
    });
  },

  async remove(id: string): Promise<void> {
    await ppidRepository.remove(id);
  },
};
