import { redirect } from "next/navigation";
import PageHeader from "@/components/esurat/PageHeader";
import { getSessionUser } from "@/server/utils/session";
import { letterTypeService } from "@/server/services/letterType.service";
import LetterTypesTable from "./LetterTypesTable";

export default async function JenisSuratPage() {
  const session = await getSessionUser();
  if (!session) redirect("/esurat");
  if (session.role !== "admin") redirect("/esurat/dashboard");

  const types = await letterTypeService.list(false);

  return (
    <div>
      <PageHeader
        overline="Pengaturan Layanan"
        title="Jenis Surat"
        description="Kelola jenis surat yang dapat diajukan warga. Jenis yang dinonaktifkan tidak muncul di formulir pengajuan, tetapi surat lama tetap sah."
        descriptionClassName="max-w-xl"
      />

      <div className="card-doc overflow-hidden rise-in" style={{ animationDelay: "100ms" }}>
        <LetterTypesTable types={types} />
      </div>
    </div>
  );
}
