import { redirect } from "next/navigation";
import PageHeader from "@/components/esurat/PageHeader";
import { getSessionUser } from "@/server/utils/session";
import ChangeEmailFlow from "./ChangeEmailFlow";

export default async function UbahEmailPage() {
  const session = await getSessionUser();
  if (!session) redirect("/esurat");

  return (
    <div className="w-full text-ink select-none antialiased">
      <PageHeader
        breadcrumb={{ parent: "Profil Saya", current: "Ubah Email" }}
        title="Ubah Email"
        description="Ganti alamat email akun Anda. Demi keamanan, kami akan mengirim kode verifikasi ke email baru sebelum perubahan disimpan."
        bordered
      />

      <div className="rise-in mt-5" style={{ animationDelay: "100ms" }}>
        <ChangeEmailFlow currentEmail={session.email} />
      </div>
    </div>
  );
}
