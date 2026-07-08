import Link from "next/link";
import { notFound } from "next/navigation";
import { productService } from "@/server/services/product.service";
import ProductForm from "../ProductForm";

export const dynamic = "force-dynamic";

export default async function AdminProdukEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await productService.getById(id);
  if (!product) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/produk"
          className="text-[11px] font-bold uppercase tracking-[0.18em] text-inkmut hover:text-pine-900"
        >
          ← Daftar Produk
        </Link>
        <h1 className="mt-2 font-serif text-[28px] font-medium text-pine-900">
          Edit Produk
        </h1>
      </div>
      <ProductForm initial={product} />
    </div>
  );
}
