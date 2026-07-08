import Link from "next/link";
import { productService } from "@/server/services/product.service";
import ProductList from "./ProductList";

export const dynamic = "force-dynamic";

export default async function AdminProdukPage() {
  const items = await productService.listAll();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="overline-doc text-brass">Koperasi Desa</span>
          <h1 className="mt-1 font-serif text-[28px] font-medium text-pine-900">
            Produk Koperasi
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-inkmut">
            Kelola produk yang tampil di{" "}
            <span className="font-mono text-xs">/produk</span>. Atur nomor
            WhatsApp tujuan pemesanan di{" "}
            <Link
              href="/admin/produk/pengaturan"
              className="font-semibold text-pine-800 underline"
            >
              Pengaturan Koperasi
            </Link>
            .
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <Link href="/admin/produk/baru" className="btn-primary">
            + Tambah Produk
          </Link>
          <Link href="/admin/produk/pengaturan" className="btn-outline text-xs">
            Pengaturan Koperasi
          </Link>
        </div>
      </div>

      <ProductList items={items} />
    </div>
  );
}
