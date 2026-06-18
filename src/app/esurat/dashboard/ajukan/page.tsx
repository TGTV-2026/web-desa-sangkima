import { redirect } from "next/navigation";
import PageHeader from "@/components/esurat/PageHeader";
import { getSessionUser } from "@/server/utils/session";
import { letterTypeService } from "@/server/services/letterType.service";
import AjukanForm from "./AjukanForm";

export default async function AjukanPage() {
  const session = await getSessionUser();
  if (!session) redirect("/esurat");

  const types = await letterTypeService.list(true);

  return (
    /* CONTAINER LAYOUT: Dikunci max-w-2xl, rata tengah otomatis di komputer lebar agar simetris */
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-2 py-6 sm:py-10 min-h-screen text-ink select-none antialiased">
      <PageHeader
        breadcrumb={{ parent: "Layanan Surat", current: "Formulir Permohonan" }}
        title="Ajukan Surat Resmi"
        description="Silakan tentukan jenis surat kebutuhan Anda, lalu lengkapi kolom instrumen data yang diminta. Parameter data identitas primer Anda akan disinkronisasikan otomatis oleh sistem berdasarkan rekam profil kependudukan desa."
        bordered
      />

      {/* AREA UTAMA FORMULIR */}
      <div className="rise-in" style={{ animationDelay: "100ms" }}>
        <AjukanForm types={types} />
      </div>
    </div>
  );
}