import { redirect } from "next/navigation";
import PageHeader from "@/components/esurat/PageHeader";
import { getSessionUser } from "@/server/utils/session";
import { letterTypeService } from "@/server/services/letterType.service";
import TambahPengajuanForm from "./TambahPengajuanForm";

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
        description="Pilih warga terdaftar sebagai pemohon, atau daftarkan dulu jika belum ada di sistem."
      />

      <TambahPengajuanForm types={types} />
    </div>
  );
}
