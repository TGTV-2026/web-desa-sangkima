import { siteContentService } from "@/server/services/siteContent.service";
import ProfilEditor from "./ProfilEditor";

export default async function AdminProfilPage() {
  const profil = await siteContentService.get("profil");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="overline-doc text-brass">Halaman Profil</span>
        <h1 className="mt-1 font-serif text-[28px] font-medium text-pine-900">
          Sejarah, Visi &amp; Misi
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-inkmut">
          Konten ini tampil di halaman{" "}
          <span className="font-mono text-xs">/profil</span>.
        </p>
      </div>
      <ProfilEditor initial={profil} />
    </div>
  );
}
