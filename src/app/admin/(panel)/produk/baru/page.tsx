import Link from "next/link";
import ProductForm from "../ProductForm";

export default function AdminProdukBaruPage() {
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
          Tambah Produk
        </h1>
      </div>
      <ProductForm />
    </div>
  );
}
