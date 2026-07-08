import type { Metadata } from "next";
import Reveal from "@/components/profile/Reveal";
import ProductCatalog from "@/components/profile/ProductCatalog";
import { siteContentService } from "@/server/services/siteContent.service";
import { productService } from "@/server/services/product.service";

export const metadata: Metadata = {
  title: "Produk Koperasi — Desa Sangkima",
  description:
    "Produk unggulan koperasi dan UMKM Desa Sangkima. Pesan langsung lewat WhatsApp.",
};

export const dynamic = "force-dynamic";

export default async function ProdukPage() {
  const [produk, products] = await Promise.all([
    siteContentService.get("produk"),
    productService.listPublished(),
  ]);

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-10 px-5 pb-24 pt-28 md:px-12 md:pt-32">
      <Reveal className="mx-auto mt-8 flex max-w-2xl flex-col items-center gap-4 text-center">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-brass">
          {produk.namaKoperasi || "Koperasi Desa"}
        </span>
        <h1 className="font-serif text-[40px] font-medium leading-[44px] tracking-[-0.02em] text-pine-900 md:text-[56px] md:leading-[60px]">
          {produk.judul}
        </h1>
        {produk.deskripsi && (
          <p className="text-sm leading-6 text-inkmut">{produk.deskripsi}</p>
        )}
      </Reveal>

      <div className="h-px w-full bg-line" />

      <ProductCatalog
        products={products}
        waNumber={produk.whatsapp}
        koperasiName={produk.namaKoperasi}
      />
    </div>
  );
}
