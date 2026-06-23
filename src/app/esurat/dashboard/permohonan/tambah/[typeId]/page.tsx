import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/esurat/PageHeader";
import { getSessionUser } from "@/server/utils/session";
import { letterTypeService } from "@/server/services/letterType.service";
import TambahPengajuanForm from "../TambahPengajuanForm";

type PageProps = { params: Promise<{ typeId: string }> };

export default async function TambahPermohonanFormPage({ params }: PageProps) {
  const session = await getSessionUser();
  if (!session) redirect("/esurat");
  if (session.role === "user") redirect("/esurat/dashboard");

  const { typeId } = await params;
  let type;
  try {
    type = await letterTypeService.getById(typeId);
  } catch {
    notFound();
  }
  if (!type.active) notFound();

  return (
    <div className="w-full max-w-4xl mx-auto">
      <PageHeader
        breadcrumb={{ parent: "Permohonan", current: type.name }}
        title="Tambah Pengajuan Surat"
        description="Pilih warga terdaftar sebagai pemohon, atau daftarkan dulu jika belum ada di sistem."
        action={
          <Link
            href="/esurat/dashboard/permohonan/tambah"
            className="text-xs font-semibold text-brass hover:underline underline-offset-2"
          >
            ← Pilih jenis surat lain
          </Link>
        }
      />

      <TambahPengajuanForm type={type} />
    </div>
  );
}
