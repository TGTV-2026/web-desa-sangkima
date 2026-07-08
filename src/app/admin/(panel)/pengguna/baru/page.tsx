import Link from "next/link";
import { requireSuperAdmin } from "@/server/utils/cmsSession";
import CmsUserForm from "../CmsUserForm";

export default async function AdminPenggunaBaruPage() {
  await requireSuperAdmin();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/pengguna"
          className="text-[11px] font-bold uppercase tracking-[0.18em] text-inkmut hover:text-pine-900"
        >
          ← Daftar Akun
        </Link>
        <h1 className="mt-2 font-serif text-[28px] font-medium text-pine-900">
          Tambah Akun Editor
        </h1>
      </div>
      <CmsUserForm />
    </div>
  );
}
