import { redirect } from "next/navigation";
import { requireCmsUser } from "@/server/utils/cmsSession";
import { siteContentService } from "@/server/services/siteContent.service";
import SuratEditor from "./SuratEditor";

export const dynamic = "force-dynamic";

export default async function AdminSuratPage() {
  // Hanya kepala desa (admin) — tanda tangan surat bersifat sensitif.
  const user = await requireCmsUser();
  if (user.role !== "admin") redirect("/admin");

  const surat = await siteContentService.get("surat");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="overline-doc text-brass">E-Surat</span>
        <h1 className="mt-1 font-serif text-[28px] font-medium text-pine-900">
          Tanda Tangan &amp; Kop Surat
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-inkmut">
          Dipakai saat menerbitkan PDF surat. Nama &amp; jabatan penandatangan
          otomatis mengikuti akun yang menyetujui; di sini kamu atur{" "}
          <b>gambar tanda tangan</b> dan <b>kop surat</b>. Berlaku untuk surat
          yang diterbitkan setelah ini.
        </p>
      </div>
      <SuratEditor initial={surat} />
    </div>
  );
}
