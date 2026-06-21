import { redirect } from "next/navigation";
import PageHeader from "@/components/esurat/PageHeader";
import PilihJenisSuratModal from "@/components/esurat/PilihJenisSuratModal";
import { getSessionUser } from "@/server/utils/session";
import { letterTypeService } from "@/server/services/letterType.service";

export default async function TambahPermohonanPage() {
  const session = await getSessionUser();
  if (!session) redirect("/esurat");
  if (session.role === "user") redirect("/esurat/dashboard");

  const types = await letterTypeService.list(true);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <PageHeader
        breadcrumb={{ parent: "Permohonan", current: "Tambah Pengajuan" }}
        title="Tambah Pengajuan Surat"
        description="Pilih jenis surat yang akan diajukan pada jendela berikut."
      />

      <PilihJenisSuratModal
        types={types}
        closeHref="/esurat/dashboard/permohonan"
        typeBasePath="/esurat/dashboard/permohonan/tambah"
      />
    </div>
  );
}
