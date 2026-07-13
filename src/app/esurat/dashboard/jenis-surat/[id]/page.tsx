import { redirect, notFound } from "next/navigation";
import PageHeader from "@/components/esurat/PageHeader";
import { getSessionUser } from "@/server/utils/session";
import { letterTypeService } from "@/server/services/letterType.service";
import LetterTypeForm from "../LetterTypeForm";

export default async function UbahJenisSuratPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSessionUser();
  if (!session) redirect("/esurat");
  if (session.role !== "admin") redirect("/esurat/dashboard");

  const { id } = await params;
  const type = await letterTypeService.getByIdForAdmin(id).catch(() => null);
  if (!type) notFound();

  return (
    <div>
      <PageHeader
        overline="Pengaturan Layanan"
        title={`Ubah Jenis Surat — ${type.code}`}
        description={type.name}
        descriptionClassName="max-w-xl"
      />
      <LetterTypeForm initial={type} />
    </div>
  );
}
