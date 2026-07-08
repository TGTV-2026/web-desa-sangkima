import { siteContentService } from "@/server/services/siteContent.service";
import GaleriEditor from "./GaleriEditor";

export default async function AdminGaleriPage() {
  const galeri = await siteContentService.get("galeri");
  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="overline-doc text-brass">Beranda</span>
        <h1 className="mt-1 font-serif text-[28px] font-medium text-pine-900">
          Galeri &amp; Potensi
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-inkmut">
          Foto & potensi ekonomi di seksi{" "}
          <span className="font-mono text-xs">/#galeri</span>.
        </p>
      </div>
      <GaleriEditor initial={galeri} />
    </div>
  );
}
