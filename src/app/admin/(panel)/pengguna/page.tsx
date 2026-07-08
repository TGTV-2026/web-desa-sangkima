import Link from "next/link";
import { requireSuperAdmin } from "@/server/utils/cmsSession";
import { cmsUserService } from "@/server/services/cmsUser.service";
import CmsUserList from "./CmsUserList";

export const dynamic = "force-dynamic";

export default async function AdminPenggunaPage() {
  const me = await requireSuperAdmin();
  const items = await cmsUserService.listAll();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="overline-doc text-brass">Akun & Akses</span>
          <h1 className="mt-1 font-serif text-[28px] font-medium text-pine-900">
            Akun Editor
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-inkmut">
            Kelola akun pengelola web profil. Editor bisa menulis konten;
            Super Admin bisa mengelola akun &amp; tanda tangan surat. Akun ini
            terpisah dari akun e-surat warga.
          </p>
        </div>
        <Link href="/admin/pengguna/baru" className="btn-primary shrink-0">
          + Tambah Akun
        </Link>
      </div>

      <CmsUserList items={items} currentUserId={me.id} />
    </div>
  );
}
