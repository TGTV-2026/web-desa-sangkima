import { createId } from "@paralleldrive/cuid2";
import { productRepository } from "../repositories/product.repository";
import { deleteProfileImage } from "../utils/imageUpload";
import { productInputSchema, type ProductDTO } from "../types/product";

function toDTO(
  row: NonNullable<Awaited<ReturnType<typeof productRepository.findById>>>,
): ProductDTO {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    unit: row.unit,
    category: row.category,
    image: row.image,
    published: row.published,
  };
}

export const productService = {
  async listAll(): Promise<ProductDTO[]> {
    try {
      return (await productRepository.findAll()).map(toDTO);
    } catch {
      return [];
    }
  },

  async listPublished(): Promise<ProductDTO[]> {
    try {
      return (await productRepository.findPublished()).map(toDTO);
    } catch {
      return [];
    }
  },

  async getById(id: string): Promise<ProductDTO | null> {
    const row = await productRepository.findById(id);
    return row ? toDTO(row) : null;
  },

  async create(input: unknown): Promise<ProductDTO> {
    const data = productInputSchema.parse(input);
    const id = createId();
    await productRepository.insert({
      id,
      name: data.name,
      description: data.description || null,
      price: data.price,
      unit: data.unit || null,
      category: data.category || null,
      image: data.image || null,
      published: data.published,
    });
    const created = await productRepository.findById(id);
    return toDTO(created!);
  },

  async update(id: string, input: unknown): Promise<void> {
    const data = productInputSchema.parse(input);
    await productRepository.update(id, {
      name: data.name,
      description: data.description || null,
      price: data.price,
      unit: data.unit || null,
      category: data.category || null,
      image: data.image || null,
      published: data.published,
    });
  },

  async remove(id: string): Promise<void> {
    const row = await productRepository.findById(id);
    if (row) await deleteProfileImage(row.image);
    await productRepository.remove(id);
  },
};
