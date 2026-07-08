import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSuperAdmin } from "@/server/utils/cmsSession";
import { cmsUserService } from "@/server/services/cmsUser.service";
import CmsUserForm from "../CmsUserForm";

export const dynamic = "force-dynamic";

export default async function AdminPenggunaEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSuperAdmin();
  const { id } = await params;
  const user = await cmsUserService.getById(id);
  if (!user) notFound();

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
          Edit Akun Editor
        </h1>
      </div>
      <CmsUserForm initial={user} />
    </div>
  );
}
