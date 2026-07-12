"use server";
import { pesanAksi } from "@/server/utils/appError";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { productService } from "@/server/services/product.service";
import { requireVerifiedCmsUser } from "@/server/utils/cmsSession";

export type ProductResult =
  | { success: true }
  | { success: false; message: string };

function revalidateProduk() {
  revalidatePath("/produk");
  revalidatePath("/admin/produk");
}

export async function createProduct(input: unknown): Promise<ProductResult> {
  try {
    await requireVerifiedCmsUser();
    await productService.create(input);
    revalidateProduk();
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, message: "Periksa isian — ada yang belum valid." };
    }
    return {
      success: false,
      message: pesanAksi(err, "Gagal menyimpan."),
    };
  }
  redirect("/admin/produk");
}

export async function updateProduct(
  id: string,
  input: unknown,
): Promise<ProductResult> {
  try {
    await requireVerifiedCmsUser();
    await productService.update(id, input);
    revalidateProduk();
    revalidatePath(`/admin/produk/${id}`);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, message: "Periksa isian — ada yang belum valid." };
    }
    return {
      success: false,
      message: pesanAksi(err, "Gagal menyimpan."),
    };
  }
  redirect("/admin/produk");
}

export async function deleteProduct(id: string): Promise<ProductResult> {
  try {
    await requireVerifiedCmsUser();
    await productService.remove(id);
    revalidateProduk();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: pesanAksi(err, "Gagal menghapus."),
    };
  }
}
