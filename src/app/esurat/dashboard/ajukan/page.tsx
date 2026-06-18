import { redirect } from "next/navigation";
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
      
      {/* HEAD KOP LAYOUT */}
      <div className="border-b border-line pb-6 mb-8 rise-in">
        <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-[0.16em] text-inkmut">
          <span>Layanan Surat</span>
          <span className="text-line">/</span>
          <span className="text-brass">Formulir Permohonan</span>
        </div>
        
        <h1 className="font-serif text-3xl md:text-4xl font-medium tracking-tight mt-2 text-pine-900">
          Ajukan Surat Resmi
        </h1>
        
        <p className="text-xs sm:text-sm text-inkmut mt-2.5 leading-relaxed">
          Silakan tentukan jenis surat kebutuhan Anda, lalu lengkapi kolom instrumen data yang diminta. Parameter data identitas primer Anda akan disinkronisasikan otomatis oleh sistem berdasarkan rekam profil kependudukan desa.
        </p>
      </div>
      
      {/* AREA UTAMA FORMULIR */}
      <div className="rise-in" style={{ animationDelay: "100ms" }}>
        <AjukanForm types={types} />
      </div>
    </div>
  );
}