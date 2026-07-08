import Link from "next/link";
import { requireCmsUser } from "@/server/utils/cmsSession";
import { siteContentService } from "@/server/services/siteContent.service";
import ProdukSettingsEditor from "./ProdukSettingsEditor";

export const dynamic = "force-dynamic";

export default async function AdminProdukSettingsPage() {
  await requireCmsUser();
  const produk = await siteContentService.get("produk");

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
          Pengaturan Koperasi
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-inkmut">
          Judul, deskripsi, nama koperasi, dan nomor WhatsApp tujuan pemesanan
          untuk halaman <span className="font-mono text-xs">/produk</span>.
        </p>
      </div>
      <ProdukSettingsEditor initial={produk} />
    </div>
  );
}
