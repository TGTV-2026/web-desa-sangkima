import { redirect } from "next/navigation";
import PageHeader from "@/components/esurat/PageHeader";
import { getSessionUser } from "@/server/utils/session";
import ChangePasswordForm from "./ChangePasswordForm";

export default async function UbahPasswordPage() {
  const session = await getSessionUser();
  if (!session) redirect("/esurat");

  return (
    <div className="w-full text-ink select-none antialiased">
      <PageHeader
        breadcrumb={{ parent: "Profil Saya", current: "Ubah Password" }}
        title="Ubah Password"
        description="Ganti kata sandi akun Anda. Masukkan password lama untuk verifikasi, lalu password baru."
        bordered
      />

      <div className="rise-in mt-5" style={{ animationDelay: "100ms" }}>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
