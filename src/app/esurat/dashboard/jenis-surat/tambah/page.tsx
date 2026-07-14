import { redirect } from "next/navigation";
import PageHeader from "@/components/esurat/PageHeader";
import { getSessionUser } from "@/server/utils/session";
import LetterTypeForm from "../LetterTypeForm";

export default async function TambahJenisSuratPage() {
  const session = await getSessionUser();
  if (!session) redirect("/esurat");
  if (session.role !== "admin") redirect("/esurat/dashboard");

  return (
    <div>
      <PageHeader
        overline="Pengaturan Layanan"
        title="Tambah Jenis Surat"
        description="Lengkapi data jenis surat. Template DOCX (wajib) bisa langsung diunggah di panel kanan — divalidasi otomatis begitu jenis surat tersimpan."
        descriptionClassName="max-w-xl"
      />
      <LetterTypeForm />
    </div>
  );
}
