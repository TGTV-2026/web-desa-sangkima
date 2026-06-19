import { notFound, redirect } from "next/navigation";
import PageHeader from "@/components/esurat/PageHeader";
import { getSessionUser } from "@/server/utils/session";
import { userService } from "@/server/services/user.service";
import { positionService } from "@/server/services/position.service";
import UserForm from "../UserForm";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditPenggunaPage({ params }: PageProps) {
  const session = await getSessionUser();
  if (!session) redirect("/esurat");
  if (session.role !== "admin") redirect("/esurat/dashboard");

  const { id } = await params;
  let user;
  try {
    user = await userService.getById(id);
  } catch {
    notFound();
  }

  const positions = await positionService.list();

  return (
    <div>
      <PageHeader breadcrumb={{ parent: "Pengguna", current: user.name }} title="Edit Pengguna" />

      <div className="card-doc rise-in max-w-2xl" style={{ animationDelay: "100ms" }}>
        <UserForm mode="edit" user={user} positions={positions} />
      </div>
    </div>
  );
}
