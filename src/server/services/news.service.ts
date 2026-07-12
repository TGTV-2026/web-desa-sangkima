import { createId } from "@paralleldrive/cuid2";
import { newsRepository } from "../repositories/news.repository";
import { deleteProfileImage } from "../utils/imageUpload";
import {
  makeSlug,
  newsInputSchema,
  type ContentAuthor,
  type NewsDTO,
} from "../types/news";

function toDTO(row: NonNullable<Awaited<ReturnType<typeof newsRepository.findById>>>): NewsDTO {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    coverImage: row.coverImage,
    authorId: row.authorId,
    authorName: row.authorName,
    published: row.published,
    publishedAt: row.publishedAt,
  };
}

export const newsService = {
  async listAll(): Promise<NewsDTO[]> {
    try {
      return (await newsRepository.findAll()).map(toDTO);
    } catch {
      return [];
    }
  },

  async listPublished(): Promise<NewsDTO[]> {
    try {
      return (await newsRepository.findPublished()).map(toDTO);
    } catch {
      return [];
    }
  },

  async getBySlug(slug: string): Promise<NewsDTO | null> {
    const row = await newsRepository.findBySlug(slug);
    return row ? toDTO(row) : null;
  },

  async getById(id: string): Promise<NewsDTO | null> {
    const row = await newsRepository.findById(id);
    return row ? toDTO(row) : null;
  },

  async create(input: unknown, author: ContentAuthor): Promise<NewsDTO> {
    const data = newsInputSchema.parse(input);
    const id = createId();
    const slug = makeSlug(data.title, id);
    await newsRepository.insert({
      id,
      slug,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      coverImage: data.coverImage,
      authorId: author.id,
      authorName: author.name,
      published: data.published,
      publishedAt: new Date(),
    });
    const created = await newsRepository.findById(id);
    return toDTO(created!);
  },

  async update(id: string, input: unknown): Promise<void> {
    const data = newsInputSchema.parse(input);
    await newsRepository.update(id, {
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      coverImage: data.coverImage,
      published: data.published,
    });
  },

  async remove(id: string): Promise<void> {
    const row = await newsRepository.findById(id);
    if (row) await deleteProfileImage(row.coverImage);
    await newsRepository.remove(id);
  },
};
