import { notFound, redirect } from "next/navigation";
import PageHeader from "@/components/esurat/PageHeader";
import { getSessionUser } from "@/server/utils/session";
import { positionService } from "@/server/services/position.service";
import PositionForm from "../PositionForm";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditPosisiPage({ params }: PageProps) {
  const session = await getSessionUser();
  if (!session) redirect("/esurat");
  if (session.role !== "admin") redirect("/esurat/dashboard");

  const { id } = await params;
  let position;
  try {
    position = await positionService.getById(id);
  } catch {
    notFound();
  }

  return (
    <div>
      <PageHeader breadcrumb={{ parent: "Jabatan", current: position.name }} title="Edit Jabatan" />

      <div className="card-doc rise-in max-w-2xl" style={{ animationDelay: "100ms" }}>
        <PositionForm mode="edit" position={position} />
      </div>
    </div>
  );
}
