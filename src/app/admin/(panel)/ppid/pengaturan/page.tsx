import Link from "next/link";
import { requireCmsUser } from "@/server/utils/cmsSession";
import { siteContentService } from "@/server/services/siteContent.service";
import PpidSettingsEditor from "./PpidSettingsEditor";

export const dynamic = "force-dynamic";

export default async function AdminPpidSettingsPage() {
  await requireCmsUser();
  const ppid = await siteContentService.get("ppid");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/ppid"
          className="text-[11px] font-bold uppercase tracking-[0.18em] text-inkmut hover:text-pine-900"
        >
          ← Daftar Dokumen PPID
        </Link>
        <h1 className="mt-2 font-serif text-[28px] font-medium text-pine-900">
          Pengaturan Halaman PPID
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-inkmut">
          Teks yang tampil di halaman{" "}
          <span className="font-mono text-xs">/ppid</span>: ringkasan, tugas,
          prosedur permohonan, dan kontak.
        </p>
      </div>
      <PpidSettingsEditor initial={ppid} />
    </div>
  );
}
