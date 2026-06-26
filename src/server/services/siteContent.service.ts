import { siteContentRepository } from "../repositories/siteContent.repository";
import {
  CONTENT_SECTIONS,
  type ContentKey,
  type ContentValueMap,
} from "../types/content";

export const siteContentService = {
  /**
   * Ambil konten satu seksi. Selalu mengembalikan nilai valid:
   * - baris belum ada → pakai default
   * - baris ada tapi bentuknya rusak/usang → pakai default (situs tak boleh pecah)
   */
  async get<K extends ContentKey>(key: K): Promise<ContentValueMap[K]> {
    const section = CONTENT_SECTIONS[key];
    try {
      const row = await siteContentRepository.findByKey(key);
      if (!row || row.value == null) {
        return section.default as ContentValueMap[K];
      }
      const parsed = section.schema.safeParse(row.value);
      return (
        parsed.success ? parsed.data : section.default
      ) as ContentValueMap[K];
    } catch {
      // DB tak tersedia (mis. saat build) → tetap tampilkan default, jangan pecah.
      return section.default as ContentValueMap[K];
    }
  },

  /**
   * Simpan konten satu seksi. Memvalidasi terhadap skema seksi (lempar ZodError
   * bila tidak valid) lalu upsert. `updatedBy` = id user penyunting.
   */
  async update<K extends ContentKey>(
    key: K,
    value: unknown,
    updatedBy: string | null,
  ): Promise<ContentValueMap[K]> {
    const section = CONTENT_SECTIONS[key];
    const data = section.schema.parse(value);
    await siteContentRepository.upsert(key, data, updatedBy);
    return data as ContentValueMap[K];
  },
};
