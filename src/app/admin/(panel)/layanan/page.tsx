import { siteContentService } from "@/server/services/siteContent.service";
import LayananEditor from "./LayananEditor";

export default async function AdminLayananPage() {
  const layanan = await siteContentService.get("layanan");
  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="overline-doc text-brass">Beranda</span>
        <h1 className="mt-1 font-serif text-[28px] font-medium text-pine-900">
          Layanan &amp; Potensi
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-inkmut">
          Kartu layanan di halaman utama (<span className="font-mono text-xs">/#layanan</span>).
        </p>
      </div>
      <LayananEditor initial={layanan} />
    </div>
  );
}
