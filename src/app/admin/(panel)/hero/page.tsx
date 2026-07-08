import { siteContentService } from "@/server/services/siteContent.service";
import HeroEditor from "./HeroEditor";

export default async function AdminHeroPage() {
  const hero = await siteContentService.get("hero");
  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="overline-doc text-brass">Beranda</span>
        <h1 className="mt-1 font-serif text-[28px] font-medium text-pine-900">
          Hero Beranda
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-inkmut">
          Bagian paling atas halaman utama (<span className="font-mono text-xs">/</span>).
        </p>
      </div>
      <HeroEditor initial={hero} />
    </div>
  );
}
