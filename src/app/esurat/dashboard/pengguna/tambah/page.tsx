import { redirect } from "next/navigation";
import PageHeader from "@/components/esurat/PageHeader";
import { getSessionUser } from "@/server/utils/session";
import { positionService } from "@/server/services/position.service";
import UserForm from "../UserForm";

export default async function TambahPenggunaPage() {
  const session = await getSessionUser();
  if (!session) redirect("/esurat");
  if (session.role !== "staff" && session.role !== "admin") redirect("/esurat/dashboard");

  const positions = await positionService.list();

  return (
    <div>
      <PageHeader
        breadcrumb={{ parent: "Pengguna", current: "Tambah Pengguna" }}
        title="Tambah Pengguna Baru"
        bordered
        description="Masukkan identitas pengguna dengan lengkap."
        descriptionClassName="max-w-full text-[16px]"
      />

      <div className="card-doc rise-in mt-4 md:mt-5 w-full" style={{ animationDelay: "100ms" }}>
        <UserForm
          mode="create"
          positions={positions}
          lockRoleToUser={session.role === "staff"}
        />
      </div>
    </div>
  );
}
