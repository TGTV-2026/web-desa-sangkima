import { requireSuperAdmin } from "@/server/utils/cmsSession";
import { siteContentService } from "@/server/services/siteContent.service";
import SuratEditor from "./SuratEditor";

export const dynamic = "force-dynamic";

export default async function AdminSuratPage() {
  // Tanda tangan surat bersifat sensitif — hanya super admin.
  await requireSuperAdmin();

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
