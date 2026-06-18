import { redirect } from "next/navigation";
import PageHeader from "@/components/esurat/PageHeader";
import { getSessionUser } from "@/server/utils/session";
import { letterTypeService } from "@/server/services/letterType.service";
import { userService } from "@/server/services/user.service";
import {
  isProfileComplete,
  getMissingProfileFields,
} from "@/server/types/user";
import AjukanForm from "./AjukanForm";
import ProfileIncompleteBlocker from "./ProfileIncompleteBlocker";

export default async function AjukanPage() {
  const session = await getSessionUser();
  if (!session) redirect("/esurat");

  // Cek kelengkapan profil sebelum izinkan akses form
  const user = await userService.getById(session.id);
  const profileComplete = isProfileComplete(user);

  const types = profileComplete ? await letterTypeService.list(true) : [];

  return (
    /* CONTAINER LAYOUT: Dikunci max-w-2xl, rata tengah otomatis di komputer lebar agar simetris */
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-2 py-6 sm:py-10 min-h-screen text-ink select-none antialiased">
      <PageHeader
        breadcrumb={{ parent: "Layanan Surat", current: "Formulir Permohonan" }}
        title="Ajukan Surat Resmi"
        description={
          profileComplete
            ? "Silakan tentukan jenis surat kebutuhan Anda, lalu lengkapi kolom instrumen data yang diminta. Parameter data identitas primer Anda akan disinkronisasikan otomatis oleh sistem berdasarkan rekam profil kependudukan desa."
            : "Sebelum mengajukan surat, Anda perlu melengkapi data profil kependudukan terlebih dahulu."
        }
        bordered
      />

      {/* AREA UTAMA — form atau blocker tergantung kelengkapan profil */}
      <div className="rise-in" style={{ animationDelay: "100ms" }}>
        {profileComplete ? (
          <AjukanForm types={types} />
        ) : (
          <ProfileIncompleteBlocker
            missingFields={getMissingProfileFields(user)}
          />
        )}
      </div>
    </div>
  );
}