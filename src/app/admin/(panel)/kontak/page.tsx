import { siteContentService } from "@/server/services/siteContent.service";
import KontakEditor from "./KontakEditor";

export default async function AdminKontakPage() {
  const kontak = await siteContentService.get("kontak");
  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="overline-doc text-brass">Beranda</span>
        <h1 className="mt-1 font-serif text-[28px] font-medium text-pine-900">
          Kontak &amp; Peta
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-inkmut">
          Alamat, surel, dan titik-titik peta di seksi{" "}
          <span className="font-mono text-xs">/#kontak</span>.
        </p>
      </div>
      <KontakEditor initial={kontak} />
    </div>
  );
}
