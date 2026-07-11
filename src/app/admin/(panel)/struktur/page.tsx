import { siteContentService } from "@/server/services/siteContent.service";
import StrukturEditor from "./StrukturEditor";

export default async function AdminStrukturPage() {
  const struktur = await siteContentService.get("struktur");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="overline-doc text-brass">Halaman Profil</span>
        <h1 className="mt-1 font-serif text-[28px] font-medium text-pine-900">
          Struktur Organisasi
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-inkmut">
          Susunan lembaga desa per grup (Aparatur, BPD, LPM, dst.) yang tampil di
          halaman <span className="font-mono text-xs">/profil</span>. Pilih grup
          di atas untuk menyuntingnya.
        </p>
      </div>
      <StrukturEditor initial={struktur} />
    </div>
  );
}
