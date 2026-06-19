import { redirect } from "next/navigation";
import PageHeader from "@/components/esurat/PageHeader";
import { getSessionUser } from "@/server/utils/session";
import PositionForm from "../PositionForm";

export default async function TambahPosisiPage() {
  const session = await getSessionUser();
  if (!session) redirect("/esurat");
  if (session.role !== "admin") redirect("/esurat/dashboard");

  return (
    <div>
      <PageHeader
        breadcrumb={{ parent: "Jabatan", current: "Tambah Jabatan" }}
        title="Tambah Jabatan Baru"
      />

      <div className="card-doc rise-in max-w-2xl" style={{ animationDelay: "100ms" }}>
        <PositionForm mode="create" />
      </div>
    </div>
  );
}
