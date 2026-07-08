import Link from "next/link";
import { notFound } from "next/navigation";
import { ppidService } from "@/server/services/ppid.service";
import PpidDocForm from "../PpidDocForm";

export const dynamic = "force-dynamic";

export default async function AdminPpidEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const doc = await ppidService.getById(id);
  if (!doc) notFound();

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
          Edit Dokumen Informasi Publik
        </h1>
      </div>
      <PpidDocForm initial={doc} />
    </div>
  );
}
