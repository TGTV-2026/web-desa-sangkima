import { redirect } from "next/navigation";
import PageHeader from "@/components/esurat/PageHeader";
import { getSessionUser } from "@/server/utils/session";
import { letterTypeService } from "@/server/services/letterType.service";
import { letterRequestService } from "@/server/services/letterRequest.service";
import { userService } from "@/server/services/user.service";
import {
  isProfileComplete,
  getMissingProfileFields,
} from "@/server/types/user";
import ProfileIncompleteBlocker from "./ProfileIncompleteBlocker";
import PilihJenisSuratModal from "@/components/esurat/PilihJenisSuratModal";

export default async function AjukanPage() {
  const session = await getSessionUser();
  if (!session) redirect("/esurat");

  // Cek kelengkapan profil sebelum izinkan akses form
  const user = await userService.getById(session.id);
  const profileComplete = isProfileComplete(user);

  const types = profileComplete ? await letterTypeService.list(true) : [];
  const pendingTypeIds = profileComplete
    ? await letterRequestService.getPendingTypeIds(session.id)
    : [];

  return (
    <div className="w-full text-ink select-none antialiased">
      <PageHeader
        breadcrumb={{ parent: "Layanan Surat", current: "Formulir Permohonan" }}
        title="Ajukan Surat Resmi"
        description={
          profileComplete
            ? "Pilih jenis surat yang Anda butuhkan pada jendela berikut."
            : "Sebelum mengajukan surat, Anda perlu melengkapi data profil kependudukan terlebih dahulu."
        }
        bordered
      />

      {/* AREA UTAMA */}
      <div className="rise-in mt-5" style={{ animationDelay: "100ms" }}>
        {profileComplete ? (
          <PilihJenisSuratModal
            types={types}
            closeHref="/esurat/dashboard"
            typeBasePath="/esurat/dashboard/ajukan"
            blockedTypeIds={pendingTypeIds}
          />
        ) : (
          <ProfileIncompleteBlocker
            missingFields={getMissingProfileFields(user)}
          />
        )}
      </div>
    </div>
  );
}