import { redirect } from "next/navigation";
import PageHeader from "@/components/esurat/PageHeader";
import { getSessionUser } from "@/server/utils/session";
import { userService } from "@/server/services/user.service";
import ProfileForm from "./ProfileForm";

export default async function ProfilPage() {
  const session = await getSessionUser();
  if (!session) redirect("/esurat");

  const user = await userService.getById(session.id);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-2 py-6 sm:py-10 min-h-screen text-ink select-none antialiased">
      <PageHeader
        breadcrumb={{ parent: "Akun Saya", current: "Data Profil" }}
        title="Kelengkapan Profil"
        description="Pastikan seluruh data kependudukan Anda terisi lengkap dan akurat. Data ini akan digunakan secara otomatis pada setiap pengajuan surat resmi."
        bordered
      />

      <div className="rise-in" style={{ animationDelay: "100ms" }}>
        <ProfileForm user={user} />
      </div>
    </div>
  );
}
